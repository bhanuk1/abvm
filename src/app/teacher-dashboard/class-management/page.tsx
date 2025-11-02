import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function TeacherClassManagementPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">कक्षा प्रबंधन</h1>
      <Card>
        <CardHeader>
          <CardTitle>मेरी कक्षाएं</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            <p>कक्षा प्रबंधन की सुविधा जल्द ही उपलब्ध होगी।</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
