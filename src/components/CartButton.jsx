'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import Cart from './Cart';

export default function CartButton() {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    const stored = JSON.parse(localStorage.getItem('materialCart') || '[]');
    setCartCount(stored.length);
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center gap-2 px-3 py-2 bg-[#A08558] text-white rounded-full shadow-lg hover:bg-[#8b7348] focus:outline-none focus:ring-1 focus:ring-[#A08558] transition duration-200"
      >
        <ShoppingCart size={18} />
        <span className="text-sm">السلة</span>
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 w-full max-w-[95vw] sm:max-w-md mx-auto bg-white rounded-t-xl shadow-2xl p-4 transition-all duration-300 ease-in-out transform origin-bottom max-h-[80vh] overflow-y-auto z-50">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
              title="إغلاق"
            >
              <X size={20} />
            </button>
            <Cart />
          </div>
        </>
      )}
    </div>
  );
}