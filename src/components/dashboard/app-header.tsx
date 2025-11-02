'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpenCheck, LayoutGrid, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AppHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'डेशबोर्ड', icon: LayoutGrid },
    {
      href: '/dashboard/school-management',
      label: 'स्कूल प्रबंधन',
      icon: FolderKanban,
    },
  ];

  return (
    <header className="bg-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <BookOpenCheck className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-xl font-bold">आदर्श बाल विद्या मन्दिर</h1>
              <p className="text-sm text-muted-foreground">
                स्वागत है, भानु प्रताप कुशवाहा
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              प्रधानाचार्य
            </Badge>
            <Button variant="destructive" asChild>
              <Link href="/">लॉगआउट</Link>
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
