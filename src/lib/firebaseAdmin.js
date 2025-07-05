import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!globalThis.firebaseAdmin) {
  try {
    globalThis.firebaseAdmin = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('خطأ في تهيئة Firebase Admin:', error);
    throw error;
  }
}

export const adminAuth = getAuth(globalThis.firebaseAdmin);