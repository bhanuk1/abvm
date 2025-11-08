
'use client';
import { cn } from '@/lib/utils';

export function SchoolLogo({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-10 w-10', className)}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="60" cy="60" r="55" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="4" />
      {/* Lotus Flower */}
      <path
        d="M60 85 C 50 85, 45 75, 45 70 C 45 65, 50 65, 55 68 C 58 70, 62 70, 65 68 C 70 65, 75 65, 75 70 C 75 75, 70 85, 60 85 Z"
        fill="hsl(var(--primary-foreground))"
        opacity="0.8"
      />
      <path
        d="M50 75 C 40 75, 35 65, 35 60 C 35 55, 40 55, 45 58 C 48 60, 52 60, 55 58 C 60 55, 65 55, 65 60 C 65 65, 60 75, 50 75 Z"
        fill="hsl(var(--primary-foreground))"
        opacity="0.8"
        transform="rotate(-20 60 60)"
      />
      <path
        d="M70 75 C 60 75, 55 65, 55 60 C 55 55, 60 55, 65 58 C 68 60, 72 60, 75 58 C 80 55, 85 55, 85 60 C 85 65, 80 75, 70 75 Z"
        fill="hsl(var(--primary-foreground))"
        opacity="0.8"
        transform="rotate(20 60 60)"
      />
      {/* Open Book */}
      <path
        d="M40 90 Q 60 80, 80 90 L 80 40 Q 60 50, 40 40 Z"
        fill="none"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="3"
      />
      <path
        d="M60 42 V 88"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="3"
        strokeLinecap="round"
      />
       <path
        d="M45 45 H 75"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2"
        strokeLinecap="round"
      />
       <path
        d="M45 55 H 75"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
