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
import { initialStudents, teacherData } from '@/lib/school-data';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

type Student = typeof initialStudents[0];
const allClasses = ['Nursery', 'KG', ...Array.from({length: 12}, (_, i) => (i + 1).toString())];

export default function TeacherClassManagementPage() {
  const [selectedClass, setSelectedClass] = React.useState(teacherData.classes[0]?.name || '');
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [students, setStudents] = React.useState<Student[]>(initialStudents);
  const [isHomeworkDialogOpen, setIsHomeworkDialogOpen] = React.useState(false);
  const [homeworkContent, setHomeworkContent] = React.useState('');
  const { toast } = useToast();

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setStudents(currentStudents => 
      currentStudents.map(student => 
        student.id === studentId 
          ? { ...student, status: isPresent ? 'उपस्थित' : 'अनुपस्थित' }
          : student
      )
    );
  };
  
  const handleSaveAttendance = () => {
    toast({
        title: "सफलता!",
        description: "उपस्थिति सफलतापूर्वक सेव हो गई है।",
        className: "bg-green-100 text-green-800",
    });
  }

  const handleSendHomework = () => {
    if (!homeworkContent) {
        toast({
            variant: 'destructive',
            title: 'त्रुटि',
            description: 'कृपया होमवर्क का विवरण भरें।',
        });
        return;
    }
    console.log(`Homework for class ${selectedClass}: ${homeworkContent}`);
    toast({
        title: "सफलता!",
        description: `कक्षा ${selectedClass} के लिए होमवर्क भेज दिया गया है।`,
        className: "bg-green-100 text-green-800",
    });
    setHomeworkContent('');
    setIsHomeworkDialogOpen(false);
  }

  const filteredStudents = students.filter(student => student.class === selectedClass);
  
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">कक्षा प्रबंधन</h1>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
           <Label htmlFor="class-select" className="shrink-0">कक्षा चुनें:</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger id="class-select" className="w-[200px]">
              <SelectValue placeholder="कक्षा चुनें" />
            </SelectTrigger>
            <SelectContent>
              {allClasses.map(c => (
                <SelectItem key={c} value={c}>कक्षा {c}</SelectItem>
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
            <CardTitle>छात्र सूची - कक्षा {selectedClass}</CardTitle>
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
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    इस कक्षा में कोई छात्र नहीं मिला।
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex justify-end gap-4 mt-6">
            <Button onClick={handleSaveAttendance}>उपस्थिति सेव करें</Button>
            <Dialog open={isHomeworkDialogOpen} onOpenChange={setIsHomeworkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white">
                    <BookPlus className="mr-2"/>
                    होमवर्क दें
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                    <DialogTitle>कक्षा {selectedClass} के लिए नया होमवर्क</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Label htmlFor="homework-content">होमवर्क का विवरण</Label>
                    <Textarea 
                        id="homework-content"
                        rows={5}
                        value={homeworkContent}
                        onChange={(e) => setHomeworkContent(e.target.value)}
                        placeholder="जैसे: गणित की प्रश्नावली 5.2 के सभी प्रश्न हल करें।"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsHomeworkDialogOpen(false)}>रद्द करें</Button>
                    <Button onClick={handleSendHomework}>होमवर्क भेजें</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
