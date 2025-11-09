import type { ReactNode } from 'react';
import { LoggedInUserHeader } from '@/components/dashboard/logged-in-user-header';


export default function PhotoGalleryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background">
      <LoggedInUserHeader />
      <main>
        {children}
      </main>
    </div>
  );
}
