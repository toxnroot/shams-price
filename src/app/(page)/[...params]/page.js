'use client';

import { use } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ViewMaterialsOnly from '@/components/ViewMaterialsOnly';

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
      <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50  sm:p-0">
        <div className="w-full max-w-4xl">
          <ViewMaterialsOnly section={section} id={id} logTourInteraction={logTourInteraction} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
