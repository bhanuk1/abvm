'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { LogIn } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'लॉग इन हो रहा है...' : <><LogIn className="mr-2 h-4 w-4" /> लॉग इन करें</>}
    </Button>
  );
}

export function LoginForm() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'student';
  
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const getRoleDisplayName = () => {
    switch (role) {
      case 'student': return 'छात्र';
      case 'parent': return 'अभिभावक';
      case 'teacher': return 'शिक्षक';
      case 'admin': return 'प्रधानाचार्य';
      default: return '';
    }
  };

  const handleRedirect = (role: string) => {
    switch (role) {
      case 'admin':
        router.push('/dashboard');
        break;
      case 'teacher':
        router.push('/teacher-dashboard');
        break;
      case 'parent':
        router.push('/parent-dashboard');
        break;
      case 'student':
        router.push('/student-dashboard');
        break;
      default:
        router.push('/');
        break;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!userId || !password) {
      setError('यूजर आईडी और पासवर्ड आवश्यक हैं।');
      return;
    }

    try {
      // We construct an email from the user ID to use Firebase Auth
      const email = `${userId}@vidyalaya.com`;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // After successful login, redirect based on role
      if (userCredential.user) {
        toast({
            title: "सफलता!",
            description: "आप सफलतापूर्वक लॉग इन हो गए हैं।",
            className: "bg-green-100 text-green-800",
        });
        handleRedirect(role);
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('अमान्य यूजर आईडी या पासवर्ड।');
      } else {
        setError('लॉगिन के दौरान एक त्रुटि हुई।');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="role">आपकी भूमिका</Label>
        <Input id="role" name="role" value={getRoleDisplayName()} readOnly className="bg-gray-100" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="user-id">यूजर आईडी</Label>
        <Input 
          id="user-id" 
          name="userId" 
          placeholder="आपकी आईडी" 
          required 
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">पासवर्ड</Label>
        </div>
        <Input 
          id="password" 
          name="password" 
          type="password" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <LoginButton />
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </form>
  );
}
