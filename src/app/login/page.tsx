'use client';

import { useEffect } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useFirestore } from '@/firebase';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { SchoolLogo } from '@/components/ui/school-logo';

export default function LoginPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    const ensureAdminExists = async () => {
      if (!firestore) return;

      const adminQuery = query(collection(firestore, 'users'), where('role', '==', 'admin'));
      const adminSnapshot = await getDocs(adminQuery);

      if (adminSnapshot.empty) {
        console.log('Admin user not found, creating one...');
        const auth = getAuth();
        const adminEmail = 'admin@vidyalaya.com';
        const adminPassword = 'admin123';

        try {
          const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
          const adminData = {
            id: userCredential.user.uid,
            userId: 'admin',
            username: 'Principal',
            role: 'admin',
            password: adminPassword
          };
          const userDocRef = doc(firestore, 'users', userCredential.user.uid);
          await setDoc(userDocRef, adminData);
          console.log('Default admin user created successfully.');
        } catch (error: any) {
          if (error.code === 'auth/email-already-in-use') {
            console.log('Admin auth user already exists. Checking Firestore document...');
             // This case is tricky. The auth user might exist but the Firestore doc doesn't.
            // For simplicity, we assume if the auth user exists, the system is in a recoverable state.
            // A more robust solution might involve signing in as admin to get UID and then checking/creating the doc.
          } else {
            console.error("Error creating admin user:", error);
            toast({
                variant: 'destructive',
                title: 'Admin Creation Error',
                description: 'Could not create the default admin user.',
            });
          }
        }
      }
    };

    ensureAdminExists();
  }, [firestore, toast]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-3 justify-center mb-6">
          <SchoolLogo />
          <div>
            <h1 className="text-2xl font-bold text-primary">
              Adarsh Bal Vidya Mandir Inter College
            </h1>
            <p className="text-sm text-red-800 font-semibold">
              Our goal is complete development
            </p>
          </div>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
