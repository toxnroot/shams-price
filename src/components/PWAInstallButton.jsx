'use client';

import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // التحقق من إمكانية التثبيت ونوع الجهاز
  useEffect(() => {
    // التحقق مما إذا كان التطبيق مثبتًا بالفعل
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    if (isStandalone) {
      setIsInstallable(false);
      return;
    }

    // التحقق مما إذا كان الجهاز iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // التحقق من دعم beforeinstallprompt (لـ Android ومتصفحات أخرى)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // إذا كان iOS، تحقق من إمكانية التثبيت
    if (isIOSDevice) {
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // معالجة النقر على زر التثبيت
  const handleInstallClick = async () => {
    if (isIOS) {
      setShowInstructions(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('User choice for PWA install:', outcome);
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    }
  };

  // إغلاق تعليمات iOS
  const closeInstructions = () => {
    setShowInstructions(false);
  };

  // إذا لم يكن التطبيق قابلًا للتثبيت، لا تعرض شيئًا
  if (!isInstallable) {
    return null;
  }

  return (
    <div className="fixed top-8 right-8 z-50">
      {/* زر التثبيت */}
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#A08558] to-[#C4A46B] hover:from-[#C4A46B] hover:to-[#A08558] text-white rounded-xl shadow-lg shadow-[#A08558]/30 hover:shadow-xl hover:shadow-[#A08558]/40 hover:scale-105 transition-all duration-300 font-medium text-sm sm:text-base font-['Cairo'] focus:outline-none"
      >
        <Download size={20} />
        <span>تثبيت التطبيق</span>
      </button>

      {/* تعليمات iOS */}
      {showInstructions && isIOS && (
        <div className="fixed top-20 right-8 bg-[#fff8f0] text-[#333] p-6 rounded-2xl shadow-2xl border border-[#A08558]/20 max-w-sm w-full font-['Cairo'] direction-rtl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">تثبيت التطبيق على iOS</h3>
            <button
              onClick={closeInstructions}
              className="text-[#A08558] font-bold text-lg focus:outline-none"
            >
              ✕
            </button>
          </div>
          <ol className="list-decimal pr-6 text-sm space-y-2">
            <li>اضغط على زر <strong>المشاركة</strong> في متصفح Safari (رمز المربع مع السهم لأعلى).</li>
            <li>اختر <strong>إضافة إلى الشاشة الرئيسية</strong> من القائمة.</li>
            <li>اضغط على <strong>إضافة</strong> في الزاوية العلوية اليمنى.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
