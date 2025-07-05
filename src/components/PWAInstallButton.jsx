'use client';

import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import Image from 'next/image';

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    if (isStandalone) {
      setIsInstallable(false);
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    const isAndroidDevice = /android/.test(userAgent);

    setIsIOS(isIOSDevice);
    setIsDesktop(!isIOSDevice && !isAndroidDevice);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (isIOSDevice) {
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

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

  const closeInstructions = () => {
    setShowInstructions(false);
  };

  if (!isInstallable) return null;

  return (
    <div className="fixed top-0 right-0 z-50 w-full h-screen bg-white flex justify-center items-center flex-col gap-4">
        <h1>ثبت التطبيق على جهازك</h1>
        <div className='bg-[#a0865867]  h-fit flex justify-center items-center flex-col gap-4 p-4 rounded-md'>
      <div className='flex justify-center items-center gap-2'>
        {isIOS && (
          <div className='apple flex justify-center items-center gap-2 flex-col'>
            <Image src='/apple.png' width={60} height={60} alt='apple' />
            <p>iOS</p>
          </div>
        )}

        {!isIOS && !isDesktop && (
          <div className='android flex justify-center items-center gap-2 flex-col'>
            <Image src='/android.png' width={60} height={60} alt='android' />
            <p>Android</p>
          </div>
        )}

        {isDesktop && (
          <div className='desktop flex justify-center items-center gap-2 flex-col'>
            <Image src='/desktop.png' width={120} height={120} alt='desktop' />
            <p>جهاز الكمبيوتر</p>
          </div>
        )}
      </div>

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
    </div>
  );
}
