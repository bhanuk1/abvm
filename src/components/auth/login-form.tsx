'use client';

import { useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { LogIn } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Logging in...' : <><LogIn className="mr-2 h-4 w-4" /> Login</>}
    </Button>
  );
}

function LoginFormContent() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'student';
  
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const getRoleDisplayName = () => {
    switch (role) {
      case 'student': return 'Student';
      case 'parent': return 'Parent';
      case 'teacher': return 'Teacher';
      case 'admin': return 'Principal';
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
    const auth = getAuth();
    if (!userId || !password) {
      setError('User ID and password are required.');
      return;
    }

    try {
      // We construct an email from the user ID to use Firebase Auth
      const email = `${userId}@vidyalaya.com`;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // After successful login, redirect based on role
      if (userCredential.user) {
        toast({
            title: "Success!",
            description: "You have been logged in successfully.",
            className: "bg-green-100 text-green-800",
        });
        handleRedirect(role);
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Invalid User ID or Password.');
      } else {
        setError('An error occurred during login.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="role">Your Role</Label>
        <Input id="role" name="role" value={getRoleDisplayName()} readOnly className="bg-gray-100" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="user-id">User ID</Label>
        <Input 
          id="user-id" 
          name="userId" 
          placeholder="Your ID" 
          required 
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">Password</Label>
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


export function LoginForm() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Render a placeholder or nothing on the server, and the actual form on the client
  if (!isClient) {
    return null; // Or a loading skeleton
  }

  return <LoginFormContent />;
}

    