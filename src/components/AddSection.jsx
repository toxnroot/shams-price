'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { PlusCircle } from 'lucide-react';

const AddSection = ({ docId }) => {
  const [sectionName, setSectionName] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSection = async () => {
    if (!sectionName.trim()) {
      setStatus('يرجى إدخال اسم القسم');
      return;
    }

    setIsLoading(true);
    setStatus('جاري التحقق من المستند...');

    try {
      const docRef = doc(db, 'priceing', docId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setStatus('المستند غير موجود! يرجى إنشاء المستند أولاً.');
        setIsLoading(false);
        return;
      }

      await setDoc(docRef, { [sectionName]: [] }, { merge: true });

      setStatus('✅ تم إضافة القسم بنجاح!');
      setSectionName('');
    } catch (error) {
      setStatus(`❌ خطأ أثناء إضافة القسم: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <PlusCircle className="w-6 h-6 text-blue-600" />
        إضافة قسم إلى: <span className="text-blue-500">{docId}</span>
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">اسم القسم</label>
          <input
            type="text"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-[1.1rem]"
            placeholder="أدخل اسم القسم"
          />
        </div>

        <button
          onClick={handleAddSection}
          disabled={isLoading}
          className={`w-full py-2.5 px-4 rounded-lg text-white font-medium text-[1.05rem] flex items-center justify-center gap-2 transition-all duration-200 ${
            isLoading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'جاري الإضافة...' : (
            <>
              <PlusCircle className="w-5 h-5" />
              إضافة القسم
            </>
          )}
        </button>

        {status && (
          <p
            className={`text-sm text-center mt-2 ${
              status.includes('بنجاح') || status.startsWith('✅')
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

export default AddSection;
