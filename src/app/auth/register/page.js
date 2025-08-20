'use client';

import { useState, useRef } from 'react';
import { db, auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleRegister = async () => {
    // التحقق من الحقول
    if (!name || !phone || !email || !password || !confirmPassword) {
      setStatus('يرجى إدخال جميع الحقول');
      toast.error('يرجى إدخال جميع الحقول');
      return;
    }
    if (password !== confirmPassword) {
      setStatus('كلمتا المرور غير متطابقتين');
      toast.error('كلمتا المرور غير متطابقتين');
      return;
    }
    if (!/^\d{10,15}$/.test(phone)) {
      setStatus('يرجى إدخال رقم هاتف صحيح (10-15 رقم)');
      toast.error('يرجى إدخال رقم هاتف صحيح (10-15 رقم)');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('يرجى إدخال بريد إلكتروني صحيح');
      toast.error('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    setIsLoading(true);
    setStatus('جاري إنشاء الحساب...');

    try {
      // إنشاء مستخدم جديد
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // حفظ بيانات المستخدم في Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        phone,
        email,
        role: ['العامة'],
        createdAt: new Date().toISOString(),
        avatar: null,
      });

      // حفظ UID في localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('userUid', user.uid);
      }

      toast.success('تم إنشاء الحساب بنجاح');
      setStatus('✅ تم إنشاء الحساب بنجاح');
      router.push('/');
    } catch (error) {
      console.error('خطأ في إنشاء الحساب:', error);
      let errorMessage = 'خطأ في إنشاء الحساب: تأكد من البيانات';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'البريد الإلكتروني غير صالح';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'كلمة المرور ضعيفة جدًا (يجب أن تكون 6 أحرف على الأقل)';
      }
      setStatus(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'name' && phoneRef.current) {
        phoneRef.current.focus();
      } else if (field === 'phone' && emailRef.current) {
        emailRef.current.focus();
      } else if (field === 'email' && passwordRef.current) {
        passwordRef.current.focus();
      } else {
        handleRegister();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.ico"
            alt="Logo"
            width={120}
            height={120}
            className="rounded-full"
          />
        </div>
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">إنشاء حساب</h1>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.trim())}
              onKeyDown={(e) => handleKeyDown(e, 'name')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="أدخل الاسم الكامل"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
            <input
              dir="rtl"
              type="tel"
              value={phone}
              ref={phoneRef}
              onChange={(e) => setPhone(e.target.value.trim())}
              onKeyDown={(e) => handleKeyDown(e, 'phone')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="أدخل رقم الهاتف"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              ref={emailRef}
              onChange={(e) => setEmail(e.target.value.trim())}
              onKeyDown={(e) => handleKeyDown(e, 'email')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="أدخل البريد الإلكتروني"
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
                placeholder="أدخل كلمة المرور"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value.trim())}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base pr-10"
                placeholder="تأكيد كلمة المرور"
              />
              <span
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute inset-y-0 left-3 flex items-center cursor-pointer text-xl select-none"
                title={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </span>
            </div>
          </div>

          <button
            onClick={handleRegister}
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-white font-semibold text-lg transition duration-200 ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#A16D28] hover:bg-[#A16D28]/90'
            }`}
          >
            {isLoading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
          </button>

          <Link
            href="/auth/login"
            className="w-full block mt-2 py-3 rounded-lg text-[#A16D28] border border-[#A16D28] text-center font-semibold text-lg transition duration-200 hover:bg-[#A16D28]/10"
          >
            لديك حساب؟ تسجيل الدخول
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