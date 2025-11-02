'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { initialStudents, homeworks, results as allResults } from '@/lib/school-data';
import { notices, type Notice } from '@/lib/placeholder-data';
import { format } from 'date-fns';

// Assuming the logged in student is the first student for this example
const loggedInStudent = initialStudents[0];

export default function StudentDashboardPage() {
  const studentHomeworks = homeworks.filter(
    (hw) => loggedInStudent.subjects.includes(hw.subject) && loggedInStudent.class === hw.class
  );

  const studentNotices = notices.filter(
    (notice) => notice.role === 'All' || notice.role === 'Students'
  );
  
  const studentResults = allResults.filter(r => r.studentId === loggedInStudent.id);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">मेरा डैशबोर्ड</h1>

      <Card>
        <CardHeader>
          <CardTitle>{loggedInStudent.name}</CardTitle>
          <CardDescription>
            कक्षा: {loggedInStudent.class} | रोल नंबर: {loggedInStudent.rollNo}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="homework">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="homework">होमवर्क</TabsTrigger>
              <TabsTrigger value="attendance">उपस्थिति</TabsTrigger>
              <TabsTrigger value="results">परिणाम</TabsTrigger>
              <TabsTrigger value="notices">सूचना</TabsTrigger>
            </TabsList>
            <TabsContent value="homework">
              <Card>
                <CardHeader>
                  <CardTitle>मेरा होमवर्क</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>तारीख</TableHead>
                        <TableHead>विषय</TableHead>
                        <TableHead>शिक्षक</TableHead>
                        <TableHead>विवरण</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentHomeworks.map((hw) => (
                        <TableRow key={hw.id}>
                          <TableCell>{format(new Date(hw.date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{hw.subject}</TableCell>
                          <TableCell>{hw.teacherName}</TableCell>
                          <TableCell>{hw.content}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="attendance">
              <Card>
                <CardHeader>
                  <CardTitle>मेरी उपस्थिति</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="p-4 min-h-[150px] flex items-center justify-center">
                     <p className="text-muted-foreground">इस महीने का उपस्थिति डेटा जल्द ही उपलब्ध होगा।</p>
                   </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle>मेरे परिणाम</CardTitle>
                </CardHeader>
                 <CardContent>
                   {studentResults.length > 0 ? (
                    <div className="space-y-6">
                      {studentResults.map(result => (
                        <Card key={result.id}>
                          <CardHeader>
                            <CardTitle className="text-lg">{result.examType}</CardTitle>
                          </CardHeader>
                          <CardContent>
                             {Array.isArray(result.marks) ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>विषय</TableHead>
                                      <TableHead>प्राप्तांक</TableHead>
                                      <TableHead>पूर्णांक</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {result.marks.map((mark, i) => (
                                      <TableRow key={i}>
                                        <TableCell>{mark.subject}</TableCell>
                                        <TableCell>{mark.obtained}</TableCell>
                                        <TableCell>{mark.total}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <div className="flex gap-4">
                                  <p><strong>प्राप्तांक:</strong> {result.marks.obtained}</p>
                                  <p><strong>पूर्णांक:</strong> {result.marks.total}</p>
                                </div>
                              )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                   ) : (
                     <div className="p-4 min-h-[150px] flex items-center justify-center">
                       <p className="text-muted-foreground">कोई परिणाम उपलब्ध नहीं है।</p>
                     </div>
                   )}
                </CardContent>
              </Card>
            </TabsContent>
             <TabsContent value="notices">
              <Card>
                <CardHeader>
                  <CardTitle>स्कूल की सूचनाएं</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                    {studentNotices.map(notice => (
                        <div key={notice.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                            <h3 className="font-semibold">{notice.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{notice.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">{format(new Date(notice.date), 'dd/MM/yyyy')} - {notice.author}</p>
                        </div>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
