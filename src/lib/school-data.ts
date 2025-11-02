import type { Notice } from './placeholder-data';


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
];


export interface Result {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  examType: string;
  marks: { subject: string; obtained: string; total: string }[] | { obtained: string; total: string };
}

export const results: Result[] = [];

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

export const homeworks: Homework[] = [];

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
  id?: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'उपस्थित' | 'अनुपस्थित';
  class: string;
}

export const attendance: Attendance[] = [];

export const allNotices: Notice[] = [];
