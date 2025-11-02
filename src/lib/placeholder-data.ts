export type Notice = {
  id: string;
  title: string;
  content: string;
  author: string;
  role: 'All' | 'Teachers' | 'Students' | 'Parents';
  date: string;
};

export const notices: Notice[] = [
  {
    id: '1',
    title: 'Annual Sports Day Announcement',
    content: 'The Annual Sports Day will be held on the 25th of next month. All students are requested to participate. Parents are welcome to attend and cheer for the participants. More details about the events will be shared soon.',
    author: 'Mr. Sharma, Principal',
    role: 'All',
    date: '2024-07-15',
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
