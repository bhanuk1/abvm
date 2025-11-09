'use client';
import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { type Photo } from '@/lib/school-data';
import { ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';


export default function PhotoGalleryPage() {
    const firestore = useFirestore();
    const photosQuery = useMemoFirebase(() => 
        firestore 
            ? query(collection(firestore, 'photos'), orderBy('createdAt', 'desc'))
            : null,
        [firestore]
    );
    const { data: photos, isLoading } = useCollection<Photo>(photosQuery);

    return (
        <div className="container mx-auto p-4 lg:p-6">
            <div className="flex items-center gap-4 mb-8">
                <ImageIcon className="h-10 w-10 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold">Photo Gallery</h1>
                    <p className="text-muted-foreground">View photos from our school events and activities.</p>
                </div>
            </div>

            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <div className="w-full aspect-square bg-muted rounded-t-lg"></div>
                            <CardHeader>
                                <div className="h-6 w-3/4 bg-muted rounded"></div>
                                <div className="h-4 w-1/2 bg-muted rounded mt-2"></div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}

            {!isLoading && photos && photos.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {photos.map(photo => (
                        <Dialog key={photo.id}>
                            <DialogTrigger asChild>
                                <Card className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group">
                                    <div className="relative w-full aspect-square">
                                        <Image
                                            src={photo.imageUrl}
                                            alt={photo.title}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-105"
                                            data-ai-hint="school event"
                                        />
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="truncate">{photo.title}</CardTitle>
                                        <CardDescription>
                                            {photo.createdAt ? format(photo.createdAt.toDate(), 'PPP') : ''}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </DialogTrigger>
                             <DialogContent className="max-w-4xl p-0">
                                <DialogHeader className="p-4 border-b">
                                    <DialogTitle>{photo.title}</DialogTitle>
                                </DialogHeader>
                                <div className="p-4">
                                     <div className="relative w-full aspect-video">
                                        <Image src={photo.imageUrl} alt={photo.title} fill className="object-contain" />
                                     </div>
                                     <p className="text-muted-foreground mt-4">{photo.description}</p>
                                </div>
                            </DialogContent>
                        </Dialog>
                    ))}
                </div>
            ) : !isLoading && (
                 <div className="text-center py-16">
                    <ImageIcon className="mx-auto h-16 w-16 text-muted-foreground"/>
                    <h2 className="mt-4 text-xl font-semibold">The Gallery is Empty</h2>
                    <p className="mt-2 text-muted-foreground">Check back later for photos of school events.</p>
                </div>
            )}
        </div>
    );
}
