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
import { teacherData as loggedInTeacherData } from '@/lib/school-data';

const totalStudents = loggedInTeacherData.classes.reduce((sum, currentClass) => sum + currentClass.students, 0);

const stats = [
  {
    title: 'My Classes',
    value: loggedInTeacherData.classes.length,
    icon: Building,
    color: 'bg-pink-100 text-pink-600',
  },
  {
    title: 'Total Students',
    value: totalStudents,
    icon: Users,
    color: 'bg-blue-100 text-blue-600',
  },
];

export default function TeacherDashboardPage() {
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
          {loggedInTeacherData.classes.map((c, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Class {c.name}
                  <Link href="/teacher-dashboard/class-management">
                    <Button variant="link">Manage</Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Book className="h-5 w-5 text-sky-500" />
                  <span>Subject: {c.subject}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5 text-lime-500" />
                  <span>Students: {c.students}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
