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
import { type Notice } from '@/lib/placeholder-data';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';


export default function ChildrenInformationPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();

  const childrenQuery = useMemoFirebase(() =>
    (firestore && currentUser)
      ? query(collection(firestore, 'users'), where('role', '==', 'student'), where('parentId', '==', currentUser.uid))
      : null,
    [firestore, currentUser]
  );
  const { data: children, isLoading: childrenLoading } = useCollection<any>(childrenQuery);
  const parentStudent = children && children.length > 0 ? children[0] : null;


  const homeworksQuery = useMemoFirebase(() => 
    firestore && parentStudent?.class
      ? query(
          collection(firestore, 'homeworks'), 
          where('class', '==', parentStudent.class)
        ) 
      : null, 
    [firestore, parentStudent]
  );
  const { data: studentHomeworks } = useCollection<any>(homeworksQuery);

  const noticesQuery = useMemoFirebase(() => 
    firestore
      ? query(
          collection(firestore, 'notices'),
          where('role', 'in', ['All', 'Parents', 'Students'])
        )
      : null,
    [firestore]
  );
  const { data: studentNotices } = useCollection<Notice>(noticesQuery);

  const resultsQuery = useMemoFirebase(() => 
    firestore && parentStudent?.id
      ? query(
          collection(firestore, 'results'),
          where('studentId', '==', parentStudent.id)
        )
      : null,
    [firestore, parentStudent]
  );
  const { data: studentResults } = useCollection<any>(resultsQuery);
  
  const attendanceQuery = useMemoFirebase(() =>
    firestore && parentStudent?.id
      ? query(
        collection(firestore, 'attendance'),
        where('studentId', '==', parentStudent.id)
      )
      : null,
    [firestore, parentStudent]
  );
  const { data: studentAttendance } = useCollection<any>(attendanceQuery);

  function DetailRow({ label, value }: { label: string; value?: string | null }) {
    return (
      <div className="grid grid-cols-3 items-center">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="col-span-2 text-sm">{value || '-'}</dd>
      </div>
    );
  }

  if (childrenLoading) {
    return <p>Loading child information...</p>;
  }

  if (!parentStudent) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>No Child Information Found</CardTitle>
            </CardHeader>
            <CardContent>
                <p>We could not find any students linked to your account. Please contact the school administration.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">My Child's Information</h1>

      <Card>
        <CardHeader>
          <CardTitle>{parentStudent.username}</CardTitle>
          <CardDescription>
            Class: {parentStudent.class} | Roll No: {parentStudent.rollNo}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="homework">Homework</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="notices">Notices</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
               <Card>
                <CardHeader>
                  <CardTitle>Student Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <dl className="grid gap-y-4 gap-x-8 md:grid-cols-2">
                    <div className="space-y-4">
                      <DetailRow label="Father's Name" value={parentStudent.fatherName} />
                      <DetailRow label="Mother's Name" value={parentStudent.motherName} />
                      <DetailRow label="Date of Birth" value={parentStudent.dob ? format(new Date(parentStudent.dob), 'dd/MM/yyyy') : '-'} />
                      <DetailRow label="Mobile Number" value={parentStudent.mobile} />
                    </div>
                     <div className="space-y-4">
                        <DetailRow label="Address" value={parentStudent.address} />
                        <DetailRow label="Aadhaar Number" value={parentStudent.aadhaar} />
                        <DetailRow label="Admission Date" value={parentStudent.admissionDate ? format(new Date(parentStudent.admissionDate), 'dd/MM/yyyy') : '-'} />
                        <DetailRow label="Subjects" value={parentStudent.subjects} />
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="attendance">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Attendance</CardTitle>
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
            <TabsContent value="homework">
              <Card>
                <CardHeader>
                  <CardTitle>Subject-wise Homework</CardTitle>
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
                      {studentHomeworks && parentStudent.subjects && studentHomeworks.filter(hw => parentStudent.subjects.includes(hw.subject)).map((hw) => (
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
            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle>Exam Results</CardTitle>
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
                                    {result.marks.map((mark: any, i: number) => (
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
