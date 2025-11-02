'use client';

import React from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Mock data
const teacherData = {
  classes: [
    { name: 'कक्षा 5', subject: 'हिंदी' },
    { name: 'कक्षा 6', subject: 'हिंदी' },
    { name: 'कक्षा 7', subject: 'संस्कृत' },
  ],
};

const initialStudents = [
  { id: 'STU001', rollNo: 1, name: 'राहुल शर्मा', status: 'उपस्थित' },
  { id: 'STU002', rollNo: 2, name: 'प्रिया कुमारी', status: 'अनुपस्थित' },
  { id: 'STU003', rollNo: 3, name: 'अमित सिंह', status: 'उपस्थित' },
  { id: 'STU004', rollNo: 4, name: 'नेहा यादव', status: 'उपस्थित' },
  { id: 'STU005', rollNo: 5, name: 'सुनीता देवी', status: 'उपस्थित' },
];


export default function TeacherClassManagementPage() {
  const [selectedClass, setSelectedClass] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [students, setStudents] = React.useState(initialStudents);

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setStudents(currentStudents => 
      currentStudents.map(student => 
        student.id === studentId 
          ? { ...student, status: isPresent ? 'उपस्थित' : 'अनुपस्थित' }
          : student
      )
    );
  };
  
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">शिक्षक डैशबोर्ड</h1>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
           <Label htmlFor="class-select" className="shrink-0">कक्षा चुनें:</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger id="class-select" className="w-[200px]">
              <SelectValue placeholder="कक्षा चुनें" />
            </SelectTrigger>
            <SelectContent>
              {teacherData.classes.map(c => (
                <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
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
            <CardTitle>छात्र सूची</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>रोल नंबर</TableHead>
                <TableHead>नाम</TableHead>
                <TableHead className="text-right">उपस्थिति</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.rollNo}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell className="flex justify-end items-center gap-4">
                     <Badge 
                       variant={student.status === 'उपस्थित' ? 'default' : 'destructive'}
                       className={cn(
                         student.status === 'उपस्थित' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                         'w-20 justify-center'
                       )}
                      >
                       {student.status}
                     </Badge>
                     <Switch
                        checked={student.status === 'उपस्थित'}
                        onCheckedChange={(isChecked) => handleAttendanceChange(student.id, isChecked)}
                        aria-label={`Mark ${student.name} as ${student.status === 'उपस्थित' ? 'absent' : 'present'}`}
                     />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end gap-4 mt-6">
            <Button>उपस्थिति सेव करें</Button>
            <Button variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white">होमवर्क दें</Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
