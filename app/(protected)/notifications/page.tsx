'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Heart, MessageCircle, UserPlus, Check, CheckCheck,
  Loader2, Settings, Trash2, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { toast } from 'sonner';

interface Notification {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  type: 'like' | 'comment' | 'follow' | 'message';
  message: string;
  postId?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [settings, setSettings] = useState({
    reactions: true,
    comments: true,
    follows: true,
    messages: true,
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/notifications?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (!confirm('Are you sure you want to clear all notifications?')) return;
    try {
      const res = await fetch('/api/notifications/clear', {
        method: 'DELETE',
      });
      if (res.ok) {
        setNotifications([]);
        toast.success('All notifications cleared');
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-orange-500" />;
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return then.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="page-shell py-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              {notifications.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark all read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllNotifications}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </motion.div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="card-surface p-4 mb-6 overflow-hidden"
              >
                <h3 className="font-semibold mb-4">Notification Preferences</h3>
                <div className="space-y-3">
                  {[
                    { key: 'reactions', label: 'Reactions on your posts', icon: Heart },
                    { key: 'comments', label: 'Comments and replies', icon: MessageCircle },
                    { key: 'follows', label: 'New followers', icon: UserPlus },
                    { key: 'messages', label: 'New messages', icon: Bell },
                  ].map((setting) => (
                    <label
                      key={setting.key}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <setting.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{setting.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings[setting.key as keyof typeof settings]}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            [setting.key]: e.target.checked,
                          }))
                        }
                        className="w-5 h-5 rounded border-border accent-orange-500"
                      />
                    </label>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="mt-4 gradient-sunset text-white"
                  onClick={() => {
                    toast.success('Settings saved');
                    setShowSettings(false);
                  }}
                >
                  Save Preferences
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'gradient-sunset text-white' : ''}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
              className={filter === 'unread' ? 'gradient-sunset text-white' : ''}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {unreadCount}
                </span>
              )}
            </Button>
          </div>

          {/* Notifications List */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-secondary" />
              </div>
            ) : notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card-surface p-12 text-center"
              >
                <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="text-lg font-medium text-foreground">No notifications</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {filter === 'unread'
                    ? "You're all caught up!"
                    : 'When someone interacts with your posts, you\'ll see it here.'}
                </p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {notifications.map((notification, i) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.03 }}
                    className={`card-surface p-4 flex items-start gap-3 transition-colors ${
                      !notification.read ? 'bg-orange-50/50 dark:bg-orange-500/5' : ''
                    }`}
                  >
                    {/* Sender Avatar */}
                    <Link href={`/profile/${notification.senderId?._id}`}>
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage
                          src={notification.senderId?.avatar}
                          alt={notification.senderId?.name || 'User'}
                        />
                        <AvatarFallback>
                          {notification.senderId?.name?.slice(0, 2)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 rounded-full bg-muted">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <Link
                              href={`/profile/${notification.senderId?._id}`}
                              className="font-semibold hover:underline"
                            >
                              {notification.senderId?.name || 'Someone'}
                            </Link>{' '}
                            <span className="text-muted-foreground">
                              {notification.message}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* View Post Link */}
                      {notification.postId && (
                        <Link
                          href={`/feed#post-${notification.postId}`}
                          className="inline-block mt-2 text-xs text-secondary hover:underline"
                        >
                          View post →
                        </Link>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification._id)}
                          className="text-muted-foreground hover:text-green-500"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification._id)}
                        className="text-muted-foreground hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-2" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
