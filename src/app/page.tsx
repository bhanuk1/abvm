'use client';

import Link from 'next/link';
import {
  BookOpenCheck,
  Building,
  Contact,
  Mail,
  Newspaper,
  School,
  User,
  Users,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, limit, query, where } from 'firebase/firestore';
import type { Notice } from '@/lib/placeholder-data';

function HomeHeader() {
  return (
    <header className="bg-card shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpenCheck className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-primary">
                आदर्श बाल विद्या मन्दिर
              </h1>
              <p className="text-sm text-green-600 font-semibold">
                हमारा ध्येय संपूर्ण विकास
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-700 space-y-1 text-right">
            <div className="flex items-center justify-end gap-2">
              <Contact className="h-4 w-4" />
              <span>संपर्क: +91 91406 24586</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Mail className="h-4 w-4" />
              <span>ईमेल: abvmic@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function LoginOptions() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          लॉगिन करें
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button
          asChild
          size="lg"
          className="justify-start text-lg py-6 bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          <Link href="/login">
            <User className="mr-4" /> शिक्षक लॉगिन
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          className="justify-start text-lg py-6 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Link href="/login">
            <Users className="mr-4" /> अभिभावक लॉगिन
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          className="justify-start text-lg py-6 bg-pink-600 hover:bg-pink-700 text-white"
        >
          <Link href="/login">
            <School className="mr-4" /> छात्र लॉगिन
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          className="justify-start text-lg py-6 bg-green-600 hover:bg-green-700 text-white"
        >
          <Link href="/login">
            <Building className="mr-4" /> प्रधानाचार्य लॉगिन
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function NoticeBoard() {
  const firestore = useFirestore();
  const noticesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'notices'),
            where('role', '==', 'All'),
            limit(1)
          )
        : null,
    [firestore]
  );
  const { data: notices, isLoading } = useCollection<Notice>(noticesQuery);

  const firstNotice = notices && notices.length > 0 ? notices[0] : null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="text-red-500" />
          सूचना बोर्ड
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p>सूचना लोड हो रही है...</p>}
        {!isLoading && firstNotice ? (
          <div className="border-l-4 border-amber-400 pl-4 bg-amber-50 p-4 rounded-r-lg">
            <h3 className="font-bold">{firstNotice.title}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-3">
              {firstNotice.content}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {firstNotice.createdAt ? format(firstNotice.createdAt.toDate(), 'dd/MM/yyyy') : ''}
            </p>
          </div>
        ) : !isLoading && !firstNotice ? (
          <p>कोई सूचना उपलब्ध नहीं है।</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SchoolInfo() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>स्कूल की जानकारी</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-gray-700">
        <p><span className="font-semibold">स्थापना:</span> 1995</p>
        <p><span className="font-semibold">कक्षाएं:</span> नर्सरी से 12वीं तक</p>
        <p><span className="font-semibold">छात्र संख्या:</span> 600+</p>
        <p><span className="font-semibold">शिक्षक:</span> 20+</p>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex justify-center md:justify-end items-start">
            <LoginOptions />
          </div>
          <div className="flex flex-col items-center md:items-start gap-8">
            <NoticeBoard />
            <SchoolInfo />
          </div>
        </div>
      </main>
    </div>
  );
}
