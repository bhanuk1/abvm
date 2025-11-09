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
import { addDoc, collection, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { type LiveClass } from '@/lib/school-data';
import { Video, VideoOff } from 'lucide-react';

export default function TeacherLiveClassPage() {
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
  const [selectedSubject, setSelectedSubject] = React.useState('');
  const [meetingLink, setMeetingLink] = React.useState('');

  const liveClassQuery = useMemoFirebase(() =>
    firestore && currentUser
      ? query(
          collection(firestore, 'live-classes'),
          where('teacherId', '==', currentUser.uid),
          where('status', '==', 'live')
        )
      : null,
  [firestore, currentUser]);
  const { data: liveClassData, isLoading } = useCollection<LiveClass>(liveClassQuery);
  const activeLiveClass = liveClassData && liveClassData.length > 0 ? liveClassData[0] : null;

  const teacherClasses = React.useMemo(() => {
    if (!teacherData?.classSubject) return [];
    const classSubjectPairs = teacherData.classSubject.split(',');
    const uniqueClasses = [
      ...new Set(classSubjectPairs.map((pair: string) => pair.split('-')[0].trim())),
    ];
    return uniqueClasses;
  }, [teacherData]);

  const teacherSubjectsForSelectedClass = React.useMemo(() => {
    if (!teacherData?.classSubject || !selectedClass) return [];
    const classSubjectPairs = teacherData.classSubject.split(',');
    return classSubjectPairs
      .filter((pair: string) => pair.split('-')[0].trim() === selectedClass)
      .map((pair: string) => {
        const parts = pair.split('-');
        return parts.length > 1 ? parts[1].trim() : null;
      })
      .filter(Boolean);
  }, [teacherData, selectedClass]);
  
  React.useEffect(() => {
    if (activeLiveClass) {
        setSelectedClass(activeLiveClass.class);
        setSelectedSubject(activeLiveClass.subject);
        setMeetingLink(activeLiveClass.meetingLink);
    }
  }, [activeLiveClass]);

  const handleStartClass = async () => {
    if (!selectedClass || !selectedSubject || !meetingLink || !firestore || !currentUser || !teacherData) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select class, subject, and provide a meeting link.',
      });
      return;
    }
    
    if (activeLiveClass) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You already have an active class. Please end it before starting a new one.',
        });
        return;
    }

    const liveClassCol = collection(firestore, 'live-classes');
    const newLiveClass = {
      teacherId: currentUser.uid,
      teacherName: teacherData.username,
      class: selectedClass,
      subject: selectedSubject,
      meetingLink: meetingLink,
      status: 'live',
      startedAt: serverTimestamp(),
    };

    try {
      await addDoc(liveClassCol, newLiveClass);
      toast({ title: 'Success!', description: 'Your class is now live.' });
    } catch (error) {
      const contextualError = new FirestorePermissionError({
        operation: 'create',
        path: liveClassCol.path,
        requestResourceData: newLiveClass,
      });
      errorEmitter.emit('permission-error', contextualError);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not start the class.' });
    }
  };
  
  const handleEndClass = async () => {
    if (!activeLiveClass || !firestore) return;
    
    const classDocRef = doc(firestore, 'live-classes', activeLiveClass.id);
    const updatedData = { status: 'ended' };

    try {
        await updateDoc(classDocRef, updatedData);
        toast({ title: 'Class Ended', description: 'Your live class has been ended.' });
        setSelectedClass('');
        setSelectedSubject('');
        setMeetingLink('');
    } catch (error) {
        const contextualError = new FirestorePermissionError({
            operation: 'update',
            path: classDocRef.path,
            requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', contextualError);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not end the class.' });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Live Class Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>{activeLiveClass ? "Class in Progress" : "Start a New Live Class"}</CardTitle>
          <CardDescription>
            {activeLiveClass
              ? `Your ${activeLiveClass.subject} class for Grade ${activeLiveClass.class} is currently live.`
              : 'Create a new live session for your students.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="live-class-class">Class</Label>
              <Select
                value={selectedClass}
                onValueChange={setSelectedClass}
                disabled={!!activeLiveClass}
              >
                <SelectTrigger id="live-class-class">
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
              <Label htmlFor="live-class-subject">Subject</Label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
                disabled={!!activeLiveClass}
              >
                <SelectTrigger id="live-class-subject">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {teacherSubjectsForSelectedClass.map((s: string) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
           <div className="space-y-2">
              <Label htmlFor="meeting-link">Meeting Link</Label>
              <Input
                id="meeting-link"
                placeholder="e.g., https://meet.google.com/xyz-abcd-efg"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                disabled={!!activeLiveClass}
              />
            </div>
            {activeLiveClass ? (
                 <Button onClick={handleEndClass} size="lg" className="w-full bg-red-600 hover:bg-red-700">
                    <VideoOff className="mr-2"/>
                    End Class
                </Button>
            ) : (
                <Button onClick={handleStartClass} size="lg" className="w-full bg-green-600 hover:bg-green-700">
                    <Video className="mr-2"/>
                    Start Class
                </Button>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
