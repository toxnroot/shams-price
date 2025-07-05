'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Loading from './loading';

export default function ProtectedRoute({ children, redirectTo = '/auth' }) {
  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem('userUid', user.uid); // حفظ uid لاستخدامه في باقي المكونات
        setIsLoggedIn(true);
      } else {
        router.push(redirectTo);
      }
      setChecking(false);
    });

    return () => unsubscribe();
  }, [router, redirectTo]);

  if (checking) {
      return (
      <div className='flex flex-col justify-center items-center min-h-screen bg-gray-100'>
        <Loading />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // عدم إظهار أي شيء أثناء التحويل
  }

  return <>{children}</>;
}
