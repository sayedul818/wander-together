"use client";

import { useEffect, useRef, useState } from 'react';
import { Bell, Loader2, Heart, MessageCircle, UserPlus, Share2, AtSign } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

interface NotificationItem {
  _id: string;
  type: 'like' | 'comment' | 'follow' | 'share' | 'mention';
  senderId: { _id: string; name: string; avatar?: string };
  postId?: string;
  read: boolean;
  createdAt: string;
  message?: string;
}

export function NotificationsDropdown() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const lastIdsRef = useRef<string[]>([]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      const unread = data.notifications || [];

      // Toast any truly new IDs
      const newIds = unread.map((n: NotificationItem) => n._id).filter((id: string) => !lastIdsRef.current.includes(id));
      if (newIds.length > 0) {
        unread
          .filter((n: NotificationItem) => newIds.includes(n._id))
          .forEach((n: NotificationItem) => {
            const senderName = n.senderId?.name || 'Someone';
            const verb = n.type === 'like' ? 'liked your post' :
                         n.type === 'comment' ? 'commented on your post' :
                         n.type === 'follow' ? 'started following you' :
                         n.type === 'share' ? 'shared your post' :
                         'mentioned you';
            toast(`${senderName} ${verb}`);
          });
      }
      lastIdsRef.current = unread.map((n: NotificationItem) => n._id);
      setItems(unread);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const t = setInterval(fetchNotifications, 30000);
    return () => clearInterval(t);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      setItems([]);
    } catch {}
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-3 w-3 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-3 w-3 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-3 w-3 text-green-500" />;
      case 'share':
        return <Share2 className="h-3 w-3 text-purple-500" />;
      case 'mention':
        return <AtSign className="h-3 w-3 text-orange-500" />;
      default:
        return <Bell className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return then.toLocaleDateString();
  };

  const count = items.length;

  return (
    <DropdownMenu open={open} onOpenChange={(v) => {
      setOpen(v);
      if (v) markAllRead();
    }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
              {count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[320px]">
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-sm font-medium">Notifications</span>
          {count > 0 && (
            <span className="text-xs text-muted-foreground">{count} new</span>
          )}
        </div>
        <DropdownMenuSeparator />
        {loading && (
          <div className="px-3 py-6 flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="px-3 py-8 text-center">
            <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
          </div>
        )}
        {!loading && items.length > 0 && (
          <div className="max-h-80 overflow-auto">
            {items.map((n) => (
              <DropdownMenuItem key={n._id} asChild className="py-3">
                <Link 
                  href={n.postId ? `/feed#post-${n.postId}` : `/profile/${n.senderId?._id}`} 
                  className="flex items-start gap-3"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={n.senderId?.avatar} alt={n.senderId?.name || 'User'} />
                      <AvatarFallback className="text-xs">
                        {n.senderId?.name?.slice(0, 2)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-background border">
                      {getNotificationIcon(n.type)}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm leading-snug">
                      <span className="font-semibold">{n.senderId?.name || 'Someone'}</span>{' '}
                      <span className="text-muted-foreground">
                        {n.message || (
                          n.type === 'like' ? 'liked your post' :
                          n.type === 'comment' ? 'commented on your post' :
                          n.type === 'follow' ? 'started following you' :
                          n.type === 'share' ? 'shared your post' :
                          'mentioned you'
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {getTimeAgo(n.createdAt)}
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="w-full text-center justify-center text-secondary font-medium">
            See all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
