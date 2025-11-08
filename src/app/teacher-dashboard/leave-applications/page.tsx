'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type LeaveApplication = {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
};

// Mock data until students can apply
const mockLeaveApplications: LeaveApplication[] = [
  {
    id: 'leave1',
    studentId: 'student123',
    studentName: 'Rohan Sharma',
    class: '5',
    startDate: '2024-08-01',
    endDate: '2024-08-03',
    reason: 'Fever and cold.',
    status: 'Pending',
  },
  {
    id: 'leave2',
    studentId: 'student456',
    studentName: 'Priya Singh',
    class: '6',
    startDate: '2024-08-05',
    endDate: '2024-08-05',
    reason: 'Family function.',
    status: 'Approved',
  },
];

export default function LeaveApplicationsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const leaveQuery = useMemoFirebase(() => firestore ? collection(firestore, 'leave-applications') : null, [firestore]);
  // Using mock data for now as student application feature is not built
  // const { data: leaveApplications, isLoading } = useCollection<LeaveApplication>(leaveQuery);
  const [leaveApplications, setLeaveApplications] = React.useState(mockLeaveApplications);
  const isLoading = false;

  const handleUpdateStatus = (id: string, status: 'Approved' | 'Rejected') => {
    // This is where you would update Firestore. For now, we update local state.
    setLeaveApplications(apps => apps.map(app => app.id === id ? { ...app, status } : app));
    toast({
        title: `Application ${status}`,
        description: `The leave application has been ${status.toLowerCase()}.`
    })
    /*
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
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not update the application status.',
        });
      });
      */
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Leave Applications</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pending and Recent Applications</CardTitle>
          <CardDescription>
            Review and take action on student leave requests.
          </CardDescription>
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
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Loading applications...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && leaveApplications.length > 0 ? (
                leaveApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.studentName}</TableCell>
                    <TableCell>{app.class}</TableCell>
                    <TableCell>
                      {format(new Date(app.startDate), 'MMM dd')} - {format(new Date(app.endDate), 'MMM dd, yyyy')}
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
                            onClick={() => handleUpdateStatus(app.id, 'Approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : !isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No leave applications found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
