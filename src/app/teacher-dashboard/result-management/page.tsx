'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  useCollection,
  useFirestore,
  useUser,
  useDoc,
  useMemoFirebase,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import { addDoc, collection, query, where, doc } from 'firebase/firestore';
import {
  type Result,
  classSubjects,
} from '@/lib/school-data';

export default function TeacherResultManagementPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();

  const teacherDocRef = useMemoFirebase(
    () =>
      firestore && currentUser
        ? doc(firestore, 'users', currentUser.uid)
        : null,
    [firestore, currentUser]
  );
  const { data: teacherData } = useDoc<any>(teacherDocRef);

  const [selectedClass, setSelectedClass] = React.useState('');
  const [selectedStudent, setSelectedStudent] = React.useState('');
  const [selectedExamType, setSelectedExamType] = React.useState('');

  const [marks, setMarks] = React.useState<any>({});
  const [monthlyObtained, setMonthlyObtained] = React.useState('');
  const [monthlyTotal, setMonthlyTotal] = React.useState('100');

  React.useEffect(() => {
    if (teacherData && !selectedClass) {
        const teacherClasses = teacherData.classSubject?.split(',').map((s: string) => s.split('-')[0].trim()) || [];
        if (teacherClasses.length > 0) {
            setSelectedClass(teacherClasses[0]);
        }
    }
  }, [teacherData, selectedClass]);

  const studentsQuery = useMemoFirebase(
    () =>
      firestore && selectedClass
        ? query(
            collection(firestore, 'users'),
            where('role', '==', 'student'),
            where('class', '==', selectedClass)
          )
        : null,
    [firestore, selectedClass]
  );
  const { data: students } = useCollection<any>(studentsQuery);

  const teacherClasses = React.useMemo(() => {
    if (!teacherData?.classSubject) return [];
    const classSubjectPairs = teacherData.classSubject.split(',');
    const uniqueClasses = [
      ...new Set(classSubjectPairs.map((pair: string) => pair.split('-')[0].trim())),
    ];
    return uniqueClasses;
  }, [teacherData]);

  const examTypes = [
    { value: 'monthly', label: 'Monthly Test' },
    { value: 'quarterly', label: 'Quarterly Exam' },
    { value: 'half-yearly', label: 'Half-Yearly Exam' },
    { value: 'final', label: 'Final Exam' },
  ];

  const handleMarksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setMarks((prev: any) => ({ ...prev, [id]: value }));
  };

  const getSubjectsForStudent = () => {
    if (!selectedStudent || !students) return [];
    const student = students.find((s) => s.id === selectedStudent);
    if (!student) return [];
    
    if (student.subjects) {
        return student.subjects.split(',').map((s: string) => s.trim());
    }
    
    // @ts-ignore
    return classSubjects[student.class] || [];
  };

  const studentSubjects = getSubjectsForStudent();

  const handleAddResult = async () => {
    if (
      !selectedClass ||
      !selectedStudent ||
      !selectedExamType ||
      !students ||
      !firestore
    ) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select class, student, and exam type.',
      });
      return;
    }

    const student = students.find((s) => s.id === selectedStudent);
    if (!student) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Selected student not found.',
      });
      return;
    }

    let resultMarks;

    if (selectedExamType === 'monthly') {
      if (!monthlyObtained || !monthlyTotal) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Please enter marks for the monthly test.',
        });
        return;
      }
      resultMarks = {
        obtained: monthlyObtained,
        total: monthlyTotal,
      };
    } else {
      resultMarks = studentSubjects.map((subject) => ({
        subject,
        obtained: marks[`${subject}-obtained`] || '0',
        total: marks[`${subject}-total`] || '100',
      }));

      const allMarksEntered = resultMarks.every((m) => m.obtained);
      if (!allMarksEntered) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Please enter marks for all subjects.',
        });
        return;
      }
    }

    const newResult: Omit<Result, 'id'> = {
      studentId: student.id,
      studentName: student.username,
      class: student.class,
      examType: examTypes.find((e) => e.value === selectedExamType)?.label || '',
      marks: resultMarks,
    };

    const resultsCol = collection(firestore, 'results');
    addDoc(resultsCol, newResult)
    .then(() => {
        toast({ title: 'Success!', description: 'Result added successfully!' });
        setSelectedStudent('');
        setSelectedExamType('');
        setMarks({});
        setMonthlyObtained('');
    })
    .catch((error) => {
      const contextualError = new FirestorePermissionError({
        operation: 'create',
        path: resultsCol.path,
        requestResourceData: newResult,
      });
      errorEmitter.emit('permission-error', contextualError);
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Result Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add Student Result</CardTitle>
          <CardDescription>
            Select a class and student to enter their exam results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="result-class">Class</Label>
              <Select
                value={selectedClass}
                onValueChange={(value) => {
                  setSelectedClass(value);
                  setSelectedStudent('');
                  setMarks({});
                }}
              >
                <SelectTrigger id="result-class">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {teacherClasses.map((c: string) => (
                    <SelectItem key={c} value={c}>
                      Class {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="result-student">Student</Label>
              <Select
                value={selectedStudent}
                onValueChange={(value) => {
                  setSelectedStudent(value);
                  setMarks({});
                }}
                disabled={!selectedClass}
              >
                <SelectTrigger id="result-student">
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  {students &&
                    students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.username} (Roll No. {s.rollNo})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="result-exam-type">Exam Type</Label>
              <Select
                value={selectedExamType}
                onValueChange={(value) => {
                  setSelectedExamType(value);
                  setMarks({});
                }}
              >
                <SelectTrigger id="result-exam-type">
                  <SelectValue placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent>
                  {examTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedExamType !== 'monthly' && (
              <Button
                onClick={handleAddResult}
                disabled={
                  !selectedClass || !selectedStudent || !selectedExamType
                }
                className="bg-green-600 hover:bg-green-700"
              >
                Add Result
              </Button>
            )}
          </div>

          {selectedExamType && selectedStudent && (
            <div className="border rounded-lg p-4 space-y-4">
              {selectedExamType === 'monthly' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 items-center max-w-sm">
                    <Label htmlFor="monthly-obtained" className="font-semibold">
                      Marks Obtained
                    </Label>
                    <Input
                      id="monthly-obtained"
                      type="number"
                      placeholder="Obtained"
                      value={monthlyObtained}
                      onChange={(e) => setMonthlyObtained(e.target.value)}
                    />
                    <Label htmlFor="monthly-total" className="font-semibold">
                      Total Marks
                    </Label>
                    <Input
                      id="monthly-total"
                      type="number"
                      value={monthlyTotal}
                      onChange={(e) => setMonthlyTotal(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleAddResult}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Save Test Result
                  </Button>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Subject-wise Marks
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {studentSubjects.map((subject) => (
                      <div
                        key={subject}
                        className="grid grid-cols-3 gap-2 items-center"
                      >
                        <Label
                          htmlFor={`marks-obtained-${subject}`}
                          className="col-span-1"
                        >
                          {subject}
                        </Label>
                        <Input
                          id={`${subject}-obtained`}
                          type="number"
                          placeholder="Obtained"
                          className="col-span-1"
                          value={marks[`${subject}-obtained`] || ''}
                          onChange={handleMarksChange}
                        />
                        <Input
                          id={`${subject}-total`}
                          type="number"
                          value={marks[`${subject}-total`] || '100'}
                          readOnly
                          className="col-span-1 bg-gray-100"
                          onChange={handleMarksChange}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
