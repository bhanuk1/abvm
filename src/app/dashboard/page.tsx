'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { School, User, Users, Building, DollarSign, UserPlus, GraduationCap, Bus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const stats = [
  {
    title: 'Total Students',
    value: '1',
    icon: User,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Teachers',
    value: '1',
    icon: Users,
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    title: 'Parents',
    value: '1',
    icon: Users,
    color: 'bg-amber-100 text-amber-600',
  },
  {
    title: 'Classes',
    value: '15',
    icon: Building,
    color: 'bg-pink-100 text-pink-600',
  },
];

const quickActions = [
    {
        label: 'Add New User',
        icon: UserPlus,
        href: '/dashboard/school-management?tab=user-management',
        color: 'bg-green-500 hover:bg-green-600'
    },
    {
        label: 'Manage Fees',
        icon: DollarSign,
        href: '/dashboard/school-management?tab=fee-management',
        color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
        label: 'Promote Students',
        icon: GraduationCap,
        href: '/dashboard/school-management?tab=student-promotion',
        color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
        label: 'Manage Transport',
        icon: Bus,
        href: '/dashboard/school-management?tab=transport-management',
        color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
        label: 'Manage Library',
        icon: BookOpen,
        href: '/dashboard/school-management?tab=library-management',
        color: 'bg-rose-500 hover:bg-rose-600'
    }
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className={`p-3 rounded-md ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-right">
                  {stat.title}
                </CardTitle>
                <p className="text-2xl font-bold text-right">{stat.value}</p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickActions.map(action => (
                <Button key={action.label} asChild className={`flex flex-col h-28 gap-2 text-white shadow-lg transform transition-transform hover:scale-105 hover:-translate-y-1 ${action.color}`}>
                    <Link href={action.href}>
                        <action.icon className="h-8 w-8"/>
                        <span>{action.label}</span>
                    </Link>
                </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
