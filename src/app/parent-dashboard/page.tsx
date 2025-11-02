'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, BarChart } from 'lucide-react';


const stats = [
  {
    title: 'मेरे बच्चे',
    value: '1',
    icon: Users,
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    title: 'औसत उपस्थिति',
    value: '94%',
    icon: BarChart,
    color: 'bg-green-100 text-green-600',
  },
];


export default function ParentDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">डैशबोर्ड</h1>
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
          <CardTitle>त्वरित कार्य</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            <p>कोई त्वरित कार्य उपलब्ध नहीं है।</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
