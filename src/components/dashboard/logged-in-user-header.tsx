'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { AppHeader } from './app-header';
import { TeacherAppHeader } from './teacher-app-header';
import { ParentAppHeader } from './parent-app-header';
import { StudentAppHeader } from './student-app-header';

// A client component that conditionally renders the correct header
// based on the user's role.
export function LoggedInUserHeader() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const userDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userData, isLoading: isUserDocLoading } = useDoc<any>(userDocRef);

  if (isUserLoading || isUserDocLoading) {
    // You can return a loading skeleton here
    return (
        <header className="bg-card border-b">
         <div className="container mx-auto px-4">
           <div className="flex h-20 items-center justify-between animate-pulse">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted"></div>
                    <div>
                        <div className="h-6 w-48 bg-muted rounded"></div>
                        <div className="h-4 w-32 bg-muted rounded mt-2"></div>
                    </div>
                </div>
           </div>
         </div>
        </header>
    );
  }
  
  const role = userData?.role;

  switch (role) {
    case 'admin':
      return <AppHeader />;
    case 'teacher':
      return <TeacherAppHeader />;
    case 'parent':
      return <ParentAppHeader />;
    case 'student':
      return <StudentAppHeader />;
    default:
      // Fallback or public header
      // This case might happen if the user is logged out or role is not set
      // For now, let's render a generic header that has links to both galleries
      return <AppHeader />;
  }
}
