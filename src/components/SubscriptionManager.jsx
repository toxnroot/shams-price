'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SubscriptionManager = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب جميع الاشتراكات
  const fetchSubscriptions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'notificationTokens'));
      const subscriptionsList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.token) {
          subscriptionsList.push({
            id: doc.id,
            token: data.token,
            userId: data.userId,
            userName: data.userName || 'مستخدم غير محدد',
            userEmail: data.userEmail || 'غير محدد',
            role: data.role || 'user',
            timestamp: data.timestamp?.toDate()
          });
        }
      });
      setSubscriptions(subscriptionsList);
    } catch (error) {
      console.error('خطأ في جلب الاشتراكات:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // حذف اشتراك
  const deleteSubscription = async (subscriptionId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاشتراك؟')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'notificationTokens', subscriptionId));
      alert('تم حذف الاشتراك بنجاح!');
      fetchSubscriptions(); // إعادة تحميل القائمة
    } catch (error) {
      console.error('خطأ في حذف الاشتراك:', error);
      alert('حدث خطأ في حذف الاشتراك');
    }
  };

  // تنسيق التاريخ
  const formatDate = (date) => {
    if (!date) return 'غير محدد';
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // الحصول على لون الدور
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // الحصول على نص الدور
  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'user': return 'مستخدم عادي';
      default: return 'غير محدد';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          إدارة الاشتراكات
        </h2>
        <button
          onClick={fetchSubscriptions}
          disabled={loading}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {loading ? 'جاري التحديث...' : 'تحديث القائمة'}
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">جاري تحميل الاشتراكات...</p>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📱</div>
          <p className="text-gray-600">لا توجد اشتراكات في الإشعارات</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* إحصائيات سريعة */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">إحصائيات الاشتراكات</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">إجمالي الاشتراكات:</span>
                <span className="font-medium ml-2">{subscriptions.length}</span>
              </div>
              <div>
                <span className="text-gray-600">المديرين:</span>
                <span className="font-medium ml-2">
                  {subscriptions.filter(s => s.role === 'admin').length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">المستخدمين العاديين:</span>
                <span className="font-medium ml-2">
                  {subscriptions.filter(s => s.role === 'user').length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">آخر اشتراك:</span>
                <span className="font-medium ml-2">
                  {subscriptions.length > 0 
                    ? formatDate(subscriptions[0].timestamp)
                    : 'لا يوجد'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* قائمة الاشتراكات */}
          <div className="space-y-3">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {subscription.userName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(subscription.role)}`}>
                        {getRoleText(subscription.role)}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>البريد الإلكتروني: {subscription.userEmail}</p>
                      <p>معرف المستخدم: {subscription.userId}</p>
                      <p>تاريخ الاشتراك: {formatDate(subscription.timestamp)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => deleteSubscription(subscription.id)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="حذف الاشتراك"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager; 