'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import Link from 'next/link';

interface SuggestionUser {
  _id: string;
  name: string;
  avatar?: string;
  location?: string;
  interests?: string[];
}

export default function SuggestionsPage() {
  const [users, setUsers] = useState<SuggestionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/users/suggestions?limit=20`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const toggleFollow = async (id: string) => {
    try {
      setBusy(id);
      const res = await fetch(`/api/users/${id}/follow`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.following ? 'Following' : 'Unfollowed');
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
    <div className="min-h-screen bg-background">
      <div className="section-shell">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">Who to Follow</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover travelers and connect with the community. Follow users to see their posts in your feed.
          </p>
        </motion.div>

        {/* Suggestions Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-surface p-6">
                <div className="h-32 rounded-md bg-muted/40 animate-pulse mb-4" />
                <div className="h-4 w-3/4 rounded bg-muted/40 animate-pulse mb-2" />
                <div className="h-3 w-1/2 rounded bg-muted/40 animate-pulse" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-foreground text-lg mb-2">No suggestions available</p>
            <p className="text-muted-foreground">Check back later for more travelers to connect with.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user, idx) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-surface p-6 hover:shadow-lg transition"
              >
                <Link href={`/profile/${user._id}`} className="block mb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.avatar || ''} />
                      <AvatarFallback className="text-xl">{user.name?.slice(0,2)?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground truncate">{user.name}</h3>
                      {user.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">{user.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>

                {user.interests && user.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {user.interests.slice(0, 3).map((interest) => (
                      <span key={interest} className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-200 px-2 py-1 rounded text-xs">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}

                <Button 
                  className="w-full gradient-sunset text-white"
                  disabled={busy === user._id}
                  onClick={() => toggleFollow(user._id)}
                >
                  {busy === user._id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Following...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
