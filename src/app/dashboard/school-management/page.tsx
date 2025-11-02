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
import { EyeOff, UserPlus } from 'lucide-react';
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

const users = [
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

export default function SchoolManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

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
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsDialogOpen(true)}>
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
                      <Select>
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
                      <Input id="name" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="mobile" className="text-right">
                        मोबाइल नंबर
                      </Label>
                      <Input id="mobile" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={() => setIsDialogOpen(false)}>बनाएं</Button>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>रद्द करें</Button>
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
                  {users.map((user) => (
                    <TableRow key={user.name}>
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
                        <span>{user.password}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                           <EyeOff className="h-4 w-4" />
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
        </Tabs>
      </Card>
    </div>
  );
}
