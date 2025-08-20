'use client';

import { use } from 'react';
import AddMaterial from '@/components/AddMaterial';
import DisplayMaterials from '@/components/DisplayMaterials';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Layers, PackageOpen } from 'lucide-react';

export default function Page({ params }) {
  const unwrappedParams = use(params); // 👈 استخدم use لفك Promise
  const section = decodeURIComponent(unwrappedParams.section);
  const id = decodeURIComponent(unwrappedParams.id);

  return (
    <ProtectedRoute redirectTo="/auth/admin-login" role="admin">
      <div className="min-h-screen bg-gray-100 py-10 px-4 flex flex-col items-center gap-8">
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
            إدارة المواد
          </h1>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-base">
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full border">
              <Layers className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">القسم:</span>
              <span className="text-blue-600 font-semibold">{section}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full border">
              <PackageOpen className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">المعرف:</span>
              <span className="text-blue-600 font-semibold">{id}</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl">
          <AddMaterial section={section} id={id} />
        </div>

        <div className="w-full max-w-4xl">
          <DisplayMaterials section={section} id={id} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
