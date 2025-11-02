import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { User, Building } from 'lucide-react';

const stats = [
  {
    title: 'मेरी कक्षाएं',
    value: '3',
    icon: Building,
    color: 'bg-pink-100 text-pink-600'
  },
  {
    title: 'कुल छात्र',
    value: '85',
    icon: User,
    color: 'bg-blue-100 text-blue-600'
  },
];


export default function TeacherDashboardPage() {
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
              <div className='text-right'>
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <p className="text-2xl font-bold">{stat.value}</p>
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
