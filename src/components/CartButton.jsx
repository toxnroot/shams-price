'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import Cart from './Cart';
import { usePathname } from 'next/navigation';
import { createContext, useContext } from 'react';

const CartDrawerContext = createContext();

export function useCartDrawer() {
  return useContext(CartDrawerContext);
}

export function CartDrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <CartDrawerContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </CartDrawerContext.Provider>
  );
}

// تعريف المسارات التي سيتم إخفاء زر السلة فيها
const HIDDEN_PATHS = ['/auth/login', '/auth/admin-login'];

export default function CartButton({ inNavbar }) {
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useCartDrawer();

  // دالة لتحديث عدد العناصر في السلة باستخدام useCallback لتحسين الأداء
  const updateCartCount = useCallback(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('materialCart') || '[]');
      setCartCount(Array.isArray(stored) ? stored.length : 0);
    } catch (error) {
      console.error('Error parsing materialCart from localStorage:', error);
      setCartCount(0);
    }
  }, []);

  // إعداد useEffect لتحديث عدد العناصر وإضافة مستمعي الأحداث
  useEffect(() => {
    updateCartCount(); // التحديث الأولي عند تحميل المكون

    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);

    // تنظيف مستمعي الأحداث عند إلغاء تحميل المكون
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, [updateCartCount]);

  // إخفاء المكون في المسارات المحددة أو أي مسار يبدأ بـ /dashboard/ أو يحتوي على /ath
  if (HIDDEN_PATHS.includes(pathname) || pathname.startsWith('/dashboard')) {
    return null;
  }

  const toggleCart = () => setIsOpen((prev) => !prev);

  // الزر فقط
  const button = inNavbar ? (
    <button
      className="relative px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-[#A08558] focus:outline-none"
      aria-label={`عرض السلة (${cartCount} عنصر)`}
      onClick={toggleCart}
    >
      <ShoppingCart className="w-5 h-5" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {cartCount}
        </span>
      )}
    </button>
  ) : (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleCart}
        className="relative flex items-center gap-2 px-3 py-2 bg-[#A08558] text-white rounded-full shadow-lg hover:bg-[#8b7348] focus:outline-none focus:ring-1 focus:ring-[#A08558] transition duration-200"
        aria-label={`عرض السلة (${cartCount} عنصر)`}
      >
        <ShoppingCart size={18} />
        <span className="text-sm">السلة</span>
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );

  // Drawer دائماً في الصفحة
  return (
    <>
      {button}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={toggleCart}
            aria-hidden="true"
          />
          <div className="fixed bottom-0 left-0 right-0 w-full max-w-[95vw] sm:max-w-md mx-auto bg-white rounded-t-xl shadow-2xl p-4 transition-all duration-300 ease-in-out transform origin-bottom max-h-[80vh] overflow-y-auto z-50">
            <button
              onClick={toggleCart}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
              aria-label="إغلاق السلة"
              title="إغلاق"
            >
              <X size={20} />
            </button>
            <Cart />
          </div>
        </>
      )}
    </>
  );
}