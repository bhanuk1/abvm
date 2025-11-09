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
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, where, doc, addDoc } from 'firebase/firestore';
import type { Notice } from '@/lib/placeholder-data';
import { type Fee, type LiveClass } from '@/lib/school-data';
import { Calendar } from '@/components/ui/calendar';
import { GraduationCap, UserCircle, DollarSign, BookMarked, CheckCircle, Award, Bell, CalendarDays, Send, Video } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

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
  const { toast } = useToast();

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
  
  const liveClassQuery = useMemoFirebase(() =>
    firestore && loggedInStudent?.class
      ? query(
          collection(firestore, 'live-classes'),
          where('class', '==', loggedInStudent.class),
          where('status', '==', 'live')
        )
      : null,
    [firestore, loggedInStudent]
  );
  const { data: liveClassData, isLoading: liveClassLoading } = useCollection<LiveClass>(liveClassQuery);
  const activeLiveClass = liveClassData && liveClassData.length > 0 ? liveClassData[0] : null;


  const [leaveDate, setLeaveDate] = React.useState<DateRange | undefined>();
  const [leaveReason, setLeaveReason] = React.useState('');


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

  const handleApplyForLeave = () => {
    if (!leaveDate?.from || !leaveReason || !firestore || !loggedInStudent) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please select leave dates and provide a reason.'
        });
        return;
    }
    const leaveCol = collection(firestore, 'leave-applications');
    const newLeaveApplication = {
        studentId: loggedInStudent.id,
        studentName: loggedInStudent.username,
        class: loggedInStudent.class,
        startDate: format(leaveDate.from, 'yyyy-MM-dd'),
        endDate: leaveDate.to ? format(leaveDate.to, 'yyyy-MM-dd') : format(leaveDate.from, 'yyyy-MM-dd'),
        reason: leaveReason,
        status: 'Pending',
        submittedAt: new Date(),
    };
    addDoc(leaveCol, newLeaveApplication)
    .then(() => {
        toast({ title: 'Success!', description: 'Your leave application has been submitted.'});
        setLeaveDate(undefined);
        setLeaveReason('');
    })
    .catch((error) => {
        const contextualError = new FirestorePermissionError({
            operation: 'create',
            path: leaveCol.path,
            requestResourceData: newLeaveApplication,
        });
        errorEmitter.emit('permission-error', contextualError);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not submit your application.'});
    });
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
            <TabsList className="grid w-full grid-cols-9">
              <TabsTrigger value="profile"><UserCircle className="mr-2 h-5 w-5" />Profile</TabsTrigger>
              <TabsTrigger value="live-class"><Video className="mr-2 h-5 w-5" />Live Class</TabsTrigger>
              <TabsTrigger value="fees"><DollarSign className="mr-2 h-5 w-5" />Fees</TabsTrigger>
              <TabsTrigger value="homework"><BookMarked className="mr-2 h-5 w-5" />Homework</TabsTrigger>
              <TabsTrigger value="attendance"><CheckCircle className="mr-2 h-5 w-5" />Attendance</TabsTrigger>
              <TabsTrigger value="results"><Award className="mr-2 h-5 w-5" />Results</TabsTrigger>
              <TabsTrigger value="notices"><Bell className="mr-2 h-5 w-5" />Notices</TabsTrigger>
              <TabsTrigger value="calendar"><CalendarDays className="mr-2 h-5 w-5" />Timetable</TabsTrigger>
              <TabsTrigger value="leave"><Send className="mr-2 h-5 w-5" />Apply for Leave</TabsTrigger>
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
            <TabsContent value="live-class">
                <Card>
                    <CardHeader>
                        <CardTitle>Live Class</CardTitle>
                        <CardDescription>Join any ongoing classes for your grade.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {liveClassLoading && <p>Checking for live classes...</p>}
                        {!liveClassLoading && activeLiveClass ? (
                            <div className="p-6 border rounded-lg bg-green-50 border-green-200">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-green-800">{activeLiveClass.subject} Class is Live!</h3>
                                        <p className="text-muted-foreground">Teacher: {activeLiveClass.teacherName}</p>
                                    </div>
                                    <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 animate-pulse">
                                        <a href={activeLiveClass.meetingLink} target="_blank" rel="noopener noreferrer">
                                            <Video className="mr-2" />
                                            Join Now
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        ) : !liveClassLoading ? (
                             <div className="p-6 text-center border rounded-lg bg-gray-50">
                                <h3 className="text-lg font-medium text-muted-foreground">No live classes at the moment.</h3>
                                <p className="text-sm text-muted-foreground">Please check back later.</p>
                            </div>
                        ) : null}
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
                      {studentHomeworks && loggedInStudent.subjects && studentHomeworks.filter(hw => loggedInStudent.subjects.includes(hw.subject)).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((hw) => (
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
                        {studentAttendance.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((att, index) => (
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
           <TabsContent value="leave">
              <Card>
                <CardHeader>
                    <CardTitle>Apply for Leave</CardTitle>
                    <CardDescription>Submit a leave application for the principal's approval.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-w-lg">
                    <div className="space-y-2">
                        <Label>Leave Dates</Label>
                        <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !leaveDate && "text-muted-foreground"
                            )}
                            >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {leaveDate?.from ? (
                                leaveDate.to ? (
                                <>
                                    {format(leaveDate.from, "LLL dd, y")} -{" "}
                                    {format(leaveDate.to, "LLL dd, y")}
                                </>
                                ) : (
                                format(leaveDate.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={leaveDate?.from}
                            selected={leaveDate}
                            onSelect={setLeaveDate}
                            numberOfMonths={1}
                            />
                        </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="leave-reason">Reason for Leave</Label>
                        <Textarea 
                            id="leave-reason"
                            placeholder="Please provide a brief reason for your absence."
                            value={leaveReason}
                            onChange={(e) => setLeaveReason(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleApplyForLeave}>
                        <Send className="mr-2" />
                        Submit Application
                    </Button>
                </CardContent>
              </Card>
           </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
