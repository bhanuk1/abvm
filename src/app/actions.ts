'use server';

import { redirect } from 'next/navigation';

export async function handleLogin(role: string) {
    if (role === 'admin') {
      redirect('/dashboard');
    } else if (role === 'teacher') {
      redirect('/teacher-dashboard');
    } else if (role === 'parent') {
      redirect('/parent-dashboard');
    } else if (role === 'student') {
      redirect('/student-dashboard');
    }
    else {
      // For student and parent, redirect to a generic dashboard for now
      redirect('/dashboard');
    }
}
