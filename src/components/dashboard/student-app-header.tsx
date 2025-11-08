'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpenCheck, LayoutGrid, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function StudentAppHeader() {
  const pathname = usePathname();
  const firestore = useFirestore();
  const { user } = useUser();

  const userDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userData } = useDoc<any>(userDocRef);

  const navLinks = [
    { href: '/student-dashboard', label: 'Dashboard', icon: LayoutGrid },
    // Add more student-specific links here if needed
  ];

  return (
    <header className="bg-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <BookOpenCheck className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Adarsh Bal Vidya Mandir</h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {userData?.username || 'Student'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm bg-green-100 text-green-800">
              Student
            </Badge>
            <Button variant="destructive" asChild>
              <Link href="/">Logout</Link>
            </Button>
          </div>
        </div>
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                pathname === link.href
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700'
              )}
            >
               <link.icon className="inline-block h-4 w-4 mr-2" />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
