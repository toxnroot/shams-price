// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// قراءة الإعدادات من بارامترات URL التي مرّرناها عند التسجيل
try {
  const url = new URL(self.location);
  const apiKey = url.searchParams.get('apiKey');
  const authDomain = url.searchParams.get('authDomain');
  const projectId = url.searchParams.get('projectId');
  const storageBucket = url.searchParams.get('storageBucket');
  const messagingSenderId = url.searchParams.get('messagingSenderId');
  const appId = url.searchParams.get('appId');

  firebase.initializeApp({
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId
  });
} catch (e) {
  // كخيار احتياطي، اتركها بقيم افتراضية (لن تعمل الإشعارات إن لم تُمَرَّر القيم الصحيحة)
  firebase.initializeApp({
    apiKey: 'fallback',
    authDomain: 'fallback',
    projectId: 'fallback',
    storageBucket: 'fallback',
    messagingSenderId: 'fallback',
    appId: 'fallback'
  });
}

const messaging = firebase.messaging();

// عند استلام إشعار في الخلفية
messaging.onBackgroundMessage((payload) => {
  console.log('تم استلام إشعار في الخلفية:', payload);

  const notificationTitle = payload.notification.title || 'إشعار جديد';
  const notificationOptions = {
    body: payload.notification.body || 'محتوى الإشعار',
    icon: '/logo.ico',
    badge: '/logo.ico',
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: 'فتح'
      },
      {
        action: 'close',
        title: 'إغلاق'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// عند النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  console.log('تم النقر على الإشعار:', event);

  event.notification.close();

  if (event.action === 'open') {
    // فتح التطبيق عند النقر على الإشعار
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// عند إغلاق الإشعار
self.addEventListener('notificationclose', (event) => {
  console.log('تم إغلاق الإشعار:', event);
}); 