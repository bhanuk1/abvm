'use client';

import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-3 justify-center mb-6">
          <BookOpenCheck className="h-12 w-12 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-primary">
              आदर्श बाल विद्या मन्दिर
            </h1>
            <p className="text-sm text-green-600 font-semibold">
              हमारा ध्येय संपूर्ण विकास
            </p>
          </div>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">लॉगिन करें</CardTitle>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
