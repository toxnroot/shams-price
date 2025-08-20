# إعداد Firebase Messaging للإشعارات

## المتطلبات الأساسية

### 1. متغيرات البيئة المطلوبة

أضف المتغيرات التالية إلى ملف `.env.local`:

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase VAPID Key (للإشعارات)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key

# Firebase Admin SDK (للإرسال من الخادم)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
```

### 2. تثبيت الحزم المطلوبة

```bash
npm install firebase-admin
```

## خطوات الإعداد

### 1. إعداد Firebase Console

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك أو أنشئ مشروعاً جديداً
3. اذهب إلى **Project Settings** > **General**
4. انسخ إعدادات Firebase إلى ملف `.env.local`

### 2. إعداد Cloud Messaging

1. في Firebase Console، اذهب إلى **Project Settings** > **Cloud Messaging**
2. في قسم **Web configuration**، انقر على **Generate key pair**
3. انسخ **VAPID key** إلى `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

### 3. إعداد Service Account

1. في Firebase Console، اذهب إلى **Project Settings** > **Service accounts**
2. انقر على **Generate new private key**
3. احفظ الملف JSON
4. انسخ `project_id` إلى `FIREBASE_PROJECT_ID`
5. انسخ `client_email` إلى `FIREBASE_CLIENT_EMAIL`
6. انسخ `private_key` إلى `FIREBASE_PRIVATE_KEY`

### 4. تحديث Service Worker

في ملف `public/firebase-messaging-sw.js`، استبدل إعدادات Firebase بإعداداتك:

```javascript
firebase.initializeApp({
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
});
```

## الميزات المتاحة

### 1. إدارة الإشعارات في لوحة التحكم

- **الاشتراك في الإشعارات**: طلب إذن الإشعارات وحفظ token
- **إرسال إشعار تجريبي**: اختبار الإشعارات
- **إلغاء الاشتراك**: إزالة token من قاعدة البيانات
- **عرض الإشعارات الواردة**: قائمة بالإشعارات المستلمة

### 2. إرسال الإشعارات

- **إرسال فوري**: إرسال إشعارات فورية لجميع الأجهزة أو أجهزة محددة
- **اختيار الأجهزة**: تحديد الأجهزة المستهدفة من قائمة الأجهزة المشتركة
- **إحصائيات فورية**: عرض عدد الأجهزة المحددة وحالة الإرسال

### 3. الإشعارات المجدولة

- **جدولة الإشعارات**: تحديد تاريخ ووقت لإرسال الإشعارات
- **إدارة الجدولة**: عرض وتعديل وإلغاء الإشعارات المجدولة
- **معالجة تلقائية**: معالجة الإشعارات المجدولة عند حلول موعدها

### 4. سجل الإشعارات

- **تاريخ الإشعارات**: عرض جميع الإشعارات المرسلة مع تفاصيلها
- **إحصائيات شاملة**: إجمالي الإشعارات والأجهزة والنجاحات والفشل
- **تتبع الحالة**: معرفة حالة كل إشعار (نجح، فشل، جزئي)

### 5. API للإرسال

```javascript
// إرسال إشعار فوري
const response = await fetch('/api/send-notification', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'عنوان الإشعار',
    body: 'محتوى الإشعار',
    token: 'device-token',
    data: { key: 'value' } // بيانات إضافية
  }),
});

// معالجة الإشعارات المجدولة
const scheduledResponse = await fetch('/api/process-scheduled-notifications', {
  method: 'POST'
});
```

### 6. Service Worker

- **إشعارات الخلفية**: عرض الإشعارات حتى عندما يكون التطبيق مغلقاً
- **تفاعل مع الإشعارات**: فتح التطبيق عند النقر على الإشعار
- **أيقونات مخصصة**: استخدام أيقونة التطبيق في الإشعارات

## استكشاف الأخطاء

### مشاكل شائعة

1. **لا تظهر الإشعارات**:
   - تأكد من منح إذن الإشعارات في المتصفح
   - تحقق من صحة VAPID key
   - تأكد من تسجيل service worker

2. **خطأ في إرسال الإشعارات**:
   - تحقق من صحة Firebase Admin credentials
   - تأكد من صحة device token

3. **Service Worker لا يعمل**:
   - تأكد من أن الموقع يعمل على HTTPS
   - تحقق من console للأخطاء

### فحص الحالة

```javascript
// فحص إذن الإشعارات
console.log('Notification permission:', Notification.permission);

// فحص تسجيل Service Worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Worker registrations:', registrations);
});
```

## إعداد معالجة الإشعارات المجدولة

### 1. إعداد Cron Job

للمعالجة التلقائية للإشعارات المجدولة، يمكنك إعداد cron job:

```bash
# تشغيل كل دقيقة
* * * * * curl -X POST https://your-domain.com/api/process-scheduled-notifications

# أو تشغيل كل 5 دقائق
*/5 * * * * curl -X POST https://your-domain.com/api/process-scheduled-notifications
```

### 2. إعداد Vercel Cron (إذا كنت تستخدم Vercel)

أضف إلى ملف `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/process-scheduled-notifications",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### 3. إعداد معالج يدوي

يمكنك أيضاً إضافة زر في لوحة التحكم لمعالجة الإشعارات المجدولة يدوياً:

```javascript
const processScheduledNotifications = async () => {
  try {
    const response = await fetch('/api/process-scheduled-notifications', {
      method: 'POST'
    });
    const result = await response.json();
    console.log('نتيجة المعالجة:', result);
  } catch (error) {
    console.error('خطأ في معالجة الإشعارات المجدولة:', error);
  }
};
```

## ملاحظات مهمة

1. **HTTPS مطلوب**: Service Worker يعمل فقط على HTTPS
2. **إذن المستخدم**: يجب على المستخدم منح إذن الإشعارات
3. **Token صالح**: يجب أن يكون device token صالحاً وحديثاً
4. **Firebase Admin**: مطلوب لإرسال الإشعارات من الخادم
5. **معالجة الإشعارات المجدولة**: تأكد من إعداد cron job أو معالج دوري
6. **حدود Firebase**: لا تتجاوز حدود Firebase Messaging (1000 إشعار/ثانية)

## الدعم

إذا واجهت أي مشاكل، تحقق من:
- console المتصفح للأخطاء
- Firebase Console للرسائل
- Network tab في Developer Tools
- سجلات الخادم لمعالجة الإشعارات المجدولة 