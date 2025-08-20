"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loading from "@/components/loading";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";
import { Moon, Sun, Type, Globe2 } from "lucide-react";

const CLOUDINARY_UPLOAD_PRESET = "ml_default";
const CLOUDINARY_CLOUD_NAME = "do88eynar";

const uploadToCloudinary = async (file) => {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "فشل رفع الصورة");
  return data;
};

const getCloudinaryPublicId = (url) => {
  if (!url) return null;
  const matches = url.match(/\/upload\/.*\/(.*)\.[a-zA-Z0-9]+$/);
  return matches ? matches[1] : null;
};

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [theme, setTheme] = useState(() => typeof window !== "undefined" ? localStorage.getItem("theme") || "light" : "light");
  const [fontSize, setFontSize] = useState(() => typeof window !== "undefined" ? localStorage.getItem("fontSize") || "base" : "base");
  const [lang, setLang] = useState(() => typeof window !== "undefined" ? localStorage.getItem("lang") || "ar" : "ar");

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = fontSize === "sm" ? "14px" : fontSize === "lg" ? "20px" : "16px";
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("lang", lang);
  }, [lang]);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const userUid = typeof window !== "undefined" ? localStorage.getItem("userUid") : null;
        if (!userUid) {
          setError("يرجى تسجيل الدخول أولاً");
          setLoading(false);
          return;
        }
        const userDoc = await getDoc(doc(db, "users", userUid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          setError("بيانات المستخدم غير موجودة");
        }
      } catch (err) {
        setError("خطأ أثناء جلب البيانات: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const startEdit = () => {
    setEditName(userData?.name || "");
    setEditPhone(userData?.phone || "");
    setEditMode(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !/^\d{10,15}$/.test(editPhone)) {
      toast.error("يرجى إدخال اسم ورقم هاتف صحيح (10-15 رقم)");
      return;
    }
    setEditLoading(true);
    try {
      const userUid = typeof window !== "undefined" ? localStorage.getItem("userUid") : null;
      if (!userUid) throw new Error("لا يوجد مستخدم");
      await updateDoc(doc(db, "users", userUid), {
        name: editName.trim(),
        phone: editPhone.trim(),
      });
      setUserData((prev) => ({ ...prev, name: editName.trim(), phone: editPhone.trim() }));
      toast.success("تم تحديث البيانات بنجاح");
      setEditMode(false);
    } catch (err) {
      toast.error("خطأ أثناء التحديث: " + (err.message || ""));
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword) {
      toast.error("يرجى إدخال كلمة السر الحالية");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error("كلمة السر الجديدة يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setPwLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("يجب تسجيل الدخول أولاً");
        setPwLoading(false);
        return;
      }
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast.success("تم تغيير كلمة السر بنجاح");
      setNewPassword("");
      setOldPassword("");
    } catch (err) {
      if (err.code === "auth/wrong-password") {
        toast.error("كلمة السر الحالية غير صحيحة");
      } else {
        toast.error("حدث خطأ: " + (err.message || "تعذر تغيير كلمة السر"));
      }
    } finally {
      setPwLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const userUid = typeof window !== "undefined" ? localStorage.getItem("userUid") : null;
      if (!userUid) throw new Error("لا يوجد مستخدم");
      if (userData?.avatar && userData.avatar.includes("cloudinary.com")) {
        const publicId = getCloudinaryPublicId(userData.avatar);
        if (publicId) {
          await fetch("/api/cloudinary-delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicId }),
          });
        }
      }
      await updateDoc(doc(db, "users", userUid), { avatar: null });
      const uploadRes = await uploadToCloudinary(file);
      const imageUrl = uploadRes.secure_url;
      await updateDoc(doc(db, "users", userUid), { avatar: imageUrl });
      setUserData((prev) => ({ ...prev, avatar: imageUrl }));
      toast.success("تم تحديث الصورة الشخصية بنجاح");
      window.dispatchEvent(new Event("userAvatarUpdated"));
    } catch (err) {
      toast.error("خطأ أثناء رفع الصورة: " + (err.message || ""));
    } finally {
      setAvatarLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <p className="text-red-600 text-center">لم يتم العثور على بيانات المستخدم</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-gray-200">
          <h1 className="text-2xl font-bold text-center mb-6 text-[#A08558]">الملف الشخصي</h1>
          {/* تخصيص الواجهة */}
                    <div className="flex flex-col items-center mb-6">
            <div className="relative w-28 h-28 mb-2">
              <img
                src={userData.avatar || "/avatar.png"}
                alt="الصورة الشخصية"
                className="w-28 h-28 rounded-full object-cover shadow-md bg-gray-100"
              />
              {avatarLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-full">
                  <span className="text-[#A08558] font-bold">جاري الرفع...</span>
                </div>
              )}
            </div>
            <label className="bg-[#A08558] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#8b7348] transition text-sm">
              تغيير الصورة
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={avatarLoading} />
            </label>
          </div>
            <ul className="flex justify-center items-start flex-col gap-6 mb-6">
            <li className="bg-[rgba(214,214,214,0.36)] rounded-sm w-full flex justify-start items-center gap-4"><span className="font-semibold bg-[#A08558] p-2 rounded-sm text-white ">الاسم</span> {userData.name || "-"}</li>
            <li className="bg-[rgba(214,214,214,0.36)] rounded-sm w-full flex justify-start items-center gap-4"><span className="font-semibold bg-[#A08558] p-2 rounded-sm text-white ">البريد الإلكتروني</span> {userData.email || "-"}</li>
            <li className="bg-[rgba(214,214,214,0.36)] rounded-sm w-full flex justify-start items-center gap-4"><span className="font-semibold bg-[#A08558] p-2 rounded-sm text-white ">رقم الهاتف</span> {userData.phone || "-"}</li>
            <li className="bg-[rgba(214,214,214,0.36)] rounded-sm w-full flex justify-start items-center gap-4"><span className="font-semibold bg-[#A08558] p-2 rounded-sm text-white ">النشرات</span> {Array.isArray(userData.role) ? userData.role.join(", ") : userData.role || "-"}</li>
            <li className="bg-[rgba(214,214,214,0.36)] rounded-sm w-full flex justify-start items-center gap-4"><span className="font-semibold bg-[#A08558] p-2 rounded-sm text-white ">تاريخ الإنشاء</span> {userData.createdAt ? new Date(userData.createdAt).toLocaleString("ar-EG") : "-"}</li>
          </ul>
          <div className="mb-8 bg-gradient-to-br from-[#f8f5ef] to-[#f3ede2] rounded-2xl p-5 border border-[#E5D7B8] shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-[#A08558] flex items-center gap-2">
              <Type className="w-5 h-5 text-[#A08558]" /> تخصيص الواجهة
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-[#A08558] flex items-center gap-1">
                  {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />} الوضع الليلي:
                </span>
                <button
                  className={`px-4 py-1 rounded-full font-bold transition border-2 focus:outline-none shadow-sm ${
                    theme === "dark" ? "bg-[#A08558] text-white border-[#A08558]" : "bg-[#F3E9D6] text-[#A08558] border-[#E5D7B8] hover:bg-[#e7dbc2]"
                  }`}
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? "ليلي" : "فاتح"}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-[#A08558] flex items-center gap-1">
                  <Type className="w-4 h-4" /> حجم الخط:
                </span>
                <select
                  className="border-2 rounded px-3 py-1 focus:ring-2 focus:ring-[#A08558] bg-[#F8F5EF] text-[#A08558] font-bold shadow-sm"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                >
                  <option value="sm">صغير</option>
                  <option value="base">عادي</option>
                  <option value="lg">كبير</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-[#A08558] flex items-center gap-1">
                  <Globe2 className="w-4 h-4" /> اللغة:
                </span>
                <select
                  className="border-2 rounded px-3 py-1 focus:ring-2 focus:ring-[#A08558] bg-[#F8F5EF] text-[#A08558] font-bold shadow-sm"
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>


          <div className="mb-6">
            {editMode ? (
              <form onSubmit={handleEditSave} className="space-y-3">
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="الاسم الجديد"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
                <input
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="رقم الهاتف الجديد"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  pattern="\d{10,15}"
                  required
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-[#A08558] text-white py-2 rounded-lg font-bold hover:bg-[#8b7348] transition" disabled={editLoading}>
                    {editLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </button>
                  <button type="button" className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-300 transition" onClick={() => setEditMode(false)} disabled={editLoading}>
                    إلغاء
                  </button>
                </div>
              </form>
            ) : (
              <button onClick={startEdit} className="w-full bg-blue-100 text-blue-700 py-2 rounded-lg font-bold hover:bg-blue-200 transition">
                تعديل الاسم أو رقم الهاتف
              </button>
            )}
          </div>
          <hr className="my-6 border-gray-200" />
          <h2 className="text-lg font-bold mb-2 text-[#A08558]">تغيير كلمة السر</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="كلمة السر الحالية"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="كلمة السر الجديدة"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
            />
            <button
              type="submit"
              className="w-full bg-[#A08558] text-white py-2 rounded-lg font-bold hover:bg-[#8b7348] transition"
              disabled={pwLoading}
            >
              {pwLoading ? "جاري التغيير..." : "حفظ كلمة السر الجديدة"}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}