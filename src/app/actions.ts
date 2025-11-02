'use server';

import { redirect } from 'next/navigation';

export async function login(prevState: { message: string | null }, formData: FormData) {
  // This is a mock login. In a real app, you'd validate credentials.
  const role = formData.get('role');
  const userId = formData.get('userId');
  const password = formData.get('password');

  if (!role || !userId || !password) {
    return { message: 'All fields are required.' };
  }
  
  // Successful "login"
  redirect('/dashboard');
}
