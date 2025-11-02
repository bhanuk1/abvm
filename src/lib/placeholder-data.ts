export type Notice = {
  id: string;
  title: string;
  content: string;
  author: string;
  role: 'All' | 'Teachers' | 'Students' | 'Parents';
  date: string;
};
