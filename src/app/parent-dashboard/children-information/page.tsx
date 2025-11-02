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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Assuming the logged in parent is linked to the first student for this example
const parentStudent = initialStudents[0];

export default function ChildrenInformationPage() {
  const studentHomeworks = homeworks.filter(
    (hw) => parentStudent.subjects.includes(hw.subject) && parentStudent.class === hw.class
  );

  const studentNotices = notices.filter(
    (notice) => notice.role === 'All' || notice.role === 'Students' || notice.role === 'Parents'
  );

  const studentResults = allResults.filter(r => r.studentId === parentStudent.id);
  
  function DetailRow({ label, value }: { label: string; value?: string }) {
    return (
      <div className="grid grid-cols-3 items-center">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="col-span-2 text-sm">{value || '-'}</dd>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">मेरे बच्चे की जानकारी</h1>

      <Card>
        <CardHeader>
          <CardTitle>{parentStudent.name}</CardTitle>
          <CardDescription>
            कक्षा: {parentStudent.class} | रोल नंबर: {parentStudent.rollNo}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">प्रोफ़ाइल</TabsTrigger>
              <TabsTrigger value="attendance">उपस्थिति</TabsTrigger>
              <TabsTrigger value="homework">होमवर्क</TabsTrigger>
              <TabsTrigger value="results">परिणाम</TabsTrigger>
              <TabsTrigger value="notices">सूचना</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
               <Card>
                <CardHeader>
                  <CardTitle>छात्र प्रोफ़ाइल</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <dl className="grid gap-y-4 gap-x-8 md:grid-cols-2">
                    <div className="space-y-4">
                      <DetailRow label="पिता का नाम" value={parentStudent.fatherName} />
                      <DetailRow label="माता का नाम" value={parentStudent.motherName} />
                      <DetailRow label="जन्म तिथि" value={format(new Date(parentStudent.dob), 'dd/MM/yyyy')} />
                      <DetailRow label="मोबाइल नंबर" value={parentStudent.mobile} />
                    </div>
                     <div className="space-y-4">
                        <DetailRow label="पता" value={parentStudent.address} />
                        <DetailRow label="आधार नंबर" value={parentStudent.aadhaar} />
                        <DetailRow label="प्रवेश तिथि" value={format(new Date(parentStudent.admissionDate), 'dd/MM/yyyy')} />
                        <DetailRow label="विषय" value={parentStudent.subjects} />
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="attendance">
              <Card>
                <CardHeader>
                  <CardTitle>मासिक उपस्थिति</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="p-4 min-h-[150px] flex items-center justify-center">
                     <p className="text-muted-foreground">इस महीने का उपस्थिति डेटा जल्द ही उपलब्ध होगा।</p>
                   </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="homework">
              <Card>
                <CardHeader>
                  <CardTitle>विषय-वार होमवर्क</CardTitle>
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
            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle>परीक्षा परिणाम</CardTitle>
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
