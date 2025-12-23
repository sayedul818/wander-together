"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Plus, Loader2 } from 'lucide-react';
import { StoriesSkeleton } from '@/components/skeletons/FeedSidebarSkeletons';
import StoryCreateModal from './StoryCreateModal';
import StoryViewerModal from './StoryViewerModal';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface StoryGroup {
  userId: { _id: string; name: string; avatar?: string };
  items: Array<any>;
}

export default function StoriesCarousel() {
  const [stories, setStories] = useState<StoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [flatStories, setFlatStories] = useState<any[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const loadStories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/stories');
      if (!res.ok) return;
      const data = await res.json();
      setStories(data.stories || []);
    } catch (err) {
      console.error('Stories fetch failed', err);
      toast.error('Could not load stories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user || data);
        }
      } catch {}
    };
    fetchMe();
  }, []);

  useEffect(() => {
    // flatten ordered for viewer
    const flattened = stories.flatMap((group) => group.items.map((s: any) => ({ ...s, userId: group.userId })));
    setFlatStories(flattened);
  }, [stories]);

  const handleOpenViewer = (id: string) => {
    const idx = flatStories.findIndex((s) => s._id === id);
    if (idx >= 0) {
      setStartIndex(idx);
      setViewerOpen(true);
    }
  };

  const handleCreated = (story: any) => {
    setStories((prev) => {
      const copy = [...prev];
      const userIdx = copy.findIndex((g) => g.userId._id === story.userId._id || g.userId === story.userId);
      if (userIdx >= 0) {
        const user = copy[userIdx].userId._id ? copy[userIdx].userId : story.userId;
        const items = [{ ...story, userId: user }, ...copy[userIdx].items];
        copy[userIdx] = { userId: user, items };
      } else {
        copy.unshift({ userId: story.userId, items: [story] });
      }
      return copy;
    });
  };

  const handleDeleted = (id: string) => {
    setStories((prev) =>
      prev
        .map((group) => ({
          ...group,
          items: group.items.filter((s) => s._id !== id),
        }))
        .filter((g) => g.items.length > 0)
    );
  };

  const cards = useMemo(() => stories.slice(0, 12), [stories]);

  return (
    <div className="mb-6 card-surface">
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">Stories</div>
        <Button size="sm" variant="ghost" className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Create
        </Button>
      </div>

      <div className="relative overflow-x-auto no-scrollbar px-4 py-4">
        <div className="flex gap-3">
          <button
            onClick={() => setCreateOpen(true)}
            className="group relative flex h-28 w-24 sm:h-32 sm:w-28 md:h-36 md:w-32 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border/60 bg-muted text-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md shrink-0"
          >
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-card shadow">
              <Plus className="h-5 w-5" />
            </div>
            <span className="mt-2 text-xs font-semibold">Add Story</span>
          </button>

          {isLoading && <StoriesSkeleton count={6} />}

          {!isLoading &&
            cards.map((group) => {
              const first = group.items[0];
              return (
                <div
                  key={first._id}
                  className="group relative h-28 w-24 sm:h-32 sm:w-28 md:h-36 md:w-32 shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-slate-900 text-white shadow-md transition hover:-translate-y-1 hover:shadow-lg"
                  onClick={() => handleOpenViewer(first._id)}
                >
                  <Image src={first.image} alt={group.userId.name} fill className="object-cover" sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                  <div className="absolute left-2 top-2">
                    <Avatar className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 ring-2 ring-white">
                      <AvatarImage src={group.userId.avatar} />
                      <AvatarFallback>{group.userId.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 text-xs font-semibold drop-shadow">{group.userId.name}</div>
                </div>
              );
            })}
        </div>
      </div>

      <StoryCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
        currentUser={currentUser}
      />

      <StoryViewerModal
        open={viewerOpen}
        stories={flatStories}
        startIndex={startIndex}
        onClose={() => setViewerOpen(false)}
        onDeleted={handleDeleted}
        currentUserId={currentUser?._id || currentUser?.userId}
      />
    </div>
  );
}
