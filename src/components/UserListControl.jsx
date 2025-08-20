'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import Checkbox from './NeonCheckbox';
import { Mail, Phone, Calendar } from 'lucide-react';
import useRoles from '@/lib/useRoles';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const { roles, loading: loadingRoles, error: errorRoles } = useRoles();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  // جلب المستخدمين مع الاستماع للتغييرات في الوقت الفعلي
  useEffect(() => {
    setLoading(true);
    let unsubscribe;

    const fetchUsers = (nextPage = false) => {
      let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
      if (nextPage && lastDoc) {
        q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE));
      }

      unsubscribe = onSnapshot(q, (snapshot) => {
        const usersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers((prev) => (nextPage ? [...prev, ...usersList] : usersList));
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
        setLoading(false);
      }, (error) => {
        setStatus(`❌ خطأ أثناء جلب البيانات: ${error.message}`);
        setLoading(false);
      });
    };

    fetchUsers();
    // Cleanup: Unsubscribe from the listener when the component unmounts
    return () => unsubscribe && unsubscribe();
  }, []);

  // تحميل المزيد من المستخدمين
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      let unsubscribe;
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const newUsers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers((prev) => [...prev, ...newUsers]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
        setLoading(false);
      }, (error) => {
        setStatus(`❌ خطأ أثناء تحميل المزيد: ${error.message}`);
        setLoading(false);
      });
      // Return cleanup function for the load more listener
      return () => unsubscribe && unsubscribe();
    }
  };

  // تحديث صلاحيات المستخدم
  const handleRoleChange = async (userId, roleValue) => {
    setStatus('جاري تحديث الصلاحيات...');
    try {
      const userRef = doc(db, 'users', userId);
      const user = users.find((u) => u.id === userId);
      const updatedRole = user.role.includes(roleValue)
        ? user.role.filter((r) => r !== roleValue)
        : [...user.role, roleValue];

      await updateDoc(userRef, { role: updatedRole });
      // Update local state to immediately reflect the change (optional with onSnapshot)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: updatedRole } : u
        )
      );
      setStatus('✅ تم تحديث الصلاحيات بنجاح');
    } catch (error) {
      setStatus(`❌ خطأ أثناء التحديث: ${error.message}`);
    }
  };

  if (loading || loadingRoles) {
    return <p className="text-center text-gray-600">جاري التحميل...</p>;
  }
  if (errorRoles) {
    return <p className="text-center text-red-600">{errorRoles}</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full max-w-6xl">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        قائمة المستخدمين
      </h1>

      {users.length === 0 ? (
        <p className="text-center text-gray-500">لا يوجد مستخدمون حالياً</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 justify-center">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white p-4 rounded-xl shadow w-full sm:w-[48%] border border-gray-200"
              >
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                    <Phone className="text-blue-600 w-4" />
                    {user.phone || '-'}
                  </p>
                  <p className="text-sm text-gray-700 flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                    <Mail className="text-blue-600 w-4" />
                    {user.email || '-'}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                    <Calendar className="text-blue-600 w-4" />
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                  </p>
                </div>

                <div>
                  <label className="block text-md font-semibold text-gray-700 mb-2">
                    الصلاحيات
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {roles.length === 0 ? (
                      <p className="text-gray-500 text-sm">لا توجد صلاحيات</p>
                    ) : (roles.map((roleOption) => (
  <Checkbox
    key={`${user.id}-${roleOption}`}
    id={`${user.id}-${roleOption}`}
    checked={user.role.includes(roleOption)} // تصحيح من roleValue إلى roleOption
    onChange={() => handleRoleChange(user.id, roleOption)}
    label={roleOption}
  />
))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? 'جاري التحميل...' : 'تحميل المزيد'}
              </button>
            </div>
          )}
        </>
      )}

      {status && (
        <p
          className={`text-sm text-center mt-6 ${
            status.includes('بنجاح') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
}