
import type { Notice } from './placeholder-data';

export const initialUsers = [
  {
    name: 'श्रीमती सुनीता गुप्ता',
    role: 'शिक्षक',
    mobile: '9876543211',
    classSubject: 'हिंदी - 5, 6',
    password: 'teacher123',
    id: 'teacher01',
    classes: ['5', '6'],
    subjects: ['हिंदी']
  },
  {
    name: 'विकास शर्मा',
    role: 'अभिभावक',
    mobile: '9876543212',
    classSubject: '5', // Represents the child's class
    password: 'parent123',
    id: 'parent01'
  },
];

export const initialStudents = [
  {
    rollNo: '001',
    name: 'राहुल शर्मा',
    class: '5',
    fatherName: 'विकास शर्मा',
    motherName: 'कविता शर्मा',
    dob: '2015-05-20',
    address: '123, गांधी नगर, दिल्ली',
    admissionDate: '2020-04-01',
    aadhaar: '1234 5678 9012',
    pen: 'PEN12345',
    mobile: '9876543213',
    id: 'STU001',
    password: 'stu123',
    subjects: 'हिंदी, अंग्रेजी, गणित, विज्ञान, सा० विज्ञान',
    status: 'उपस्थित'
  },
  { id: 'STU002', rollNo: '002', name: 'प्रिया कुमारी', class: '5', fatherName: 'अशोक कुमार', status: 'अनुपस्थित', password: 'stu123', mobile: '9876543214' },
  { id: 'STU003', rollNo: '003', name: 'अमित सिंह', class: '5', fatherName: 'राजेश सिंह', status: 'उपस्थित', password: 'stu123', mobile: '9876543215' },
  { id: 'STU004', rollNo: '004', name: 'नेहा यादव', class: '6', fatherName: 'महेश यादव', status: 'उपस्थित', password: 'stu123', mobile: '9876543216' },
  { id: 'STU005', rollNo: '005', name: 'सुनीता देवी', class: '6', fatherName: 'राम प्रसाद', status: 'उपस्थित', password: 'stu123', mobile: '9876543217' },
];


export interface Result {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  examType: string;
  marks: { subject: string; obtained: string; total: string }[] | { obtained: string; total: string };
}

export const initialNewUserState = {
    role: '',
    // Teacher fields
    teacherName: '',
    teacherMobile: '',
    teacherSubject: '',
    teacherClass: '',
    // Parent fields
    parentName: '',
    // Student fields
    studentName: '',
    studentClass: '',
    studentSubjects: '',
    motherName: '',
    address: '',
    dob: undefined,
    admissionDate: undefined,
    aadhaar: '',
    pen: '',
    studentMobile: ''
};

export const initialNewNoticeState = {
  title: '',
  content: '',
  role: 'All' as Notice['role'],
};

// Mock data for the logged-in teacher
export const teacherData = {
  name: 'श्रीमती सुनीता गुप्ता',
  id: 'teacher01',
  classes: [
    { name: '5', subject: 'हिंदी', students: 3 },
    { name: '6', subject: 'हिंदी', students: 2 },
  ],
};
