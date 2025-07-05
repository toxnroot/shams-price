// components/SectionCard.js
import { ArrowLeft, FileText, Folder } from 'lucide-react';
import Link from 'next/link';
import { useTour } from '@reactour/tour';
import { useEffect } from 'react';

export default function SectionCard({ docId, sections , startTour }) {
  const sectionCount = Object.keys(sections).length;
  const { setIsOpen } = useTour();

  useEffect(() => {
    if (localStorage.getItem('tourCompleted1') === 'true') {
      setIsOpen(false);
    }else {
      setIsOpen(true);
    }


  }, [setIsOpen]);

  const handleSaveTour = () => {
    localStorage.setItem('tourCompleted1', 'true');
    setIsOpen(false);
  };

  return (
    <div className=" bg-white rounded-3xl shadow-lg border border-gray-100 p-8 w-full max-w-4xl mt-8 relative overflow-hidden">
      {/* خلفية تدرجية خفيفة */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-50 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
      
      {/* الهيدر */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-[#f5eadcbb] rounded-xl">
            <FileText className="w-6 h-6 text-[#A16D28]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              الأقسام في 
            </h2>
            <p className="text-[#A16D28] font-semibold text-lg mt-1">{docId}</p>
          </div>
        </div>
        
        {/* عداد الأقسام */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-sm text-gray-600">
          <Folder className="w-4 h-4" />
          <span>{sectionCount} قسم متاح</span>
        </div>
      </div>

      {/* قائمة الأقسام */}
      {sectionCount > 0 ? (
        <div className="space-y-3 ">
          {Object.keys(sections).map((section, index) => (
            <Link
              key={section}
              href={`/${encodeURIComponent(docId)}/${encodeURIComponent(section)}`}
              className="block group test-app"
              onClick={startTour} // بدء الجولة عند الضغط على القسم
            >
              <div onClick={handleSaveTour} className="section-card bg-gradient-to-r from-gray-50 to-gray-50/50 hover:from-[#f7e1c5bb] hover:to-[#f5eadcbb] p-5 rounded-2xl border border-gray-100 hover:border-[#f5eadcbb] transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-gray-800 group-hover:text-[#A16D28] transition-colors">
                      {section}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-400 group-hover:text-[#A16D28] transition-colors">
                    <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      عرض القسم
                    </span>
                    <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}

        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Folder className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">لا توجد أقسام في المستند</p>
          <p className="text-gray-400 text-sm mt-2">سيتم عرض الأقسام هنا عند توفرها</p>
        </div>
      )}

      {/* شريط سفلي للزينة */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A16D28] via-[#fff8f0] to-[#A16D28]"></div>
    </div>
  );
}