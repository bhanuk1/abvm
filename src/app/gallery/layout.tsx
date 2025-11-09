import type { ReactNode } from 'react';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { LoggedInUserHeader } from '@/components/dashboard/logged-in-user-header';


export default function GalleryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background">
      <LoggedInUserHeader />
      <main>
        {children}
      </main>
    </div>
  );
}
