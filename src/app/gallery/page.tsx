'use client';
import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { type Video } from '@/lib/school-data';
import { Film } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

function VideoPlayer({ videoUrl }: { videoUrl: string }) {
    // Basic URL check to handle YouTube and other direct links
    const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    
    if (isYoutube) {
        // Extract video ID from YouTube URL
        const videoId = videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop();
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        return (
            <iframe
                className="w-full aspect-video"
                src={embedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        );
    }

    // Assume direct video link for other cases
    return (
        <video className="w-full aspect-video" controls>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    );
}


export default function GalleryPage() {
    const firestore = useFirestore();
    const videosQuery = useMemoFirebase(() => 
        firestore 
            ? query(collection(firestore, 'videos'), orderBy('createdAt', 'desc'))
            : null,
        [firestore]
    );
    const { data: videos, isLoading } = useCollection<Video>(videosQuery);

    return (
        <div className="container mx-auto p-4 lg:p-6">
            <div className="flex items-center gap-4 mb-8">
                <Film className="h-10 w-10 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold">Video Gallery</h1>
                    <p className="text-muted-foreground">Watch the latest videos from our school events and classes.</p>
                </div>
            </div>

            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <div className="w-full aspect-video bg-muted rounded-t-lg"></div>
                            <CardHeader>
                                <div className="h-6 w-3/4 bg-muted rounded"></div>
                                <div className="h-4 w-1/2 bg-muted rounded mt-2"></div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}

            {!isLoading && videos && videos.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {videos.map(video => (
                        <Dialog key={video.id}>
                            <DialogTrigger asChild>
                                <Card className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group">
                                    <div className="relative w-full aspect-video">
                                        <Image
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-105"
                                            data-ai-hint="video thumbnail"
                                        />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <Film className="h-12 w-12 text-white/80"/>
                                        </div>
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="truncate">{video.title}</CardTitle>
                                        <CardDescription>
                                            Uploaded on {video.createdAt ? format(video.createdAt.toDate(), 'PPP') : ''}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </DialogTrigger>
                             <DialogContent className="max-w-4xl p-0">
                                <DialogHeader className="p-4 border-b">
                                    <DialogTitle>{video.title}</DialogTitle>
                                </DialogHeader>
                                <div className="p-4">
                                     <VideoPlayer videoUrl={video.videoUrl} />
                                     <p className="text-muted-foreground mt-4">{video.description}</p>
                                </div>
                            </DialogContent>
                        </Dialog>
                    ))}
                </div>
            ) : !isLoading && (
                 <div className="text-center py-16">
                    <Film className="mx-auto h-16 w-16 text-muted-foreground"/>
                    <h2 className="mt-4 text-xl font-semibold">The Gallery is Empty</h2>
                    <p className="mt-2 text-muted-foreground">Check back later for school videos and event recordings.</p>
                </div>
            )}
        </div>
    );
}
