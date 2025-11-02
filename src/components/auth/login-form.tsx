'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { login } from '@/app/actions';

const initialState = {
  message: null,
};

function LoginButton() {
  const { pending } = useFormStatus();

  return (
     <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Logging in...' : <><LogIn className="mr-2 h-4 w-4" /> Login</>}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="role">Your Role</Label>
        <Select name="role" required defaultValue="student">
          <SelectTrigger id="role">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="parent">Parent</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="admin">Administrator</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="user-id">User ID</Label>
        <Input id="user-id" name="userId" placeholder="Your ID" required />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">Password</Label>
        </div>
        <Input id="password" name="password" type="password" required />
      </div>
      <LoginButton />
      {state?.message && (
        <p className="text-sm text-destructive mt-2">{state.message}</p>
      )}
    </form>
  );
}
