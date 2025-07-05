'use client';

import { useEffect, useState } from 'react';
import { Trash2, Send, ShoppingCart } from 'lucide-react';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [undoTimeout, setUndoTimeout] = useState(null);
  const [fontSize, setFontSize] = useState('base');

  useEffect(() => {
    setIsLoading(true);
    const stored = localStorage.getItem('materialCart');
    if (stored) {
      setCart(JSON.parse(stored));
    }
    setIsLoading(false);

    const handleStorageChange = () => {
      const updatedCart = JSON.parse(localStorage.getItem('materialCart') || '[]');
      setCart(updatedCart);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  const updateQuantity = (itemName, colorName, quantity) => {
    const updated = cart.map((item) =>
      item.خامة === itemName
        ? {
            ...item,
            colors: item.colors.map((color) =>
              color.name === colorName ? { ...color, quantity: parseFloat(quantity) || 0 } : color
            ),
          }
        : item
    );
    setCart(updated);
    localStorage.setItem('materialCart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateCount = (itemName, colorName, count) => {
    const updated = cart.map((item) =>
      item.خامة === itemName
        ? {
            ...item,
            colors: item.colors.map((color) =>
              color.name === colorName ? { ...color, count: parseInt(count) || 0 } : color
            ),
          }
        : item
    );
    setCart(updated);
    localStorage.setItem('materialCart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeFromCart = (itemName) => {
    setPendingDelete(itemName);
    const timeout = setTimeout(() => {
      const updated = cart.filter((item) => item.خامة !== itemName);
      setCart(updated);
      localStorage.setItem('materialCart', JSON.stringify(updated));
      window.dispatchEvent(new Event('cartUpdated'));
      setPendingDelete(null);
    }, 5000);
    setUndoTimeout(timeout);
  };

  const undoDelete = () => {
    clearTimeout(undoTimeout);
    setPendingDelete(null);
  };

  const sendWhatsAppOrder = () => {
    const messageLines = [
      '🛒 *طلب خامات جديد* 🛒',
      '---------------------------',
      ...cart.map(
        (item, index) =>
          `${index + 1}. *${item.خامة}*\n   - الألوان: ${item.colors
            .map((color) => {
              const parts = [];
              if (color.quantity > 0) parts.push(`${formatNumber(color.quantity)} كجم`);
              if (color.count > 0) parts.push(`${formatNumber(color.count)} توب`);
              return `${color.name} (${parts.join(', ')})`;
            })
            .join(' و ')}\n \n`
      ),
      '---------------------------',
      'شكرًا لتسوقكم معنا! 🙌',
    ];
    const fullMessage = messageLines.join('\n');

    const phone = '201278489905';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`;
    window.open(url, '_blank');
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.colors.reduce((subSum, color) => subSum + color.quantity * item.سعر, 0), 0);

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
      <div className="flex justify-center items-center min-h-[40vh] max-w-[95vw] sm:max-w-4xl mx-auto sm:mx-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A88C5C]"></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-6 max-w-[95vw] sm:max-w-4xl mx-auto sm:mx-8">
        <ShoppingCart size={48} className="text-gray-400 mb-4" />
        <p className={`${getFontSize('xl')} text-gray-500 font-medium`}>سلة المشتريات فارغة</p>
        <p className={`${getFontSize('base')} text-gray-400 mt-2`}>ابدأ بإضافة بعض المنتجات إلى السلة!</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl max-w-[95vw] sm:max-w-4xl mx-auto sm:mx-8 w-full box-border" style={{ direction: 'rtl' }}>
      <div className="flex flex-wrap justify-center gap-3 mb-4">
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
      <div className="flex items-center justify-between mb-6">
        <h2 className={`${getFontSize('2xl')} font-bold text-white flex items-center gap-3 bg-[#3636366b] px-4 py-2 rounded-lg`}>
          <ShoppingCart size={28} className="text-[#fff]" />
          سلة المشتريات
        </h2>
        <span className={`${getFontSize('base')} text-gray-500`}>{cart.length} عنصر</span>
      </div>

      {pendingDelete && (
        <div className={`fixed top-4 left-4 bg-red-100 text-red-800 px-4 py-3 rounded-md shadow-md flex items-center gap-3 ${getFontSize('lg')}`}>
          <span>سيتم حذف {pendingDelete}...</span>
          <button
            onClick={undoDelete}
            className={`${getFontSize('lg')} text-[#A08558] hover:text-teal-700 font-medium`}
          >
            تراجع
          </button>
        </div>
      )}

      <div className="space-y-4">
        {cart.map((item, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-start sm:justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow gap-3"
          >
            <div className="flex-1">
              <p className={`${getFontSize('lg')} font-semibold text-gray-800`}>
                الخامة: {item.خامة}
              </p>
              <p className={`${getFontSize('base')} text-gray-600`}>سعر الوحدة: {formatNumber(item.سعر)} جنيه</p>
              <div className="mt-3 space-y-3">
                {item.colors.map((color, j) => (
                  <div key={j} className="flex flex-col gap-3">
                    <p className={`${getFontSize('base')} text-gray-600`}>اللون: {color.name}</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div>
                        <label className={`${getFontSize('base')} text-gray-600`}>الكمية (كجم):</label>
                        <input
                          type="number"
                          value={color.quantity}
                          min="0"
                          step="0.1"
                          onChange={(e) => updateQuantity(item.خامة, color.name, e.target.value)}
                          className={`mt-1 px-3 py-2 border border-gray-300 rounded-md w-full sm:w-28 ${getFontSize('base')} focus:outline-none focus:ring-1 focus:ring-teal-500`}
                        />
                      </div>
                      <div>
                        <label className={`${getFontSize('base')} text-gray-600`}>العدد:</label>
                        <input
                          type="number"
                          value={color.count}
                          min="0"
                          step="1"
                          onChange={(e) => updateCount(item.خامة, color.name, e.target.value)}
                          className={`mt-1 px-3 py-2 border border-gray-300 rounded-md w-full sm:w-28 ${getFontSize('base')} focus:outline-none focus:ring-1 focus:ring-teal-500`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => removeFromCart(item.خامة)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition"
              title="حذف"
            >
              <Trash2 size={24} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <span className={`${getFontSize('lg')} font-semibold text-gray-800`}>الإجمالي الكلي:</span>
          <span className={`${getFontSize('xl')} font-bold text-[#A08558]`}>{formatNumber(totalAmount)} جنيه</span>
        </div>
        <button
          onClick={sendWhatsAppOrder}
          className={`w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-3 px-4 rounded-lg hover:bg-[#000] transition focus:outline-none focus:ring-1 focus:ring-[#25D366] ${getFontSize('lg')}`}
        >
          <Send size={20} />
          إرسال الطلب عبر واتساب
        </button>
      </div>
    </div>
  );
}