import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { School, User, Users, Building } from 'lucide-react';

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
    icon: User,
    color: 'bg-blue-100 text-blue-600',
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
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            {/* Quick actions content will go here */}
            <p>No quick actions available.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
