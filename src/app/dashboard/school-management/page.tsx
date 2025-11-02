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
import { Eye, EyeOff, UserPlus, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
    classSubject: '1',
    password: 'parent123',
  },
];

const initialStudents = [
  {
    rollNo: '001',
    name: 'राहुल शर्मा',
    class: '5',
    fatherName: 'विकास शर्मा',
    mobile: '9876543213',
    id: 'STU001',
    password: 'stu123',
  },
]

export default function SchoolManagementPage() {
  const [users, setUsers] = React.useState(initialUsers);
  const [students, setStudents] = React.useState(initialStudents);
  const [isUserDialogOpen, setIsUserDialogOpen] = React.useState(false);
  const [passwordVisibility, setPasswordVisibility] = React.useState<{[key: number]: boolean}>({});

  const [newUser, setNewUser] = React.useState({
    role: '',
    name: '',
    mobile: '',
    classSubject: '',
  });

  const handleInputChange = (id: string, value: string) => {
    setNewUser((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (value: string) => {
    setNewUser((prev) => ({ ...prev, role: value }));
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.role || !newUser.mobile) {
      // Maybe show an error toast here in the future
      return;
    }
    const password = Math.random().toString(36).slice(-8);
    const userToAdd = {
      ...newUser,
      role: newUser.role === 'teacher' ? 'शिक्षक' : 'अभिभावक', // Adjust as needed
      password: password,
    };
    setUsers((prev) => [...prev, userToAdd]);
    setNewUser({ role: '', name: '', mobile: '', classSubject: '' });
    setIsUserDialogOpen(false);
  };
  
  const togglePasswordVisibility = (index: number) => {
    setPasswordVisibility(prev => ({
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
                <DialogContent className="sm:max-w-[425px]">
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
                          <SelectItem value="student">छात्र</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        नाम
                      </Label>
                      <Input id="name" value={newUser.name} onChange={(e) => handleInputChange(e.target.id, e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="mobile" className="text-right">
                        मोबाइल नंबर
                      </Label>
                      <Input id="mobile" value={newUser.mobile} onChange={(e) => handleInputChange(e.target.id, e.target.value)} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="classSubject" className="text-right">
                        कक्षा/विषय
                      </Label>
                      <Input id="classSubject" value={newUser.classSubject} onChange={(e) => handleInputChange(e.target.id, e.target.value)} className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleCreateUser}>बनाएं</Button>
                    <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>रद्द करें</Button>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>छात्र प्रबंधन</CardTitle>
              <Button>
                <PlusCircle className="mr-2" />
                नया छात्र जोड़ें
              </Button>
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
                        <div>पासवर्ड: {student.password}</div>
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
        </Tabs>
      </Card>
    </div>
  );
}
