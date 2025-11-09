'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Send, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { type Message } from '@/lib/school-data';

export default function ParentQueriesPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => currentUser ? doc(firestore, 'users', currentUser.uid) : null, [firestore, currentUser]);
  const { data: parentData } = useDoc<any>(userDocRef);

  const studentDocRef = useMemoFirebase(() => parentData?.studentId ? doc(firestore, 'users', parentData.studentId) : null, [firestore, parentData]);
  const { data: studentData } = useDoc<any>(studentDocRef);

  const messagesQuery = useMemoFirebase(() => 
    currentUser 
      ? query(collection(firestore, 'messages'), where('parentId', '==', currentUser.uid))
      : null, 
    [firestore, currentUser]
  );
  const { data: messages, isLoading } = useCollection<Message>(messagesQuery);
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [subject, setSubject] = React.useState('');
  const [queryText, setQueryText] = React.useState('');
  
  const handleSendQuery = async () => {
    if (!subject || !queryText || !currentUser || !studentData || !parentData) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all fields.',
      });
      return;
    }

    const messagesCol = collection(firestore, 'messages');
    const newMessage = {
      parentId: currentUser.uid,
      parentName: parentData.username,
      studentId: studentData.id,
      studentName: studentData.username,
      subject,
      query: queryText,
      status: 'Pending' as const,
      createdAt: serverTimestamp(),
    };

    try {
        await addDoc(messagesCol, newMessage);
        toast({ title: 'Success!', description: 'Your query has been sent.' });
        setIsDialogOpen(false);
        setSubject('');
        setQueryText('');
    } catch(e) {
        const contextualError = new FirestorePermissionError({
            operation: 'create',
            path: messagesCol.path,
            requestResourceData: newMessage,
        });
        errorEmitter.emit('permission-error', contextualError);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not send your query.' });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Queries</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2"/> Ask a New Question</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ask a new question</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Regarding upcoming exam"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="query">Your Question</Label>
                    <Textarea id="query" value={queryText} onChange={(e) => setQueryText(e.target.value)} placeholder="Please type your question here..." rows={5}/>
                </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSendQuery}><Send className="mr-2"/> Send Query</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Conversation History</CardTitle>
          <CardDescription>View your past questions and the school's replies.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading queries...</p>}
          {!isLoading && messages && messages.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {messages.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis()).map(message => (
                <AccordionItem value={message.id} key={message.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full items-center pr-4">
                        <div className="text-left">
                            <p className="font-semibold">{message.subject}</p>
                            <p className="text-sm text-muted-foreground">{message.createdAt ? format(message.createdAt.toDate(), 'PPP') : ''}</p>
                        </div>
                        <Badge variant={message.status === 'Answered' ? 'default' : 'secondary'} className={message.status === 'Answered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{message.status}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <p className="font-semibold mb-1">Your Question:</p>
                            <p className="text-muted-foreground">{message.query}</p>
                        </div>
                        {message.status === 'Answered' && message.reply && (
                           <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                             <p className="font-semibold mb-1">School's Reply:</p>
                             <p className="text-muted-foreground">{message.reply}</p>
                             <p className="text-xs text-muted-foreground mt-2">Replied on {message.repliedAt ? format(message.repliedAt.toDate(), 'PPP') : ''}</p>
                           </div>
                        )}
                         {message.status === 'Pending' && (
                           <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                             <p className="text-muted-foreground">Awaiting a reply from the school.</p>
                           </div>
                        )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : !isLoading && (
            <div className="text-center py-10">
                <p className="text-muted-foreground">You haven't asked any questions yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    