'use client';
import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Buffer } from 'buffer';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
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
import { Eye, EyeOff, UserPlus, Calendar as CalendarIcon, PlusCircle, FileDown, Printer, GraduationCap, Phone, Home, User as UserIcon, DollarSign, Barcode, BookOpen, Bus, Users, ChevronsRight, FolderKanban, Newspaper, BarChart2, Banknote, CreditCard, UserSquare, BookCopy, FileText, BusFront, Library, FileSignature, CalendarCheck, CalendarClock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { type Notice } from '@/lib/placeholder-data';
import {
  initialNewUserState,
  type Result,
  type Homework,
  allSubjects,
  results as initialResults,
  classSubjects,
  type Attendance,
  type Fee,
  type LeaveApplication,
} from '@/lib/school-data';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { addDoc, collection, serverTimestamp, setDoc, doc, query, where, deleteDoc, getDocs, updateDoc, Timestamp, writeBatch, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { SchoolLogo } from '@/components/ui/school-logo';

const managementOptions = [
    { value: "user-management", label: "User Management", icon: Users, color: "bg-blue-500 hover:bg-blue-600" },
    { value: "student-management", label: "Student Management", icon: UserSquare, color: "bg-cyan-500 hover:bg-cyan-600" },
    { value: "student-promotion", label: "Student Promotion", icon: GraduationCap, color: "bg-teal-500 hover:bg-teal-600" },
    { value: "notice-management", label: "Notice Board", icon: Newspaper, color: "bg-amber-500 hover:bg-amber-600" },
    { value: "result-management", label: "Result Management", icon: BarChart2, color: "bg-orange-500 hover:bg-orange-600" },
    { value: "fee-management", label: "Fee Management", icon: Banknote, color: "bg-green-500 hover:bg-green-600" },
    { value: "daily-fee-report", label: "Fee Reports", icon: FileText, color: "bg-emerald-500 hover:bg-emerald-600" },
    { value: "salary-management", label: "Salary Management", icon: DollarSign, color: "bg-lime-500 hover:bg-lime-600" },
    { value: "id-cards", label: "ID Cards", icon: CreditCard, color: "bg-pink-500 hover:bg-pink-600" },
    { value: "marksheets", label: "Marksheets", icon: BookCopy, color: "bg-rose-500 hover:bg-rose-600" },
    { value: "reports", label: "Student Reports", icon: FolderKanban, color: "bg-purple-500 hover:bg-purple-600" },
    { value: "library-management", label: "Library", icon: Library, color: "bg-violet-500 hover:bg-violet-600" },
    { value: "transport-management", label: "Transport", icon: BusFront, color: "bg-indigo-500 hover:bg-indigo-600" },
    { value: "leave-applications", label: "Leave Applications", icon: CalendarCheck, color: "bg-sky-500 hover:bg-sky-600" },
    { value: "timetable-management", label: "Timetable", icon: CalendarClock, color: "bg-stone-500 hover:bg-stone-600" },
    { value: "attendance-report", label: "Attendance", icon: Users, color: "bg-red-500 hover:bg-red-600" },
    { value: "homework-report", label: "Homework", icon: BookOpen, color: "bg-sky-500 hover:bg-sky-600" },
    { value: "tc-generator", label: "TC Generator", icon: FileSignature, color: "bg-fuchsia-500 hover:bg-fuchsia-600" },
];


function DashboardPageContent() {
  const firestore = useFirestore();
  const { user: currentUser, isUserLoading } = useUser();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'user-management';
  const [activeTab, setActiveTab] = React.useState(initialTab);

  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<any>(usersQuery);

  const studentsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users'), where('role', '==', 'student')) : null, [firestore]);
  const { data: students, isLoading: studentsLoading } = useCollection<any>(studentsQuery);

  const noticesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'notices') : null, [firestore]);
  const { data: notices, isLoading: noticesLoading } = useCollection<Notice>(noticesQuery);
  
  const resultsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'results') : null, [firestore]);
  const { data: resultsData, isLoading: resultsLoading } = useCollection<Result>(resultsQuery);

  const leaveQuery = useMemoFirebase(() => firestore ? collection(firestore, 'leave-applications') : null, [firestore]);
  const { data: leaveApplications, isLoading: leaveApplicationsLoading } = useCollection<LeaveApplication>(leaveQuery);


  const [results, setResults] = React.useState<Result[]>(initialResults);

  const [isUserDialogOpen, setIsUserDialogOpen] = React.useState(false);
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = React.useState(false);
  const [editingNotice, setEditingNotice] = React.useState<Notice | null>(null);

  const [passwordVisibility, setPasswordVisibility] = React.useState<{[key: string]: boolean}>({});

  const [newUser, setNewUser] = React.useState<any>(initialNewUserState);
  const [newNotice, setNewNotice] = React.useState({ title: '', content: '', role: 'All' as Notice['role'] });
  
  const [selectedResultClass, setSelectedResultClass] = React.useState('');
  const [selectedResultStudent, setSelectedResultStudent] = React.useState('');
  const [selectedExamType, setSelectedExamType] = React.useState('');
  
  const [monthlyObtained, setMonthlyObtained] = React.useState('');
  const [monthlyTotal, setMonthlyTotal] = React.useState('100');
  const [marks, setMarks] = React.useState<any>({});


  const [selectedReportClass, setSelectedReportClass] = React.useState('');
  const [selectedReportStudent, setSelectedReportStudent] = React.useState('');

  const [selectedClassReportClass, setSelectedClassReportClass] = React.useState('');
  const [selectedClassReportExam, setSelectedClassReportExam] = React.useState('');

  const [attendanceReportClass, setAttendanceReportClass] = React.useState('');
  const [attendanceReportDate, setAttendanceReportDate] = React.useState<Date | undefined>();
  
  const [homeworkReportClass, setHomeworkReportClass] = React.useState('');
  const [homeworkReportSubject, setHomeworkReportSubject] = React.useState('');
  const [homeworkReportDate, setHomeworkReportDate] = React.useState<Date | undefined>();

  const [idCardClass, setIdCardClass] = React.useState('');
  const [marksheetClass, setMarksheetClass] = React.useState('');
  const [marksheetExam, setMarksheetExam] = React.useState('');
  const [classMarksheets, setClassMarksheets] = React.useState<any[]>([]);

  const [feeClass, setFeeClass] = React.useState('');
  const [feeStudent, setFeeStudent] = React.useState('');
  const [feeQuarter, setFeeQuarter] = React.useState('');
  
  const [dailyReportDate, setDailyReportDate] = React.useState<Date | undefined>(new Date());

  const [tcClass, setTcClass] = React.useState('');
  const [tcStudent, setTcStudent] = React.useState('');
  
  const currentUserDocRef = useMemoFirebase(
    () => (currentUser && firestore ? doc(firestore, 'users', currentUser.uid) : null),
    [firestore, currentUser]
  );
  const { data: currentUserData, isLoading: isCurrentUserLoading } = useDoc<any>(currentUserDocRef);
  const userRole = currentUserData?.role;

  const feesQuery = useMemoFirebase(
    () => firestore && feeStudent ? query(collection(firestore, 'fees'), where('studentId', '==', feeStudent)) : null,
    [firestore, feeStudent]
  );
  const { data: studentFees } = useCollection<Fee>(feesQuery);

  const dailyFeesQuery = useMemoFirebase(() => {
    if (!firestore || !dailyReportDate || !userRole || !['admin', 'teacher'].includes(userRole)) return null;
    const start = startOfDay(dailyReportDate);
    const end = endOfDay(dailyReportDate);
    return query(
        collection(firestore, 'fees'), 
        where('paymentDate', '>=', Timestamp.fromDate(start)),
        where('paymentDate', '<=', Timestamp.fromDate(end))
    );
  }, [firestore, dailyReportDate, userRole]);
  const { data: dailyFeeData, isLoading: dailyFeeLoading } = useCollection<Fee>(dailyFeesQuery);

  const attendanceQuery = useMemoFirebase(() =>
    firestore && attendanceReportClass && attendanceReportDate
      ? query(
          collection(firestore, 'attendance'),
          where('class', '==', attendanceReportClass),
          where('date', '==', format(attendanceReportDate, 'yyyy-MM-dd'))
        )
      : null,
  [firestore, attendanceReportClass, attendanceReportDate]
  );
  const { data: attendance, isLoading: attendanceLoading } = useCollection<Attendance>(attendanceQuery);

  const homeworkQuery = useMemoFirebase(() =>
    firestore && homeworkReportClass && homeworkReportSubject && homeworkReportDate
      ? query(
          collection(firestore, 'homeworks'),
          where('class', '==', homeworkReportClass),
          where('subject', '==', homeworkReportSubject),
          where('date', '==', format(homeworkReportDate, 'yyyy-MM-dd'))
        )
      : null,
    [firestore, homeworkReportClass, homeworkReportSubject, homeworkReportDate]
  );
  const { data: homeworks, isLoading: homeworksLoading } = useCollection<Homework>(homeworkQuery);
  const filteredHomework = homeworks?.[0];

  const dailyFeeReportData = React.useMemo(() => {
    if (!dailyFeeData) return {};
    const groupedByClass = dailyFeeData.reduce((acc, fee) => {
      const className = fee.class;
      if (!acc[className]) {
        acc[className] = [];
      }
      acc[className].push(fee);
      return acc;
    }, {} as {[key: string]: Fee[]});
    return groupedByClass;
  }, [dailyFeeData]);

  React.useEffect(() => {
    // Set date on client-side only to avoid hydration mismatch
    setAttendanceReportDate(new Date());
    setHomeworkReportDate(new Date());
  }, []);
  
  React.useEffect(() => {
    if (editingNotice) {
      setNewNotice({
        title: editingNotice.title,
        content: editingNotice.content,
        role: editingNotice.role,
      });
      setIsNoticeDialogOpen(true);
    } else {
      setNewNotice({ title: '', content: '', role: 'All' });
    }
  }, [editingNotice]);


  const handleInputChange = (id: string, value: string) => {
    setNewUser((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleStudentClassChange = (value: string) => {
    if (!students) return;
    const subjectsForClass = classSubjects[value] || [];
    const studentsInClass = students.filter(s => s.class === value).length;
    const nextRollNo = studentsInClass + 1;

    setNewUser((prev: any) => ({
      ...prev,
      studentClass: value,
      studentSubjects: subjectsForClass.join(', '),
      rollNo: nextRollNo.toString(),
    }));
  };
  
  const handleSelectChange = (value: string) => {
    setNewUser({ ...initialNewUserState, role: value });
  };
  
  const handleDateChange = (field: 'dob' | 'admissionDate', date?: Date) => {
    setNewUser((prev: any) => ({ ...prev, [field]: date }));
  };

  const handleNoticeInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewNotice(prev => ({ ...prev, [id]: value }));
  };

  const handleNoticeRoleChange = (value: Notice['role']) => {
    setNewNotice(prev => ({ ...prev, role: value }));
  };
  
  const handleCreateNotice = () => {
    if (!newNotice.title || !newNotice.content || !firestore || !currentUser) return;
    
    const noticesCol = collection(firestore, 'notices');
    const noticeToAdd = {
      ...newNotice,
      authorId: currentUser.uid,
      author: 'Principal',
      createdAt: serverTimestamp(),
    };

    addDoc(noticesCol, noticeToAdd)
      .catch(error => {
        const contextualError = new FirestorePermissionError({
            operation: 'create',
            path: noticesCol.path,
            requestResourceData: noticeToAdd,
        });
        errorEmitter.emit('permission-error', contextualError);
    });
    
    setNewNotice({ title: '', content: '', role: 'All' });
    setIsNoticeDialogOpen(false);
  };
  
  const handleUpdateNotice = () => {
    if (!editingNotice || !firestore) return;
    
    const noticeDocRef = doc(firestore, 'notices', editingNotice.id);
    const updatedData = { ...newNotice };

    updateDoc(noticeDocRef, updatedData).catch(error => {
      const contextualError = new FirestorePermissionError({
        operation: 'update',
        path: noticeDocRef.path,
        requestResourceData: updatedData
      });
      errorEmitter.emit('permission-error', contextualError);
    });
    
    setEditingNotice(null);
    setIsNoticeDialogOpen(false);
  };

  const handleNoticeDialogClose = (open: boolean) => {
    if (!open) {
      setEditingNotice(null);
    }
    setIsNoticeDialogOpen(open);
  };
  
  const handleEditNoticeClick = (notice: Notice) => {
    setEditingNotice(notice);
  };

  const handleDeleteNotice = (noticeId: string) => {
    if (!firestore) return;
    const noticeDoc = doc(firestore, 'notices', noticeId);
    deleteDoc(noticeDoc).catch(error => {
        const contextualError = new FirestorePermissionError({
            operation: 'delete',
            path: noticeDoc.path
        });
        errorEmitter.emit('permission-error', contextualError);
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);
    deleteDoc(userDocRef)
      .then(() => {
        toast({ title: 'Success!', description: 'User deleted successfully.' });
      })
      .catch(error => {
        const contextualError = new FirestorePermissionError({
          operation: 'delete',
          path: userDocRef.path,
        });
        errorEmitter.emit('permission-error', contextualError);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete user.' });
      });
  };

  const handleCreateUser = async () => {
    if (!newUser.role || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill all required fields.' });
      return;
    }
    const auth = getAuth();
    const generatePassword = () => Math.random().toString(36).slice(-8);
    const batch = writeBatch(firestore);

    if (newUser.role === 'teacher') {
        const teacherPassword = generatePassword();
        const teacherUserId = `abvm${Date.now()}`;
        const teacherEmail = `${teacherUserId}@vidyalaya.com`;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, teacherEmail, teacherPassword);
            const user = userCredential.user;
            const teacherData = {
                id: user.uid,
                userId: teacherUserId,
                password: teacherPassword,
                username: newUser.username,
                role: 'teacher',
                mobile: newUser.teacherMobile,
                classSubject: `${newUser.teacherClass} - ${newUser.teacherSubject}`
            };
            const userDocRef = doc(firestore, 'users', user.uid);
            batch.set(userDocRef, teacherData);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Teacher Creation Error', description: error.message });
            return;
        }
    } else if (newUser.role === 'parent' || newUser.role === 'student') {
        const parentName = newUser.role === 'parent' ? newUser.username : newUser.parentName;
        const studentName = newUser.role === 'student' ? newUser.username : newUser.studentName;

        if (!parentName || !studentName) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please fill in both Father\'s and Student\'s names.' });
            return;
        }

        const parentPassword = generatePassword();
        const parentUserId = `abvm${Date.now()}`;
        const parentEmail = `${parentUserId}@vidyalaya.com`;
        
        const studentPassword = generatePassword();
        const studentUserId = `abvm${Date.now() + 1}`; // Add 1 to ensure unique timestamp
        const studentEmail = `${studentUserId}@vidyalaya.com`;

        try {
            // Create Parent Auth User
            const parentCredential = await createUserWithEmailAndPassword(auth, parentEmail, parentPassword);
            const parentUser = parentCredential.user;

            // Create Student Auth User
            const studentCredential = await createUserWithEmailAndPassword(auth, studentEmail, studentPassword);
            const studentUser = studentCredential.user;
            
            // Parent Firestore Doc
            const parentData = {
                id: parentUser.uid,
                userId: parentUserId,
                password: parentPassword,
                username: parentName,
                role: 'parent',
                fatherName: parentName,
                motherName: newUser.motherName,
                address: newUser.address,
                mobile: newUser.studentMobile,
                studentId: studentUser.uid, // Link to student
            };
            batch.set(doc(firestore, 'users', parentUser.uid), parentData);

            // Student Firestore Doc
            const studentData = {
                id: studentUser.uid,
                userId: studentUserId,
                password: studentPassword,
                username: studentName,
                role: 'student',
                class: newUser.studentClass,
                subjects: newUser.studentSubjects,
                fatherName: parentName,
                motherName: newUser.motherName,
                address: newUser.address,
                dob: newUser.dob ? format(newUser.dob, 'yyyy-MM-dd') : null,
                admissionDate: newUser.admissionDate ? format(newUser.admissionDate, 'yyyy-MM-dd') : null,
                aadhaar: newUser.aadhaar,
                pen: newUser.pen,
                mobile: newUser.studentMobile,
                rollNo: newUser.rollNo,
                parentId: parentUser.uid, // Link to parent
            };
            batch.set(doc(firestore, 'users', studentUser.uid), studentData);

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'User Creation Error', description: error.message });
            return;
        }
    }
    
    await batch.commit();

    toast({ title: 'Success!', description: 'New user(s) created successfully.' });
    setNewUser(initialNewUserState);
    setIsUserDialogOpen(false);
  };
  
  const togglePasswordVisibility = (id: string) => {
    setPasswordVisibility(prev => ({
        ...prev,
        [id]: !prev[id]
    }));
  };
  
  const handleAddResult = async () => {
    if (!selectedResultClass || !selectedResultStudent || !selectedExamType || !students || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select class, student, and exam type.' });
      return;
    }

    const student = students.find(s => s.id === selectedResultStudent);
    if (!student) {
      toast({ variant: 'destructive', title: 'Error', description: 'Selected student not found.' });
      return;
    }

    let resultMarks;

    if (selectedExamType === 'monthly') {
        if (
            monthlyObtained === undefined ||
            monthlyObtained === null ||
            String(monthlyObtained).trim() === '' ||
            monthlyTotal === undefined ||
            monthlyTotal === null ||
            String(monthlyTotal).trim() === ''
        ) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter marks for the monthly test.' });
            return;
        }
        resultMarks = {
            obtained: monthlyObtained,
            total: monthlyTotal,
        };
    } else {
        const studentSubjects = getSubjectsForStudent();
        resultMarks = studentSubjects.map(subject => ({
            subject,
            obtained: marks[`${subject}-obtained`] || '0',
            total: marks[`${subject}-total`] || '100',
        }));

        const allMarksEntered = resultMarks.every(m => m.obtained);
        if (!allMarksEntered) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter marks for all subjects.' });
            return;
        }
    }

    const newResult: Omit<Result, 'id'> = {
      studentId: student.id,
      studentName: student.username,
      class: student.class,
      examType: examTypes.find(e => e.value === selectedExamType)?.label || '',
      marks: resultMarks,
    };

    const resultsCol = collection(firestore, 'results');
    addDoc(resultsCol, newResult).catch(error => {
        const contextualError = new FirestorePermissionError({
            operation: 'create',
            path: resultsCol.path,
            requestResourceData: newResult,
        });
        errorEmitter.emit('permission-error', contextualError);
    });
    
    toast({ title: 'Success!', description: 'Result added successfully!' });
    setSelectedResultClass('');
    setSelectedResultStudent('');
    setSelectedExamType('');
    setMarks({});
    setMonthlyObtained('');
    setMonthlyTotal('100');
  };
  
  const handleMarksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setMarks(prev => ({...prev, [id]: value}));
  };

  const getSubjectsForStudent = () => {
    if (!selectedResultStudent || !students) return [];
    const student = students.find(s => s.id === selectedResultStudent);
    if (!student) return [];
    
    if (student.subjects) {
        return student.subjects.split(',').map(s => s.trim());
    }
    
    // @ts-ignore
    return classSubjects[student.class] || [];
  };
  
  const handleGeneratePdf = async (doc: jsPDF, student: any, results: Result[]) => {
    try {
        // The custom font logic has been removed to prevent fetch errors.
        // The PDF will now use one of jsPDF's built-in fonts.
        // Note: Hindi characters may not render correctly with default fonts.
        doc.setFontSize(16);
        doc.text('Adarsh Bal Vidya Mandir', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.text('Student Progress Report', doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
        
        const studentDetails = [
            ['Name', student.username],
            ['Class', student.class],
            ['Roll No.', student.rollNo],
            ["Father's Name", student.fatherName],
            ['Date of Birth', student.dob],
            ['Address', student.address],
        ];

        (doc as any).autoTable({
          startY: 30,
          head: [['Detail', 'Information']],
          body: studentDetails,
          theme: 'grid',
        });

        results.forEach(result => {
            const lastTableY = (doc as any).lastAutoTable.finalY;
            doc.setFontSize(12);
            doc.text(`Exam: ${result.examType}`, 14, lastTableY + 10);

            let tableBody: (string|number)[][] = [];
            let tableHead;

            if (Array.isArray(result.marks)) {
                tableHead = [['Subject', 'Marks Obtained', 'Total Marks']];
                tableBody = result.marks.map(m => [m.subject, m.obtained, m.total]);
            } else {
                tableHead = [['Description', 'Marks']];
                tableBody = [
                    ['Marks Obtained', result.marks.obtained],
                    ['Total Marks', result.marks.total]
                ];
            }

            (doc as any).autoTable({
                startY: lastTableY + 16,
                head: tableHead,
                body: tableBody,
                theme: 'grid',
            });
        });
        
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert('Error generating PDF. Please check the console.');
    }
  };

  const handleDownloadClick = async () => {
    if (!selectedReportClass || !selectedReportStudent || !students || !resultsData) {
      alert('Please select class and student to generate the report.');
      return;
    }

    const student = students.find(s => s.id === selectedReportStudent);
    if (!student) {
        alert('Student not found.');
        return;
    }

    const studentResults = resultsData.filter(r => r.studentId === student.id);
    if (studentResults.length === 0) {
        alert('No results found for this student.');
        return;
    }
    
    try {
        const doc = new jsPDF();
        await handleGeneratePdf(doc, student, studentResults);
        doc.save(`${student.username}_${student.class}_report.pdf`);
    } catch (e) {
        console.error(e);
        alert('Error generating PDF.');
    }
  };

  const handleClassReportDownloadClick = async () => {
    if (!selectedClassReportClass || !selectedClassReportExam || !students || !resultsData) {
      alert('Please select class and exam type.');
      return;
    }

    const studentsInClass = students.filter(s => s.class === selectedClassReportClass);
    if (studentsInClass.length === 0) {
      alert('There are no students in this class.');
      return;
    }

    const examLabel = examTypes.find(e => e.value === selectedClassReportExam)?.label || '';
    const resultsForExam = resultsData.filter(r => r.class === selectedClassReportClass && r.examType === examLabel);

    if (resultsForExam.length === 0) {
      alert(`No results found for '${examLabel}' in this class.`);
      return;
    }

    const doc = new jsPDF();
    let isFirstPage = true;

    for (const student of studentsInClass) {
      const studentResults = resultsForExam.filter(r => r.studentId === student.id);
      if (studentResults.length > 0) {
        if (!isFirstPage) {
          doc.addPage();
        }
        await handleGeneratePdf(doc, student, studentResults);
        isFirstPage = false;
      }
    }

    if (isFirstPage) {
        alert(`No student results found for this class and exam.`);
        return;
    }

    doc.save(`Class-${selectedClassReportClass}_${examLabel}_Report.pdf`);
  };

  const handleShowMarksheets = async () => {
    if (!marksheetClass || !marksheetExam || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select class and exam type.' });
      return;
    }
    const examLabel = examTypes.find(e => e.value === marksheetExam)?.label || '';
  
    const studentsQueryRef = query(collection(firestore, 'users'), where('role', '==', 'student'), where('class', '==', marksheetClass));
    const resultsQueryRef = query(collection(firestore, 'results'), where('class', '==', 'marksheetClass'), where('examType', '==', examLabel));
  
    const [studentsSnapshot, resultsSnapshot] = await Promise.all([getDocs(studentsQueryRef), getDocs(resultsQueryRef)]);
  
    const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const resultsDataFromQuery = resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
    const combinedData = studentsData.map(student => {
      const studentResult = resultsDataFromQuery.find(r => r.studentId === student.id);
      return {
        ...student,
        result: studentResult || null
      };
    });
  
    setClassMarksheets(combinedData);
  };
  
  const handlePrintIdCards = () => {
    if (!idCardClass) {
      toast({ variant: 'destructive', title: 'Selection Missing', description: 'Please select a class to print first.' });
      return;
    }

    const printContent = document.getElementById('printable-id-cards');
    if (!printContent) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not find printable content.' });
      return;
    }

    const printWindow = window.open('', '', 'height=800,width=800');
    if (!printWindow) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not open print window. Please disable your pop-up blocker.' });
      return;
    }

    const stylesheets = Array.from(document.styleSheets)
      .map(s => s.href ? `<link rel="stylesheet" href="${s.href}">` : '')
      .join('');

    const pageStyles = `
      <html>
        <head>
          <title>Print ID Cards</title>
          ${stylesheets}
          <style>
            body { 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
              font-family: 'PT Sans', sans-serif;
            }
            .id-card-print-wrapper {
              page-break-inside: avoid;
              break-inside: avoid;
            }
             @media print {
              body {
                margin: 0;
                padding: 0;
              }
              #printable-id-cards {
                margin: 0;
                padding: 0;
                width: 100%;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `;
    
    printWindow.document.write(pageStyles);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const getQuarterlyFee = (className: string) => {
    if (!className) return 0;
    const classNum = parseInt(className);
    if (className === 'Nursery' || className === 'KG') return 1200;
    if (classNum >= 1 && classNum <= 8) return 1800;
    if (classNum >= 9 && classNum <= 12) return 2400;
    return 0;
  };

  const academicYearQuarters = [
    { id: 'q1', label: 'April - June' },
    { id: 'q2', label: 'July - September' },
    { id: 'q3', label: 'October - December' },
    { id: 'q4', label: 'January - March' },
  ];

  const getFeeStatusForQuarter = (quarterId: string) => {
    if (!studentFees) return { status: 'Unpaid' };
    const feeRecord = studentFees.find(f => f.quarter === quarterId);
    return feeRecord
      ? { status: feeRecord.status, paymentDate: feeRecord.paymentDate, id: feeRecord.id }
      : { status: 'Unpaid' };
  };

  const handlePayFee = (quarterId: string, amount: number) => {
    if (!firestore || !feeStudent || !feeClass || !students) return;
  
    const student = students.find(s => s.id === feeStudent);
    if (!student) return;
  
    const quarterFeeRecord = studentFees?.find(f => f.quarter === quarterId);
  
    if (quarterFeeRecord && quarterFeeRecord.id) {
      // Update existing fee record if it's 'Unpaid'
      if (quarterFeeRecord.status === 'Unpaid') {
        const feeDocRef = doc(firestore, 'fees', quarterFeeRecord.id);
        const updatedData = { status: 'Paid', paymentDate: serverTimestamp() };
        updateDoc(feeDocRef, updatedData)
          .then(() => toast({ title: 'Success', description: 'Fee paid successfully.' }))
          .catch(error => {
            const contextualError = new FirestorePermissionError({
                path: feeDocRef.path,
                operation: 'update',
                requestResourceData: updatedData,
            });
            errorEmitter.emit('permission-error', contextualError);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update fee status.' });
        });
      }
    } else {
      // Create new fee record if one doesn't exist for the quarter
      const feeColRef = collection(firestore, 'fees');
      const newData = {
        studentId: feeStudent,
        studentName: student.username,
        class: feeClass,
        quarter: quarterId,
        amount: amount,
        status: 'Paid',
        paymentDate: serverTimestamp()
      };
      addDoc(feeColRef, newData)
        .then(() => toast({ title: 'Success', description: 'Fee paid successfully.' }))
        .catch(error => {
            const contextualError = new FirestorePermissionError({
                path: feeColRef.path,
                operation: 'create',
                requestResourceData: newData,
            });
            errorEmitter.emit('permission-error', contextualError);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to create fee record.' });
        });
    }
  };

  const handlePayAllClassFees = async () => {
    if (!firestore || !feeClass || !feeQuarter || !students) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a class and a quarter.' });
      return;
    }

    const studentsInClass = students.filter(s => s.class === feeClass);
    if (studentsInClass.length === 0) {
      toast({ title: 'Info', description: 'No students found in the selected class.' });
      return;
    }
    
    const feeAmount = getQuarterlyFee(feeClass);
    const batch = writeBatch(firestore);

    // Get all existing fee documents for the class and quarter to avoid duplicates
    const feesRef = collection(firestore, 'fees');
    const q = query(feesRef, where('class', '==', 'feeClass'), where('quarter', '==', 'feeQuarter'));
    const querySnapshot = await getDocs(q);
    const existingFeesMap = new Map(querySnapshot.docs.map(doc => [doc.data().studentId, {id: doc.id, ...doc.data()}]));

    let paymentsProcessed = 0;

    studentsInClass.forEach(student => {
      const existingFee = existingFeesMap.get(student.id);

      if (existingFee && existingFee.status === 'Paid') {
        // Fee already paid, skip
        return;
      } else if (existingFee && existingFee.status === 'Unpaid') {
        // Fee exists but is unpaid, update it
        const feeDocRef = doc(firestore, 'fees', existingFee.id);
        batch.update(feeDocRef, { status: 'Paid', paymentDate: serverTimestamp() });
        paymentsProcessed++;
      } else {
        // No fee record exists, create a new one
        const newFeeDocRef = doc(collection(firestore, 'fees'));
        batch.set(newFeeDocRef, {
          studentId: student.id,
          studentName: student.username,
          class: student.class,
          quarter: feeQuarter,
          amount: feeAmount,
          status: 'Paid',
          paymentDate: serverTimestamp()
        });
        paymentsProcessed++;
      }
    });

    if (paymentsProcessed === 0) {
      toast({ title: 'Info', description: 'All fees for this quarter are already paid.' });
      return;
    }

    await batch.commit();
    toast({ title: 'Success', description: `Processed ${paymentsProcessed} fee payment(s) for Class ${feeClass}.` });
  };


  const handlePrintFeeReceipt = async (feeData: any) => {
    if (!students) return;
    const student = students.find(s => s.id === feeData.studentId);
    if (!student) return;
    
    const doc = new jsPDF();
    try {
        // The custom font logic has been removed to prevent fetch errors.
        // The PDF will now use one of jsPDF's built-in fonts.
        doc.setFontSize(18);
        doc.text('Adarsh Bal Vidya Mandir', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
        doc.setFontSize(14);
        doc.text('Fee Receipt', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

        const quarterInfo = academicYearQuarters.find(q => q.id === feeData.quarter);

        const details = [
            ['Receipt No.', feeData.id.slice(0, 8).toUpperCase()],
            ['Payment Date', feeData.paymentDate ? format(feeData.paymentDate.toDate(), 'dd/MM/yyyy') : ''],
            ['Student Name', student.username],
            ['Class', student.class],
            ['Roll No.', student.rollNo],
            ['Quarter', quarterInfo?.label || ''],
            ['Amount (INR)', feeData.amount.toString()],
            ['Status', feeData.status],
        ];

        (doc as any).autoTable({
          startY: 40,
          head: [['Detail', 'Information']],
          body: details,
          theme: 'grid',
          styles: { cellPadding: 3 },
        });

        const finalY = (doc as any).lastAutoTable.finalY;
        doc.setFontSize(10);
        doc.text('This is a computer-generated receipt.', 14, finalY + 15);
        doc.text('Principal', doc.internal.pageSize.getWidth() - 30, finalY + 25, {align: 'center'});

        doc.save(`Fee_Receipt_${student.username}_${feeData.quarter}.pdf`);
    } catch (e) {
        console.error(e);
        toast({variant: 'destructive', title: 'Error', description: 'Failed to generate receipt.'});
    }
  };

  const handlePrintDailyFeeReport = () => {
    if (!dailyFeeData || dailyFeeData.length === 0 || !dailyReportDate) {
      toast({ variant: 'destructive', title: 'No Data', description: 'No fee data available for the selected date.' });
      return;
    }
    
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Adarsh Bal Vidya Mandir', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`Daily Fee Collection Report - ${format(dailyReportDate, 'PPP')}`, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

    let totalDayCollection = 0;
    let startY = 40;

    Object.keys(dailyFeeReportData).sort().forEach(className => {
        const feesForClass = dailyFeeReportData[className];
        if (feesForClass.length === 0) return;

        let classTotal = 0;
        const tableBody = feesForClass.map(fee => {
            const quarterInfo = academicYearQuarters.find(q => q.id === fee.quarter);
            classTotal += fee.amount;
            return [fee.studentName, quarterInfo?.label || fee.quarter, fee.amount.toFixed(2)];
        });

        totalDayCollection += classTotal;

        doc.setFontSize(12);
        doc.text(`Class: ${className}`, 14, startY);

        (doc as any).autoTable({
            startY: startY + 6,
            head: [['Student Name', 'Quarter', 'Amount (INR)']],
            body: tableBody,
            theme: 'grid',
            didDrawPage: (data: any) => {
                startY = data.cursor.y;
            }
        });
        
        startY = (doc as any).lastAutoTable.finalY + 2;
        doc.setFontSize(10);
        doc.text(`Class Total: ${classTotal.toFixed(2)}`, doc.internal.pageSize.getWidth() - 14, startY, { align: 'right' });
        startY += 10;
    });

    startY += 5;
    doc.setFontSize(14);
    doc.text(`Total Collection for the Day: ${totalDayCollection.toFixed(2)} INR`, 14, startY);

    doc.save(`Daily_Fee_Report_${format(dailyReportDate, 'yyyy-MM-dd')}.pdf`);
  };

  const handleGenerateTC = async () => {
    if (!tcStudent || !students) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a student.' });
      return;
    }
  
    const student = students.find(s => s.id === tcStudent);
    if (!student) {
      toast({ variant: 'destructive', title: 'Error', description: 'Student not found.' });
      return;
    }
  
    const doc = new jsPDF();
  
    // Add border
    doc.rect(5, 5, doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 10);
    
    // Add logo - a bit tricky with jsPDF and SVG component, converting to base64 or using an image is easier
    // For now, let's skip the logo in PDF to avoid complexity, but we can add text header
    
    // Header
    doc.setFontSize(22);
    doc.setFont('times', 'bold');
    doc.text('Adarsh Bal Vidya Mandir Inter College', doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    doc.text('Affiliated to U.P. Board, Prayagraj', doc.internal.pageSize.getWidth() / 2, 33, { align: 'center' });
    doc.text('bilgram - hardoi', doc.internal.pageSize.getWidth() / 2, 39, { align: 'center' });
  
    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSFER CERTIFICATE', doc.internal.pageSize.getWidth() / 2, 55, { align: 'center' });
  
    // TC Details
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    const tcNo = `TC/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
    const issueDate = format(new Date(), 'dd/MM/yyyy');
    doc.text(`Certificate No: ${tcNo}`, 14, 70);
    doc.text(`Date of Issue: ${issueDate}`, doc.internal.pageSize.width - 14, 70, { align: 'right' });
  
    // Student Information
    const studentInfo = [
      ['1. Name of Student', student.username],
      ['2. Father\'s Name', student.fatherName],
      ["3. Mother's Name", student.motherName],
      ['4. Date of Birth (in figures)', student.dob ? format(new Date(student.dob), 'dd/MM/yyyy') : 'N/A'],
      // TODO: Convert DOB to words
      ['5. Class in which admitted', student.class],
      ['6. Date of Admission', student.admissionDate ? format(new Date(student.admissionDate), 'dd/MM/yyyy') : 'N/A'],
    ];
  
    (doc as any).autoTable({
      startY: 80,
      body: studentInfo,
      theme: 'plain',
      styles: {
        fontSize: 12,
        font: 'times',
        cellPadding: 2,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 70 },
      },
    });
  
    const lastY = (doc as any).lastAutoTable.finalY;
  
    // Declaration
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    const declarationText = `This is to certify that the above-named student was on the rolls of this school. He/She has paid all school dues up to date. We wish him/her all the best for his/her future.`;
    const splitText = doc.splitTextToSize(declarationText, doc.internal.pageSize.width - 28);
    doc.text(splitText, 14, lastY + 15);
  
    // Signature
    const signatureY = doc.internal.pageSize.height - 40;
    doc.text('Principal\'s Signature', doc.internal.pageSize.width - 40, signatureY, { align: 'center' });
    doc.line(doc.internal.pageSize.width - 70, signatureY - 2, doc.internal.pageSize.width - 10, signatureY - 2);
  
    doc.save(`TC_${student.username}.pdf`);
  };

  const handleUpdateLeaveStatus = (id: string, status: 'Approved' | 'Rejected') => {
    if (!firestore) return;
    const docRef = doc(firestore, 'leave-applications', id);
    updateDoc(docRef, { status })
      .then(() => {
        toast({
          title: 'Success!',
          description: `Application has been ${status}.`,
        });
      })
      .catch((error) => {
        const contextualError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: { status }
        });
        errorEmitter.emit('permission-error', contextualError);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not update the application status.',
        });
      });
  };

  const classes = ['Nursery', 'KG', ...Array.from({length: 12}, (_, i) => (i + 1).toString())];
  const examTypes = [
    { value: 'monthly', label: 'Monthly Test' },
    { value: 'quarterly', label: 'Quarterly Exam' },
    { value: 'half-yearly', label: 'Half-Yearly Exam' },
    { value: 'final', label: 'Final Exam' },
  ];
  const studentSubjects = getSubjectsForStudent();
  
  const attendanceFilteredStudents = React.useMemo(() => {
    if (!attendanceReportClass || !attendanceReportDate || !students) return [];

    const studentsInClass = students.filter(s => s.class === attendanceReportClass);

    return studentsInClass.map(student => {
      const attendanceRecord = attendance?.find(
        att => att.studentId === student.id
      );
      return {
        ...student,
        status: attendanceRecord ? attendanceRecord.status : 'Absent',
      };
    });
  }, [attendanceReportClass, attendanceReportDate, students, attendance]);

  const idCardFilteredStudents = React.useMemo(() => {
    if (!idCardClass || !students) return [];
    return students.filter(s => s.class === idCardClass);
  }, [idCardClass, students]);

  if (isUserLoading || isCurrentUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading data...</p>
      </div>
    );
  }
  
  const stats = [
      {
        title: 'Total Students',
        value: users?.filter(u => u.role === 'student').length ?? '0',
        icon: UserIcon,
        color: 'bg-blue-100 text-blue-600',
      },
      {
        title: 'Teachers',
        value: users?.filter(u => u.role === 'teacher').length ?? '0',
        icon: Users,
        color: 'bg-indigo-100 text-indigo-600',
      },
      {
        title: 'Parents',
        value: users?.filter(u => u.role === 'parent').length ?? '0',
        icon: Users,
        color: 'bg-amber-100 text-amber-600',
      },
      {
        title: 'Classes',
        value: '14',
        icon: Home,
        color: 'bg-pink-100 text-pink-600',
      },
    ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Principal Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className={`p-3 rounded-md ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-right">
                  {stat.title}
                </CardTitle>
                <p className="text-2xl font-bold text-right">{stat.value}</p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
         <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <CardTitle>School Management</CardTitle>
            <CardDescription>Select a module to manage school operations.</CardDescription>
            <ScrollArea className="w-full whitespace-nowrap">
             <TabsList className="grid h-auto grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-2 p-2 bg-transparent border-none">
                {managementOptions.map(option => (
                    <TabsTrigger key={option.value} value={option.value} asChild>
                         <div className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer h-24 text-white shadow-lg transform transition-transform hover:-translate-y-1",
                            option.color
                         )}>
                            <option.icon className="h-8 w-8 mb-1"/>
                            <span className="text-xs text-center font-semibold">{option.label}</span>
                         </div>
                    </TabsTrigger>
                ))}
             </TabsList>
            </ScrollArea>
          </CardHeader>
          <TabsContent value="user-management">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Management</CardTitle>
              <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setNewUser(initialNewUserState); setIsUserDialogOpen(true); }} className="bg-green-500 hover:bg-green-600 text-white">
                    <UserPlus className="mr-2" />
                    Create New User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={newUser.role} onValueChange={handleSelectChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {newUser.role && (
                      <div className="space-y-2">
                        <Label htmlFor="username">
                          {newUser.role === 'teacher' ? 'Teacher Name' : newUser.role === 'parent' ? "Father's Name" : 'Student Name'}
                        </Label>
                        <Input id="username" value={newUser.username || ''} onChange={(e) => handleInputChange(e.target.id, e.target.value)} />
                      </div>
                    )}


                    {newUser.role === 'teacher' && (
                      <div className="space-y-4 rounded-md border p-4">
                        <h3 className="font-semibold">Teacher Details</h3>
                         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="teacherMobile">Mobile Number</Label>
                            <Input id="teacherMobile" value={newUser.teacherMobile || ''} onChange={(e) => handleInputChange(e.target.id, e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="teacherSubject">Subject</Label>
                            <Input id="teacherSubject" value={newUser.teacherSubject || ''} onChange={(e) => handleInputChange(e.target.id, e.target.value)} placeholder="e.g., Hindi, English"/>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="teacherClass">Class</Label>
                            <Input id="teacherClass" value={newUser.teacherClass || ''} onChange={(e) => handleInputChange(e.target.id, e.target.value)} placeholder="e.g., 5, 6, 7" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {(newUser.role === 'parent' || newUser.role === 'student') && (
                      <>
                        <div className="space-y-4 rounded-md border p-4">
                          <h3 className="font-semibold">Parent & Student Details</h3>
                          
                          {newUser.role === 'student' && (
                            <div className="space-y-2">
                                <Label htmlFor="parentName">Father's Name</Label>
                                <Input id="parentName" value={newUser.parentName || ''} onChange={(e) => handleInputChange(e.target.id, e.target.value)} />
                            </div>
                          )}

                          <div className="space-y-2">
                              <Label htmlFor="motherName">Mother's Name</Label>
                              <Input id="motherName" value={newUser.motherName || ''} onChange={(e) => handleInputChange(e.target.id, e.target.value)} />
                          </div>
                          
                          <div className="space-y-2">
                              <Label htmlFor="studentMobile">Mobile Number</Label>
                              <Input id="studentMobile" value={newUser.studentMobile || ''} onChange={(e) => handleInputChange(e.target.id, e.target.value)} />
                          </div>
                          
                          {newUser.role === 'parent' && (
                          <div className="space-y-2 pt-4 border-t">
                            <Label htmlFor="studentName" className="font-medium text-primary">Student's Name</Label>
                            <Input id="studentName" value={newUser.studentName || ''} onChange={(e) => handleInputChange(e.target.id, e.target.value)} />
                          </div>
                          )}
                        </div>

                        <div className="space-y-4 rounded-md border p-4">
                          <h3 className="font-semibold">Student Academic Details</h3>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="studentClass">Class</Label>
                              <Select onValueChange={handleStudentClassChange} value={newUser.studentClass}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a class" />
                                </SelectTrigger>
                                <SelectContent>
                                  {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="rollNo">Roll No.</Label>
                              <Input id="rollNo" value={newUser.rollNo || ''} readOnly className="bg-gray-100" placeholder="Auto-generated"/>
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                              <Label htmlFor="studentSubjects">Subjects</Label>
                              <Input id="studentSubjects" value={newUser.studentSubjects || ''} readOnly className="bg-gray-100" placeholder="Auto-filled"/>
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                              <Label htmlFor="address">Address</Label>
                              <Input id="address" value={newUser.address || ''} onChange={(e) => handleInputChange(e.target.id, e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                 <Popover>
                                    <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal", !newUser.dob && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newUser.dob ? format(newUser.dob, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={newUser.dob}
                                        onSelect={(date) => handleDateChange('dob', date)}
                                        captionLayout="dropdown"
                                        fromYear={1980}
                                        toYear={new Date().getFullYear()}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admissionDate">Admission Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal", !newUser.admissionDate && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newUser.admissionDate ? format(newUser.admissionDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={newUser.admissionDate}
                                        onSelect={(date) => handleDateChange('admissionDate', date)}
                                        captionLayout="dropdown"
                                        fromYear={new Date().getFullYear() - 10}
                                        toYear={new Date().getFullYear()}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                            </div>
                             <div className="space-y-2">
                              <Label htmlFor="aadhaar">Aadhaar Number</Label>
                              <Input id="aadhaar" value={newUser.aadhaar || ''} onChange={(e) => handleInputChange(e.target.id, e.target.value)} />
                            </div>
                             <div className="space-y-2">
                              <Label htmlFor="pen">PEN Number</Label>
                              <Input id="pen" value={newUser.pen || ''} onChange={(e) => handleInputChange(e.target.id, e.target.value)} />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleCreateUser}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Class/Subject</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading && <TableRow><TableCell colSpan={7} className="h-24 text-center">Loading...</TableCell></TableRow>}
                  {!usersLoading && users && users.filter(u => u.role !== 'student' && u.role !== 'admin').map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === 'teacher' ? 'secondary' : 'outline'
                          }
                          className={
                            user.role === 'teacher'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.userId}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <span>{passwordVisibility[user.id] ? user.password : '••••••••'}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => togglePasswordVisibility(user.id)}>
                            {passwordVisibility[user.id] ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </Button>
                      </TableCell>
                      <TableCell>{user.mobile || '-'}</TableCell>
                      <TableCell>{user.classSubject || '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                   {!usersLoading && (!users || users.filter(u => u.role !== 'student' && u.role !== 'admin').length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </TabsContent>
          <TabsContent value="student-management">
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Father's Name</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsLoading && <TableRow><TableCell colSpan={8} className="h-24 text-center">Loading...</TableCell></TableRow>}
                  {!studentsLoading && students && students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.rollNo}</TableCell>
                      <TableCell>{student.username}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>{student.fatherName}</TableCell>
                      <TableCell>{student.userId}</TableCell>
                       <TableCell className="flex items-center gap-2">
                        <span>{passwordVisibility[student.id] ? student.password : '••••••••'}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => togglePasswordVisibility(student.id)}>
                            {passwordVisibility[student.id] ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </Button>
                      </TableCell>
                      <TableCell>{student.mobile}</TableCell>
                       <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-destructive"
                          onClick={() => handleDeleteUser(student.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                   {!studentsLoading && (!students || students.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No students found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </TabsContent>
           <TabsContent value="notice-management">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Notice Management</CardTitle>
                <Dialog open={isNoticeDialogOpen} onOpenChange={handleNoticeDialogClose}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsNoticeDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600">
                    <PlusCircle className="mr-2" />
                    Add New Notice
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingNotice ? 'Edit Notice' : 'Create New Notice'}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title
                      </Label>
                      <Input id="title" value={newNotice.title} onChange={handleNoticeInputChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="content" className="text-right pt-2">
                        Content
                      </Label>
                      <Textarea id="content" value={newNotice.content} onChange={handleNoticeInputChange} className="col-span-3" rows={5} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-right">
                        For
                      </Label>
                      <Select value={newNotice.role} onValueChange={handleNoticeRoleChange}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          <SelectItem value="Teachers">Teachers</SelectItem>
                          <SelectItem value="Students">Students</SelectItem>
                          <SelectItem value="Parents">Parents</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => handleNoticeDialogClose(false)}>Cancel</Button>
                    <Button type="submit" onClick={editingNotice ? handleUpdateNotice : handleCreateNotice}>
                        {editingNotice ? 'Update' : 'Publish'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {noticesLoading && <p className="text-center text-muted-foreground">Loading notices...</p>}
              {!noticesLoading && notices && notices.map(notice => (
                <div key={notice.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 relative border-l-4 border-amber-400">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{notice.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{notice.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">{notice.createdAt ? format(notice.createdAt.toDate(), 'dd/MM/yyyy') : ''} - {notice.author}</p>
                    </div>
                    <div className="flex items-center gap-2 absolute top-4 right-4">
                        <Button variant="outline" size="sm" className="bg-amber-100 text-amber-800" onClick={() => handleEditNoticeClick(notice)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteNotice(notice.id)}>Delete</Button>
                    </div>
                  </div>
                </div>
              ))}
               {!noticesLoading && (!notices || notices.length === 0) && (
                <div className="p-4 min-h-[150px] flex items-center justify-center">
                    <p className="text-muted-foreground">No notices found.</p>
                </div>
               )}
            </CardContent>
          </TabsContent>
           <TabsContent value="result-management">
            <CardHeader>
              <CardTitle>Result Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="result-class">Class</Label>
                  <Select value={selectedResultClass} onValueChange={(value) => { setSelectedResultClass(value); setSelectedResultStudent(''); setMarks({}); }}>
                    <SelectTrigger id="result-class">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="result-student">Student</Label>
                  <Select value={selectedResultStudent} onValueChange={(value) => {setSelectedResultStudent(value); setMarks({});}} disabled={!selectedResultClass}>
                    <SelectTrigger id="result-student">
                      <SelectValue placeholder="Select Student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students && students.filter(s => s.class === selectedResultClass).map(s => <SelectItem key={s.id} value={s.id}>{s.username} (Roll No. {s.rollNo})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="result-exam-type">Exam Type</Label>
                    <Select value={selectedExamType} onValueChange={(value) => {setSelectedExamType(value); setMarks({});}}>
                        <SelectTrigger id="result-exam-type">
                            <SelectValue placeholder="Select Exam" />
                        </SelectTrigger>
                        <SelectContent>
                          {examTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                    </Select>
                </div>
                {selectedExamType !== 'monthly' && (
                  <Button onClick={handleAddResult} disabled={!selectedResultClass || !selectedResultStudent || !selectedExamType} className="bg-green-600 hover:bg-green-700">
                    Add Result
                  </Button>
                )}
              </div>

              {selectedExamType && selectedResultStudent && (
                <div className="border rounded-lg p-4 space-y-4">
                  {selectedExamType === 'monthly' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 items-center max-w-sm">
                        <Label htmlFor="monthly-obtained" className="font-semibold">Marks Obtained</Label>
                        <Input id="monthly-obtained" type="number" placeholder="Obtained" value={monthlyObtained} onChange={(e) => setMonthlyObtained(e.target.value)}/>
                         <Label htmlFor="monthly-total" className="font-semibold">Total Marks</Label>
                        <Input id="monthly-total" type="number" value={monthlyTotal} onChange={(e) => setMonthlyTotal(e.target.value)} />
                      </div>
                      <Button onClick={handleAddResult} className="bg-green-600 hover:bg-green-700">Save Test Result</Button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Subject-wise Marks</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {studentSubjects.map(subject => (
                           <div key={subject} className="grid grid-cols-3 gap-2 items-center">
                              <Label htmlFor={`marks-obtained-${subject}`} className="col-span-1">{subject}</Label>
                              <Input id={`${subject}-obtained`} type="number" placeholder="Obtained" className="col-span-1" value={marks[`${subject}-obtained`] || ''} onChange={handleMarksChange} />
                              <Input id={`${subject}-total`} type="number" value={marks[`${subject}-total`] || '100'} readOnly className="col-span-1 bg-gray-100" onChange={handleMarksChange}/>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium mb-4 mt-6">All Results</h3>
                <div className="border rounded-lg">
                  {resultsLoading && <p className="text-center p-4">Loading results...</p>}
                  {!resultsLoading && resultsData && resultsData.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Exam</TableHead>
                          <TableHead>Result</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resultsData.map(result => (
                          <TableRow key={result.id}>
                            <TableCell>{result.studentName}</TableCell>
                            <TableCell>{result.class}</TableCell>
                            <TableCell>{result.examType}</TableCell>
                            <TableCell>
                              {Array.isArray(result.marks) ? (
                                <ul className="list-disc pl-5">
                                  {result.marks.map((mark, i) => (
                                    <li key={i}>{mark.subject}: {mark.obtained}/{mark.total}</li>
                                  ))}
                                </ul>
                              ) : (
                                `Marks: ${result.marks.obtained}/${result.marks.total}`
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : !resultsLoading ? (
                    <div className="p-4 min-h-[100px] flex items-center justify-center">
                      <p className="text-muted-foreground">No results available</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </TabsContent>
          {userRole === 'admin' && (
          <TabsContent value="fee-management">
            <CardHeader>
              <CardTitle>Fee Management</CardTitle>
              <CardDescription>Submit and track quarterly student fees.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-medium">Single Student Fee</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="fee-class">Class</Label>
                    <Select value={feeClass} onValueChange={(value) => { setFeeClass(value); setFeeStudent(''); }}>
                      <SelectTrigger id="fee-class">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee-student">Student</Label>
                    <Select value={feeStudent} onValueChange={setFeeStudent} disabled={!feeClass}>
                      <SelectTrigger id="fee-student">
                        <SelectValue placeholder="Select Student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students && students.filter(s => s.class === feeClass).map(s => <SelectItem key={s.id} value={s.id}>{s.username} (Roll No. {s.rollNo})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-medium">Bulk Fee Payment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="fee-class-bulk">Class</Label>
                      <Select value={feeClass} onValueChange={setFeeClass}>
                        <SelectTrigger id="fee-class-bulk">
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fee-quarter-bulk">Quarter</Label>
                        <Select value={feeQuarter} onValueChange={setFeeQuarter}>
                          <SelectTrigger id="fee-quarter-bulk">
                            <SelectValue placeholder="Select Quarter" />
                          </SelectTrigger>
                          <SelectContent>
                            {academicYearQuarters.map(q => <SelectItem key={q.id} value={q.id}>{q.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handlePayAllClassFees} disabled={!feeClass || !feeQuarter} className="bg-blue-600 hover:bg-blue-700">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Pay All Fees for this Class
                    </Button>
                </div>
              </div>


              {feeStudent && (
                <Card>
                  <CardHeader>
                    <CardTitle>Fee Status for {students?.find(s => s.id === feeStudent)?.username}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Quarter</TableHead>
                          <TableHead>Amount (INR)</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {academicYearQuarters.map(q => {
                          const feeInfo = getFeeStatusForQuarter(q.id);
                          const isPaid = feeInfo.status === 'Paid';
                          const feeAmount = getQuarterlyFee(feeClass);
                          const feeData = studentFees?.find(f => f.quarter === q.id);

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
                              <TableCell className="text-right space-x-2">
                                <Button size="sm" disabled={isPaid} onClick={() => handlePayFee(q.id, feeAmount)} className="bg-blue-600 hover:bg-blue-700">
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  Pay Fee
                                </Button>
                                {isPaid && feeData && (
                                  <Button size="sm" variant="outline" onClick={() => handlePrintFeeReceipt({...feeData, amount: feeAmount, id: feeInfo.id })}>
                                      <Printer className="mr-2 h-4 w-4" />
                                      Print Receipt
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </TabsContent>
          )}
          {userRole === 'admin' && (
          <TabsContent value="daily-fee-report">
            <CardHeader>
                <CardTitle>Daily Fee Collection Report</CardTitle>
                <CardDescription>View and print fee collection for a specific day.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                        <Label>Select Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[280px] justify-start text-left font-normal",
                                        !dailyReportDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dailyReportDate ? format(dailyReportDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={dailyReportDate}
                                    onSelect={setDailyReportDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Button onClick={handlePrintDailyFeeReport}><Printer className="mr-2" /> Print Report</Button>
                </div>
                {dailyFeeLoading ? (
                    <p>Loading report...</p>
                ) : Object.keys(dailyFeeReportData).length > 0 ? (
                  <div className="space-y-8">
                    {Object.keys(dailyFeeReportData).sort().map(className => {
                      const feesForClass = dailyFeeReportData[className];
                      const classTotal = feesForClass.reduce((sum, fee) => sum + fee.amount, 0);
                      return (
                        <Card key={className}>
                          <CardHeader>
                            <CardTitle>Class {className}</CardTitle>
                            <CardDescription>Total collected: {classTotal.toFixed(2)} INR</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Student Name</TableHead>
                                  <TableHead>Quarter</TableHead>
                                  <TableHead className="text-right">Amount (INR)</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {feesForClass.map(fee => {
                                  const quarterInfo = academicYearQuarters.find(q => q.id === fee.quarter);
                                  return (
                                    <TableRow key={fee.id}>
                                      <TableCell>{fee.studentName}</TableCell>
                                      <TableCell>{quarterInfo?.label || fee.quarter}</TableCell>
                                      <TableCell className="text-right">{fee.amount.toFixed(2)}</TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      )
                    })}
                     <div className="text-right font-bold text-lg pr-4">
                        Total Day Collection: {dailyFeeData?.reduce((sum, fee) => sum + fee.amount, 0).toFixed(2)} INR
                    </div>
                  </div>
                ) : (
                    <div className="p-4 min-h-[150px] flex items-center justify-center text-muted-foreground">
                        <p>No fees collected on {dailyReportDate ? format(dailyReportDate, 'PPP') : 'the selected date'}.</p>
                    </div>
                )}
            </CardContent>
          </TabsContent>
          )}
          <TabsContent value="student-promotion">
            <CardHeader>
                <CardTitle>Student Promotion</CardTitle>
                <CardDescription>Promote students from one class to the next for the new academic session.</CardDescription>
            </CardHeader>
            <CardContent>
                <Card className="max-w-xl mx-auto">
                    <CardHeader>
                        <CardTitle>Promote Class</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-2">
                                <Label>From Class</Label>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="Select current class" /></SelectTrigger>
                                    <SelectContent>{classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <ChevronsRight className="mt-7 h-8 w-8 text-muted-foreground shrink-0"/>
                            <div className="flex-1 space-y-2">
                                <Label>To Class</Label>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="Select new class" /></SelectTrigger>
                                    <SelectContent>{classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button className="w-full bg-blue-500 hover:bg-blue-600" size="lg">
                            <GraduationCap className="mr-2"/>
                            Promote All Students
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">This action will promote all students from the selected class to the new class. This cannot be undone.</p>
                    </CardContent>
                </Card>
            </CardContent>
          </TabsContent>
          {userRole === 'admin' && (
          <TabsContent value="salary-management">
             <CardHeader>
                <CardTitle>Salary Management</CardTitle>
                <CardDescription>Manage monthly salary payments for teachers.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Salary Amount</TableHead>
                        <TableHead>Status</TableHead>
                         <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users && users.filter(u => u.role === 'teacher').map(teacher => (
                            <TableRow key={teacher.id}>
                                <TableCell>{teacher.username}</TableCell>
                                <TableCell><Badge variant="secondary" className="bg-blue-100 text-blue-800">Teacher</Badge></TableCell>
                                <TableCell>₹ 25,000</TableCell>
                                <TableCell><Badge className="bg-red-100 text-red-800">Unpaid</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700"><DollarSign className="mr-2"/>Pay Now</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                         {!usersLoading && (!users || users.filter(u => u.role === 'teacher').length === 0) && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No teachers found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
          </TabsContent>
          )}
          <TabsContent value="id-cards">
            <CardHeader>
              <CardTitle>ID Card Generator</CardTitle>
              <CardDescription>Select a class and view all student ID cards.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 border rounded-lg mb-6">
                <div className="space-y-2">
                  <Label htmlFor="id-card-class">Select Class</Label>
                  <Select value={idCardClass} onValueChange={setIdCardClass}>
                    <SelectTrigger id="id-card-class" className="w-[180px]">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handlePrintIdCards} className="bg-rose-500 hover:bg-rose-600">
                  <Printer className="mr-2" /> Print
                </Button>
              </div>

              {idCardClass && (
                <div id="printable-id-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {idCardFilteredStudents.map(student => (
                    <div key={student.id} className="id-card-print-wrapper">
                      <div className="bg-[#0A2540] rounded-2xl shadow-2xl overflow-hidden w-full max-w-xs mx-auto text-white font-sans">
                        <div className="bg-yellow-400 p-3 text-center">
                          <h2 className="text-lg font-bold text-[#0A2540]">Adarsh Bal Vidya Mandir</h2>
                          <p className="text-xs font-semibold text-[#0A2540]">IDENTITY CARD (2024-25)</p>
                        </div>
                        <div className="p-4 flex flex-col items-center">
                          <div className="w-28 h-28 rounded-full border-4 border-pink-500 overflow-hidden mb-3">
                            <Image 
                              src={`https://picsum.photos/seed/${student.id}/200/300`} 
                              alt="Student Photo" 
                              width={112} 
                              height={112} 
                              className="object-cover w-full h-full" 
                              data-ai-hint="student portrait" 
                            />
                          </div>
                          <h3 className="text-xl font-bold text-yellow-400">{student.username}</h3>
                          <div className="text-center mt-2 space-y-1 text-sm">
                            <p><span className="font-semibold">Class:</span> {student.class} | <span className="font-semibold">Roll:</span> {student.rollNo}</p>
                            <p><span className="font-semibold">Father:</span> {student.fatherName}</p>
                          </div>
                        </div>
                        <div className="px-4 pb-3 space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4 text-yellow-400 shrink-0" />
                            <p>{student.address}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-yellow-400 shrink-0" />
                            <p>{student.mobile}</p>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col items-center">
                          <Barcode className="h-10 w-full text-white" />
                          <p className="text-xs mt-1">www.abvmic.com</p>
                        </div>
                        <div className="bg-pink-500 h-2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </TabsContent>
          <TabsContent value="marksheets">
            <CardHeader>
              <CardTitle>Class-wise Marksheets</CardTitle>
              <CardDescription>View marksheet for an entire class at once.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 p-4 border rounded-lg mb-6">
                <div className="space-y-2">
                  <Label htmlFor="marksheet-class">Select Class</Label>
                  <Select value={marksheetClass} onValueChange={setMarksheetClass}>
                    <SelectTrigger id="marksheet-class" className="w-[180px]">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marksheet-exam">Select Exam</Label>
                  <Select value={marksheetExam} onValueChange={setMarksheetExam}>
                    <SelectTrigger id="marksheet-exam" className="w-[180px]">
                      <SelectValue placeholder="Select Exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleShowMarksheets} className="bg-purple-600 hover:bg-purple-700">View Marksheets</Button>
              </div>

              {classMarksheets.length > 0 && (
                <div className="space-y-6">
                  {classMarksheets.map(student => (
                    <Card key={student.id}>
                      <CardHeader>
                        <CardTitle>{student.username}</CardTitle>
                        <CardDescription>Roll No: {student.rollNo}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {student.result ? (
                          Array.isArray(student.result.marks) ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Subject</TableHead>
                                  <TableHead>Obtained</TableHead>
                                  <TableHead>Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {student.result.marks.map((mark: any, i: number) => (
                                  <TableRow key={i}>
                                    <TableCell>{mark.subject}</TableCell>
                                    <TableCell>{mark.obtained}</TableCell>
                                    <TableCell>{mark.total}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                             <p>Marks: {student.result.marks.obtained}/{student.result.marks.total}</p>
                          )
                        ) : (
                          <p className="text-muted-foreground">Result not available for this student.</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </TabsContent>
          <TabsContent value="reports">
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Student Progress Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="space-y-2">
                      <Label htmlFor="report-class">Select Class</Label>
                      <Select value={selectedReportClass} onValueChange={setSelectedReportClass}>
                        <SelectTrigger id="report-class">
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                           {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="report-student">Select Student</Label>
                      <Select value={selectedReportStudent} onValueChange={setSelectedReportStudent} disabled={!selectedReportClass}>
                        <SelectTrigger id="report-student">
                          <SelectValue placeholder="Select Student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students && students.filter(s => s.class === selectedReportClass).map(s => <SelectItem key={s.id} value={s.id}>{s.username} (Roll No. {s.rollNo})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white" onClick={handleDownloadClick}>
                      <FileDown className="mr-2"/>
                      Generate PDF Report
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Class-wise Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="space-y-2">
                      <Label htmlFor="class-report-class">Select Class</Label>
                      <Select value={selectedClassReportClass} onValueChange={setSelectedClassReportClass}>
                        <SelectTrigger id="class-report-class">
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                           {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="class-report-exam">Select Exam</Label>
                      <Select value={selectedClassReportExam} onValueChange={setSelectedClassReportExam}>
                        <SelectTrigger id="class-report-exam">
                          <SelectValue placeholder="Select Exam" />
                        </SelectTrigger>
                        <SelectContent>
                          {examTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleClassReportDownloadClick}>
                      <FileDown className="mr-2"/>
                      Generate PDF Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </TabsContent>
          <TabsContent value="leave-applications">
             <CardHeader>
                <CardTitle>Leave Applications</CardTitle>
                <CardDescription>Review and take action on student leave requests.</CardDescription>
            </CardHeader>
             <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leaveApplicationsLoading && (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                        Loading applications...
                        </TableCell>
                    </TableRow>
                    )}
                    {!leaveApplicationsLoading && leaveApplications && leaveApplications.length > 0 ? (
                    leaveApplications.map((app) => (
                        <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.studentName}</TableCell>
                        <TableCell>{app.class}</TableCell>
                        <TableCell>
                            {app.startDate ? format(new Date(app.startDate), 'MMM dd') : ''} - {app.endDate ? format(new Date(app.endDate), 'MMM dd, yyyy') : ''}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{app.reason}</TableCell>
                        <TableCell>
                            <Badge
                            variant={
                                app.status === 'Approved'
                                ? 'default'
                                : app.status === 'Rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className={
                                app.status === 'Approved' ? 'bg-green-100 text-green-800'
                                : app.status === 'Rejected' ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                            >
                            {app.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                            {app.status === 'Pending' && (
                            <>
                                <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                                onClick={() => handleUpdateLeaveStatus(app.id, 'Approved')}
                                >
                                Approve
                                </Button>
                                <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleUpdateLeaveStatus(app.id, 'Rejected')}
                                >
                                Reject
                                </Button>
                            </>
                            )}
                        </TableCell>
                        </TableRow>
                    ))
                    ) : !leaveApplicationsLoading && (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                        No leave applications found.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </CardContent>
          </TabsContent>
          <TabsContent value="timetable-management">
             <CardHeader>
                <CardTitle>Timetable Management</CardTitle>
                <CardDescription>Create and manage the school's timetable.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground p-8 border rounded-lg">
                    <CalendarClock className="mx-auto h-12 w-12"/>
                    <p className="mt-4">Timetable management feature is coming soon.</p>
                </div>
            </CardContent>
          </TabsContent>
           <TabsContent value="library-management">
              <CardHeader>
                <CardTitle>Library Management</CardTitle>
                <CardDescription>Manage book inventory and track issued books.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground p-8 border rounded-lg">
                    <BookOpen className="mx-auto h-12 w-12"/>
                    <p className="mt-4">Library management feature is coming soon.</p>
                </div>
            </CardContent>
           </TabsContent>
           <TabsContent value="transport-management">
            <CardHeader>
                <CardTitle>Transport Management</CardTitle>
                <CardDescription>Manage bus routes and student transport details.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground p-8 border rounded-lg">
                    <Bus className="mx-auto h-12 w-12"/>
                    <p className="mt-4">Transport management feature is coming soon.</p>
                </div>
            </CardContent>
           </TabsContent>
          <TabsContent value="attendance-report">
             <CardHeader>
              <CardTitle>Class-wise Attendance Report</CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
               <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="att-report-class">Select Class</Label>
                  <Select value={attendanceReportClass} onValueChange={setAttendanceReportClass}>
                    <SelectTrigger id="att-report-class" className="w-[180px]">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                       {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <Label>Select Date</Label>
                   <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !attendanceReportDate && "text-muted-foreground"
                          )}
                          >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {attendanceReportDate ? format(attendanceReportDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={attendanceReportDate}
                          onSelect={setAttendanceReportDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                </div>
               </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceLoading && <TableRow><TableCell colSpan={3} className="text-center h-24">Loading attendance...</TableCell></TableRow>}
                    {!attendanceLoading && attendanceFilteredStudents.length > 0 ? (
                      attendanceFilteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.rollNo}</TableCell>
                          <TableCell>{student.username}</TableCell>
                          <TableCell className="text-right">
                             <Badge 
                               variant={student.status === 'Present' ? 'default' : 'destructive'}
                               className={cn(
                                 student.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                                 'w-20 justify-center'
                               )}
                              >
                               {student.status}
                             </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : !attendanceLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">
                          No students found for this class or data not available for this date.
                        </TableCell>
                      </TableRow>
                    ): null}
                  </TableBody>
                </Table>
             </CardContent>
          </TabsContent>
          <TabsContent value="homework-report">
             <CardHeader>
              <CardTitle>Class-wise Homework Report</CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="hw-report-class">Select Class</Label>
                    <Select value={homeworkReportClass} onValueChange={setHomeworkReportClass}>
                      <SelectTrigger id="hw-report-class" className="w-[180px]">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                         {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hw-report-subject">Select Subject</Label>
                    <Select value={homeworkReportSubject} onValueChange={setHomeworkReportSubject}>
                      <SelectTrigger id="hw-report-subject" className="w-[180px]">
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                         {allSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                     <Label>Select Date</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] justify-start text-left font-normal",
                              !homeworkReportDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {homeworkReportDate ? format(homeworkReportDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={homeworkReportDate}
                            onSelect={setHomeworkReportDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Homework Details</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {homeworksLoading && <p>Loading homework...</p>}
                      {!homeworksLoading && filteredHomework ? (
                        <div>
                          <p className="font-semibold">Teacher: {filteredHomework.teacherName}</p>
                          <p className="mt-2 text-muted-foreground">{filteredHomework.content}</p>
                        </div>
                      ) : !homeworksLoading ? (
                         <p className="text-muted-foreground">No homework found for the selected class, subject, and date.</p>
                      ) : null}
                    </CardContent>
                </Card>
             </CardContent>
          </TabsContent>
          <TabsContent value="tc-generator">
            <CardHeader>
              <CardTitle>Transfer Certificate (TC) Generator</CardTitle>
              <CardDescription>Generate a TC for a student leaving the school.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="tc-class">Class</Label>
                  <Select value={tcClass} onValueChange={(value) => { setTcClass(value); setTcStudent(''); }}>
                    <SelectTrigger id="tc-class">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tc-student">Student</Label>
                  <Select value={tcStudent} onValueChange={setTcStudent} disabled={!tcClass}>
                    <SelectTrigger id="tc-student">
                      <SelectValue placeholder="Select Student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students && students.filter(s => s.class === tcClass).map(s => <SelectItem key={s.id} value={s.id}>{s.username} (Roll No. {s.rollNo})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleGenerateTC} disabled={!tcStudent} className="bg-fuchsia-600 hover:bg-fuchsia-700">
                  <FileSignature className="mr-2"/>
                  Generate & Download TC
                </Button>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <DashboardPageContent />
        </React.Suspense>
    );
}
