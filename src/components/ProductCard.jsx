'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Plus, Image as ImageIcon } from 'lucide-react';
import { useTour } from '@reactour/tour';

export default function ProductCard({ item, index, getFontSize, formatNumber, logTourInteraction }) {
  const [imageError, setImageError] = useState(false);
  const { setIsOpen } = useTour();

  const completeTour = () => {
    localStorage.setItem('tour2Completed', 'true');
    setIsOpen(false);
  };

  return (
    <div className="card-det bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-[#A08558]/10 p-4 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#A08558] to-[#C4A46B] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-2 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-[#A08558] rounded-full animate-pulse"></div>
            <h3 className={`${getFontSize('xl')} font-bold text-gray-800`}>{item.خامة}</h3>
            <div className="flex items-center">
              <span
                className={`${getFontSize('base')} px-2 py-2 rounded-full font-medium ${
                  item.الحالة === 'متاح'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}
              >
                {item.الحالة}
              </span>
            </div>
          </div>
          <div className="bg-[#A08558]/5 rounded-xl p-1 flex items-center gap-4 justify-between">
            <p className={`${getFontSize('2xl')} text-[#17b145] font-semibold`}>
              السعر: {formatNumber(item.سعر)} جنيه
            </p>
            {item.صورة && !imageError ? (
              <img
                src={item.صورة}
                alt={item.خامة}
                className="w-16 h-16 object-cover rounded-lg"
                onError={() => setImageError(true)}
              />
            ) : (
              <ImageIcon size={70} strokeWidth={1} className="text-[#fff] bg-[#a16c28c0] rounded-lg" />
            )}
          </div>
        </div>
      </div>

      <Link href={`/product/${encodeURIComponent(item.خامة)}`}>
        <button
          onClick={() => {
            logTourInteraction('اطلب الآن');
            completeTour();
          }}
          className={`order-now w-full mt-4 flex items-center justify-center gap-3 ${getFontSize('lg')} font-semibold py-2 px-2 rounded-2xl transition-all duration-300 ${
            item.الحالة === 'متاح'
              ? 'bg-gradient-to-r from-[#A08558] to-[#C4A46B] hover:from-[#C4A46B] hover:to-[#A08558] text-white shadow-lg shadow-[#A08558]/30 hover:shadow-xl hover:shadow-[#A08558]/40 hover:scale-105'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          disabled={item.الحالة !== 'متاح'}
        >
          <ShoppingCart size={20} />
          <span>اطلب الآن</span>
          <Plus size={20} />
        </button>
      </Link>
    </div>
  );
}
