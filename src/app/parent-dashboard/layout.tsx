import type { ReactNode } from 'react';
import { ParentAppHeader } from '@/components/dashboard/parent-app-header';

export default function ParentDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background">
      <ParentAppHeader />
      <main className="p-4 lg:p-6 container mx-auto">
        {children}
      </main>
    </div>
  );
}
