'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { FolderOpen, AlertCircle, BookOpen } from 'lucide-react'; // أيقونات احترافية

const DisplaySections = ({ docId }) => {
  const [sections, setSections] = useState({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    const docRef = doc(db, 'priceing', docId);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSections(docSnap.data());
          setStatus('');
        } else {
          setSections({});
          setStatus('المستند غير موجود');
        }
      },
      (error) => {
        setStatus(`خطأ أثناء جلب الأقسام: ${error.message}`);
      }
    );
    return () => unsubscribe();
  }, [docId]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-4xl mx-auto mt-10 border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <FolderOpen className="text-blue-600 w-6 h-6" />
        <h2 className="text-2xl font-bold text-gray-800">الأقسام في نشرة: {docId}</h2>
      </div>

      {status ? (
        <div className="flex items-center justify-center gap-2 text-red-600 text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          <p>{status}</p>
        </div>
      ) : Object.keys(sections).length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {Object.keys(sections).map((section) => (
            <li key={section}>
              <Link
                href={`/dashboard/${encodeURIComponent(docId)}/${encodeURIComponent(section)}`}
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition shadow-sm group"
              >
                <span className="text-lg font-semibold text-gray-700 group-hover:text-blue-600 transition">
                  {section}
                </span>
                <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm text-center">لا توجد أقسام متاحة حاليًا</p>
      )}
    </div>
  );
};

export default DisplaySections;
