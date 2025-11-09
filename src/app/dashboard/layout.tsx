import type { ReactNode } from 'react';
import { AppHeader } from '@/components/dashboard/app-header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <AppHeader />
      <main className="p-4 lg:p-6 container mx-auto">
        {children}
      </main>
    </div>
  );
}
