'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { User, Building, Book, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';


export default function TeacherDashboardPage() {
  const firestore = useFirestore();
  const { user: currentUser, isUserLoading } = useUser();

  const teacherDocRef = useMemoFirebase(
    () => (firestore && currentUser ? doc(firestore, 'users', currentUser.uid) : null),
    [firestore, currentUser]
  );
  const { data: teacherData, isLoading: teacherLoading } = useDoc<any>(teacherDocRef);
  
  if (isUserLoading || teacherLoading) {
    return <p>Loading dashboard...</p>
  }

  if (!teacherData) {
    return <p>Could not load teacher data.</p>
  }

  const classes = teacherData.classSubject?.split(',') || [];
  const totalStudents = 0; // This would need a query to calculate

  const stats = [
    {
      title: 'My Classes',
      value: classes.length,
      icon: Building,
      color: 'bg-pink-100 text-pink-600',
    },
    {
      title: 'Total Students',
      value: 'N/A', // To be implemented
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className={`p-3 rounded-md ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="text-right">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Classes and Subjects</CardTitle>
          <CardDescription>
            Here are all the classes and subjects you teach.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((c: string, index: number) => {
            const [className, subject] = c.split('-').map(s => s.trim());
            return (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Class {className}
                    <Link href="/teacher-dashboard/class-management">
                      <Button variant="link">Manage</Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Book className="h-5 w-5 text-sky-500" />
                    <span>Subject: {subject}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-5 w-5 text-lime-500" />
                    <span>Students: N/A</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </CardContent>
      </Card>
    </div>
  );
}
