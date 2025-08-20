"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import Checkbox from "./NeonCheckbox";
import useRoles from '@/lib/useRoles';
import toast from 'react-hot-toast';

export default function CreateUser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState([]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { roles, loading: loadingRoles, error: errorRoles } = useRoles();

  useEffect(() => {
    if (roles.length > 0) {
      setRole([roles[0]]);
    }
  }, [roles]);

  // إنشاء المستخدم
  const handleCreateUser = async () => {
    if (!email || !password || !phone || role.length === 0) {
      setStatus("يرجى ملء جميع الحقول واختيار صلاحية واحدة على الأقل");
      return;
    }

    if (password.length < 6) {
      setStatus("كلمة السر يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setIsLoading(true);
    setStatus("جاري التحقق من المستخدم...");
    try {
      // التحقق من وجود المستخدم باستخدام البريد الإلكتروني
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        toast.error("البريد الإلكتروني مستخدم بالفعل! يرجى اختيار بريد آخر.");
        setIsLoading(false);
        return;
      }

      // إنشاء المستخدم في Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // تخزين البيانات في Firestore مع role كمصفوفة
      await setDoc(doc(db, "users", user.uid), {
        phone,
        email,
        role,
        createdAt: new Date().toISOString(),
      });

      setStatus("");
      toast.success("تم إنشاء المستخدم بنجاح!");
      // إعادة تعيين الحقول
      setEmail("");
      setPassword("");
      setPhone("");
      setRole(roles.length > 0 ? [roles[0]] : []);
      setIsLoading(false);
    } catch (error) {
      toast.error(`خطأ أثناء إنشاء المستخدم: ${error.message}`);
      setIsLoading(false);
    }
  };

  // تحديث الصلاحيات المختارة
  const handleRoleChange = (e) => {
    const value = e.target.value;
    setRole((prevRole) => {
      const newRole = prevRole.includes(value)
        ? prevRole.filter((r) => r !== value)
        : [...prevRole, value];
      return newRole;
    });
  };

  if (loadingRoles) {
    return <div className="text-center">جاري تحميل الصلاحيات...</div>;
  }
  if (errorRoles) {
    return <div className="text-center text-red-600">{errorRoles}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full max-w-6xl flex items-center justify-centerk">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          إنشاء مستخدم جديد
        </h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رقم الهاتف
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="أدخل الرقم"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="أدخل البريد الإلكتروني"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة السر (6 أحرف على الأقل)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="أدخل كلمة السر"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الصلاحيات
            </label>
            <div className="flex items-center justify-around flex-wrap gap-2">
{roles.length === 0 ? (
              <p className="text-gray-500 text-sm">لا توجد صلاحيات متاحة</p>
            ) : (
              roles.map((roleOption) => (
                <div
                  key={roleOption}
                  className="flex items-center space-x-2 mb-2"
                >
                  <Checkbox
                    key={roleOption}
                    id={`create-${roleOption}`}
                    checked={role.includes(roleOption)}
                    onChange={() =>
                      handleRoleChange({ target: { value: roleOption } })
                    }
                    label={roleOption}
                  />
                </div>
              ))
            )}
            </div>
            
          </div>
          <button
            onClick={handleCreateUser}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-colors duration-200 ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "جاري الإنشاء..." : "إنشاء المستخدم"}
          </button>
        </div>
        {status && (
          <p
            className={`mt-4 text-sm text-center ${
              status.includes("بنجاح") ? "text-green-600" : "text-red-600"
            }`}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
