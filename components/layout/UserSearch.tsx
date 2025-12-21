"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

interface UserResult {
  _id: string;
  name: string;
  avatar?: string;
  location?: string;
  interests?: string[];
}

export function UserSearch({ className }: { className?: string }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    // Debounce
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(async () => {
      try {
        setLoading(true);
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        const res = await fetch(`/api/search/users?q=${encodeURIComponent(q)}` , {
          signal: abortRef.current.signal,
        });
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setResults(data.users || []);
        setOpen(true);
      } catch (err) {
        // swallow
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, [q]);

  const clear = () => {
    setQ('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div className={cn('relative w-64', className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search travelers..."
            className="pl-8"
            onFocus={() => q && setOpen(true)}
          />
          {q && (
            <button
              aria-label="Clear"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={clear}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-40 mt-2 w-full rounded-xl border border-border bg-card shadow-xl">
          <ul className="max-h-72 overflow-auto py-2">
            {results.map((u) => (
              <li key={u._id}>
                <Link
                  href={`/profile/${u._id}`}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={u.avatar || ''} alt={u.name} />
                    <AvatarFallback>{u.name?.slice(0,2)?.toUpperCase() || 'TB'}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{u.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {u.location || (u.interests && u.interests.join(', ')) || 'Traveler'}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {open && !loading && results.length === 0 && q && (
        <div className="absolute z-40 mt-2 w-full rounded-xl border border-border bg-card shadow-xl p-3 text-sm text-muted-foreground">
          No travelers found.
        </div>
      )}
    </div>
  );
}
