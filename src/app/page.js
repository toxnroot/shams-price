// app/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';
import SectionCard from '@/components/SectionCard';
import Loading from '@/components/loading';

export default function Home() {
  const [sections, setSections] = useState({});
  const [status, setStatus] = useState('');
  const [userRole, setUserRole] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoSectionsMessage, setShowNoSectionsMessage] = useState(false);

  useEffect(() => {
    const userUid = typeof window !== 'undefined' ? localStorage.getItem('userUid') : null;
    if (!userUid) {
      setStatus('يرجى تسجيل الدخول أولاً');
      setLoading(false);
      setShowNoSectionsMessage(false);
      return;
    }

    const userDocRef = doc(db, 'users', userUid);
    const unsubscribeUser = onSnapshot(
      userDocRef,
      (userSnap) => {
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserRole(userData.role || []);
          setStatus('');
        } else {
          setUserRole([]);
          setStatus('بيانات المستخدم غير موجودة');
          setLoading(false);
          setShowNoSectionsMessage(true);
        }
      },
      (error) => {
        setStatus(`خطأ أثناء جلب بيانات المستخدم: ${error.message}`);
        setLoading(false);
        setShowNoSectionsMessage(true);
      }
    );

    return () => unsubscribeUser();
  }, []);

  useEffect(() => {
    if (userRole.length === 0) {
      setSections({});
      // تأخير إظهار الرسالة لمدة 3 ثوانٍ
      const timer = setTimeout(() => {
        setShowNoSectionsMessage(true);
        setLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    }

    const allSections = {};
    let completed = 0;

    // إعداد مؤقت لمدة 3 ثوانٍ
    const timer = setTimeout(() => {
      if (Object.keys(allSections).length === 0) {
        setShowNoSectionsMessage(true);
        setLoading(false);
      }
    }, 4000);

    userRole.forEach((role) => {
      const docRef = doc(db, 'priceing', role);
      onSnapshot(
        docRef,
        (docSnap) => {
          completed++;
          allSections[role] = docSnap.exists() ? docSnap.data() : {};
          if (completed === userRole.length) {
            setSections({ ...allSections });
            setLoading(false);
            // إذا تم جلب الأقسام، لا تظهر رسالة "لا يوجد أقسام"
            if (Object.keys(allSections).length > 0) {
              setShowNoSectionsMessage(false);
            } else {
              setShowNoSectionsMessage(true);
            }
            clearTimeout(timer); // إلغاء المؤقت إذا اكتمل الجلب
          }
        },
        (error) => {
          setStatus(`خطأ أثناء جلب الأقسام: ${error.message}`);
          setLoading(false);
          setShowNoSectionsMessage(true);
          clearTimeout(timer);
        }
      );
    });

    return () => clearTimeout(timer);
  }, [userRole]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        <Loading />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen max-h-full p-6 bg-gray-100 flex flex-col items-center justify-center">
        {status && (
          <p className={`text-sm text-center mb-4 ${status.includes('بنجاح') ? 'text-green-600' : 'text-red-600'}`}>
            {status}
          </p>
        )}
        {showNoSectionsMessage && Object.keys(sections).length === 0 ? (
          <p className="text-center text-gray-500 text-lg font-medium">لا يوجد أقسام متاحة</p>
        ) : (
          Object.keys(sections).length > 0 && (
            Object.keys(sections).map((docId) => (
              <SectionCard key={docId} docId={docId} sections={sections[docId]} />
            ))
          )
        )}
      </div>
    </ProtectedRoute>
  );
}