'use client';

import { use } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ViewMaterialsOnly from '@/components/ViewMaterialsOnly';
import { TourProvider } from '@reactour/tour';

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

export default function Page({ params }) {
  const { params: paramsArray } = use(params || { params: [] });
  const section = decodeURIComponent(paramsArray?.[0] || '');
  const id = decodeURIComponent(paramsArray?.[1] || '');

  const logTourInteraction = (elementName) => {
    const timestamp = new Date().toLocaleString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const interaction = { element: elementName, timestamp };
    const existingInteractions = JSON.parse(localStorage.getItem('tourInteractions') || '[]');
    existingInteractions.push(interaction);
    localStorage.setItem('tourInteractions', JSON.stringify(existingInteractions));
    console.log('Tour interaction logged:', interaction);
  };

  return (
    <ProtectedRoute>
      <TourProvider
        steps={stepsTour1} // الخطوات الافتراضية، ستتغير ديناميكيًا
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
            '&:hover': {
              color: '#A16D28',
            },
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
            localStorage.setItem('tour1Completed', 'true');
          } else if (steps === stepsTour2) {
            localStorage.setItem('tour2Completed', 'true');
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
                    localStorage.setItem('tour1Completed', 'true');
                  } else if (steps === stepsTour2) {
                    localStorage.setItem('tour2Completed', 'true');
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
                      localStorage.setItem('tour1Completed', 'true');
                    } else if (steps === stepsTour2) {
                      localStorage.setItem('tour2Completed', 'true');
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
        <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 p-4 sm:p-6">
          <div className="w-full max-w-4xl">
            <ViewMaterialsOnly section={section} id={id} logTourInteraction={logTourInteraction} />
          </div>
        </div>
      </TourProvider>
    </ProtectedRoute>
  );
}
