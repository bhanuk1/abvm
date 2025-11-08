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
import { type Fee } from '@/lib/school-data';
import { Calendar } from '@/components/ui/calendar';
import { GraduationCap } from 'lucide-react';

function DetailRow({ label, value }: { label: string; value?: string | null }) {
    return (
      <div className="grid grid-cols-3 items-center">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="col-span-2 text-sm">{value || '-'}</dd>
      </div>
    );
  }

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
  
  const feesQuery = useMemoFirebase(() =>
    firestore && currentUser?.uid
      ? query(
        collection(firestore, 'fees'),
        where('studentId', '==', currentUser.uid)
      )
      : null,
    [firestore, currentUser]
  );
  const { data: studentFees } = useCollection<Fee>(feesQuery);


  const academicYearQuarters = [
    { id: 'q1', label: 'April - June' },
    { id: 'q2', label: 'July - September' },
    { id: 'q3', label: 'October - December' },
    { id: 'q4', label: 'January - March' },
  ];

  const getQuarterlyFee = (className: string) => {
    if (!className) return 0;
    const classNum = parseInt(className);
    if (className === 'Nursery' || className === 'KG') return 1200;
    if (classNum >= 1 && classNum <= 8) return 1800;
    if (classNum >= 9 && classNum <= 12) return 2400;
    return 0;
  };

  const getFeeStatusForQuarter = (quarterId: string) => {
    if (!studentFees) return { status: 'Unpaid' };
    const feeRecord = studentFees.find(f => f.quarter === quarterId);
    return feeRecord
      ? { status: feeRecord.status, paymentDate: feeRecord.paymentDate }
      : { status: 'Unpaid' };
  };

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
       <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="bg-primary-foreground/20 p-4 rounded-full">
            <GraduationCap className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome, {loggedInStudent.username}!</h1>
            <CardDescription className="text-primary-foreground/80 text-lg">
              Class: {loggedInStudent.class} | Roll No: {loggedInStudent.rollNo}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
              <TabsTrigger value="homework">Homework</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="notices">Notices</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
               <Card>
                <CardHeader>
                  <CardTitle>My Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <dl className="grid gap-y-4 gap-x-8 md:grid-cols-2">
                    <div className="space-y-4">
                      <DetailRow label="Father's Name" value={loggedInStudent.fatherName} />
                      <DetailRow label="Mother's Name" value={loggedInStudent.motherName} />
                      <DetailRow label="Date of Birth" value={loggedInStudent.dob ? format(new Date(loggedInStudent.dob), 'dd/MM/yyyy') : '-'} />
                      <DetailRow label="Mobile Number" value={loggedInStudent.mobile} />
                    </div>
                     <div className="space-y-4">
                        <DetailRow label="Address" value={loggedInStudent.address} />
                        <DetailRow label="Aadhaar Number" value={loggedInStudent.aadhaar} />
                        <DetailRow label="Admission Date" value={loggedInStudent.admissionDate ? format(new Date(loggedInStudent.admissionDate), 'dd/MM/yyyy') : '-'} />
                        <DetailRow label="Subjects" value={loggedInStudent.subjects} />
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="fees">
              <Card>
                <CardHeader>
                  <CardTitle>My Fee Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quarter</TableHead>
                        <TableHead>Amount (INR)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {academicYearQuarters.map(q => {
                        const feeInfo = getFeeStatusForQuarter(q.id);
                        const isPaid = feeInfo.status === 'Paid';
                        const feeAmount = getQuarterlyFee(loggedInStudent.class);
                        
                        return (
                          <TableRow key={q.id}>
                            <TableCell className="font-medium">{q.label}</TableCell>
                            <TableCell>{feeAmount}</TableCell>
                            <TableCell>
                              <Badge variant={isPaid ? 'default' : 'destructive'} className={isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {feeInfo.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{feeInfo.paymentDate ? format(feeInfo.paymentDate.toDate(), 'dd/MM/yyyy') : '-'}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
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
                          <TableCell>{hw.date ? format(new Date(hw.date), 'dd/MM/yyyy') : ''}</TableCell>
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
                            <TableCell>{att.date ? format(new Date(att.date), 'PPP') : ''}</TableCell>
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
                     {!studentNotices || studentNotices.length === 0 && (
                        <div className="p-4 min-h-[150px] flex items-center justify-center">
                            <p className="text-muted-foreground">No notices available.</p>
                        </div>
                     )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="calendar">
                <Card>
                    <CardHeader>
                        <CardTitle>School Event Calendar</CardTitle>
                        <CardDescription>View upcoming school events, holidays, and examination dates.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="month"
                            className="rounded-md border"
                        />
                    </CardContent>
                </Card>
           </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
