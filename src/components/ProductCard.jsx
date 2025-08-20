'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Plus, Image as ImageIcon } from 'lucide-react';
import { useTour } from '@reactour/tour';
import Image from 'next/image';
export default function ProductCard({ item, index, getFontSize, formatNumber, logTourInteraction }) {
  const [imageError, setImageError] = useState(false);
  const { setIsOpen } = useTour();

  const completeTour = () => {
    localStorage.setItem('tour2Completed', 'true');
    setIsOpen(false);
  };

  return (
    <div className="card-det bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#A08558]/10 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
            <Link href={`/product/${encodeURIComponent(item.خامة)}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#A08558] to-[#C4A46B] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-2">
        <div className="flex-1">

          <div className=" rounded-xl  flex items-center  justify-between pr-3 items-center h-[170px]">
              <div className='flex flex-col gap-2 h-[150px] justify-center items-start w-[100%]'>
                <div className='flex justify-start items-center gap-3 p-2'>
                    {/* <div className="w-3 h-3 bg-[#A08558] rounded-full animate-pulse"></div> */}
                    <span className={`${getFontSize('base')} px-2 rounded-full font-medium flex justify-center items-center animate-pulse ${
                    item.الحالة === 'متاح'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                    }`}
                    >
                      {item.الحالة}
                    </span>
                  </div>
                <h3 className={`${getFontSize('xl')} font-bold text-gray-800 w-fit`}>{item.خامة}</h3>
                <p className={`${getFontSize('xl')} text-[#17b145] font-semibold p-1 border-1 rounded-full w-fit`}>
                  {formatNumber(item.سعر)} جنيه
                </p> 
              </div>         
     
            {item.صورة && !imageError ? (
              <Image className='absolute bottom-0 left-0' width='100' height='100' src={item.صورة} alt={item.خامة} onError={() => setImageError(true)} />
            ) : (
              <ImageIcon size={120} strokeWidth={1} className="text-[#fff] bg-[#a16c28c0] rounded-lg" />
            )}
          </div>
        </div>
      </div>



      </Link>
    </div>
  );
}
