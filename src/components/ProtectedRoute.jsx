'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Loading from './loading';

export default function ProtectedRoute({ children, redirectTo = '/auth/login', role }) {
  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasRole, setHasRole] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        localStorage.setItem('userUid', user.uid);
        setIsLoggedIn(true);
        if (role) {
          // تحقق من الصلاحية من Firestore
          const userDoc = await getDoc(doc(db, role === 'admin' ? 'user-admin' : 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (role === 'admin' && userData.role === 'admin') {
              setHasRole(true);
            } else if (role !== 'admin' && userData.role && userData.role.length > 0) {
              setHasRole(true);
            } else {
              setHasRole(false);
              router.push('/unauthorized');
            }
          } else {
            setHasRole(false);
            router.push('/unauthorized');
          }
        } else {
          setHasRole(true); // لا يوجد شرط صلاحية محدد
        }
      } else {
        setIsLoggedIn(false);
        setHasRole(false);
        router.push(redirectTo);
      }
      setChecking(false);
    });
    return () => unsubscribe();
  }, [router, redirectTo, role]);

  if (checking) {
    return (
      <div className='flex flex-col justify-center items-center min-h-screen bg-gray-100'>
        <Loading />
      </div>
    );
  }

  if (!isLoggedIn || !hasRole) {
    return null;
  }

  return <>{children}</>;
}
