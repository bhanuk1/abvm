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
