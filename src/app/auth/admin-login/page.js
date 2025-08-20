'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Image from 'next/image';
import { loginUser } from '@/lib/authUtils';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);
    try {
      const { user, token } = await loginUser({ identifier: email, password, auth, db });
      const userDoc = await getDoc(doc(db, 'user-admin', user.uid));
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        await signOut(auth);
        toast.error('❌ ليس لديك صلاحية الدخول كمدير');
        setLoading(false);
        return;
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('idToken', token);
      }
      toast.success('✅ تسجيل الدخول ناجح');
      setStatus('');
      router.push('/dashboard');
    } catch (error) {
      toast.error('⚠️ فشل تسجيل الدخول. تحقق من البريد وكلمة المرور');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.ico"
            alt="Logo"
            width={120}
            height={120}
            className="rounded-full"
          />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800">تسجيل دخول المدير</h1>

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 bg-[#A16D28] text-white rounded hover:bg-[#A16D28]/90 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
        </button>

        {status && (
          <p className="text-center text-sm mt-2 text-red-600 font-medium">{status}</p>
        )}
      </form>
    </div>
  );
}