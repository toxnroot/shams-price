'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const LoginForm = ({ pathRouter = '/' }) => { // تعيين قيمة افتراضية
  const router = useRouter();
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let email = input;

      // إذا كان الإدخال ليس بريدًا إلكترونيًا، ابحث عن البريد من اسم المستخدم
      if (!input.includes('@')) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('name', '==', input));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error('اسم المستخدم غير موجود');
        }

        const userData = querySnapshot.docs[0].data();
        if (!userData.email) {
          throw new Error('البريد الإلكتروني غير موجود لهذا المستخدم');
        }
        email = userData.email;
      }

      // تسجيل الدخول
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      // إرسال التوكن إلى API
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('فشل في تحديث الجلسة');
      }

      // إعادة التوجيه
      router.push(pathRouter);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">تسجيل الدخول</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني أو اسم المستخدم</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="أدخل البريد الإلكتروني أو اسم المستخدم"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="أدخل كلمة المرور"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
          {error && <p className="text-sm text-red-600 text-center mt-2">{error}</p>}
        </div>
      </form>
    </div>
  );
};

export default LoginForm;