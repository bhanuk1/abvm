
import type { Notice } from './placeholder-data';

export const allNotices: Notice[] = [
  {
    id: '1',
    title: 'स्कूल में वार्षिक उत्सव',
    content: 'दिनांक 15 दिसंबर को स्कूल में वार्षिक उत्सव का आयोजन किया जाएगा। सभी छात्र और अभिभावक आमंत्रित हैं।',
    author: 'प्रधानाचार्य',
    role: 'All',
    date: '2025-10-28',
  },
  {
    id: '2',
    title: 'Parent-Teacher Meeting Schedule',
    content: 'A Parent-Teacher Meeting is scheduled for this Saturday to discuss the mid-term performance of students. Please book your slots with the respective class teachers.',
    author: 'Administration',
    role: 'Parents',
    date: '2024-07-12',
  },
  {
    id: '3',
    title: 'Holiday for National Festival',
    content: 'The school will remain closed on August 15th on account of Independence Day. We wish everyone a happy and patriotic celebration.',
    author: 'Administration',
    role: 'All',
    date: '2024-07-10',
  },
  {
    id: '4',
    title: 'Science Fair Submissions',
    content: 'Students interested in participating in the upcoming Science Fair should submit their project proposals by the end of this month. Please contact Mrs. Davis for the submission guidelines.',
    author: 'Science Department',
    role: 'Students',
    date: '2024-07-08',
  },
  {
    id: '5',
    title: 'Staff Meeting Notification',
    content: 'There will be a mandatory staff meeting on Friday at 3:00 PM in the staff room to discuss the curriculum for the new semester.',
    author: 'Principal\'s Office',
    role: 'Teachers',
    date: '2024-07-05',
  },
  {
    id: '6',
    title: 'Library Books Return Deadline',
    content: 'All students are reminded to return any overdue library books by this Friday to avoid fines. The library will be closed for stock-taking next week.',
    author: 'Librarian',
    role: 'Students',
    date: '2024-07-02',
  },
];


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
    subjects: 'हिंदी, अंग्रेजी, गणित, विज्ञान, सामाजिक विज्ञान, कंप्यूटर, नैतिक शिक्षा, Drawing, संस्कृत/उर्दू',
  },
  { id: 'STU002', rollNo: '002', name: 'प्रिया कुमारी', class: '5', fatherName: 'अशोक कुमार', password: 'stu123', mobile: '9876543214', motherName: 'a', dob: '2015-05-20', address: '123, गांधी नगर, दिल्ली', admissionDate: '2020-04-01', aadhaar: '1234 5678 9012', pen: 'PEN12345', subjects: 'हिंदी, अंग्रेजी, गणित, विज्ञान, सामाजिक विज्ञान, कंप्यूटर, नैतिक शिक्षा, Drawing, संस्कृत/उर्दू', },
  { id: 'STU003', rollNo: '003', name: 'अमित सिंह', class: '5', fatherName: 'राजेश सिंह', password: 'stu123', mobile: '9876543215', motherName: 'a', dob: '2015-05-20', address: '123, गांधी नगर, दिल्ली', admissionDate: '2020-04-01', aadhaar: '1234 5678 9012', pen: 'PEN12345', subjects: 'हिंदी, अंग्रेजी, गणित, विज्ञान, सामाजिक विज्ञान, कंप्यूटर, नैतिक शिक्षा, Drawing, संस्कृत/उर्दू', },
  { id: 'STU004', rollNo: '004', name: 'नेहा यादव', class: '6', fatherName: 'महेश यादव', password: 'stu123', mobile: '9876543216', motherName: 'a', dob: '2015-05-20', address: '123, गांधी नगर, दिल्ली', admissionDate: '2020-04-01', aadhaar: '1234 5678 9012', pen: 'PEN12345', subjects: 'हिंदी, अंग्रेजी, गणित, विज्ञान, सामाजिक विज्ञान, कंप्यूटर, नैतिक शिक्षा, Drawing, संस्कृत/उर्दू', },
  { id: 'STU005', rollNo: '005', name: 'सुनीता देवी', class: '6', fatherName: 'राम प्रसाद', password: 'stu123', mobile: '9876543217', motherName: 'a', dob: '2015-05-20', address: '123, गांधी नगर, दिल्ली', admissionDate: '2020-04-01', aadhaar: '1234 5678 9012', pen: 'PEN12345', subjects: 'हिंदी, अंग्रेजी, गणित, विज्ञान, सामाजिक विज्ञान, कंप्यूटर, नैतिक शिक्षा, Drawing, संस्कृत/उर्दू', },
];


export interface Result {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  examType: string;
  marks: { subject: string; obtained: string; total: string }[] | { obtained: string; total: string };
}

export const results: Result[] = [
    {
        id: 'RES001',
        studentId: 'STU001',
        studentName: 'राहुल शर्मा',
        class: '5',
        examType: 'त्रैमासिक परीक्षा',
        marks: [
            { subject: 'हिंदी', obtained: '85', total: '100' },
            { subject: 'अंग्रेजी', obtained: '78', total: '100' },
            { subject: 'गणित', obtained: '92', total: '100' },
        ]
    }
];

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

