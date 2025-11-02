import Link from 'next/link';
import { BookOpenCheck, LayoutGrid, FolderKanban } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AppHeader() {
  return (
    <header className="bg-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <BookOpenCheck className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-xl font-bold">आदर्श बाल विद्या मन्दिर</h1>
              <p className="text-sm text-muted-foreground">स्वागत है, भानु प्रताप कुशवाहा</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">प्रधानाचार्य</Badge>
            <Button variant="destructive" asChild>
              <Link href="/">लॉगआउट</Link>
            </Button>
          </div>
        </div>
        <nav className="flex items-center space-x-6 border-t h-12">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors pb-3"
          >
            <LayoutGrid className="h-4 w-4" />
            डेशबोर्ड
          </Link>
          <Link
            href="/dashboard/school-management"
            className="flex items-center gap-2 text-sm font-medium text-primary border-b-2 border-primary pb-3"
          >
            <FolderKanban className="h-4 w-4" />
            स्कूल प्रबंधन
          </Link>
        </nav>
      </div>
    </header>
  );
}
