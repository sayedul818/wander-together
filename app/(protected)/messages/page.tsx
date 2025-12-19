'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Search, Menu, X, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

interface Message {
  _id: string;
  sender: { _id: string; name: string; avatar?: string };
  recipient: { _id: string; name: string; avatar?: string };
  content: string;
  read: boolean;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

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

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams?.get('userId');

  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState<{_id: string; name: string; email: string; avatar?: string} | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedUser = conversations.find(conv => conv.user._id === userId)?.user || selectedUserData;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        setFilteredConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Filter conversations
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = conversations.filter(conv =>
        conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const fetchMessages = async (silent = false) => {
    if (!userId) return;
    try {
      if (!silent) setIsLoading(true);
      const res = await fetch(`/api/messages?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        // Refresh conversations to update unread count
        if (!silent) fetchConversations();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (!silent) toast.error('Failed to load messages');
    } finally {
      if (!silent) setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    // Initial load with loading indicator
    fetchMessages(false);

    // Set up polling for real-time message updates (every 2 seconds) - silent mode
    const pollInterval = setInterval(() => {
      fetchMessages(true);
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [userId]);

  // Fetch user details when userId is provided via URL params
  useEffect(() => {
    if (!userId) {
      setSelectedUserData(null);
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedUserData(data.user);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !userId) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: userId,
          content: newMessage
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        // Polling will handle refresh, just update conversations immediately
        fetchConversations();
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('An error occurred');
    } finally {
      setIsSending(false);
    }
  };

  const handleConversationClick = (convUserId: string) => {
    router.push(`/messages?userId=${convUserId}`);
    setIsSidebarOpen(false);
  };

  if (!userId) {
    return (
      <div className="fixed inset-0 top-16 bg-background pt-10 pb-10">
        <div className="page-shell h-full flex">
          {/* Sidebar */}
          <div className="w-full lg:w-80 xl:w-96 border-r border-border bg-card flex-shrink-0 rounded-l-xl overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-border">
                <h2 className="text-xl font-bold text-foreground mb-4">Messages</h2>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {isLoadingConversations ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm mb-4">
                      {searchQuery ? 'No conversations found' : 'No messages yet'}
                    </p>
                    <Link href="/explore">
                      <Button className="gradient-sunset text-white text-sm">Browse Trips</Button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    {/* Show selected user from URL params if not in conversations */}
                    {userId && selectedUserData && !conversations.some(c => c.user._id === userId) && (
                      <button
                        key={selectedUserData._id}
                        onClick={() => handleConversationClick(selectedUserData._id)}
                        className="w-full flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border/50 bg-muted/70"
                      >
                        <div className="relative flex-shrink-0">
                          {selectedUserData.avatar ? (
                            <Image
                              src={selectedUserData.avatar}
                              alt={selectedUserData.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center text-white font-bold">
                              {selectedUserData.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-semibold text-foreground truncate">
                            {selectedUserData.name}
                          </p>
                          <p className="text-sm truncate text-muted-foreground">
                            New conversation
                          </p>
                        </div>
                      </button>
                    )}
                    {filteredConversations.map((conversation) => (
                      <button
                        key={conversation.user._id}
                        onClick={() => handleConversationClick(conversation.user._id)}
                        className="w-full flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border/50"
                      >
                        <div className="relative flex-shrink-0">
                          {conversation.user.avatar ? (
                            <Image
                              src={conversation.user.avatar}
                              alt={conversation.user.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center text-white font-bold">
                              {conversation.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <p className="font-semibold text-foreground truncate">
                              {conversation.user.name}
                            </p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(conversation.lastMessageTime).toLocaleDateString() === new Date().toLocaleDateString()
                                ? new Date(conversation.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : new Date(conversation.lastMessageTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="flex-1 hidden lg:flex items-center justify-center text-center p-8 bg-muted/20 rounded-r-xl">
            <div>
              <MessageCircle className="h-20 w-20 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-16 bg-background pt-10 pb-10">
      <div className="page-shell h-full flex">
        {/* Sidebar - Hidden on mobile when chat is open */}
        <div className={`${userId ? 'hidden' : 'flex'} lg:flex w-full lg:w-80 xl:w-96 border-r border-border bg-card flex-shrink-0 rounded-l-xl overflow-hidden`}>
          <div className="flex flex-col h-full w-full">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">Messages</h2>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm mb-4">
                    {searchQuery ? 'No conversations found' : 'No messages yet'}
                  </p>
                  <Link href="/explore">
                    <Button className="gradient-sunset text-white text-sm">Browse Trips</Button>
                  </Link>
                </div>
              ) : (
                <div>
                  {filteredConversations.map((conversation) => {
                    const isSelected = conversation.user._id === userId;
                    return (
                      <button
                        key={conversation.user._id}
                        onClick={() => handleConversationClick(conversation.user._id)}
                        className={`w-full flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border/50 ${
                          isSelected ? 'bg-muted/70' : ''
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          {conversation.user.avatar ? (
                            <Image
                              src={conversation.user.avatar}
                              alt={conversation.user.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center text-white font-bold">
                              {conversation.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {conversation.unreadCount > 0 && !isSelected && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <p className="font-semibold text-foreground truncate">
                              {conversation.user.name}
                            </p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(conversation.lastMessageTime).toLocaleDateString() === new Date().toLocaleDateString()
                                ? new Date(conversation.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : new Date(conversation.lastMessageTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className={`text-sm truncate ${conversation.unreadCount > 0 && !isSelected ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area - Shows when user is selected */}
        {userId && selectedUser && (
          <div className="flex-1 flex flex-col bg-background rounded-r-xl overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
              {/* Back button for mobile */}
              <button
                onClick={() => router.push('/messages')}
                className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {selectedUser.avatar ? (
                <Image
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center text-white font-bold">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-foreground truncate">{selectedUser.name}</h2>
                <p className="text-sm text-muted-foreground truncate">{selectedUser.email}</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = msg.sender._id === user?.id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-orange-100' : 'text-muted-foreground'
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-4 bg-card">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 min-h-[60px] max-h-32 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="gradient-sunset text-white self-end"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Empty State for desktop when no conversation selected */}
        {!userId && (
          <div className="flex-1 hidden lg:flex items-center justify-center text-center p-8 bg-muted/20 rounded-r-xl">
            <div>
              <MessageCircle className="h-20 w-20 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
