'use client';

import { useState, useEffect } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton({ path }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // الاستماع لتغيرات حالة المستخدم (تسجيل الدخول والخروج)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        localStorage.setItem('userUid', user.uid); // اختياري للتخزين
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem('userUid');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    setError('');

    try {
      await signOut(auth);

      // حذف التوكن من الكوكيز (API route)
      await fetch('/api/logout', { method: 'POST' });

      // حذف uid من localStorage
      localStorage.removeItem('userUid');

      // توجيه المستخدم
      router.push(`/${path || 'auth'}`);
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الخروج');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="text-center">
<button
  onClick={handleLogout}
  disabled={loading}
  className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out px-2 py-1 rounded-full text-white text-sm ${
    loading
      ? 'bg-gray-400 cursor-not-allowed'
      : 'bg-[#DC2525] hover:bg-red-700'
  } w-8 hover:w-32 group`}
>
  <LogOut size={16} className="flex-shrink-0" />
  <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
    تسجيل الخروج
  </span>
</button>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
