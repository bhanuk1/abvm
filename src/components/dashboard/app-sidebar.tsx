import Link from 'next/link';
import { LogOut, BookOpenCheck, LayoutGrid } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export function AppSidebar() {
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold font-headline">
            <BookOpenCheck className="h-6 w-6 text-primary" />
            <span className="text-sm">Adarsh Bal Vidya Mandir Inter College</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg bg-accent text-accent-foreground px-3 py-2 transition-all hover:bg-accent/90"
            >
              <LayoutGrid className="h-4 w-4" />
              Notice Board
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Card>
            <CardHeader className="p-2 pt-0 md:p-4 flex-row items-center gap-4">
               <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="https://picsum.photos/seed/user-avatar/40/40" alt="Avatar" data-ai-hint="person face" />
                <AvatarFallback>AD</AvatarFallback>
               </Avatar>
               <div>
                <CardTitle className="text-sm font-medium">Admin User</CardTitle>
                <p className="text-xs text-muted-foreground">Administrator</p>
               </div>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
              <Button size="sm" variant="outline" className="w-full" asChild>
                <Link href="/">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
