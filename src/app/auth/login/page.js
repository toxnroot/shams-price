'use client';

import { useState, useRef } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { loginUser } from '@/lib/authUtils';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const passwordRef = useRef(null);

  const handleLogin = async () => {
    if (!identifier || !password) {
      setStatus('يرجى إدخال البريد أو رقم الهاتف وكلمة المرور');
      return;
    }
    setIsLoading(true);
    setStatus('جاري التحقق...');
    try {
      const { user, token } = await loginUser({ identifier, password, auth, db });
      if (typeof window !== 'undefined') {
        localStorage.setItem('userUid', user.uid);
      }
      await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      // الاشتراك التلقائي في الإشعارات للمستخدمين العاديين
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('تم منح إذن الإشعارات للمستخدم');
        }
      } catch (error) {
        console.error('خطأ في طلب إذن الإشعارات:', error);
      }

      toast.success('تم تسجيل الدخول بنجاح');
      setStatus('');
      router.push('/');
    } catch (error) {
      if (error.message.includes('Firebase: Error (auth/invalid-credential).')) {
        toast.error('خطأ في تسجيل الدخول: كلمة المرور غير صحيحة');
        setStatus('');
      } else {
        toast.error('خطأ في تسجيل الدخول: تأكد من البيانات');
        setStatus('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'identifier' && passwordRef.current) {
        passwordRef.current.focus();
      } else {
        handleLogin();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.webp"
            alt="Logo"
            width={120}
            height={120}
            className="rounded-full"
            
          />
        </div>
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">تسجيل الدخول</h1>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني أو رقم الهاتف</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value.trim())}
              onKeyDown={(e) => handleKeyDown(e, 'identifier')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="البريد الإلكتروني أو رقم الهاتف"
              id="identifier"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                ref={passwordRef}
                onChange={(e) => setPassword(e.target.value.trim())}
                onKeyDown={(e) => handleKeyDown(e, 'password')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base pr-10"
                placeholder="**********"
                id="password"
              />
              <span
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 left-3 flex items-center cursor-pointer text-xl select-none"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-white font-semibold text-lg transition duration-200 ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#A16D28] hover:bg-[#A16D28]/90'
            }`}
          >
            {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>

          <Link
            href="/auth/register"
            className="w-full block mt-2 py-3 rounded-lg text-[#A16D28] border border-[#A16D28] text-center font-semibold text-lg transition duration-200 hover:bg-[#A16D28]/10"
          >
            إنشاء حساب جديد
          </Link>
        </div>

        {status && (
          <p
            className={`mt-4 text-sm text-center ${
              status.includes('✅') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
}