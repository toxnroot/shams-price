'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Trash2, FileText } from 'lucide-react';

const SectionsRadio = () => {
  const [documentIds, setDocumentIds] = useState([]);
  const [status, setStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'priceing'),
      (snapshot) => {
        const ids = snapshot.docs.map((doc) => doc.id);
        setDocumentIds(ids);
        setStatus(ids.length === 0 ? 'لم يتم اضافة نشرات بعد' : '');
      },
      (error) => {
        setStatus(`خطأ: ${error.message}`);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'هل أنت متأكد أنك تريد حذف هذه النشرة؟ لن تتمكن من إرجاعها وسيتم حذف كل ما بداخلها.'
    );
    if (!confirmDelete) return;

    try {
      // الخطوة 1: حذف النشرة من priceing
      await deleteDoc(doc(db, 'priceing', id));

      // الخطوة 2: جلب جميع المستخدمين من مجموعة users
      const usersSnapshot = await getDocs(collection(db, 'users'));

      // الخطوة 3: تحديث حقل role لكل مستخدم يحتوي على docId
      const updatePromises = usersSnapshot.docs
        .filter((userDoc) => {
          const userData = userDoc.data();
          return userData.role && userData.role.includes(id);
        })
        .map((userDoc) => {
          const userRef = doc(db, 'users', userDoc.id);
          const updatedRole = userDoc.data().role.filter((roleId) => roleId !== id);
          return updateDoc(userRef, { role: updatedRole });
        });

      // انتظار اكتمال جميع تحديثات المستخدمين
      await Promise.all(updatePromises);

      setStatus('تم الحذف بنجاح!');
    } catch (error) {
      setStatus(`خطأ أثناء الحذف: ${error.message}`);
    }
  };

  return (
    <div className="p-4 w-full max-w-4xl">
      <h2 className="text-center text-xl font-semibold text-gray-800 mb-4">
        النشرات المتوفرة
      </h2>

      {status && (
        <p className="text-center text-sm text-red-600 mb-2">{status}</p>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        {documentIds.map((id) => (
          <div
            key={id}
            className="flex items-center gap-3 shadow-lg rounded-xl p-4 hover:shadow-xl transition-all bg-white"
          >
            <button
              onClick={() => router.push(`/dashboard/${id}`)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition text-[1.2rem]"
            >
              <FileText className="w-5 h-5" />
              <span>{id}</span>
            </button>

            <button
              onClick={() => handleDelete(id)}
              className="text-red-500 hover:text-red-700 transition"
              title="حذف النشرة"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionsRadio;