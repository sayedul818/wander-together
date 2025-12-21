"use client";

import { Video, Image as ImageIcon, Smile } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Props {
  currentUser?: { name?: string; avatar?: string } | null;
  onOpen: () => void;
}

export default function PostComposerBar({ currentUser, onOpen }: Props) {
  return (
    <div className="card-surface p-3 md:p-4 flex items-center gap-3">
      <Avatar className="h-9 w-9 md:h-10 md:w-10">
        <AvatarImage src={currentUser?.avatar || ''} />
        <AvatarFallback>{currentUser?.name?.slice(0,2)?.toUpperCase() || 'U'}</AvatarFallback>
      </Avatar>
      <button
        onClick={onOpen}
        className="flex-1 rounded-full bg-muted px-4 py-2 text-left text-sm text-muted-foreground hover:bg-muted/80"
      >
        What's on your mind{currentUser?.name ? `, ${currentUser.name}?` : '?'}
      </button>
      <div className="flex items-center gap-2">
        <button onClick={onOpen} className="rounded-md p-2 hover:bg-muted" title="Live video">
          <Video className="h-4 w-4 text-red-500" />
        </button>
        <button onClick={onOpen} className="rounded-md p-2 hover:bg-muted" title="Photo/Video">
          <ImageIcon className="h-4 w-4 text-emerald-500" />
        </button>
        <button onClick={onOpen} className="rounded-md p-2 hover:bg-muted" title="Feeling/Activity">
          <Smile className="h-4 w-4 text-yellow-500" />
        </button>
      </div>
    </div>
  );
}
