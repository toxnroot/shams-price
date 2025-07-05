'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase'; // تأكد من وجود ملف firebase.js
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function AddSectionToDocument() {
  const [documentId, setDocumentId] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [sectionKey, setSectionKey] = useState('');
  const [sectionValue, setSectionValue] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // إضافة قسم إلى المستند
  const handleAddSection = async () => {
    if (!documentId || !sectionName || !sectionKey || !sectionValue) {
      setStatus('يرجى ملء جميع الحقول');
      return;
    }

    setIsLoading(true);
    setStatus('جاري التحقق من المستند...');
    try {
      const docRef = doc(db, 'priceing', documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setStatus('المستند غير موجود! يرجى إنشاء المستند أولاً.');
        setIsLoading(false);
        return;
      }

      // إضافة القسم كحقل جديد
      const sectionData = {
        [sectionName]: {
          [sectionKey]: sectionValue,
        },
      };

      await setDoc(docRef, sectionData, { merge: true });

      setStatus('تم إضافة القسم بنجاح!');
      // إعادة تعيين الحقول
      setDocumentId('');
      setSectionName('');
      setSectionKey('');
      setSectionValue('');
      setIsLoading(false);
    } catch (error) {
      setStatus(`خطأ أثناء إضافة القسم: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className=" p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">إضافة قسم إلى مستند في priceing</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">معرف المستند</label>
            <input
              type="text"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="أدخل معرف المستند"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم القسم</label>
            <input
              type="text"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="أدخل اسم القسم"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">مفتاح القسم</label>
            <input
              type="text"
              value={sectionKey}
              onChange={(e) => setSectionKey(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="أدخل مفتاح القسم"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">قيمة القسم</label>
            <input
              type="text"
              value={sectionValue}
              onChange={(e) => setSectionValue(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="أدخل قيمة القسم"
            />
          </div>
          <button
            onClick={handleAddSection}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-colors duration-200 ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'جاري الإضافة...' : 'إضافة القسم'}
          </button>
        </div>
        {status && (
          <p
            className={`mt-4 text-sm text-center ${
              status.includes('بنجاح') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
}