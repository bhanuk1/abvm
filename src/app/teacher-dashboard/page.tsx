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

// Mock data for the logged-in teacher
const teacherData = {
  name: 'श्रीमती सुनीता गुप्ता',
  classes: [
    { name: 'कक्षा 5', subject: 'हिंदी', students: 30 },
    { name: 'कक्षा 6', subject: 'हिंदी', students: 25 },
    { name: 'कक्षा 7', subject: 'संस्कृत', students: 30 },
  ],
};

const totalStudents = teacherData.classes.reduce((sum, currentClass) => sum + currentClass.students, 0);

const stats = [
  {
    title: 'मेरी कक्षाएं',
    value: teacherData.classes.length,
    icon: Building,
    color: 'bg-pink-100 text-pink-600',
  },
  {
    title: 'कुल छात्र',
    value: totalStudents,
    icon: Users,
    color: 'bg-blue-100 text-blue-600',
  },
];

export default function TeacherDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">शिक्षक डैशबोर्ड</h1>
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
          <CardTitle>मेरी कक्षाएं और विषय</CardTitle>
          <CardDescription>
            यहाँ वे सभी कक्षाएं और विषय दिए गए हैं जिन्हें आप पढ़ाते हैं।
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teacherData.classes.map((c, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {c.name}
                  <Link href="/teacher-dashboard/class-management">
                    <Button variant="link">प्रबंधन करें</Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Book className="h-5 w-5 text-sky-500" />
                  <span>विषय: {c.subject}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5 text-lime-500" />
                  <span>छात्र: {c.students}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
