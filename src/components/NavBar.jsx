'use client';
import Link from 'next/link';
import LogoutButton from './ButtonLogout';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import CartButton from './CartButton';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { CartDrawerProvider } from './CartButton';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Toaster } from 'react-hot-toast';

const NavBar = () => {
  const pathname = usePathname();
  const [path, setPath] = useState('auth');
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (pathname.startsWith('/dashboard')) {
      setPath('auth/admin-login');
    } else {
      setPath('auth');
    }
  }, [pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserData(null);
      return;
    }
    // الاستماع لتغيرات بيانات المستخدم في الوقت الحقيقي
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (userDoc) => {
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      } else {
        setUserData(null);
      }
    }, (error) => {
      console.error('خطأ في جلب بيانات المستخدم:', error);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleAvatarUpdate = () => {
      // إعادة جلب بيانات المستخدم من Firestore (سيعمل onSnapshot تلقائياً)
      setUserData((prev) => ({ ...prev }));
    };
    window.addEventListener('userAvatarUpdated', handleAvatarUpdate);
    return () => window.removeEventListener('userAvatarUpdated', handleAvatarUpdate);
  }, []);

  return (
    <nav className="bg-white shadow-md w-full z-50 border-b border-gray-200 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image
              src="/logo.ico"
              alt="SHAMS TEX Logo"
              fill
              sizes="40px"
              className="object-contain"
            />
          </div>
          <span className="text-2xl font-bold text-[#A08558] leading-tight">
            SHAMS TEX
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {mounted && (
            <button
              onClick={() => setDarkMode((v) => !v)}
              className={`px-3 py-2 rounded-full transition-colors duration-200 focus:outline-none ${
                darkMode ? 'bg-[#A08558] text-white' : 'bg-gray-100 text-[#A08558] hover:bg-[#A08558]/10'
              }`}
              aria-label="تبديل الوضع الليلي"
              title={darkMode ? 'الوضع الفاتح' : 'الوضع الليلي'}
            >
              {darkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                  />
                </svg>
              )}
            </button>
          )}
          {user && <CartButton inNavbar />}
          {/* NotificationBell محذوف */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm focus:outline-none"
              >
                <span className="hidden sm:inline">{user.email || 'مستخدم غير محدد'}</span>
                {userData && userData.avatar ? (
                  <span className="w-9 h-9 rounded-full overflow-hidden shadow-md flex items-center justify-center bg-gray-100">
                    <Image
                      src={userData.avatar}
                      alt="avatar"
                      width={36}
                      height={36}
                      className="object-cover w-9 h-9"
                    />
                  </span>
                ) : (
                  <span className="bg-[#A08558] text-white rounded-full w-9 h-9 flex items-center justify-center font-bold uppercase text-lg shadow-md border-2 border-[#C4A46B]">
                    {user.displayName
                      ? user.displayName.slice(0, 2)
                      : (user.email?.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2) || 'US')}
                  </span>
                )}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50 border border-gray-100 animate-fade-in">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                  >
                    ملفي الشخصي
                  </Link>
                  <LogoutButton path={path} />
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 ${
                  pathname.startsWith('/auth/login')
                    ? 'bg-[#A08558] text-white'
                    : 'bg-gray-100 text-[#A08558] hover:bg-[#A08558]/10'
                }`}
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/auth/register"
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 ${
                  pathname.startsWith('/auth/register')
                    ? 'bg-[#A08558] text-white'
                    : 'bg-gray-100 text-[#A08558] hover:bg-[#A08558]/10'
                }`}
              >
                إنشاء حساب
              </Link>
            </>
          )}
        </div>
      </div>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </nav>
  );
};

export default function NavBarWithDrawer() {
  return (
    <CartDrawerProvider>
      <NavBar />
    </CartDrawerProvider>
  );
}