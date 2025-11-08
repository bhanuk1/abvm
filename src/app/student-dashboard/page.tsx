'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { Notice } from '@/lib/placeholder-data';


export default function StudentDashboardPage() {
  const firestore = useFirestore();
  const { user: currentUser, isUserLoading } = useUser();

  const loggedInStudentDocRef = useMemoFirebase(
    () => (firestore && currentUser ? doc(firestore, 'users', currentUser.uid) : null),
    [firestore, currentUser]
  );
  const { data: loggedInStudent, isLoading: studentLoading } = useDoc<any>(loggedInStudentDocRef);

  const homeworksQuery = useMemoFirebase(() => 
    firestore && loggedInStudent?.class
      ? query(
          collection(firestore, 'homeworks'), 
          where('class', '==', loggedInStudent.class)
        ) 
      : null, 
    [firestore, loggedInStudent]
  );
  const { data: studentHomeworks } = useCollection<any>(homeworksQuery);

  const noticesQuery = useMemoFirebase(() => 
    firestore
      ? query(
          collection(firestore, 'notices'),
          where('role', 'in', ['All', 'Students'])
        )
      : null,
    [firestore]
  );
  const { data: studentNotices } = useCollection<Notice>(noticesQuery);

  const resultsQuery = useMemoFirebase(() => 
    firestore && loggedInStudent?.id
      ? query(
          collection(firestore, 'results'),
          where('studentId', '==', loggedInStudent.id)
        )
      : null,
    [firestore, loggedInStudent]
  );
  const { data: studentResults } = useCollection<any>(resultsQuery);
  
  const attendanceQuery = useMemoFirebase(() =>
    firestore && loggedInStudent?.id
      ? query(
        collection(firestore, 'attendance'),
        where('studentId', '==', loggedInStudent.id)
      )
      : null,
    [firestore, loggedInStudent]
  );
  const { data: studentAttendance } = useCollection<any>(attendanceQuery);

  if (isUserLoading || studentLoading) {
    return <p>Loading dashboard...</p>
  }

  if (!loggedInStudent) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Could not load student information. Please try again or contact support.</p>
            </CardContent>
        </Card>
    )
  }


  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">My Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>{loggedInStudent.username}</CardTitle>
          <CardDescription>
            Class: {loggedInStudent.class} | Roll No: {loggedInStudent.rollNo}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="homework">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="homework">Homework</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="notices">Notices</TabsTrigger>
            </TabsList>
            <TabsContent value="homework">
              <Card>
                <CardHeader>
                  <CardTitle>My Homework</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentHomeworks && loggedInStudent.subjects && studentHomeworks.filter(hw => loggedInStudent.subjects.includes(hw.subject)).map((hw) => (
                        <TableRow key={hw.id}>
                          <TableCell>{format(new Date(hw.date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{hw.subject}</TableCell>
                          <TableCell>{hw.teacherName}</TableCell>
                          <TableCell>{hw.content}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="attendance">
              <Card>
                <CardHeader>
                  <CardTitle>My Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                   {studentAttendance && studentAttendance.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentAttendance.map((att, index) => (
                          <TableRow key={index}>
                            <TableCell>{format(new Date(att.date), 'PPP')}</TableCell>
                            <TableCell className="text-right">
                              <Badge 
                                variant={att.status === 'Present' ? 'default' : 'destructive'}
                                className={cn(
                                 att.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                               )}
                              >
                               {att.status}
                             </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                   ) : (
                     <div className="p-4 min-h-[150px] flex items-center justify-center">
                       <p className="text-muted-foreground">This month's attendance data will be available soon.</p>
                     </div>
                   )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle>My Results</CardTitle>
                </CardHeader>
                 <CardContent>
                   {studentResults && studentResults.length > 0 ? (
                    <div className="space-y-6">
                      {studentResults.map(result => (
                        <Card key={result.id}>
                          <CardHeader>
                            <CardTitle className="text-lg">{result.examType}</CardTitle>
                          </CardHeader>
                          <CardContent>
                             {Array.isArray(result.marks) ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Subject</TableHead>
                                      <TableHead>Obtained</TableHead>
                                      <TableHead>Total</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {result.marks.map((mark:any, i: number) => (
                                      <TableRow key={i}>
                                        <TableCell>{mark.subject}</TableCell>
                                        <TableCell>{mark.obtained}</TableCell>
                                        <TableCell>{mark.total}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <div className="flex gap-4">
                                  <p><strong>Marks Obtained:</strong> {result.marks.obtained}</p>
                                  <p><strong>Total Marks:</strong> {result.marks.total}</p>
                                </div>
                              )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                   ) : (
                     <div className="p-4 min-h-[150px] flex items-center justify-center">
                       <p className="text-muted-foreground">No results available.</p>
                     </div>
                   )}
                </CardContent>
              </Card>
            </TabsContent>
             <TabsContent value="notices">
              <Card>
                <CardHeader>
                  <CardTitle>School Notices</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                    {studentNotices && studentNotices.map(notice => (
                        <div key={notice.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                            <h3 className="font-semibold">{notice.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{notice.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">{notice.createdAt ? format(notice.createdAt.toDate(), 'dd/MM/yyyy') : ''} - {notice.author}</p>
                        </div>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
