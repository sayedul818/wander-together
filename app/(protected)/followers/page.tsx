'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, MapPin } from 'lucide-react';

interface FollowerUser {
  _id: string;
  name: string;
  avatar?: string;
  location?: string;
  reviewCount?: number;
  rating?: number;
}

export default function FollowersPage() {
  const [users, setUsers] = useState<FollowerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingId, setFollowingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/users/followers');
        if (res.ok) {
          const data = await res.json();
          setUsers(data.followers || []);
        } else {
          toast.error('Failed to load followers list');
        }
      } catch {
        toast.error('Error loading followers');
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, []);

  const handleFollow = async (userId: string) => {
    try {
      setFollowingId(userId);
      const res = await fetch(`/api/users/${userId}/follow`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.following ? 'Following' : 'Unfollowed');
        if (data.following) {
          // Update button state
          setUsers(prev =>
            prev.map(u => (u._id === userId ? { ...u, isFollowed: true } : u))
          );
        }
      } else {
        toast.error('Failed to follow');
      }
    } catch {
      toast.error('Error following user');
    } finally {
      setFollowingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Followers</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Users who are following you</p>
        </div>

        {users.length === 0 ? (
          <Card className="p-6 sm:p-8 text-center">
          <p className="text-sm sm:text-base text-muted-foreground">No followers yet</p>
          <Link href="/suggestions">
            <Button variant="outline" size="sm" className="mt-4">
              Find people to follow
            </Button>
          </Link>
        </Card>
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
            <Card key={user._id} className="p-3 sm:p-4 hover:shadow-lg transition-shadow">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-2 sm:gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                      <AvatarImage src={user.avatar || ''} />
                      <AvatarFallback>{user.name?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${user._id}`}>
                        <h3 className="font-semibold text-sm sm:text-base hover:text-primary truncate">{user.name}</h3>
                      </Link>
                      {user.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{user.location}</span>
                        </p>
                      )}
                      {user.rating && (
                        <p className="text-xs text-yellow-500">⭐ {user.rating.toFixed(1)}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/profile/${user._id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                      Profile
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    onClick={() => handleFollow(user._id)}
                    disabled={followingId === user._id}
                    className="text-xs sm:text-sm"
                  >
                    {followingId === user._id ? '...' : 'Follow'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
