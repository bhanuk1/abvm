'use client';
import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Eye, EyeOff, UserPlus, Calendar as CalendarIcon, PlusCircle, FileDown } from 'lucide-react';
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
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { type Notice } from '@/lib/placeholder-data';
import {
  initialUsers,
  initialStudents,
  initialNewUserState,
  initialNewNoticeState,
  type Result,
  homeworks as initialHomeworks,
  type Homework,
  allSubjects,
  results as initialResults,
  classSubjects,
  attendance as initialAttendance,
  type Attendance,
  notices as allNotices
} from '@/lib/school-data';


export default function SchoolManagementPage() {
  const [users, setUsers] = React.useState(initialUsers);
  const [students, setStudents] = React.useState(initialStudents);
  const [notices, setNotices] = React.useState<Notice[]>(allNotices);
  const [results, setResults] = React.useState<Result[]>(initialResults);
  const [homeworks, setHomeworks] = React.useState<Homework[]>(initialHomeworks);
  const [attendance, setAttendance] = React.useState<Attendance[]>(initialAttendance);


  const [isUserDialogOpen, setIsUserDialogOpen] = React.useState(false);
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = React.useState(false);

  const [passwordVisibility, setPasswordVisibility] = React.useState<{[key: string]: boolean}>({});
  const [studentPasswordVisibility, setStudentPasswordVisibility] = React.useState<{[key: string]: boolean}>({});

  const [newUser, setNewUser] = React.useState<any>(initialNewUserState);
  const [newNotice, setNewNotice] = React.useState(initialNewNoticeState);
  
  const [selectedResultClass, setSelectedResultClass] = React.useState('');
  const [selectedResultStudent, setSelectedResultStudent] = React.useState('');
  const [selectedExamType, setSelectedExamType] = React.useState('');
  const [marks, setMarks] = React.useState<any>({});
  
  const [selectedReportClass, setSelectedReportClass] = React.useState('');
  const [selectedReportStudent, setSelectedReportStudent] = React.useState('');

  const [selectedClassReportClass, setSelectedClassReportClass] = React.useState('');
  const [selectedClassReportExam, setSelectedClassReportExam] = React.useState('');

  const [attendanceReportClass, setAttendanceReportClass] = React.useState('');
  const [attendanceReportDate, setAttendanceReportDate] = React.useState<Date | undefined>(new Date());
  
  const [homeworkReportClass, setHomeworkReportClass] = React.useState('');
  const [homeworkReportSubject, setHomeworkReportSubject] = React.useState('');
  const [homeworkReportDate, setHomeworkReportDate] = React.useState<Date | undefined>(new Date());

  const handleInputChange = (id: string, value: string) => {
    setNewUser((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleStudentClassChange = (value: string) => {
    const subjectsForClass = classSubjects[value] || [];
    setNewUser((prev: any) => ({
      ...prev,
      studentClass: value,
      studentSubjects: subjectsForClass.join(', '),
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
    if (!newNotice.title || !newNotice.content) return;
    const noticeToAdd: Notice = {
      id: (allNotices.length + 1).toString(),
      ...newNotice,
      author: 'प्रधानाचार्य',
      date: new Date().toISOString(),
    };
    // Add to the beginning of the array to show newest first
    allNotices.unshift(noticeToAdd);
    setNotices(allNotices);
    setNewNotice(initialNewNoticeState);
    setIsNoticeDialogOpen(false);
  };


  const handleCreateUser = () => {
    if (!newUser.role) return;

    const password = Math.random().toString(36).slice(-8);

    if (newUser.role === 'teacher') {
      if (!newUser.teacherName || !newUser.teacherMobile) return;
      const userToAdd = {
        name: newUser.teacherName,
        role: 'शिक्षक',
        mobile: newUser.teacherMobile,
        classSubject: `${newUser.teacherSubject} - ${newUser.teacherClass}`,
        password,
        id: `teacher${(users.filter(u => u.role === 'शिक्षक').length + 1).toString().padStart(2, '0')}`,
        classes: newUser.teacherClass.split(',').map((c: string) => c.trim()),
        subjects: newUser.teacherSubject.split(',').map((s: string) => s.trim()),
      };
      setUsers((prev) => [...prev, userToAdd]);
    } else if (newUser.role === 'parent') {
      if (!newUser.parentName || !newUser.studentName) return;
      
      const parentToAdd = {
        name: newUser.parentName,
        role: 'अभिभावक',
        mobile: newUser.studentMobile,
        classSubject: newUser.studentClass,
        password: password,
        id: `parent${(users.filter(u => u.role === 'अभिभावक').length + 1).toString().padStart(2, '0')}`,
      };
      setUsers((prev) => [...prev, parentToAdd]);
      
      const studentId = `STU${(students.length + 1).toString().padStart(3, '0')}`;
      const studentPassword = Math.random().toString(36).slice(-8);
      const studentToAdd = {
        rollNo: (students.length + 1).toString().padStart(3, '0'),
        name: newUser.studentName,
        class: newUser.studentClass,
        fatherName: newUser.parentName,
        motherName: newUser.motherName,
        dob: newUser.dob ? format(newUser.dob, 'yyyy-MM-dd') : '',
        address: newUser.address,
        admissionDate: newUser.admissionDate ? format(newUser.admissionDate, 'yyyy-MM-dd') : '',
        aadhaar: newUser.aadhaar,
        pen: newUser.pen,
        mobile: newUser.studentMobile,
        id: studentId,
        password: studentPassword,
        subjects: newUser.studentSubjects,
      };
      setStudents((prev) => [...prev, studentToAdd]);
    }
    
    setNewUser(initialNewUserState);
    setIsUserDialogOpen(false);
  };
  
  const togglePasswordVisibility = (id: string) => {
    setPasswordVisibility(prev => ({
        ...prev,
        [id]: !prev[id]
    }));
  };
  const toggleStudentPasswordVisibility = (id: string) => {
    setStudentPasswordVisibility(prev => ({
        ...prev,
        [id]: !prev[id]
    }));
  };
  
  const handleAddResult = () => {
    if (!selectedResultClass || !selectedResultStudent || !selectedExamType) {
      alert('कृपया कक्षा, छात्र और परीक्षा का प्रकार चुनें।');
      return;
    }
  
    const student = students.find(s => s.id === selectedResultStudent);
    if (!student) return;
  
    let resultMarks;
    if (selectedExamType === 'monthly') {
      if (!marks['monthly-obtained'] || !marks['monthly-total']) {
        alert('कृपया मासिक परीक्षा के अंक भरें।');
        return;
      }
      resultMarks = {
        obtained: marks['monthly-obtained'],
        total: marks['monthly-total'],
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
        alert('कृपया सभी विषयों के अंक भरें।');
        return;
      }
    }
  
    const newResult: Result = {
      id: `RES${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      examType: examTypes.find(e => e.value === selectedExamType)?.label || '',
      marks: resultMarks,
    };
  
    setResults(prev => [...prev, newResult]);
    
    // Reset fields
    setSelectedResultClass('');
    setSelectedResultStudent('');
    setSelectedExamType('');
    setMarks({});
    
    alert('परिणाम सफलतापूर्वक जोड़ा गया!');
  };
  
  const handleMarksChange = (field: string, value: string) => {
    setMarks(prev => ({...prev, [field]: value}));
  };

  const getSubjectsForStudent = () => {
    if (!selectedResultStudent) return [];
    const student = students.find(s => s.id === selectedResultStudent);
    if (!student) return [];
    
    if (student.subjects) {
        return student.subjects.split(',').map(s => s.trim());
    }
    
    return classSubjects[student.class] || [];
  }
  
  const handleGeneratePdf = (doc: jsPDF, student: any, results: Result[]) => {
    try {
        doc.addFont('/fonts/TiroDevanagariHindi-Regular.ttf', 'TiroDevanagariHindi', 'normal');
        doc.setFont('TiroDevanagariHindi');

        doc.setFontSize(16);
        doc.text('आदर्श बाल विद्या मन्दिर', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.text('छात्र प्रगति रिपोर्ट', doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
        
        const studentDetails = [
            ['नाम', student.name],
            ['कक्षा', student.class],
            ['रोल नंबर', student.rollNo],
            ['पिता का नाम', student.fatherName],
            ['जन्म तिथि', student.dob],
            ['पता', student.address],
        ];

        (doc as any).autoTable({
          startY: 30,
          head: [['विवरण', 'जानकारी']],
          body: studentDetails,
          theme: 'grid',
          styles: { font: 'TiroDevanagariHindi', fontStyle: 'normal' },
          headStyles: { fillColor: [41, 128, 185], font: 'TiroDevanagariHindi', fontStyle: 'normal' },
        });

        results.forEach(result => {
            const lastTableY = (doc as any).lastAutoTable.finalY;
            doc.setFontSize(12);
            doc.text(`परीक्षा: ${result.examType}`, 14, lastTableY + 10);

            let tableBody: (string|number)[][] = [];
            let tableHead;

            if (Array.isArray(result.marks)) {
                tableHead = [['विषय', 'प्राप्तांक', 'पूर्णांक']];
                tableBody = result.marks.map(m => [m.subject, m.obtained, m.total]);
            } else {
                tableHead = [['विवरण', 'अंक']];
                tableBody = [
                    ['प्राप्तांक', result.marks.obtained],
                    ['पूर्णांक', result.marks.total]
                ];
            }

            (doc as any).autoTable({
                startY: lastTableY + 16,
                head: tableHead,
                body: tableBody,
                theme: 'grid',
                styles: { font: 'TiroDevanagariHindi', fontStyle: 'normal' },
                headStyles: { fillColor: [22, 160, 133], font: 'TiroDevanagariHindi', fontStyle: 'normal' },
            });
        });
        
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert('PDF बनाने में त्रुटि हुई। कृपया कंसोल देखें।');
    }
};

const handleDownloadClick = async () => {
    if (!selectedReportClass || !selectedReportStudent) {
      alert('कृपया रिपोर्ट बनाने के लिए कक्षा और छात्र चुनें।');
      return;
    }

    const student = students.find(s => s.id === selectedReportStudent);
    if (!student) {
        alert('छात्र नहीं मिला।');
        return;
    }

    const studentResults = results.filter(r => r.studentId === student.id);
    if (studentResults.length === 0) {
        alert('इस छात्र के लिए कोई परिणाम नहीं मिला।');
        return;
    }
    
    try {
        const doc = new jsPDF();
        handleGeneratePdf(doc, student, studentResults);
        doc.save(`${student.name}_${student.class}_report.pdf`);
    } catch (e) {
        console.error(e);
        alert('PDF बनाने में त्रुटि हुई।');
    }
};

const handleClassReportDownloadClick = () => {
  if (!selectedClassReportClass || !selectedClassReportExam) {
    alert('कृपया कक्षा और परीक्षा का प्रकार चुनें।');
    return;
  }

  const studentsInClass = students.filter(s => s.class === selectedClassReportClass);
  if (studentsInClass.length === 0) {
    alert('इस कक्षा में कोई छात्र नहीं हैं।');
    return;
  }

  const examLabel = examTypes.find(e => e.value === selectedClassReportExam)?.label || '';
  const resultsForExam = results.filter(r => r.class === selectedClassReportClass && r.examType === examLabel);

  if (resultsForExam.length === 0) {
    alert(`इस कक्षा के लिए '${examLabel}' का कोई परिणाम नहीं मिला।`);
    return;
  }

  const doc = new jsPDF();
  let isFirstPage = true;

  studentsInClass.forEach(student => {
    const studentResults = resultsForExam.filter(r => r.studentId === student.id);
    if (studentResults.length > 0) {
      if (!isFirstPage) {
        doc.addPage();
      }
      handleGeneratePdf(doc, student, studentResults);
      isFirstPage = false;
    }
  });

  if (isFirstPage) {
      alert(`इस कक्षा और परीक्षा के लिए किसी भी छात्र का परिणाम नहीं मिला।`);
      return;
  }

  doc.save(`कक्षा-${selectedClassReportClass}_${examLabel}_रिपोर्ट.pdf`);
};


  const classes = ['Nursery', 'KG', ...Array.from({length: 12}, (_, i) => (i + 1).toString())];
  const examTypes = [
    { value: 'monthly', label: 'मासिक परीक्षा' },
    { value: 'quarterly', label: 'त्रैमासिक परीक्षा' },
    { value: 'half-yearly', label: 'अर्धवार्षिक परीक्षा' },
    { value: 'final', label: 'वार्षिक परीक्षा' },
  ]
  const studentSubjects = getSubjectsForStudent();
  
  const attendanceFilteredStudents = React.useMemo(() => {
    if (!attendanceReportClass || !attendanceReportDate) return [];
    
    const reportDateStr = format(attendanceReportDate, 'yyyy-MM-dd');
    const studentsInClass = students.filter(s => s.class === attendanceReportClass);

    return studentsInClass.map(student => {
      const attendanceRecord = attendance.find(
        att => att.studentId === student.id && att.date === reportDateStr
      );
      return {
        ...student,
        status: attendanceRecord ? attendanceRecord.status : 'अनुपस्थित', // Default to absent
      };
    });
  }, [attendanceReportClass, attendanceReportDate, students, attendance]);
  
  const filteredHomework = homeworks.find(h => 
    h.class === homeworkReportClass &&
    h.subject === homeworkReportSubject &&
    homeworkReportDate && h.date === format(homeworkReportDate, 'yyyy-MM-dd')
  );


  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">प्रधानाचार्य डैशबोर्ड</h1>
      <Card>
        <Tabs defaultValue="user-management">
          <CardHeader className="p-2 md:p-4">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
              <TabsTrigger value="user-management">उपयोगकर्ता</TabsTrigger>
              <TabsTrigger value="student-management">छात्र</TabsTrigger>
              <TabsTrigger value="notice-management">सूचना</TabsTrigger>
              <TabsTrigger value="result-management">परिणाम</TabsTrigger>
              <TabsTrigger value="reports">छात्र रिपोर्ट</TabsTrigger>
              <TabsTrigger value="attendance-report">उपस्थिति रिपोर्ट</TabsTrigger>
              <TabsTrigger value="homework-report">होमवर्क रिपोर्ट</TabsTrigger>
            </TabsList>
          </CardHeader>
          <TabsContent value="user-management">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>उपयोगकर्ता प्रबंधन</CardTitle>
              <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsUserDialogOpen(true)}>
                    <UserPlus className="mr-2" />
                    नया उपयोगकर्ता बनाएं
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>नया उपयोगकर्ता बनाएं</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-right">
                        भूमिका
                      </Label>
                      <Select value={newUser.role} onValueChange={handleSelectChange}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="भूमिका चुनें" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="teacher">शिक्षक</SelectItem>
                          <SelectItem value="parent">अभिभावक</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newUser.role === 'teacher' && (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="teacherName" className="text-right">नाम</Label>
                          <Input id="teacherName" value={newUser.teacherName} onChange={(e) => handleInputChange(e.target.id, e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="teacherMobile" className="text-right">मोबाइल नंबर</Label>
                          <Input id="teacherMobile" value={newUser.teacherMobile} onChange={(e) => handleInputChange(e.target.id, e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="teacherSubject" className="text-right">विषय</Label>
                          <Input id="teacherSubject" value={newUser.teacherSubject} onChange={(e) => handleInputChange(e.target.id, e.target.value)} className="col-span-3" placeholder="जैसे: हिंदी, अंग्रेजी"/>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="teacherClass" className="text-right">कक्षा</Label>
                          <Input id="teacherClass" value={newUser.teacherClass} onChange={(e) => handleInputChange(e.target.id, e.target.value)} className="col-span-3" placeholder="जैसे: 5, 6, 7" />
                        </div>
                      </>
                    )}
                    
                    {newUser.role === 'parent' && (
                      <>
                        <h3 className="col-span-4 font-semibold text-lg border-b pb-2 mb-2">अभिभावक विवरण</h3>
                         <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="parentName" className="text-right">पिता का नाम</Label>
                          <Input id="parentName" value={newUser.parentName} onChange={(e) => handleInputChange(e.target.id, e.target.value)} className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="motherName" className="text-right">माता का नाम</Label>
                          <Input id="motherName" value={newUser.motherName} onChange={(e) => handleInputChange(e.target.id, e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="studentMobile" className="text-right">मोबाइल नंबर</Label>
                            <Input id="studentMobile" value={newUser.studentMobile} onChange={(e) => handleInputChange(e.target.id, e.target.value)} className="col-span-3" />
                        </div>
                        <h3 className="col-span-4 font-semibold text-lg border-b pb-2 mt-4 mb-2">छात्र विवरण</h3>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="studentName" className="text-right">छात्र का नाम</Label>
                          <Input id="studentName" value={newUser.studentName} onChange={(e) => handleInputChange(e.target.id, e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="studentClass" className="text-right">कक्षा</Label>
                          <Select onValueChange={handleStudentClassChange}>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="कक्षा चुनें" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="studentSubjects" className="text-right">विषय</Label>
                          <Input id="studentSubjects" value={newUser.studentSubjects} onChange={(e) => handleInputChange(e.target.id, e.target.value)} className="col-span-3" placeholder="कक्षा चुनने पर विषय स्वतः भर जाएंगे"/>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="address" className="text-right">पता</Label>
                          <Input id="address" value={newUser.address} onChange={(e) => handleInputChange(e.target.id, e.target.value)} className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dob" className="text-right">जन्म तिथि</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "col-span-3 justify-start text-left font-normal",
                                    !newUser.dob && "text-muted-foreground"
                                    )}
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
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="admissionDate" className="text-right">प्रवेश तिथि</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "col-span-3 justify-start text-left font-normal",
                                    !newUser.admissionDate && "text-muted-foreground"
                                    )}
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
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="aadhaar" className="text-right">आधार नंबर</Label>
                          <Input id="aadhaar" value={newUser.aadhaar} onChange={(e) => handleInputChange(e.target.id, e.target.value)} className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="pen" className="text-right">PEN नंबर</Label>
                          <Input id="pen" value={newUser.pen} onChange={(e) => handleInputChange(e.target.id, e.target.value)} className="col-span-3" />
                        </div>
                      </>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>रद्द करें</Button>
                    <Button type="submit" onClick={handleCreateUser}>बनाएं</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>नाम</TableHead>
                    <TableHead>भूमिका</TableHead>
                    <TableHead>मोबाइल</TableHead>
                    <TableHead>कक्षा/विषय</TableHead>
                    <TableHead>यूज़र आईडी</TableHead>
                    <TableHead>पासवर्ड</TableHead>
                    <TableHead>कार्य</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === 'शिक्षक' ? 'secondary' : 'outline'
                          }
                          className={
                            user.role === 'शिक्षक'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.mobile}</TableCell>
                      <TableCell>{user.classSubject}</TableCell>
                      <TableCell>{user.id}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <span>
                            {passwordVisibility[user.id] ? user.password : '*'.repeat(user.password.length)}
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => togglePasswordVisibility(user.id)}>
                           {passwordVisibility[user.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button variant="link" className="p-0 h-auto text-primary">
                          पासवर्ड रीसेट
                        </Button>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-destructive ml-4"
                        >
                          हटाएं
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </TabsContent>
          <TabsContent value="student-management">
            <CardHeader>
              <CardTitle>छात्र प्रबंधन</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>रोल नं.</TableHead>
                    <TableHead>नाम</TableHead>
                    <TableHead>कक्षा</TableHead>
                    <TableHead>पिता का नाम</TableHead>
                    <TableHead>मोबाइल</TableHead>
                    <TableHead>लॉगिन विवरण</TableHead>
                    <TableHead>कार्य</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.rollNo}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>{student.fatherName}</TableCell>
                      <TableCell>{student.mobile}</TableCell>
                      <TableCell>
                        <div>ID: {student.id}</div>
                        <div className="flex items-center gap-2">
                            <span>पासवर्ड: {studentPasswordVisibility[student.id] ? student.password : '*'.repeat(student.password.length)}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleStudentPasswordVisibility(student.id)}>
                               {studentPasswordVisibility[student.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                      </TableCell>
                       <TableCell>
                        <Button variant="link" className="p-0 h-auto text-primary">
                          पासवर्ड रीसेट
                        </Button>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-destructive ml-4"
                        >
                          हटाएं
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </TabsContent>
           <TabsContent value="notice-management">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>सूचना प्रबंधन</CardTitle>
              <Dialog open={isNoticeDialogOpen} onOpenChange={setIsNoticeDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsNoticeDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600">
                    <PlusCircle className="mr-2" />
                    नई सूचना जोड़ें
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>नई सूचना बनाएं</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        शीर्षक
                      </Label>
                      <Input id="title" value={newNotice.title} onChange={handleNoticeInputChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="content" className="text-right pt-2">
                        विवरण
                      </Label>
                      <Textarea id="content" value={newNotice.content} onChange={handleNoticeInputChange} className="col-span-3" rows={5} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-right">
                        किसके लिए
                      </Label>
                      <Select value={newNotice.role} onValueChange={handleNoticeRoleChange}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">सभी</SelectItem>
                          <SelectItem value="Teachers">शिक्षक</SelectItem>
                          <SelectItem value="Students">छात्र</SelectItem>
                          <SelectItem value="Parents">अभिभावक</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNoticeDialogOpen(false)}>रद्द करें</Button>
                    <Button type="submit" onClick={handleCreateNotice}>प्रकाशित करें</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {notices.map(notice => (
                <div key={notice.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{notice.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{notice.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">{format(new Date(notice.date), 'dd/MM/yyyy')} - {notice.author}</p>
                    </div>
                    <div className="flex items-center gap-2 absolute top-4 right-4">
                        <Button variant="outline" size="sm" className="bg-amber-100 text-amber-800">उच्च</Button>
                        <Button variant="destructive" size="sm">हटाएं</Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </TabsContent>
           <TabsContent value="result-management">
            <CardHeader>
              <CardTitle>परिणाम प्रबंधन</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="result-class">कक्षा</Label>
                  <Select value={selectedResultClass} onValueChange={(value) => { setSelectedResultClass(value); setSelectedResultStudent(''); setMarks({}); }}>
                    <SelectTrigger id="result-class">
                      <SelectValue placeholder="कक्षा चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c} value={c}>कक्षा {c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="result-student">छात्र</Label>
                  <Select value={selectedResultStudent} onValueChange={(value) => {setSelectedResultStudent(value); setMarks({});}} disabled={!selectedResultClass}>
                    <SelectTrigger id="result-student">
                      <SelectValue placeholder="छात्र चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.filter(s => s.class === selectedResultClass).map(s => <SelectItem key={s.id} value={s.id}>{s.name} (रोल नं. {s.rollNo})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="result-exam-type">परीक्षा का प्रकार</Label>
                    <Select value={selectedExamType} onValueChange={(value) => {setSelectedExamType(value); setMarks({});}}>
                        <SelectTrigger id="result-exam-type">
                            <SelectValue placeholder="परीक्षा चुनें" />
                        </SelectTrigger>
                        <SelectContent>
                          {examTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleAddResult} disabled={!selectedResultClass || !selectedResultStudent || !selectedExamType}>
                  परिणाम जोड़ें
                </Button>
              </div>

              {selectedExamType && selectedResultStudent && (
                <div className="border rounded-lg p-4 space-y-4">
                  {selectedExamType === 'monthly' ? (
                    <div className="grid grid-cols-2 gap-4 items-center max-w-sm">
                      <Label htmlFor="marks-obtained-monthly" className="font-semibold">प्राप्तांक</Label>
                      <Input id="marks-obtained-monthly" type="number" placeholder="प्राप्तांक" value={marks['monthly-obtained'] || ''} onChange={(e) => handleMarksChange('monthly-obtained', e.target.value)}/>
                       <Label htmlFor="marks-total-monthly" className="font-semibold">पूर्णांक</Label>
                      <Input id="marks-total-monthly" type="number" value={marks['monthly-total'] || '100'} onChange={(e) => handleMarksChange('monthly-total', e.target.value)} />
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-medium mb-4">विषयवार अंक</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {studentSubjects.map(subject => (
                           <div key={subject} className="grid grid-cols-3 gap-2 items-center">
                              <Label htmlFor={`marks-obtained-${subject}`} className="col-span-1">{subject}</Label>
                              <Input id={`marks-obtained-${subject}`} type="number" placeholder="प्राप्तांक" className="col-span-1" value={marks[`${subject}-obtained`] || ''} onChange={(e) => handleMarksChange(`${subject}-obtained`, e.target.value)} />
                              <Input id={`marks-total-${subject}`} type="number" value={marks[`${subject}-total`] || '100'} readOnly className="col-span-1 bg-gray-100" onChange={(e) => handleMarksChange(`${subject}-total`, e.target.value)}/>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium mb-4 mt-6">सभी परिणाम</h3>
                <div className="border rounded-lg">
                  {results.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>छात्र</TableHead>
                          <TableHead>कक्षा</TableHead>
                          <TableHead>परीक्षा</TableHead>
                          <TableHead>परिणाम</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.map(result => (
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
                                `प्राप्तांक: ${result.marks.obtained}/${result.marks.total}`
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 min-h-[100px] flex items-center justify-center">
                      <p className="text-muted-foreground">कोई परिणाम उपलब्ध नहीं है</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </TabsContent>
          <TabsContent value="reports">
            <CardHeader>
              <CardTitle>रिपोर्ट्स</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">छात्र प्रगति रिपोर्ट</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="space-y-2">
                      <Label htmlFor="report-class">कक्षा चुनें</Label>
                      <Select value={selectedReportClass} onValueChange={setSelectedReportClass}>
                        <SelectTrigger id="report-class">
                          <SelectValue placeholder="कक्षा चुनें" />
                        </SelectTrigger>
                        <SelectContent>
                           {classes.map(c => <SelectItem key={c} value={c}>कक्षा {c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="report-student">छात्र चुनें</Label>
                      <Select value={selectedReportStudent} onValueChange={setSelectedReportStudent} disabled={!selectedReportClass}>
                        <SelectTrigger id="report-student">
                          <SelectValue placeholder="छात्र चुनें" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.filter(s => s.class === selectedReportClass).map(s => <SelectItem key={s.id} value={s.id}>{s.name} (रोल नं. {s.rollNo})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white" onClick={handleDownloadClick}>
                      <FileDown className="mr-2"/>
                      PDF रिपोर्ट बनाएं
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">कक्षा-वार रिपोर्ट</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="space-y-2">
                      <Label htmlFor="class-report-class">कक्षा चुनें</Label>
                      <Select value={selectedClassReportClass} onValueChange={setSelectedClassReportClass}>
                        <SelectTrigger id="class-report-class">
                          <SelectValue placeholder="कक्षा चुनें" />
                        </SelectTrigger>
                        <SelectContent>
                           {classes.map(c => <SelectItem key={c} value={c}>कक्षा {c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="class-report-exam">परीक्षा चुनें</Label>
                      <Select value={selectedClassReportExam} onValueChange={setSelectedClassReportExam}>
                        <SelectTrigger id="class-report-exam">
                          <SelectValue placeholder="परीक्षा चुनें" />
                        </SelectTrigger>
                        <SelectContent>
                          {examTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleClassReportDownloadClick}>
                      <FileDown className="mr-2"/>
                      PDF रिपोर्ट बनाएँ
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </TabsContent>
          <TabsContent value="attendance-report">
             <CardHeader>
              <CardTitle>कक्षा-वार उपस्थिति रिपोर्ट</CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
               <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="att-report-class">कक्षा चुनें</Label>
                  <Select value={attendanceReportClass} onValueChange={setAttendanceReportClass}>
                    <SelectTrigger id="att-report-class" className="w-[180px]">
                      <SelectValue placeholder="कक्षा चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                       {classes.map(c => <SelectItem key={c} value={c}>कक्षा {c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <Label>तारीख चुनें</Label>
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
                          {attendanceReportDate ? format(attendanceReportDate, "PPP") : <span>तारीख चुनें</span>}
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
                      <TableHead>रोल नंबर</TableHead>
                      <TableHead>नाम</TableHead>
                      <TableHead className="text-right">स्थिति</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceFilteredStudents.length > 0 ? (
                      attendanceFilteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.rollNo}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell className="text-right">
                             <Badge 
                               variant={student.status === 'उपस्थित' ? 'default' : 'destructive'}
                               className={cn(
                                 student.status === 'उपस्थित' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                                 'w-20 justify-center'
                               )}
                              >
                               {student.status}
                             </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">
                          इस कक्षा के लिए कोई छात्र नहीं मिला या डेटा उपलब्ध नहीं है।
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
             </CardContent>
          </TabsContent>
          <TabsContent value="homework-report">
             <CardHeader>
              <CardTitle>कक्षा-वार होमवर्क रिपोर्ट</CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="hw-report-class">कक्षा चुनें</Label>
                    <Select value={homeworkReportClass} onValueChange={setHomeworkReportClass}>
                      <SelectTrigger id="hw-report-class" className="w-[180px]">
                        <SelectValue placeholder="कक्षा चुनें" />
                      </SelectTrigger>
                      <SelectContent>
                         {classes.map(c => <SelectItem key={c} value={c}>कक्षा {c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hw-report-subject">विषय चुनें</Label>
                    <Select value={homeworkReportSubject} onValueChange={setHomeworkReportSubject}>
                      <SelectTrigger id="hw-report-subject" className="w-[180px]">
                        <SelectValue placeholder="विषय चुनें" />
                      </SelectTrigger>
                      <SelectContent>
                         {allSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                     <Label>तारीख चुनें</Label>
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
                            {homeworkReportDate ? format(homeworkReportDate, "PPP") : <span>तारीख चुनें</span>}
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
                    <CardTitle>होमवर्क विवरण</CardTitle>
                    <CardContent className="pt-4">
                      {filteredHomework ? (
                        <div>
                          <p className="font-semibold">शिक्षक: {filteredHomework.teacherName}</p>
                          <p className="mt-2 text-muted-foreground">{filteredHomework.content}</p>
                        </div>
                      ) : (
                         <p className="text-muted-foreground">चुनी गई कक्षा, विषय और तारीख के लिए कोई होमवर्क नहीं मिला।</p>
                      )}
                    </CardContent>
                  </CardHeader>
                </Card>
             </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
