'use client';

import { useState, useRef } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
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
      let emailToUse = identifier;

      // إذا كان الإدخال رقم هاتف، ابحث عن البريد المرتبط به
      if (/^\d{10,15}$/.test(identifier)) {
        const q = query(collection(db, 'users'), where('phone', '==', identifier));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setStatus('رقم الهاتف غير مسجل');
          setIsLoading(false);
          return;
        }

        const userData = querySnapshot.docs[0].data();
        emailToUse = userData.email;
      }

      // تسجيل الدخول بالبريد وكلمة المرور
      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
      const user = userCredential.user;

      // استخدام localStorage فقط في المتصفح
      if (typeof window !== 'undefined') {
        localStorage.setItem('userUid', user.uid);
      }

      const token = await user.getIdToken();
      await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      setStatus('✅ تم تسجيل الدخول بنجاح');
      router.push('/');
    } catch (error) {
      console.error(error);
      setStatus('❌ خطأ في تسجيل الدخول: تأكد من البيانات');
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
            src="/logo.ico"
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
            />
          </div>
              

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              ref={passwordRef}
              onChange={(e) => setPassword(e.target.value.trim())}
              onKeyDown={(e) => handleKeyDown(e, 'password')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="**********"
            />
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


// 'use client';

// import { TourProvider, useTour } from '@reactour/tour';

// const steps = [
//   {
//     selector: '.my-button',
//     content: 'اضغط على هذا الزر لبدء العملية',
//   },
//   {
//     selector: '.my-input',
//     content: 'ثم أدخل البيانات هنا',
//   },
// ];

// export default function App() {
//   return (
//     <TourProvider steps={steps} showBadge={false} locale={{ close: 'إغلاق', last: 'إنهاء', next: 'التالي', skip: 'تخطي' }}>
//       <Main />
//     </TourProvider>
//   );
// }

// function Main() {
//   const { setIsOpen } = useTour();

//   return (
//     <div className="p-8">
//       <button className="my-button px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setIsOpen(true)}>
//         ابدأ الشرح
//       </button>
//       <br /><br />
//       <input className="my-input border p-2 rounded" placeholder="اكتب هنا" onChange={() => setIsOpen(true)} />
//     </div>
//   );
// }
