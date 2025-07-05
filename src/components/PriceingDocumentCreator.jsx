'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'; // من lucide-react

export default function PriceingDocumentCreator() {
  const [documentId, setDocumentId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateDocument = async () => {
    if (!documentId.trim()) {
      setStatus({ type: 'error', message: 'يرجى إدخال اسم نشرة الأسعار.' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'جاري التحقق من النشرة...' });

    try {
      const docRef = doc(db, 'priceing', documentId.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setStatus({ type: 'error', message: 'النشرة موجودة بالفعل! يرجى اختيار اسم آخر.' });
        setLoading(false);
        return;
      }

      await setDoc(docRef, {});
      setStatus({ type: 'success', message: `تم إنشاء "${documentId}" بنجاح!` });
      setDocumentId('');
    } catch (error) {
      setStatus({ type: 'error', message: `حدث خطأ: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    info: 'text-blue-500',
    success: 'text-green-600',
    error: 'text-red-600',
  };

  const statusIcon = {
    info: <Loader2 className="animate-spin w-4 h-4 mr-1" />,
    success: <CheckCircle className="w-4 h-4 mr-1" />,
    error: <AlertCircle className="w-4 h-4 mr-1" />,
  };

  return (
    <div className="p-6 w-full max-w-4xl  rounded-xl shadow-lg bg-white ">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">إنشاء نشرة أسعار جديدة</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">اسم النشرة</label>
        <input
          type="text"
          value={documentId}
          onChange={(e) => setDocumentId(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="أدخل اسم النشرة هنا"
        />
      </div>

      <button
        onClick={handleCreateDocument}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-200 ${
          loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'جاري الإنشاء...' : 'إنشاء النشرة'}
      </button>

      {status && (
        <div className={`flex items-center mt-4 text-sm ${statusColor[status.type]}`}>
          {statusIcon[status.type]}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
}
