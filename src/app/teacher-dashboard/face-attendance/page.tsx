
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { recognizeStudent } from '@/ai/flows/recognize-student-flow';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { collection, query, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { Camera, CheckCircle, XCircle, Loader2 } from 'lucide-react';

type Student = {
  id: string;
  username: string;
  class: string;
  photoUrl?: string;
};

export default function FaceAttendancePage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();

  const teacherDocRef = useMemoFirebase(
    () => (firestore && currentUser ? doc(firestore, 'users', currentUser.uid) : null),
    [firestore, currentUser]
  );
  const { data: teacherData } = useDoc<any>(teacherDocRef);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const studentsQuery = useMemoFirebase(
    () =>
      firestore && selectedClass
        ? query(collection(firestore, 'users'), where('role', '==', 'student'), where('class', '==', selectedClass))
        : null,
    [firestore, selectedClass]
  );
  const { data: students, isLoading: studentsLoading } = useCollection<Student>(studentsQuery);

  const teacherClasses = React.useMemo(() => {
    if (!teacherData?.classSubject) return [];
    const classSubjectPairs = teacherData.classSubject.split(',');
    const uniqueClasses = [...new Set(classSubjectPairs.map((pair: string) => pair.split('-')[0].trim()))];
    return uniqueClasses;
  }, [teacherData]);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };
    getCameraPermission();
  }, [toast]);

  const markAttendance = async () => {
    if (!videoRef.current || !students || students.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a class with students first.',
      });
      return;
    }

    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
        setIsProcessing(false);
        return;
    }
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const photoDataUri = canvas.toDataURL('image/jpeg');

    try {
      const studentProfiles = students.map((s) => ({
        id: s.id,
        name: s.username,
        // Use real photoUrl if available, otherwise fallback to placeholder
        photoUrl: s.photoUrl || `https://picsum.photos/seed/${s.id}/200/300`,
      }));

      const result = await recognizeStudent({
        photoDataUri,
        students: studentProfiles,
      });

      if (result.studentId) {
        const student = students.find((s) => s.id === result.studentId);
        if (student && firestore) {
          const dateStr = format(new Date(), 'yyyy-MM-dd');
          const attendanceDocRef = doc(firestore, 'attendance', `${student.id}_${dateStr}`);

          try {
            await setDoc(attendanceDocRef, {
              studentId: student.id,
              date: dateStr,
              status: 'Present',
              class: student.class,
            });
            toast({
              title: 'Attendance Marked!',
              description: `${student.username}'s attendance has been marked as Present.`,
              className: 'bg-green-100 text-green-800',
            });
          } catch (e) {
             const contextualError = new FirestorePermissionError({
                operation: 'create',
                path: attendanceDocRef.path,
                requestResourceData: {
                    studentId: student.id,
                    date: dateStr,
                    status: 'Present',
                    class: student.class,
                },
             });
             errorEmitter.emit('permission-error', contextualError);
          }
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Recognition Failed',
          description: 'Could not recognize the student. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error recognizing student:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'An error occurred during face recognition.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Face Recognition Attendance</h1>

      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance with AI</CardTitle>
          <CardDescription>
            Select a class, position the student in front of the camera, and click "Mark Attendance".
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 max-w-sm">
            <Label htmlFor="class-select">Select Class:</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger id="class-select">
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

          <div className="relative aspect-video max-w-2xl mx-auto rounded-lg overflow-hidden border">
             <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                    <Loader2 className="h-12 w-12 animate-spin mb-4" />
                    <p className="text-lg font-semibold">Recognizing Student...</p>
                </div>
            )}
          </div>
          
          {hasCameraPermission === false && (
             <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                    Camera permission is denied. Please enable it in your browser settings to use this feature.
                </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            <Button
              onClick={markAttendance}
              disabled={!hasCameraPermission || isProcessing || !selectedClass || studentsLoading}
              size="lg"
            >
              <Camera className="mr-2 h-5 w-5" />
              {isProcessing ? 'Processing...' : 'Mark Attendance'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
