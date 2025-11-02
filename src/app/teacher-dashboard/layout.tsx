import type { ReactNode } from 'react';
import { TeacherAppHeader } from '@/components/dashboard/teacher-app-header';

export default function TeacherDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background">
      <TeacherAppHeader />
      <main className="p-4 lg:p-6 container mx-auto">
        {children}
      </main>
    </div>
  );
}
