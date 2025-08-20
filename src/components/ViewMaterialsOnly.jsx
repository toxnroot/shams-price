'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Package, Search, Sparkles } from 'lucide-react';
import Loading from '@/components/loading';
import ProductCard from '@/components/ProductCard';
import { useTour } from '@reactour/tour';

export default function ViewMaterialsOnly({ section, id, logTourInteraction }) {
  const [notification, setNotification] = useState('');
  const [materials, setMaterials] = useState([]);
  const [status, setStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [fontSize, setFontSize] = useState('base');

  const { setIsOpen, setSteps } = useTour();

  useEffect(() => {
    if (!section || !id) {
      setStatus('القسم أو المعرف غير موجود');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const docRef = doc(db, 'priceing', section);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data[id]) {
            setMaterials(data[id] || []);
            setStatus('');
          } else {
            setMaterials([]);
            setStatus(`المعرف "${id}" غير موجود في القسم "${section}"`);
          }
        } else {
          setMaterials([]);
          setStatus(`القسم "${section}" غير موجود`);
        }
        setIsLoading(false);
      },
      (error) => {
        setStatus(`خطأ: ${error.message}`);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [section, id]);

  useEffect(() => {
    const stepsTour1 = [
      {
        selector: '.btn-text-1',
        content: 'هذا الزر يتحكم بحجم الخط في الصفحة',
      },
      {
        selector: '.search',
        content: 'يمكنك البحث عن الخامات هنا أو لون معين وستجد الخامات المتاحة فيها اللون',
      },
    ];

    const stepsTour2 = [
      {
        selector: '.order-now',
        content: 'انقر على "اطلب الآن" لتقديم طلب الخامة',
      },
    ];

    const tour1Completed = localStorage.getItem('tour1Completed') === 'true';
    const tour2Completed = localStorage.getItem('tour2Completed') === 'true';

    const startTour = () => {
      setTimeout(() => {
        if (!tour1Completed) {
          setSteps(stepsTour1);
          setIsOpen(true);
        } else if (!tour2Completed && materials.length > 0) {
          setSteps(stepsTour2);
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      }, 1000);
    };

    startTour();
  }, [setIsOpen, setSteps, materials]);

  const completeTour = (tourNumber) => {
    localStorage.setItem(`tour${tourNumber}Completed`, 'true');
    setIsOpen(false);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ar-EG', { minimumFractionDigits: 2 }).format(num);
  };

  const getFontSize = (baseSize) => {
    const sizes = {
      base: { sm: 'text-xs', base: 'text-sm', lg: 'text-base', xl: 'text-lg', '2xl': 'text-xl' },
      large: { sm: 'text-sm', base: 'text-base', lg: 'text-lg', xl: 'text-xl', '2xl': 'text-2xl' },
      xlarge: { sm: 'text-base', base: 'text-lg', lg: 'text-xl', xl: 'text-2xl', '2xl': 'text-3xl' },
    };
    return sizes[fontSize][baseSize] || baseSize;
  };

  const filteredMaterials = useMemo(() => {
    if (!searchQuery) return materials;
    return materials.filter(
      (item) =>
        item.خامة.includes(searchQuery) ||
        item.الألوان.some((color) => color.name.includes(searchQuery))
    );
  }, [materials, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-[95vw] sm:max-w-full mx-auto pt-8 bg-gradient-to-br from-white to-[#A08558]/5 rounded-3xl shadow-2xl mt-8 border border-[#A08558]/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#A08558] via-[#C4A46B] to-[#A08558]"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#A08558]/10 to-transparent rounded-full -translate-y-8 translate-x-8"></div>

      <div className="flex flex-wrap justify-center gap-3 mb-8 relative z-10">
        <button
          onClick={() => setFontSize('base')}
          className={`${getFontSize('base')} px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            fontSize === 'base'
              ? 'bg-[#A08558] text-white shadow-lg shadow-[#A08558]/30'
              : 'bg-[#A08558]/10 text-[#A08558] hover:bg-[#A08558]/20'
          }`}
        >
          حجم افتراضي
        </button>
        <button
          onClick={() => {
            setFontSize('large');
            logTourInteraction('حجم كبير');
            completeTour(1);
          }}
          className={`btn-text-1 ${getFontSize('base')} px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            fontSize === 'large'
              ? 'bg-[#A08558] text-white shadow-lg shadow-[#A08558]/30'
              : 'bg-[#A08558]/10 text-[#A08558] hover:bg-[#A08558]/20'
          }`}
        >
          حجم كبير
        </button>
        <button
          onClick={() => setFontSize('xlarge')}
          className={`${getFontSize('base')} px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            fontSize === 'xlarge'
              ? 'bg-[#A08558] text-white shadow-lg shadow-[#A08558]/30'
              : 'bg-[#A08558]/10 text-[#A08558] hover:bg-[#A08558]/20'
          }`}
        >
          حجم أكبر
        </button>
      </div>

      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center gap-4 bg-gradient-to-r from-[#A08558] to-[#C4A46B] text-white px-8 py-4 rounded-2xl shadow-lg">
          <Package size={32} className="animate-pulse" />
          <div className="text-right">
            <h1 className={`${getFontSize('xl')} font-bold`}>{section}</h1>
            <p className={`${getFontSize('base')} opacity-90`}>{id}</p>
          </div>
          <Sparkles size={24} className="animate-pulse" />
        </div>
      </div>

      <div className="search relative mb-8 max-w-md mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن خامة أو لون..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              logTourInteraction('البحث');
              completeTour(1);
            }}
            className={`w-full pr-12 pl-4 py-4 border-2 border-[#A08558]/20 rounded-2xl ${getFontSize('base')} focus:outline-none focus:border-[#A08558] focus:ring-4 focus:ring-[#A08558]/20 transition-all duration-300 bg-white/80 backdrop-blur-sm`}
          />
          <Search size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#A08558]" />
        </div>
      </div>

      {notification && (
        <div className="fixed top-8 right-8 bg-gradient-to-r from-[#A08558] to-[#C4A46B] text-white px-6 py-4 rounded-2xl shadow-2xl transition-all duration-500 z-50 max-w-sm">
          <div className="flex items-center gap-3">
            <span className={`${getFontSize('base')}`}>{notification}</span>
          </div>
        </div>
      )}

      {status && (
        <div
          className={`text-center mb-6 p-4 rounded-2xl ${getFontSize('base')} ${
            status.includes('بنجاح') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {status}
        </div>
      )}

      {filteredMaterials.length > 0 ? (
        <div className="grid gap-6 w-full">
          {filteredMaterials.map((item, index) => (
            <ProductCard
              key={index}
              item={item}
              index={index}
              getFontSize={getFontSize}
              formatNumber={formatNumber}
              logTourInteraction={logTourInteraction}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-[#A08558]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={32} className="text-[#A08558]" />
          </div>
          <p className={`${getFontSize('xl')} text-gray-500 font-medium mb-2`}>لا توجد خامات متاحة</p>
          <p className={`${getFontSize('base')} text-gray-400`}>سيتم عرض الخامات هنا عند توفرها</p>
        </div>
      )}
    </div>
  );
}
