import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { getFirestore } from 'firebase-admin/firestore';

// تهيئة Firebase Admin إذا لم يكن موجوداً
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request) {
  try {
    const { title, body, token, data } = await request.json();

    if (!title || !body || !token) {
      return NextResponse.json(
        { error: 'يجب توفير العنوان والمحتوى ورمز الجهاز' },
        { status: 400 }
      );
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      token,
    };

    const messaging = getMessaging();
    const response = await messaging.send(message);

    console.log('تم إرسال الإشعار بنجاح:', response);

    // حفظ سجل الإشعار في Firestore
    try {
      const db = getFirestore();
      await db.collection('notificationHistory').add({
        title,
        body,
        recipientCount: 1,
        successCount: 1,
        failCount: 0,
        timestamp: new Date(),
        sender: 'admin',
        messageId: response
      });
    } catch (dbError) {
      console.error('خطأ في حفظ سجل الإشعار:', dbError);
    }

    return NextResponse.json({
      success: true,
      messageId: response,
      message: 'تم إرسال الإشعار بنجاح'
    });

  } catch (error) {
    console.error('خطأ في إرسال الإشعار:', error);
    
    // حفظ سجل الفشل
    try {
      const db = getFirestore();
      await db.collection('notificationHistory').add({
        title: title || 'إشعار فاشل',
        body: body || 'محتوى الإشعار',
        recipientCount: 1,
        successCount: 0,
        failCount: 1,
        timestamp: new Date(),
        sender: 'admin',
        error: error.message
      });
    } catch (dbError) {
      console.error('خطأ في حفظ سجل الفشل:', dbError);
    }
    
    return NextResponse.json(
      { 
        error: 'فشل في إرسال الإشعار',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 