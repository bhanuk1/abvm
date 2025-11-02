import type { ReactNode } from 'react';
import { StudentAppHeader } from '@/components/dashboard/student-app-header';

export default function StudentDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background">
      <StudentAppHeader />
      <main className="p-4 lg:p-6 container mx-auto">
        {children}
      </main>
    </div>
  );
}
