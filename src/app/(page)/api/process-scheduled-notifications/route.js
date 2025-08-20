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
    const db = getFirestore();
    const messaging = getMessaging();
    
    // جلب الإشعارات المجدولة التي حان وقتها
    const now = new Date();
    const scheduledNotificationsRef = db.collection('scheduledNotifications');
    const query = scheduledNotificationsRef
      .where('status', '==', 'pending')
      .where('scheduledAt', '<=', now);
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'لا توجد إشعارات مجدولة للتنفيذ',
        processed: 0
      });
    }

    let processedCount = 0;
    let successCount = 0;
    let failCount = 0;

    // معالجة كل إشعار مجدول
    for (const doc of snapshot.docs) {
      const notification = doc.data();
      
      try {
        // جلب tokens الأجهزة
        const tokensRef = db.collection('notificationTokens');
        const tokensSnapshot = await tokensRef.get();
        
        const tokens = [];
        tokensSnapshot.forEach((tokenDoc) => {
          const tokenData = tokenDoc.data();
          if (tokenData.token && notification.selectedTokens?.includes(tokenDoc.id)) {
            tokens.push(tokenData.token);
          }
        });

        if (tokens.length === 0) {
          // تحديث حالة الإشعار إلى فشل
          await doc.ref.update({
            status: 'failed',
            processedAt: now,
            error: 'لا توجد أجهزة صالحة'
          });
          failCount++;
          continue;
        }

        // إرسال الإشعار لجميع الأجهزة
        const message = {
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: notification.data || {},
          tokens: tokens,
        };

        const response = await messaging.sendMulticast(message);
        
        // حساب النجاحات والفشل
        const successTokens = response.responses.filter(r => r.success).length;
        const failedTokens = response.responses.length - successTokens;
        
        // تحديث حالة الإشعار
        await doc.ref.update({
          status: failedTokens === 0 ? 'sent' : 'failed',
          processedAt: now,
          successCount: successTokens,
          failCount: failedTokens,
          messageId: response.messageId
        });

        // حفظ في سجل الإشعارات
        await db.collection('notificationHistory').add({
          title: notification.title,
          body: notification.body,
          recipientCount: tokens.length,
          successCount: successTokens,
          failCount: failedTokens,
          timestamp: now,
          sender: notification.sender || 'admin',
          scheduledNotificationId: doc.id
        });

        processedCount++;
        successCount += successTokens;
        failCount += failedTokens;

      } catch (error) {
        console.error(`خطأ في معالجة الإشعار المجدول ${doc.id}:`, error);
        
        // تحديث حالة الإشعار إلى فشل
        await doc.ref.update({
          status: 'failed',
          processedAt: now,
          error: error.message
        });
        
        failCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم معالجة ${processedCount} إشعار مجدول`,
      processed: processedCount,
      successCount,
      failCount
    });

  } catch (error) {
    console.error('خطأ في معالجة الإشعارات المجدولة:', error);
    
    return NextResponse.json(
      { 
        error: 'فشل في معالجة الإشعارات المجدولة',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 