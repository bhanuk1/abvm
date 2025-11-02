import type { ReactNode } from 'react';
import { AppHeader } from '@/components/dashboard/app-header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background">
      <AppHeader />
      <main className="p-4 lg:p-6 container mx-auto">
        {children}
      </main>
    </div>
  );
}
