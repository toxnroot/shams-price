'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
} from 'firebase/firestore';
import Checkbox from './NeonCheckbox';
import { Mail, Phone, Calendar } from 'lucide-react';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // جلب الصلاحيات من مجموعة priceing
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'priceing'));
        const roleList = querySnapshot.docs.map((doc) => doc.id);
        setRoles(roleList);
      } catch (error) {
        setStatus(`خطأ أثناء جلب الصلاحيات: ${error.message}`);
      }
    };
    fetchRoles();
  }, []);

  // جلب المستخدمين في الوقت الفعلي
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const usersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
        setLoading(false);
      },
      (error) => {
        setStatus(`خطأ أثناء جلب المستخدمين: ${error.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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
      setStatus('✅ تم تحديث الصلاحيات بنجاح');
    } catch (error) {
      setStatus(`❌ خطأ أثناء التحديث: ${error.message}`);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600">جاري التحميل...</p>;
  }

  return (
    <div className="p-6 bg-gray-100 w-full max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        قائمة المستخدمين
      </h1>

      {users.length === 0 ? (
        <p className="text-center text-gray-500">لا يوجد مستخدمون حالياً</p>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white p-4 rounded-xl shadow w-full sm:w-[48%] border border-gray-200"
            >
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-gray-800 flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                  <Phone className="text-blue-600 w-4" />
                  {user.phone}
                </p>
                <p className="text-sm text-gray-700 flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                  <Mail className="text-blue-600 w-4" />
                  {user.email}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                  <Calendar className="text-blue-600 w-4" />
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="block text-md font-semibold text-gray-700 mb-2">
                  الصلاحيات
                </label>
                <div className="flex flex-wrap gap-2">
                  {roles.length === 0 ? (
                    <p className="text-gray-500 text-sm">لا توجد صلاحيات</p>
                  ) : (
                    roles.map((roleOption) => (
                      <Checkbox
                        key={`${user.id}-${roleOption}`}
                        id={`${user.id}-${roleOption}`}
                        checked={user.role.includes(roleOption)}
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
