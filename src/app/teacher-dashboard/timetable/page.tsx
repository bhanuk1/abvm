'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const timetableData = {
  'Monday': [
    { time: '08:00 - 08:40', class: '6', subject: 'Hindi' },
    { time: '08:40 - 09:20', class: '5', subject: 'Hindi' },
    { time: '09:20 - 10:00', class: '7', subject: 'English' },
    { time: '10:20 - 11:00', class: '8', subject: 'Math' },
  ],
  'Tuesday': [
    { time: '08:00 - 08:40', class: '5', subject: 'Hindi' },
    { time: '08:40 - 09:20', class: '6', subject: 'Hindi' },
    { time: '09:20 - 10:00', class: '8', subject: 'Math' },
    { time: '10:20 - 11:00', class: '7', subject: 'English' },
  ],
  'Wednesday': [
    { time: '08:00 - 08:40', class: '7', subject: 'English' },
    { time: '08:40 - 09:20', class: '8', subject: 'Math' },
    { time: '09:20 - 10:00', class: '5', subject: 'Hindi' },
    { time: '10:20 - 11:00', class: '6', subject: 'Hindi' },
  ],
  // Add other days as needed
};


export default function TimetablePage() {
  const days = Object.keys(timetableData);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">My Timetable</h1>
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>
            This is your teaching schedule for the week.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {days.map(day => (
            <div key={day}>
              <h3 className="text-lg font-semibold mb-2">{day}</h3>
              <Table className="border">
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timetableData[day as keyof typeof timetableData].map((period, index) => (
                    <TableRow key={index}>
                      <TableCell>{period.time}</TableCell>
                      <TableCell>{period.class}</TableCell>
                      <TableCell>{period.subject}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
