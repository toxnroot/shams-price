'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Package, ShoppingCart, Palette, X, Plus, Image as ImageIcon } from 'lucide-react';
import Checkbox from '@/components/NeonCheckbox';
import Loading from '@/components/loading';
import CartButton from '@/components/CartButton';
import { TourProvider, useTour } from '@reactour/tour';

const stepsTour1 = [
  {
    selector: '.btn-text-1',
    content: 'هذا الزر يتحكم بحجم الخط في الصفحة',
  },
  {
    selector: '.clear-colors',
    content: 'انقر هنا لإلغاء اختيار جميع الألوان المحددة',
  },
  {
    selector: '.quantity-input',
    content: 'أدخل الكمية (كجم) أو العدد للون المحدد',
  },
];

const stepsTour2 = [
  {
    selector: '.add-to-cart',
    content: 'انقر هنا لإضافة المنتج إلى السلة',
  },
];

export default function ProductPage() {
  const { product } = useParams();
  const [material, setMaterial] = useState(null);
  const [status, setStatus] = useState('');
  const [inputs, setInputs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [fontSize, setFontSize] = useState('base');
  const [notification, setNotification] = useState('');
  const [imageError, setImageError] = useState(false);

  const decodedProduct = product ? decodeURIComponent(product) : '';

  const { setIsOpen, setSteps } = useTour();

  const logTourInteraction = (elementName) => {
    const timestamp = new Date().toLocaleString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const interaction = { element: elementName, timestamp, page: 'ProductPage' };
    const existingInteractions = JSON.parse(localStorage.getItem('tourInteractions') || '[]');
    existingInteractions.push(interaction);
    localStorage.setItem('tourInteractions', JSON.stringify(existingInteractions));
    console.log('Tour interaction logged:', interaction);
  };

  useEffect(() => {
    if (!decodedProduct) {
      setStatus('اسم المنتج غير موجود');
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const priceingRef = collection(db, 'priceing');
        const querySnapshot = await getDocs(priceingRef);

        let found = null;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          Object.values(data).forEach((section) => {
            const item = section.find((mat) => mat.خامة === decodedProduct);
            if (item) found = item;
          });
        });

        if (found) {
          setMaterial(found);
          setStatus('');
        } else {
          setStatus('المنتج غير موجود');
        }
        setIsLoading(false);
      } catch (error) {
        setStatus(`خطأ: ${error.message}`);
        console.error('Error fetching product:', error);
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [decodedProduct]);

  useEffect(() => {
    const productTour1Completed = localStorage.getItem('productTour1Completed') === 'true';
    const productTour2Completed = localStorage.getItem('productTour2Completed') === 'true';

    const startTour = () => {
      setTimeout(() => {
        if (material && material.الألوان?.length > 0 && !productTour1Completed) {
          const hasElements = document.querySelector('.btn-text-1') && document.querySelector('.clear-colors') && document.querySelector('.quantity-input');
          if (hasElements) {
            setSteps(stepsTour1);
            setIsOpen(true);
          } else {
            console.warn('Tour 1 elements not found in DOM');
            localStorage.setItem('productTour1Completed', 'true');
            setIsOpen(false);
          }
        } else if (material && !productTour2Completed) {
          const hasAddToCart = document.querySelector('.add-to-cart');
          if (hasAddToCart) {
            setSteps(stepsTour2);
            setIsOpen(true);
          } else {
            console.warn('Tour 2 element (.add-to-cart) not found in DOM');
            localStorage.setItem('productTour2Completed', 'true');
            setIsOpen(false);
          }
        } else {
          setIsOpen(false);
        }
      }, 1000);
    };

    if (material) {
      startTour();
    }
  }, [material, setIsOpen, setSteps]);

  const completeTour = (tourNumber) => {
    localStorage.setItem(`productTour${tourNumber}Completed`, 'true');
    setIsOpen(false);
  };

  const handleInputChange = (colorName, field, value) => {
    setInputs((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorName]: {
          ...prev.colors?.[colorName],
          [field]: value,
        },
      },
    }));
    logTourInteraction('إدخال الكمية');
    completeTour(1);
  };

  const handleColorChange = (color, checked) => {
    setInputs((prev) => {
      const currentColors = prev.colors || {};
      if (checked) {
        return {
          ...prev,
          colors: {
            ...currentColors,
            [color]: { quantity: '', count: '' },
          },
        };
      } else {
        const { [color]: _, ...remainingColors } = currentColors;
        return {
          ...prev,
          colors: remainingColors,
        };
      }
    });
  };

  const clearColors = () => {
    setInputs({});
    logTourInteraction('إلغاء الاختيار');
    completeTour(1);
  };

  const addToCart = () => {
    if (!material) return;

    const selectedColors = Object.entries(inputs.colors || {})
      .filter(([_, values]) => (values.quantity && parseFloat(values.quantity) > 0) || (values.count && parseInt(values.count) > 0))
      .map(([name, values]) => ({
        name,
        quantity: parseFloat(values.quantity) || 0,
        count: parseInt(values.count) || 0,
      }));

    if (selectedColors.length === 0) {
      setNotification(`يرجى تعبئة الكمية أو العدد للون واحد على الأقل لـ ${material.خامة}`);
      setTimeout(() => setNotification(''), 2000);
      return;
    }

    const existing = JSON.parse(localStorage.getItem('materialCart') || '[]');
    const existingItemIndex = existing.findIndex((x) => x.خامة === material.خامة);

    let updatedCart;
    if (existingItemIndex !== -1) {
      updatedCart = [...existing];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        colors: selectedColors,
      };
      setNotification(
        `تم تحديث ${material.خامة} (الألوان: ${selectedColors
          .map((c) => {
            const parts = [];
            if (c.quantity > 0) parts.push(`${formatNumber(c.quantity)} كجم`);
            if (c.count > 0) parts.push(`${formatNumber(c.count)} وحدة`);
            return `${c.name} (${parts.join(', ')})`;
          })
          .join(', ')}) في السلة`
      );
    } else {
      updatedCart = [
        ...existing,
        { ...material, colors: selectedColors },
      ];
      setNotification(
        `تم إضافة ${material.خامة} (الألوان: ${selectedColors
          .map((c) => {
            const parts = [];
            if (c.quantity > 0) parts.push(`${formatNumber(c.quantity)} كجم`);
            if (c.count > 0) parts.push(`${formatNumber(c.count)} وحدة`);
            return `${c.name} (${parts.join(', ')})`;
          })
          .join(', ')}) إلى السلة`
      );
    }

    localStorage.setItem('materialCart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
    setTimeout(() => setNotification(''), 2000);
    logTourInteraction('أضف إلى السلة');
    completeTour(2);
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

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        <Loading />
      </div>
    );
  }

  return (
    <TourProvider
      steps={stepsTour1}
      showBadge={false}
      locale={{ close: 'إغلاق', last: 'إنهاء', next: 'التالي', skip: 'تخطي' }}
      styles={{
        popover: (base) => ({
          ...base,
          backgroundColor: '#fff8f0',
          borderRadius: '16px',
          padding: '20px',
          color: '#333',
          fontFamily: 'Cairo, sans-serif',
          direction: 'rtl',
        }),
        maskArea: (base) => ({
          ...base,
          rx: 8,
        }),
        controls: (base) => ({
          ...base,
          justifyContent: 'flex-start',
        }),
        badge: (base) => ({
          ...base,
          backgroundColor: '#A16D28',
        }),
        close: (base) => ({
          ...base,
          color: '#A16D28',
          fontSize: '20px',
          fontWeight: 'bold',
          cursor: 'pointer',
          top: '10px',
        }),
      }}
      onClickNext={({ setCurrentStep, currentStep }) => {
        logTourInteraction('التالي');
        setCurrentStep(currentStep + 1);
      }}
      onClickPrev={({ setCurrentStep, currentStep }) => {
        logTourInteraction('السابق');
        setCurrentStep(currentStep - 1);
      }}
      beforeClose={({ steps }) => {
        logTourInteraction('إنهاء');
        if (steps === stepsTour1) {
          localStorage.setItem('productTour1Completed', 'true');
        } else if (steps === stepsTour2) {
          localStorage.setItem('productTour2Completed', 'true');
        }
      }}
      onAfterClose={() => logTourInteraction('إغلاق')}
      components={{
        Controls: ({ setCurrentStep, currentStep, setIsOpen, steps }) => (
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-[#A08558] text-white rounded-lg"
              onClick={() => {
                logTourInteraction('تخطي');
                setIsOpen(false);
                if (steps === stepsTour1) {
                  localStorage.setItem('productTour1Completed', 'true');
                } else if (steps === stepsTour2) {
                  localStorage.setItem('productTour2Completed', 'true');
                }
              }}
            >
              تخطي
            </button>
            {currentStep > 0 && (
              <button
                className="px-4 py-2 bg-[#A08558] text-white rounded-lg"
                onClick={() => {
                  logTourInteraction('السابق');
                  setCurrentStep(currentStep - 1);
                }}
              >
                السابق
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                className="px-4 py-2 bg-[#A08558] text-white rounded-lg"
                onClick={() => {
                  logTourInteraction('التالي');
                  setCurrentStep(currentStep + 1);
                }}
              >
                التالي
              </button>
            ) : (
              <button
                className="px-4 py-2 bg-[#A08558] text-white rounded-lg"
                onClick={() => {
                  logTourInteraction('إنهاء');
                  setIsOpen(false);
                  if (steps === stepsTour1) {
                    localStorage.setItem('productTour1Completed', 'true');
                  } else if (steps === stepsTour2) {
                    localStorage.setItem('productTour2Completed', 'true');
                  }
                }}
              >
                إنهاء
              </button>
            )}
          </div>
        ),
      }}
    >
      <div className="max-w-[95vw] sm:max-w-5xl mx-auto p-8 bg-gradient-to-br from-white to-[#A08558]/5 rounded-3xl shadow-2xl mt-8 border border-[#A08558]/20 relative overflow-hidden">
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

        {notification && (
          <div className="fixed top-8 right-8 bg-gradient-to-r from-[#A08558] to-[#C4A46B] text-white px-6 py-4 rounded-2xl shadow-2xl transition-all duration-500 z-50 max-w-sm">
            <div className="flex items-center gap-3">
              <ShoppingCart size={20} />
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

        {material ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-[#A08558]/10 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="flex-1">
                <h1 className={`${getFontSize('2xl')} font-bold text-gray-800 mb-4`}>{material.خامة}</h1>
                <p className={`${getFontSize('lg')} text-[#A08558] font-semibold mb-2`}>السعر: {formatNumber(material.سعر)} جنيه</p>
                <p
                  className={`${getFontSize('base')} px-2 py-2 rounded-full font-medium inline-block mb-4 ${
                    material.الحالة === 'متاح' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                  }`}
                >
                  {material.الحالة}
                </p>
                {material.صورة && !imageError ? (
                  <img
                    src={material.صورة}
                    alt={material.خامة}
                    className="w-full max-w-md h-auto rounded-lg mb-4"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full max-w-md h-48 flex items-center justify-center bg-[#a16c28c0] rounded-lg mb-4">
                    <ImageIcon size={70} strokeWidth={1} className="text-[#fff]" />
                  </div>
                )}
                {material.الألوان?.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Palette size={20} className="text-[#A08558]" />
                      <h4 className={`${getFontSize('lg')} font-semibold text-gray-700`}>الألوان المتاحة</h4>
                    </div>
                    <div className="grid gap-4">
                      {material.الألوان.map((color, i) => (
                        <div key={i} className="bg-gray-50/50 rounded-2xl p-4 border border-gray-200/50 hover:border-[#A08558]/30 transition-all duration-300">
                          <Checkbox
                            id={`${material.خامة}-${color.name}`}
                            checked={inputs.colors?.[color.name] !== undefined}
                            onChange={(e) => handleColorChange(color.name, e.target.checked)}
                            label={
                              <div className="flex items-center gap-2">
                                <div className="relative">
                                  <span
                                    className="w-8 h-8 rounded-full border-2 border-white shadow-lg ring-2 ring-gray-200 block"
                                    style={{ backgroundColor: color.code }}
                                  ></span>
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#A08558] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                                <span className={`${getFontSize('lg')} font-medium text-gray-800`}>{color.name}</span>
                              </div>
                            }
                          />
                          {inputs.colors?.[color.name] && (
                            <div className="mt-1 pr-12 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="space-y-2">
                                <label className={`${getFontSize('base')} text-[#A08558] font-medium flex items-center gap-2`}>
                                  <span>الكمية (كجم)</span>
                                </label>
                                <input
                                  placeholder="الكيلو"
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={inputs.colors[color.name].quantity}
                                  onChange={(e) => handleInputChange(color.name, 'quantity', e.target.value)}
                                  className={`quantity-input w-full px-4 py-3 border-2 border-[#A08558]/20 rounded-xl ${getFontSize('base')} focus:outline-none focus:border-[#A08558] focus:ring-4 focus:ring-[#A08558]/20 transition-all duration-300`}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className={`${getFontSize('base')} text-[#A08558] font-medium flex items-center gap-2`}>
                                  <span>العدد</span>
                                </label>
                                <input
                                  placeholder="عدد الأتواب"
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={inputs.colors[color.name].count}
                                  onChange={(e) => handleInputChange(color.name, 'count', e.target.value)}
                                  className={`quantity-input w-full px-4 py-3 border-2 border-[#A08558]/20 rounded-xl ${getFontSize('base')} focus:outline-none focus:border-[#A08558] focus:ring-4 focus:ring-[#A08558]/20 transition-all duration-300`}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {inputs.colors && Object.keys(inputs.colors).length > 0 && (
                      <button
                        onClick={clearColors}
                        className={`clear-colors ${getFontSize('base')} flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-300 font-medium mx-auto mt-4`}
                      >
                        <X size={18} />
                        إلغاء الاختيار
                      </button>
                    )}
                  </div>
                )}
                <button
                  onClick={addToCart}
                  disabled={material.الحالة !== 'متاح'}
                  className={`add-to-cart w-full flex items-center justify-center gap-3 ${getFontSize('lg')} font-semibold py-3 px-4 rounded-2xl transition-all duration-300 ${
                    material.الحالة === 'متاح'
                      ? 'bg-gradient-to-r from-[#A08558] to-[#C4A46B] hover:from-[#C4A46B] hover:to-[#A08558] text-white shadow-lg shadow-[#A08558]/30 hover:shadow-xl hover:shadow-[#A08558]/40 hover:scale-105'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart size={20} />
                  <span>أضف إلى السلة</span>
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-[#A08558]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={32} className="text-[#A08558]" />
            </div>
            <p className={`${getFontSize('xl')} text-gray-500 font-medium mb-2`}>المنتج غير متاح</p>
            <p className={`${getFontSize('base')} text-gray-400`}>يرجى التحقق من اسم المنتج أو العودة لاحقًا</p>
          </div>
        )}
        <CartButton />
      </div>
    </TourProvider>
  );
}
