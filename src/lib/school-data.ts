import type { Timestamp } from 'firebase/firestore';

export type Notice = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: string;
  role: 'All' | 'Teachers' | 'Students' | 'Parents';
  createdAt: Timestamp;
};

export const initialStudents = [];


export interface Result {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  examType: string;
  marks: { subject: string; obtained: string; total: string }[] | { obtained: string; total: string };
}

export const results: Result[] = [];

export interface Fee {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  quarter: string;
  amount: number;
  status: 'Paid' | 'Unpaid';
  paymentDate?: Timestamp;
}

export const initialNewUserState = {
    role: '',
    username: '',
    userId: '',
    password: '',
    // Teacher fields
    teacherName: '',
    teacherMobile: '',
    teacherSubject: '',
    teacherClass: '',
    // Parent fields
    parentName: '',
    // Student fields
    studentName: '',
    studentUserId: '',
    studentPassword: '',
    studentClass: '',
    studentSubjects: '',
    motherName: '',
    address: '',
    dob: undefined,
    admissionDate: undefined,
    aadhaar: '',
    pen: '',
    studentMobile: '',
    rollNo: '',
};

// Mock data for the logged-in teacher
export const teacherData = {
  name: 'Mrs. Sunita Gupta',
  id: 'teacher01',
  classes: [
    { name: '5', subject: 'Hindi', students: 3 },
    { name: '6', subject: 'Hindi', students: 2 },
  ],
};

export interface Homework {
  id: string;
  class: string;
  subject: string;
  content: string;
  date: string; // YYYY-MM-DD
  teacherId: string;
  teacherName: string;
}

export const homeworks: Homework[] = [];

export const classSubjects: { [key: string]: string[] } = {
  'Nursery': ['Hindi', 'English', 'Math', 'Drawing'],
  'KG': ['Hindi', 'English', 'Math', 'Drawing'],
  '1': ['Hindi', 'English', 'Math', 'Science', 'Social Science', 'Computer', 'Moral Science', 'Drawing', 'Sanskrit/Urdu'],
  '2': ['Hindi', 'English', 'Math', 'Science', 'Social Science', 'Computer', 'Moral Science', 'Drawing', 'Sanskrit/Urdu'],
  '3': ['Hindi', 'English', 'Math', 'Science', 'Social Science', 'Computer', 'Moral Science', 'Drawing', 'Sanskrit/Urdu'],
  '4': ['Hindi', 'English', 'Math', 'Science', 'Social Science', 'Computer', 'Moral Science', 'Drawing', 'Sanskrit/Urdu'],
  '5': ['Hindi', 'English', 'Math', 'Science', 'Social Science', 'Computer', 'Moral Science', 'Drawing', 'Sanskrit/Urdu'],
  '6': ['Hindi', 'English', 'Math', 'Science', 'Social Science', 'Computer', 'Moral Science', 'Drawing', 'Sanskrit/Urdu'],
  '7': ['Hindi', 'English', 'Math', 'Science', 'Social Science', 'Computer', 'Moral Science', 'Drawing', 'Sanskrit/Urdu'],
  '8': ['Hindi', 'English', 'Math', 'Science', 'Social Science', 'Computer', 'Moral Science', 'Drawing', 'Sanskrit/Urdu'],
  '9': ['Hindi', 'English/Urdu/Sanskrit', 'Math/Home Science', 'Science', 'Social Science', 'Drawing'],
  '10': ['Hindi', 'English/Urdu/Sanskrit', 'Math/Home Science', 'Science', 'Social Science', 'Drawing'],
  '11': ['Hindi', 'English', 'Physics/Geography', 'Chemistry/Education', 'Math/Biology/Sociology'],
  '12': ['Hindi', 'English', 'Physics/Geography', 'Chemistry/Education', 'Math/Biology/Sociology'],
};

export const allSubjects = [
    'Hindi',
    'English',
    'Math',
    'Science',
    'Social Science',
    'Art',
    'Sanskrit',
    'Drawing',
    'Computer',
    'Moral Science',
    'Sanskrit/Urdu',
    'English/Urdu/Sanskrit',
    'Math/Home Science',
    'Physics/Geography',
    'Chemistry/Education',
    'Math/Biology/Sociology',
];

export interface Attendance {
  id?: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent';
  class: string;
}

export const attendance: Attendance[] = [];

export const allNotices: Notice[] = [];

export type LeaveApplication = {
    id: string;
    studentId: string;
    studentName: string;
    class: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    submittedAt: Date;
};

export type LiveClass = {
    id: string;
    teacherId: string;
    teacherName: string;
    class: string;
    subject: string;
    meetingLink: string;
    status: 'live' | 'ended';
    startedAt: Timestamp;
};
