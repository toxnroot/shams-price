'use clinet';
import AddSection from "@/components/AddSection";
import DisplaySections from "@/components/DisplaySections";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Page({ params }) {
  const section = decodeURIComponent(params.section); // فك تشفير المعرف الديناميكي

  return (
    <div className="p-4 flex flex-col items-center justify-center">
      <ProtectedRoute redirectTo="/auth-admin">
        <AddSection docId={section} />
        <DisplaySections docId={section}/>
      </ProtectedRoute>
    </div>
  );
}