export interface Homework {
  id: string;
  class: string;
  subject: string;
  content: string;
  date: string; // YYYY-MM-DD
  teacherId: string;
  teacherName: string;
}

export const homeworks: Homework[] = [
    {
        id: 'HW001',
        class: '5',
        subject: 'हिंदी',
        content: 'पाठ 3 के प्रश्न उत्तर याद करें।',
        date: '2024-07-29',
        teacherId: 'teacher01',
        teacherName: 'श्रीमती सुनीता गुप्ता'
    }
];

export const classSubjects: { [key: string]: string[] } = {
  'Nursery': ['हिंदी', 'अंग्रेजी', 'गणित', 'Drawing'],
  'KG': ['हिंदी', 'अंग्रेजी', 'गणित', 'Drawing'],
  '1': ['हिंदी', 'अंग्रेजी', 'गणित', 'विज्ञान', 'सामाजिक विज्ञान', 'कंप्यूटर', 'नैतिक शिक्षा', 'Drawing', 'संस्कृत/उर्दू'],
  '2': ['हिंदी', 'अंग्रेजी', 'गणित', 'विज्ञान', 'सामाजिक विज्ञान', 'कंप्यूटर', 'नैतिक शिक्षा', 'Drawing', 'संस्कृत/उर्दू'],
  '3': ['हिंदी', 'अंग्रेजी', 'गणित', 'विज्ञान', 'सामाजिक विज्ञान', 'कंप्यूटर', 'नैतिक शिक्षा', 'Drawing', 'संस्कृत/उर्दू'],
  '4': ['हिंदी', 'अंग्रेजी', 'गणित', 'विज्ञान', 'सामाजिक विज्ञान', 'कंप्यूटर', 'नैतिक शिक्षा', 'Drawing', 'संस्कृत/उर्दू'],
  '5': ['हिंदी', 'अंग्रेजी', 'गणित', 'विज्ञान', 'सामाजिक विज्ञान', 'कंप्यूटर', 'नैतिक शिक्षा', 'Drawing', 'संस्कृत/उर्दू'],
  '6': ['हिंदी', 'अंग्रेजी', 'गणित', 'विज्ञान', 'सामाजिक विज्ञान', 'कंप्यूटर', 'नैतिक शिक्षा', 'Drawing', 'संस्कृत/उर्दू'],
  '7': ['हिंदी', 'अंग्रेजी', 'गणित', 'विज्ञान', 'सामाजिक विज्ञान', 'कंप्यूटर', 'नैतिक शिक्षा', 'Drawing', 'संस्कृत/उर्दू'],
  '8': ['हिंदी', 'अंग्रेजी', 'गणित', 'विज्ञान', 'सामाजिक विज्ञान', 'कंप्यूटर', 'नैतिक शिक्षा', 'Drawing', 'संस्कृत/उर्दू'],
  '9': ['हिंदी', 'अंग्रेजी/उर्दू/संस्कृत', 'गणित/गृह विज्ञान', 'विज्ञान', 'सामाजिक विज्ञान', 'चित्रकला'],
  '10': ['हिंदी', 'अंग्रेजी/उर्दू/संस्कृत', 'गणित/गृह विज्ञान', 'विज्ञान', 'सामाजिक विज्ञान', 'चित्रकला'],
  '11': ['हिंदी', 'अंग्रेजी', 'भौतिक विज्ञान/भूगोल', 'रसायन विज्ञान/शिक्षाशास्त्र', 'गणित/जीव विज्ञान/समाजशास्त्र'],
  '12': ['हिंदी', 'अंग्रेजी', 'भौतिक विज्ञान/भूगोल', 'रसायन विज्ञान/शिक्षाशास्त्र', 'गणित/जीव विज्ञान/समाजशास्त्र'],
};

export const allSubjects = [
    'हिंदी',
    'अंग्रेजी',
    'गणित',
    'विज्ञान',
    'सामाजिक विज्ञान',
    'कला',
    'संस्कृत',
    'Drawing',
    'कंप्यूटर',
    'नैतिक शिक्षा',
    'संस्कृत/उर्दू',
    'अंग्रेजी/उर्दू/संस्कृत',
    'गणित/गृह विज्ञान',
    'चित्रकला',
    'भौतिक विज्ञान/भूगोल',
    'रसायन विज्ञान/शिक्षाशास्त्र',
    'गणित/जीव विज्ञान/समाजशास्त्र',
];

export interface Attendance {
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'उपस्थित' | 'अनुपस्थित';
  class: string;
}

export const attendance: Attendance[] = [
    { studentId: 'STU001', date: '2024-07-29', status: 'उपस्थित', class: '5' },
    { studentId: 'STU002', date: '2024-07-29', status: 'अनुपस्थित', class: '5' },
    { studentId: 'STU003', date: '2024-07-29', status: 'उपस्थित', class: '5' },
];
