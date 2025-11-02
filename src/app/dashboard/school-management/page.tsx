'use client';
import React from 'react';

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
import { Eye, EyeOff, UserPlus, Calendar as CalendarIcon, PlusCircle } from 'lucide-react';
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
import { notices as initialNotices, type Notice } from '@/lib/placeholder-data';


const initialUsers = [
  {
    name: 'श्रीमती सुनीता गुप्ता',
    role: 'शिक्षक',
    mobile: '9876543211',
    classSubject: 'हिंदी',
    password: 'teacher123',
  },
  {
    name: 'विकास शर्मा',
    role: 'अभिभावक',
    mobile: '9876543212',
    classSubject: '1', // Represents the child's class
    password: 'parent123',
  },
];

const initialStudents = [
  {
    rollNo: '001',
    name: 'राहुल शर्मा',
    class: '5',
    fatherName: 'विकास शर्मा',
    motherName: 'कविता शर्मा',
    dob: '2015-05-20',
    address: '123, गांधी नगर, दिल्ली',
    admissionDate: '2020-04-01',
    aadhaar: '1234 5678 9012',
    pen: 'PEN12345',
    mobile: '9876543213',
    id: 'STU001',
    password: 'stu123',
    subjects: 'हिंदी, अंग्रेजी, गणित'
  },
]

const initialNewUserState = {
    role: '',
    // Teacher fields
    teacherName: '',
    teacherMobile: '',
    teacherSubject: '',
    teacherClass: '',
    // Parent fields
    parentName: '',
    // Student fields
    studentName: '',
    studentClass: '',
    studentSubjects: '',
    motherName: '',
    address: '',
    dob: undefined,
    admissionDate: undefined,
    aadhaar: '',
    pen: '',
    studentMobile: ''
};

const initialNewNoticeState = {
  title: '',
  content: '',
  role: 'All' as Notice['role'],
};


export default function SchoolManagementPage() {
  const [users, setUsers] = React.useState(initialUsers);
  const [students, setStudents] = React.useState(initialStudents);
  const [notices, setNotices] = React.useState<Notice[]>(initialNotices);

  const [isUserDialogOpen, setIsUserDialogOpen] = React.useState(false);
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = React.useState(false);

  const [passwordVisibility, setPasswordVisibility] = React.useState<{[key: number]: boolean}>({});
  const [studentPasswordVisibility, setStudentPasswordVisibility] = React.useState<{[key: number]: boolean}>({});

  const [newUser, setNewUser] = React.useState<any>(initialNewUserState);
  const [newNotice, setNewNotice] = React.useState(initialNewNoticeState);

  const handleInputChange = (id: string, value: string) => {
    setNewUser((prev: any) => ({ ...prev, [id]: value }));
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
      id: (notices.length + 1).toString(),
      ...newNotice,
      author: 'प्रधानाचार्य',
      date: new Date().toISOString(),
    };
    setNotices(prev => [noticeToAdd, ...prev]);
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
        subjects: newUser.studentSubjects
      };
      setStudents((prev) => [...prev, studentToAdd]);
    }
    
    setNewUser(initialNewUserState);
    setIsUserDialogOpen(false);
  };
  
  const togglePasswordVisibility = (index: number) => {
    setPasswordVisibility(prev => ({
        ...prev,
        [index]: !prev[index]
    }));
  };
  const toggleStudentPasswordVisibility = (index: number) => {
    setStudentPasswordVisibility(prev => ({
        ...prev,
        [index]: !prev[index]
    }));
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">प्रधानाचार्य डैशबोर्ड</h1>
      <Card>
        <Tabs defaultValue="user-management">
          <CardHeader className="p-2 md:p-4">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
              <TabsTrigger value="user-management">उपयोगकर्ता प्रबंधन</TabsTrigger>
              <TabsTrigger value="student-management">छात्र प्रबंधन</TabsTrigger>
              <TabsTrigger value="notice-management">सूचना प्रबंधन</TabsTrigger>
              <TabsTrigger value="result-management">परिणाम प्रबंधन</TabsTrigger>
              <TabsTrigger value="reports">रिपोर्ट्स</TabsTrigger>
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
                          <Input id="teacherSubject" value={newUser.teacherSubject} onChange={(e) => handleInputChange(e.target.id, e.target.value)} className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="teacherClass" className="text-right">कक्षा</Label>
                          <Input id="teacherClass" value={newUser.teacherClass} onChange={(e) => handleInputChange(e.target.id, e.target.value)} className="col-span-3" />
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
                          <Input id="studentClass" value={newUser.studentClass} onChange={(e) => handleInputChange(e.target.id, e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="studentSubjects" className="text-right">विषय</Label>
                          <Input id="studentSubjects" value={newUser.studentSubjects} onChange={(e) => handleInputChange(e.target.id, e.target.value)} className="col-span-3" placeholder="जैसे: हिंदी, अंग्रेजी, गणित"/>
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
                    <TableHead>पासवर्ड</TableHead>
                    <TableHead>कार्य</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={index}>
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
                      <TableCell className="flex items-center gap-2">
                        <span>
                            {passwordVisibility[index] ? user.password : '*'.repeat(user.password.length)}
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => togglePasswordVisibility(index)}>
                           {passwordVisibility[index] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  {students.map((student, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{student.rollNo}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>{student.fatherName}</TableCell>
                      <TableCell>{student.mobile}</TableCell>
                      <TableCell>
                        <div>ID: {student.id}</div>
                        <div className="flex items-center gap-2">
                            <span>पासवर्ड: {studentPasswordVisibility[index] ? student.password : '*'.repeat(student.password.length)}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleStudentPasswordVisibility(index)}>
                               {studentPasswordVisibility[index] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              <div className="flex items-center gap-4">
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="कक्षा चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">कक्षा 1</SelectItem>
                    <SelectItem value="2">कक्षा 2</SelectItem>
                    <SelectItem value="3">कक्षा 3</SelectItem>
                    <SelectItem value="4">कक्षा 4</SelectItem>
                    <SelectItem value="5">कक्षा 5</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="छात्र चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student1">राहुल शर्मा</SelectItem>
                    {/* Add more students as needed */}
                  </SelectContent>
                </Select>
                <Button>परिणाम जोड़ें</Button>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">सभी परिणाम</h3>
                <div className="border rounded-lg p-4 min-h-[100px] flex items-center justify-center">
                  <p className="text-muted-foreground">कोई परिणाम उपलब्ध नहीं है</p>
                </div>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
