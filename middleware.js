// middleware.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// ⚙️ إعداد firebase-admin فقط عند أول استدعاء
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export async function middleware(req) {
    console.log('Middleware is running...');
    
  const token = cookies().get('__session')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const userDoc = await db.doc(`user-admin/${uid}`).get();

    if (!userDoc.exists) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    const userRole = userDoc.data().role;

    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('خطأ التحقق من التوكن:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// 🛡️ تحديد الصفحات المحمية
export const config = {
  matcher: ['/dashboard/:path*'],
};
