'use client';

import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, BookPlus, Send, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { type Attendance } from '@/lib/school-data';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { addDoc, collection, query, where, doc, writeBatch, getDocs, setDoc, getDoc } from 'firebase/firestore';

type Student = {
    id: string;
    rollNo: string;
    username: string;
    class: string;
    parentId?: string;
    fatherName?: string;
    motherName?: string;
    dob?: string;
    mobile?: string;
    address?: string;
    aadhaar?: string;
    admissionDate?: string;
    subjects?: string;
};

const allClasses = ['Nursery', 'KG', ...Array.from({length: 12}, (_, i) => (i + 1).toString())];

type AttendanceChanges = { [studentId: string]: 'Present' | 'Absent' };

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-3 items-center">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm">{value || '-'}</dd>
    </div>
  );
}


export default function TeacherClassManagementPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();

  const teacherDocRef = useMemoFirebase(
    () => (firestore && currentUser ? doc(firestore, 'users', currentUser.uid) : null),
    [firestore, currentUser]
  );
  const { data: teacherData, isLoading: teacherLoading } = useDoc<any>(teacherDocRef);

  const [selectedClass, setSelectedClass] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
  const [attendanceChanges, setAttendanceChanges] = React.useState<AttendanceChanges>({});
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = React.useState(false);

  
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  useEffect(() => {
    if (teacherData && !selectedClass) {
        const teacherClasses = teacherData.classSubject?.split(',').map((s: string) => s.split('-')[0].trim()) || [];
        if (teacherClasses.length > 0) {
            setSelectedClass(teacherClasses[0]);
        }
    }
  }, [teacherData, selectedClass]);
  
  useEffect(() => {
    // Reset changes when class or date changes
    setAttendanceChanges({});
  }, [selectedClass, selectedDate]);


  const studentsQuery = useMemoFirebase(() => 
    firestore && selectedClass
        ? query(collection(firestore, 'users'), where('role', '==', 'student'), where('class', '==', selectedClass))
        : null,
    [firestore, selectedClass]
  );
  const { data: students, isLoading: studentsLoading } = useCollection<Student>(studentsQuery);

  const attendanceQuery = useMemoFirebase(() =>
    firestore && selectedClass && selectedDate
        ? query(
            collection(firestore, 'attendance'),
            where('class', '==', selectedClass),
            where('date', '==', format(selectedDate, 'yyyy-MM-dd'))
          )
        : null,
    [firestore, selectedClass, selectedDate]
  );
  const { data: attendanceData, isLoading: attendanceLoading } = useCollection<Attendance>(attendanceQuery);


  const [isHomeworkDialogOpen, setIsHomeworkDialogOpen] = React.useState(false);
  const [homeworkContent, setHomeworkContent] = React.useState('');
  const [homeworkSubject, setHomeworkSubject] = React.useState('');

  const { toast } = useToast();

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setAttendanceChanges(prev => ({
      ...prev,
      [studentId]: isPresent ? 'Present' : 'Absent',
    }));
  };
  
  const handleSaveAttendance = async () => {
    if (!firestore || !selectedClass || !selectedDate || Object.keys(attendanceChanges).length === 0) {
        toast({
            title: "No Changes",
            description: "No attendance changes to save.",
        });
        return;
    }

    const batch = writeBatch(firestore);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const attendanceCol = collection(firestore, 'attendance');

    for (const studentId in attendanceChanges) {
        const newStatus = attendanceChanges[studentId];
        
        // Check if a record already exists for this student and date
        const existingRecord = attendanceData?.find(att => att.studentId === studentId);

        if (existingRecord) {
            // Update existing record
            const docRef = doc(firestore, 'attendance', existingRecord.id);
            batch.update(docRef, { status: newStatus });
        } else {
            // Create new record - using a specific doc ID to prevent duplicates on multiple saves
            const docId = `${studentId}_${dateStr}`;
            const docRef = doc(attendanceCol, docId);
            const newAttendanceRecord: Attendance = {
                studentId,
                date: dateStr,
                status: newStatus,
                class: selectedClass,
            };
            batch.set(docRef, newAttendanceRecord);
        }
    }

    try {
        await batch.commit();
        toast({
            title: "Success!",
            description: "Attendance saved successfully.",
            className: "bg-green-100 text-green-800",
        });
        setAttendanceChanges({}); // Reset changes after saving
    } catch (error) {
        console.error("Error saving attendance: ", error);
        toast({
            variant: 'destructive',
            title: "Error",
            description: "Failed to save attendance.",
        });
    }
  };

  const handleSendHomework = async () => {
    if (!homeworkContent || !homeworkSubject || !firestore || !currentUser || !selectedClass || !students) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please select a class and fill in the subject and content for the homework.',
        });
        return;
    }
    
    // 1. Save homework to Firestore
    const homeworkCol = collection(firestore, 'homeworks');
    const homeworkData = {
        class: selectedClass,
        subject: homeworkSubject,
        content: homeworkContent,
        date: format(new Date(), 'yyyy-MM-dd'),
        teacherId: currentUser.uid,
        teacherName: teacherData?.username || 'Teacher'
    };
    
    try {
        await addDoc(homeworkCol, homeworkData);
    } catch(error) {
      const contextualError = new FirestorePermissionError({
        operation: 'create',
        path: homeworkCol.path,
        requestResourceData: homeworkData,
      });
      errorEmitter.emit('permission-error', contextualError);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save homework.'});
      return;
    }

    // 2. Notify parents (simulation)
    console.log(`--- Initiating Parent Notifications for Class ${selectedClass} ---`);
    for (const student of students) {
        if (student.parentId) {
            const parentDocRef = doc(firestore, 'users', student.parentId);
            const parentDoc = await getDoc(parentDocRef);
            if (parentDoc.exists()) {
                const parentData = parentDoc.data();
                if (parentData.mobile) {
                    const message = `Adarsh Bal Vidya Mandir: Homework for ${student.username} (Class ${selectedClass}, ${homeworkSubject}): ${homeworkContent}`;
                    console.log(`Simulating SMS to ${parentData.mobile}: ${message}`);
                } else {
                    console.log(`Parent of ${student.username} has no mobile number.`);
                }
            }
        }
    }
    console.log(`--- Parent Notifications Finished ---`);

    toast({
        title: "Success!",
        description: `Homework sent and parent notifications initiated.`,
        className: "bg-green-100 text-green-800",
    });
    setHomeworkContent('');
    setHomeworkSubject('');
    setIsHomeworkDialogOpen(false);
  }

  const getStudentStatus = (studentId: string) => {
    // 1. Check for pending changes first
    if (studentId in attendanceChanges) {
      return attendanceChanges[studentId];
    }
    // 2. Fall back to saved data from Firestore
    const attendanceRecord = attendanceData?.find(
      att => att.studentId === studentId
    );
    return attendanceRecord?.status || 'Absent'; // Default to absent
  };

  const teacherClasses = React.useMemo(() => {
    if (!teacherData?.classSubject) return [];
    const classSubjectPairs = teacherData.classSubject.split(',');
    const uniqueClasses = [...new Set(classSubjectPairs.map((pair: string) => pair.split('-')[0].trim()))];
    return uniqueClasses;
  }, [teacherData]);

  const teacherSubjectsForSelectedClass = React.useMemo(() => {
    if (!teacherData?.classSubject || !selectedClass) return [];
    const classSubjectPairs = teacherData.classSubject.split(',');
    return classSubjectPairs
      .filter((pair: string) => pair.split('-')[0].trim() === selectedClass)
      .map((pair: string) => {
        const parts = pair.split('-');
        if (parts.length > 1) {
          return parts[1].trim();
        }
        return null;
      })
      .filter(Boolean);
  }, [teacherData, selectedClass]);
  
  const handleViewProfile = (student: Student) => {
    setSelectedStudent(student);
    setIsProfileDialogOpen(true);
  };


  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Class Management</h1>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
           <Label htmlFor="class-select" className="shrink-0">Select Class:</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger id="class-select" className="w-[200px]">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {teacherClasses.map((c: string) => (
                <SelectItem key={c} value={c}>Class {c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Student List - Class {selectedClass}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(studentsLoading || attendanceLoading) && <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>}
              {!(studentsLoading || attendanceLoading) && students && students.length > 0 ? (
                students.map((student) => {
                  const status = getStudentStatus(student.id);
                  const isPresent = status === 'Present';
                  return (
                    <TableRow key={student.id}>
                      <TableCell>{student.rollNo}</TableCell>
                      <TableCell>{student.username}</TableCell>
                      <TableCell className="flex items-center gap-4">
                         <Badge 
                           variant={isPresent ? 'default' : 'destructive'}
                           className={cn(
                             isPresent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                             'w-20 justify-center'
                           )}
                          >
                           {status}
                         </Badge>
                         <Switch
                            checked={isPresent}
                            onCheckedChange={(isChecked) => handleAttendanceChange(student.id, isChecked)}
                            aria-label={`Mark ${student.username} as ${isPresent ? 'absent' : 'present'}`}
                         />
                      </TableCell>
                       <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleViewProfile(student)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </Button>
                        </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No students found in this class.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex justify-end gap-4 mt-6">
            <Button onClick={handleSaveAttendance}>Save Attendance</Button>
            <Dialog open={isHomeworkDialogOpen} onOpenChange={setIsHomeworkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white">
                    <BookPlus className="mr-2"/>
                    Give Homework
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Homework for Class {selectedClass}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="homework-subject">Subject</Label>
                         <Select value={homeworkSubject} onValueChange={setHomeworkSubject}>
                            <SelectTrigger id="homework-subject">
                                <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {teacherSubjectsForSelectedClass.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="homework-content">Homework Details</Label>
                        <Textarea 
                            id="homework-content"
                            rows={5}
                            value={homeworkContent}
                            onChange={(e) => setHomeworkContent(e.target.value)}
                            placeholder="e.g., Solve all questions from exercise 5.2 in the math textbook."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsHomeworkDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSendHomework}>
                      <Send className="mr-2 h-4 w-4" />
                      Send Homework & Notify Parents
                    </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
      
       <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Student Profile: {selectedStudent?.username}</DialogTitle>
            <DialogDescription>
                Class: {selectedStudent?.class} | Roll No: {selectedStudent?.rollNo}
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
             <div className="py-4 space-y-4">
                <dl className="grid gap-y-4 gap-x-8 md:grid-cols-2">
                <div className="space-y-4">
                    <DetailRow label="Father's Name" value={selectedStudent.fatherName} />
                    <DetailRow label="Mother's Name" value={selectedStudent.motherName} />
                    <DetailRow label="Date of Birth" value={selectedStudent.dob ? format(new Date(selectedStudent.dob), 'dd/MM/yyyy') : '-'} />
                    <DetailRow label="Mobile Number" value={selectedStudent.mobile} />
                </div>
                <div className="space-y-4">
                    <DetailRow label="Address" value={selectedStudent.address} />
                    <DetailRow label="Aadhaar Number" value={selectedStudent.aadhaar} />
                    <DetailRow label="Admission Date" value={selectedStudent.admissionDate ? format(new Date(selectedStudent.admissionDate), 'dd/MM/yyyy') : '-'} />
                    <DetailRow label="Subjects" value={selectedStudent.subjects} />
                </div>
                </dl>
          </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsProfileDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
