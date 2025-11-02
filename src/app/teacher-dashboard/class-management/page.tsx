'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, FileUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data
const classData = {
  name: 'कक्षा 5',
  subject: 'हिंदी',
  students: [
    { id: 'STU001', rollNo: 1, name: 'राहुल शर्मा', status: 'उपस्थित' },
    { id: 'STU002', rollNo: 2, name: 'प्रिया कुमारी', status: 'अनुपस्थित' },
    { id: 'STU003', rollNo: 3, name: 'अमित सिंह', status: 'उपस्थित' },
    { id: 'STU004', rollNo: 4- 'new', name: 'नेहा यादव', status: 'उपस्थित' },
  ],
  assignments: [
    { id: 1, title: 'पाठ 1: अभ्यास प्रश्न', dueDate: '2024-08-15', submitted: 28, total: 30 },
    { id: 2, title: 'निबंध: मेरा प्रिय त्योहार', dueDate: '2024-08-20', submitted: 25, total: 30 },
  ],
  attendance: {
    total: 30,
    present: 28,
    date: new Date().toLocaleDateString('hi-IN'),
  },
};

export default function TeacherClassManagementPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">कक्षा प्रबंधन: {classData.name}</h1>
        <p className="text-muted-foreground">विषय: {classData.subject}</p>
      </div>

      <Tabs defaultValue="attendance">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="attendance">उपस्थिति</TabsTrigger>
          <TabsTrigger value="students">छात्र सूची</TabsTrigger>
          <TabsTrigger value="assignments">गृहकार्य</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>आज की उपस्थिति ({classData.attendance.date})</CardTitle>
              <CardDescription>
                कुल छात्र: {classData.attendance.total} | उपस्थित: {classData.attendance.present} | अनुपस्थित: {classData.attendance.total - classData.attendance.present}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>रोल नंबर</TableHead>
                    <TableHead>नाम</TableHead>
                    <TableHead>स्थिति</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classData.students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.rollNo}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        <Badge variant={student.status === 'उपस्थित' ? 'default' : 'destructive'}
                          className={student.status === 'उपस्थित' ? 'bg-green-100 text-green-800' : ''}>
                          {student.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>छात्र सूची</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>रोल नंबर</TableHead>
                    <TableHead>छात्र आईडी</TableHead>
                    <TableHead>नाम</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classData.students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.rollNo}</TableCell>
                      <TableCell>{student.id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>गृहकार्य प्रबंधन</CardTitle>
              <Button>
                <PlusCircle className="mr-2" />
                नया गृहकार्य जोड़ें
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>शीर्षक</TableHead>
                    <TableHead>जमा करने की अंतिम तिथि</TableHead>
                    <TableHead>जमा किया गया</TableHead>
                    <TableHead>कार्य</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classData.assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.title}</TableCell>
                      <TableCell>{assignment.dueDate}</TableCell>
                      <TableCell>
                        {assignment.submitted} / {assignment.total}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          विवरण देखें
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
