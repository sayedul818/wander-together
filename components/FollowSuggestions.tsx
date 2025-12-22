"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface SuggestionUser {
  _id: string;
  name: string;
  avatar?: string;
  location?: string;
  interests?: string[];
}

export default function FollowSuggestions({ title = 'Who to follow', titleHref, limit = 6, dense = false }: { title?: string; titleHref?: string; limit?: number; dense?: boolean }) {
  const [users, setUsers] = useState<SuggestionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/users/suggestions?limit=${limit}`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [limit]);

  const toggleFollow = async (id: string) => {
    try {
      setBusy(id);
      const res = await fetch(`/api/users/${id}/follow`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.following ? 'Following' : 'Unfollowed');
        // If followed, optionally remove from list in sidebar to reduce clutter
        setUsers(prev => prev.filter(u => u._id !== id));
      } else {
        const e = await res.json().catch(() => ({}));
        toast.error(e.error || 'Failed to follow');
      }
    } catch {
      toast.error('Failed to follow');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="bg-card border border-border rounded-lg p-3">
      <h3 className="font-semibold mb-2 text-sm">
        {titleHref ? (
          <Link href={titleHref} className="hover:text-primary transition-colors">
            {title}
          </Link>
        ) : (
          title
        )}
      </h3>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: Math.min(3, limit) }).map((_, i) => (
            <div key={i} className="h-10 rounded-md bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-xs text-muted-foreground">No suggestions right now.</p>
      ) : (
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u._id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={u.avatar || ''} />
                  <AvatarFallback>{u.name?.slice(0,2)?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  {u.location && <p className="text-xs text-muted-foreground truncate">{u.location}</p>}
                </div>
              </div>
              <Button size="sm" variant="outline" className="shrink-0" disabled={busy === u._id} onClick={() => toggleFollow(u._id)}>
                {busy === u._id ? '...' : 'Follow'}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
