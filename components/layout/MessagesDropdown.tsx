'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface Conversation {
  user: {
    _id: string;
    name: string;
    avatar?: string;
    email: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export function MessagesDropdown() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        
        // Calculate total unread
        const total = (data.conversations || []).reduce(
          (sum: number, conv: Conversation) => sum + conv.unreadCount,
          0
        );
        setUnreadCount(total);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount only
  useEffect(() => {
    fetchConversations();
  }, []);

  const truncateMessage = (text: string, maxLength: number = 40) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <MessageCircle className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 bg-card text-card-foreground border-border">
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Messages</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} unread</Badge>
            )}
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto bg-card">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No messages yet</p>
              <p className="text-xs mt-1">Start chatting with travelers!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {conversations.map((conversation) => (
                <Link
                  key={conversation.user._id}
                  href={`/messages?userId=${conversation.user._id}&userName=${encodeURIComponent(conversation.user.name)}${conversation.user.avatar ? `&userAvatar=${encodeURIComponent(conversation.user.avatar)}` : ''}`}
                  className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {conversation.user.avatar ? (
                    <Image
                      src={conversation.user.avatar}
                      alt={conversation.user.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {conversation.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-foreground text-sm truncate">
                        {conversation.user.name}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs h-5 min-w-5 flex items-center justify-center">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm ${conversation.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'} truncate`}>
                      {truncateMessage(conversation.lastMessage)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(conversation.lastMessageTime).toLocaleDateString() === new Date().toLocaleDateString()
                        ? new Date(conversation.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : new Date(conversation.lastMessageTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {conversations.length > 0 && (
          <div className="p-3 border-t border-border">
            <Link href="/messages" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full text-sm">
                View All Messages
              </Button>
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
