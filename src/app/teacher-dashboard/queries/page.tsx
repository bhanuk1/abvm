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
import { collection, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';
import { format } from 'date-fns';
import { type Message } from '@/lib/school-data';

export default function TeacherQueriesPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  
  const teacherDocRef = useMemoFirebase(() => currentUser ? doc(firestore, 'users', currentUser.uid) : null, [firestore, currentUser]);
  const { data: teacherData } = useDoc<any>(teacherDocRef);
  
  const teacherClasses = React.useMemo(() => {
    if (!teacherData?.classSubject) return [];
    const classSubjectPairs = teacherData.classSubject.split(',');
    return [...new Set(classSubjectPairs.map((pair: string) => pair.split('-')[0].trim()))];
  }, [teacherData]);

  const messagesQuery = useMemoFirebase(() => 
    firestore && teacherClasses.length > 0
      ? query(collection(firestore, 'messages'), where('class', 'in', teacherClasses))
      : null, 
    [firestore, teacherClasses]
  );
  const { data: messages, isLoading } = useCollection<Message>(messagesQuery);
  
  const [selectedMessage, setSelectedMessage] = React.useState<Message | null>(null);
  const [replyText, setReplyText] = React.useState('');
  
  const handleReplyClick = (message: Message) => {
    setSelectedMessage(message);
    setReplyText('');
  };
  
  const handleSendReply = async () => {
    if (!replyText || !selectedMessage || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please write a reply before sending.',
      });
      return;
    }

    const messageDocRef = doc(firestore, 'messages', selectedMessage.id);
    const updatedData = {
      reply: replyText,
      status: 'Answered' as const,
      repliedAt: serverTimestamp(),
    };

    try {
        await updateDoc(messageDocRef, updatedData);
        toast({ title: 'Success!', description: 'Your reply has been sent.' });
        setSelectedMessage(null);
        setReplyText('');
    } catch(e) {
        const contextualError = new FirestorePermissionError({
            path: messageDocRef.path,
            operation: 'update',
            requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', contextualError);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not send your reply.' });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Parent Queries</h1>

      <Card>
        <CardHeader>
          <CardTitle>Conversation History</CardTitle>
          <CardDescription>Review and respond to questions from parents.</CardDescription>
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
                            <p className="text-sm text-muted-foreground">From: {message.parentName} (Parent of {message.studentName})</p>
                        </div>
                        <Badge variant={message.status === 'Answered' ? 'default' : 'secondary'} className={message.status === 'Answered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{message.status}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <p className="font-semibold mb-1">Parent's Question:</p>
                            <p className="text-muted-foreground">{message.query}</p>
                            <p className="text-xs text-muted-foreground mt-2">Asked on {message.createdAt ? format(message.createdAt.toDate(), 'PPP') : ''}</p>
                        </div>
                        {message.status === 'Answered' && message.reply && (
                           <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                             <p className="font-semibold mb-1">Your Reply:</p>
                             <p className="text-muted-foreground">{message.reply}</p>
                             <p className="text-xs text-muted-foreground mt-2">Replied on {message.repliedAt ? format(message.repliedAt.toDate(), 'PPP') : ''}</p>
                           </div>
                        )}
                         {message.status === 'Pending' && (
                           <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                             <Button onClick={() => handleReplyClick(message)}>Reply</Button>
                           </div>
                        )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : !isLoading && (
            <div className="text-center py-10">
                <p className="text-muted-foreground">No queries found for your classes.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {selectedMessage?.parentName}</DialogTitle>
            <CardDescription className="pt-2">Query: "{selectedMessage?.subject}"</CardDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border text-sm">
                <p className="font-semibold mb-1">Original Question:</p>
                <p className="text-muted-foreground">{selectedMessage?.query}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea id="reply" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your reply here..." rows={5}/>
              </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMessage(null)}>Cancel</Button>
            <Button onClick={handleSendReply}><Send className="mr-2"/> Send Reply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    