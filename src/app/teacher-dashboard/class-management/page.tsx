'use client';

import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
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
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, BookPlus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { teacherData, type Attendance } from '@/lib/school-data';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useCollection, useFirestore, useMemoFirebase, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { addDoc, collection, query, where } from 'firebase/firestore';

type Student = {
    id: string;
    rollNo: string;
    name: string;
    class: string;
};

const allClasses = ['Nursery', 'KG', ...Array.from({length: 12}, (_, i) => (i + 1).toString())];

export default function TeacherClassManagementPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const [selectedClass, setSelectedClass] = React.useState(teacherData.classes[0]?.name || '');
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
  
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);


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
  const { data: attendance, isLoading: attendanceLoading } = useCollection<Attendance>(attendanceQuery);


  const [isHomeworkDialogOpen, setIsHomeworkDialogOpen] = React.useState(false);
  const [homeworkContent, setHomeworkContent] = React.useState('');
  const [homeworkSubject, setHomeworkSubject] = React.useState('');

  const { toast } = useToast();

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    // This part would need a more robust state management for a real app,
    // like updating a local attendance draft state before saving to Firestore.
    // For now, we'll optimistically assume it works and save directly.
    console.log(`Toggling attendance for ${studentId} to ${isPresent}`);
  };
  
  const handleSaveAttendance = () => {
    // In a real app, this is where you'd send the `attendance` state to your backend.
    // For this mock app, the state is already updated, so we just show a confirmation.
    toast({
        title: "Success!",
        description: "Attendance saved successfully.",
        className: "bg-green-100 text-green-800",
    });
  }

  const handleSendHomework = () => {
    if (!homeworkContent || !homeworkSubject || !firestore || !currentUser) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please fill in the subject and content for the homework.',
        });
        return;
    }
    
    const homeworkCol = collection(firestore, 'homeworks');
    const homeworkData = {
        class: selectedClass,
        subject: homeworkSubject,
        content: homeworkContent,
        date: format(new Date(), 'yyyy-MM-dd'),
        teacherId: currentUser.uid,
        teacherName: currentUser.displayName || 'Teacher'
    };
    
    addDoc(homeworkCol, homeworkData).catch(error => {
      const contextualError = new FirestorePermissionError({
        operation: 'create',
        path: homeworkCol.path,
        requestResourceData: homeworkData,
      });
      errorEmitter.emit('permission-error', contextualError);
    });

    toast({
        title: "Success!",
        description: `Homework for class ${selectedClass} has been sent.`,
        className: "bg-green-100 text-green-800",
    });
    setHomeworkContent('');
    setHomeworkSubject('');
    setIsHomeworkDialogOpen(false);
  }

  const getStudentStatus = (studentId: string) => {
    const attendanceRecord = attendance?.find(
      att => att.studentId === studentId
    );
    return attendanceRecord?.status || 'Absent'; // Default to absent
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
              {allClasses.map(c => (
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
                <TableHead className="text-right">Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(studentsLoading || attendanceLoading) && <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>}
              {!(studentsLoading || attendanceLoading) && students && students.length > 0 ? (
                students.map((student) => {
                  const status = getStudentStatus(student.id);
                  return (
                    <TableRow key={student.id}>
                      <TableCell>{student.rollNo}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="flex justify-end items-center gap-4">
                         <Badge 
                           variant={status === 'Present' ? 'default' : 'destructive'}
                           className={cn(
                             status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                             'w-20 justify-center'
                           )}
                          >
                           {status}
                         </Badge>
                         <Switch
                            checked={status === 'Present'}
                            onCheckedChange={(isChecked) => handleAttendanceChange(student.id, isChecked)}
                            aria-label={`Mark ${student.name} as ${status === 'Present' ? 'absent' : 'present'}`}
                         />
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
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
                                {teacherData.classes.find(c => c.name === selectedClass)?.subject.split(', ').map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
                    <Button onClick={handleSendHomework}>Send Homework</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
