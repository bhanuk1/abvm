import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notices, type Notice } from '@/lib/placeholder-data';
import { format } from 'date-fns';

function getBadgeVariant(role: Notice['role']) {
  switch (role) {
    case 'Teachers':
      return 'default';
    case 'Students':
      return 'secondary';
    case 'Parents':
      return 'outline';
    default:
      return 'destructive';
  }
}

export default function NoticeBoardPage() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {notices.map((notice) => (
          <Card key={notice.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg leading-snug">{notice.title}</CardTitle>
                <Badge variant={getBadgeVariant(notice.role)} className="ml-2 shrink-0">{notice.role}</Badge>
              </div>
              <CardDescription>{format(new Date(notice.date), 'MMMM d, yyyy')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground line-clamp-4">{notice.content}</p>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">By: {notice.author}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
