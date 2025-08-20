import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * تسجيل الدخول باستخدام بريد أو هاتف أو اسم مستخدم
 * @param {Object} params
 * @param {string} params.identifier البريد أو الهاتف أو اسم المستخدم
 * @param {string} params.password كلمة المرور
 * @param {object} params.auth كائن auth من Firebase
 * @param {object} params.db كائن db من Firestore
 * @returns {Promise<{user: object, token: string}>}
 */
export async function loginUser({ identifier, password, auth, db }) {
  if (!identifier || !password) {
    throw new Error('يرجى إدخال جميع الحقول');
  }

  let emailToUse = identifier;

  // إذا كان الإدخال رقم هاتف
  if (/^\d{10,15}$/.test(identifier)) {
    const q = query(collection(db, 'users'), where('phone', '==', identifier));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error('رقم الهاتف غير مسجل');
    }
    const userData = querySnapshot.docs[0].data();
    emailToUse = userData.email;
  } else if (!identifier.includes('@')) {
    // إذا كان اسم مستخدم
    const q = query(collection(db, 'users'), where('name', '==', identifier));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error('اسم المستخدم غير موجود');
    }
    const userData = querySnapshot.docs[0].data();
    if (!userData.email) {
      throw new Error('البريد الإلكتروني غير موجود لهذا المستخدم');
    }
    emailToUse = userData.email;
  }

  // تسجيل الدخول بالبريد وكلمة المرور
  const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
  const user = userCredential.user;
  const token = await user.getIdToken();
  return { user, token };
} 