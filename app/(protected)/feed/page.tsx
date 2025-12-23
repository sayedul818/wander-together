'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, Loader2, MoreVertical,
  Image as ImageIcon, Video, MapPin, Calendar, Sparkles, Pencil, Trash2, Flag,
  ThumbsUp, Smile, PartyPopper, Plane, Frown, Angry, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostSkeleton, PostSkeletonList } from '@/components/skeletons/PostSkeleton';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import PostDetailModal from '@/components/PostDetailModal';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface Post {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
    location?: string;
  };
  content: string;
  postType: 'text' | 'image' | 'video' | 'memory';
  images?: string[];
  videoUrl?: string;
  location?: string;
  tripId?: {
    _id: string;
    title: string;
    destination: string;
  };
  reactions?: Array<{ userId: string; type: string }>;
  comments?: Array<{ _id: string; userId: any; content: string; createdAt: string }>;
  privacy: string;
  createdAt: string;
}

import LeftSidebar from '@/components/layout/LeftSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import PostComposerBar from '@/components/PostComposerBar';
import PostCreateModal from '@/components/PostCreateModal';
import StoriesCarousel from '@/components/StoriesCarousel';

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const latestPageRef = useRef(1);
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [tripId, setTripId] = useState<string>('');
  const [myTrips, setMyTrips] = useState<Array<{ _id: string; title: string; destination: string }>>([]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [openCommentsFor, setOpenCommentsFor] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showReactorsModal, setShowReactorsModal] = useState<string | null>(null);
  const [selectedPostModal, setSelectedPostModal] = useState<any>(null);
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const observerTarget = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  
  // Pull to refresh states
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const pullThreshold = 80;
  const maxPullDistance = 120;


  // Reaction types with emojis and colors
  const reactionTypes = [
    { type: 'like', label: 'Like', emoji: '👍', color: 'text-blue-500' },
    { type: 'love', label: 'Love', emoji: '❤️', color: 'text-red-500' },
    { type: 'care', label: 'Care', emoji: '🥰', color: 'text-amber-500' },
    { type: 'haha', label: 'Haha', emoji: '😂', color: 'text-yellow-500' },
    { type: 'wow', label: 'Wow', emoji: '😮', color: 'text-yellow-500' },
    { type: 'sad', label: 'Sad', emoji: '😢', color: 'text-blue-400' },
    { type: 'angry', label: 'Angry', emoji: '😡', color: 'text-orange-600' },
  ];

  const fetchPosts = useCallback(async (pageNum: number) => {
    latestPageRef.current = pageNum;
    try {
      setIsLoading(true);
      // Default to Following feed for logged-in users
      const res = await fetch(`/api/posts?scope=following&page=${pageNum}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        // Only update posts if this is the latest requested page
        if (latestPageRef.current === pageNum) {
          if (pageNum === 1) {
            setPosts(data.posts);
          } else {
            setPosts((prev) => [...prev, ...data.posts]);
          }
          setHasMore(pageNum < data.pages);
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      setIsPullRefreshing(true);
      await fetchPosts(1);
      setPage(1);
      toast.success('Feed refreshed!');
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsPullRefreshing(false);
      setPullDistance(0);
    }
  }, [fetchPosts]);

  // Touch event handlers for pull to refresh
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY === 0 || isPullRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;
    
    // Only activate pull-to-refresh if scrolled to top and pulling down significantly
    if (distance > 10 && window.scrollY === 0) {
      e.preventDefault();
      // Apply resistance for smoother feel
      const resistanceFactor = 0.5;
      setPullDistance(Math.min(distance * resistanceFactor, maxPullDistance));
    }
  }, [startY, isPullRefreshing, maxPullDistance]);

  const handleTouchEnd = useCallback(() => {
    // Only refresh if pulled past threshold
    if (pullDistance >= pullThreshold && !isPullRefreshing) {
      handleRefresh();
    } else {
      // Smoothly reset if not past threshold
      setPullDistance(0);
    }
    setStartY(0);
  }, [pullDistance, pullThreshold, isPullRefreshing, handleRefresh]);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Fetch current user for composer avatar
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch {}
    };
    fetchMe();
  }, []);

  // Fetch trips for tagging
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const s = await fetch('/api/auth/session');
        if (!s.ok) return;
        const session = await s.json();
        const uid = session?.userId || session?.user?.id;
        if (!uid) return;
        const res = await fetch(`/api/travel-plans?participant=${uid}&limit=50`);
        if (res.ok) {
          const data = await res.json();
          const plans = (data.plans || []).map((p: any) => ({ _id: p._id, title: p.title, destination: p.destination }));
          setMyTrips(plans);
        }
      } catch {}
    };
    fetchTrips();
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page);
    }
  }, [page, fetchPosts]);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && previews.length === 0 && !videoPreview) return;

    try {
      setIsPosting(true);

      // Upload selected files first
      let images: string[] = [];
      let videoUrl: string | undefined;
      if (files.length > 0) {
        for (const f of files) {
          const fd = new FormData();
          fd.append('file', f);
          const resUp = await fetch('/api/upload/cloudinary', { method: 'POST', body: fd });
          if (resUp.ok) {
            const dataUp = await resUp.json();
            if (dataUp.resourceType === 'image') {
              images.push(dataUp.url);
            } else if (dataUp.resourceType === 'video') {
              videoUrl = dataUp.url;
            }
          }
        }
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postContent,
          postType: videoUrl ? 'video' : images.length > 0 ? 'image' : 'text',
          images,
          videoUrl,
          tripId: tripId || undefined,
          privacy: 'public'
        })
      });

      if (res.ok) {
        const newPost = await res.json();
        setPosts((prev) => [newPost, ...prev]);
        setPostContent('');
        setFiles([]);
        setPreviews([]);
        setVideoPreview(null);
        setTripId('');
        toast.success('Post published');
      }
    } catch (error) {
      console.error('Error posting:', error);
      toast.error('Failed to publish post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    try {
      const post = posts.find((p) => p._id === postId);
      if (!post) return;
      
      const currentUserId = currentUser?._id?.toString?.() || currentUser?.id || currentUser?._id;
      const existingReaction = post.reactions?.find((r: any) => (r.userId?._id || r.userId)?.toString() === (currentUserId as string));

      // Optimistically update local state before sending to server
      if (existingReaction) {
        if (existingReaction.type === reactionType) {
          // Remove reaction
          setPosts((prev) =>
            prev.map((p) =>
              p._id === postId
                ? { ...p, reactions: p.reactions?.filter((r: any) => (r.userId?._id || r.userId)?.toString() !== (currentUserId as string)) }
                : p
            )
          );
        } else {
          // Update reaction type
          setPosts((prev) =>
            prev.map((p) =>
              p._id === postId
                ? {
                    ...p,
                    reactions: p.reactions?.map((r: any) =>
                      (r.userId?._id || r.userId)?.toString() === (currentUserId as string)
                        ? { ...r, type: reactionType }
                        : r
                    ),
                  }
                : p
            )
          );
        }
      } else {
        // Add new reaction
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? {
                  ...p,
                  reactions: [
                    ...(p.reactions || []),
                    { userId: currentUser, type: reactionType, createdAt: new Date().toISOString() },
                  ],
                }
              : p
          )
        );
      }

      const res = await fetch(`/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType })
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? updatedPost : p))
        );
      }
    } catch (error) {
      console.error('Error reacting:', error);
      toast.error('Failed to react');
    }
  };

  const onPickFiles = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const onFilesSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = Array.from(e.target.files || []);
    setFiles(f);
    const imageUrls: string[] = [];
    let videoUrlLocal: string | null = null;
    f.forEach((file) => {
      const url = URL.createObjectURL(file);
      if (file.type.startsWith('image/')) imageUrls.push(url);
      else if (file.type.startsWith('video/')) videoUrlLocal = url;
    });
    setPreviews(imageUrls);
    setVideoPreview(videoUrlLocal);
  };

  const startEditPost = (post: Post) => {
    setEditingPostId(post._id);
    setEditContent(post.content);
  };

  const saveEditPost = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent })
      });
      if (res.ok) {
        const updated = await res.json();
        setPosts((prev) => prev.map((p) => (p._id === postId ? updated : p)));
        setEditingPostId(null);
        setEditContent('');
        toast.success('Post updated');
      }
    } catch {
      toast.error('Failed to update post');
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        toast.success('Post deleted');
      }
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const reportPost = async (postId: string) => {
    const reason = prompt('Reason for report (e.g., spam, harassment)');
    if (!reason) return;
    const details = prompt('Additional details (optional)') || '';
    try {
      const res = await fetch(`/api/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, details })
      });
      if (res.ok) toast.success('Report submitted');
    } catch {
      toast.error('Failed to submit report');
    }
  };

  const toggleComments = (postId: string) => {
    setOpenCommentsFor((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const submitComment = async (postId: string) => {
    const content = newComment[postId]?.trim();
    if (!content) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPosts((prev) => prev.map((p) => (p._id === postId ? updatedPost : p)));
        setNewComment((prev) => ({ ...prev, [postId]: '' }));
        toast.success('Comment added');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const submitReply = async (postId: string, commentId: string) => {
    const content = replyInputs[commentId]?.trim();
    if (!content) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPosts((prev) => prev.map((p) => (p._id === postId ? updatedPost : p)));
        setReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
        toast.success('Reply added');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to add reply');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    }
  };

  // Helper to get reaction summary (top 3 reaction types with counts)
  const getReactionSummary = (reactions: any[] = []) => {
    const counts: Record<string, number> = {};
    reactions.forEach((r: any) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));
  };

  // Helper to truncate text if more than 20 words
  const getTruncatedText = (text: string, postId: string) => {
    const words = text.split(' ');
    if (words.length <= 20) return text;
    
    if (expandedPosts[postId]) return text;
    
    return words.slice(0, 20).join(' ') + '...';
  };

  const togglePostExpansion = (postId: string) => {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <div 
      className="min-h-screen bg-background"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: pullDistance > 0 ? 1 : 0, 
          y: pullDistance > 0 ? Math.min(pullDistance - 20, 60) : -20 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="bg-card border border-border shadow-lg rounded-full p-3 mt-4">
          <motion.div
            animate={{ rotate: isPullRefreshing ? 360 : pullDistance * 4 }}
            transition={{ 
              duration: isPullRefreshing ? 1 : 0,
              repeat: isPullRefreshing ? Infinity : 0,
              ease: 'linear'
            }}
          >
            <Loader2 
              className={`h-5 w-5 ${pullDistance >= pullThreshold ? 'text-primary' : 'text-muted-foreground'}`}
            />
          </motion.div>
        </div>
      </motion.div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px] gap-6">
          <div className="hidden lg:block">
            <LeftSidebar />
          </div>
          <div className="space-y-6">
          {/* Post Composer (new) */}
          <PostComposerBar currentUser={currentUser} onOpen={() => setShowPostModal(true)} />

          <StoriesCarousel />

          {/* Feed */}
          <div className="space-y-4">
            {posts.length === 0 && !isLoading && (
              <div className="card-surface p-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Start following travelers to see their posts!</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/explore">Explore Travelers</Link>
                </Button>
              </div>
            )}

            {posts.map((post, i) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-surface overflow-hidden"
              >
                {/* Post Header */}
                <div className="p-4 md:p-6 border-b border-border/60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                      <Link href={`/profile/${post.userId._id}`}>
                        <Avatar className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0">
                          <AvatarImage src={post.userId.avatar || ''} alt={post.userId.name} />
                          <AvatarFallback>{post.userId.name?.slice(0,2)?.toUpperCase() || 'TB'}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${post.userId._id}`}>
                          <p className="font-semibold text-foreground hover:underline text-sm md:text-base truncate">
                            {post.userId.name}
                          </p>
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {new Date(post.createdAt).toLocaleDateString()}
                          {post.location && ` • ${post.location}`}
                          {post.tripId && ` • ${post.tripId.destination}`}
                        </p>
                      </div>
                    </div>
                    {/* Only show dropdown if user owns post or is admin */}
                    {(currentUser?._id === post.userId._id || currentUser?.role === 'admin') && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {editingPostId === post._id ? (
                            <DropdownMenuItem onClick={() => saveEditPost(post._id)}>
                              <Pencil className="h-4 w-4 mr-2" /> Save
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => startEditPost(post)}>
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => deletePost(post._id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => reportPost(post._id)}>
                            <Flag className="h-4 w-4 mr-2" /> Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    {/* Report option for non-owners */}
                    {currentUser?._id !== post.userId._id && currentUser?.role !== 'admin' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => reportPost(post._id)}>
                            <Flag className="h-4 w-4 mr-2" /> Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4 md:p-6">
                  {editingPostId === post._id ? (
                    <div className="space-y-2">
                      <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} className="text-sm" />
                      <div className="flex gap-2 flex-col-reverse sm:flex-row">
                        <Button onClick={() => saveEditPost(post._id)} size="sm" className="gradient-sunset text-white w-full sm:w-auto">Save</Button>
                        <Button onClick={() => { setEditingPostId(null); setEditContent(''); }} variant="outline" size="sm" className="w-full sm:w-auto">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-foreground whitespace-pre-wrap text-sm md:text-base">
                        {getTruncatedText(post.content, post._id)}
                      </p>
                      {post.content && post.content.split(' ').length > 20 && (
                        <button
                          onClick={() => togglePostExpansion(post._id)}
                          className="text-secondary hover:underline text-sm font-medium mt-1"
                        >
                          {expandedPosts[post._id] ? 'See less' : 'See more'}
                        </button>
                      )}
                    </div>
                  )}
                  {post.images && post.images.length > 0 && (
                    <div className="mt-4 -mx-6">
                      <img
                        src={post.images[0]}
                        alt="Post image"
                        className="w-full max-h-[70vh] object-cover"
                      />
                      {post.images.length > 1 && (
                        <div className="grid grid-cols-2 gap-2 p-6">
                          {post.images.slice(1).map((img, idx) => (
                            <div key={idx} className="relative h-40 rounded-md overflow-hidden">
                              <img src={img} alt={`Post image ${idx + 2}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {post.videoUrl && (
                    <div className="mt-4 relative rounded-lg overflow-hidden">
                      <video src={post.videoUrl} controls className="w-full" />
                    </div>
                  )}
                </div>

                {/* Engagement Stats */}
                <div className="px-4 md:px-6 py-2 border-y border-border/60 flex items-center justify-between text-xs md:text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {post.reactions && post.reactions.length > 0 && (
                      <>
                        {/* Top 3 Reactions (emoji) */}
                        <div className="flex -space-x-1">
                          {getReactionSummary(post.reactions).map(({ type }) => {
                            const reactionConfig = reactionTypes.find(rt => rt.type === type);
                            if (!reactionConfig) return null;
                            return (
                              <div
                                key={type}
                                className={`${reactionConfig.color} bg-card border border-border rounded-full px-2 py-1 text-[11px] leading-none`}
                                title={reactionConfig.label}
                              >
                                {reactionConfig.emoji}
                              </div>
                            );
                          })}
                        </div>
                        {/* Reaction Count - Clickable */}
                        <button 
                          onClick={() => setShowReactorsModal(post._id)}
                          className="hover:underline hover:text-foreground"
                        >
                          {post.reactions.length}
                        </button>
                      </>
                    )}
                  </div>
                  {post.comments && post.comments.length > 0 && (
                    <button 
                      onClick={() => setSelectedPostModal(post)}
                      className="hover:text-foreground hover:underline"
                    >
                      {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                    </button>
                  )}
                </div>

                {/* Reactors Modal */}
                <AnimatePresence>
                  {showReactorsModal === post._id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                      onClick={() => setShowReactorsModal(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="card-surface max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
                      >
                        <div className="p-4 border-b border-border flex items-center justify-between">
                          <h3 className="font-semibold text-lg">Reactions</h3>
                          <button 
                            onClick={() => setShowReactorsModal(null)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="overflow-y-auto p-4 space-y-3">
                          {post.reactions?.map((reaction: any, idx: number) => {
                            const reactionConfig = reactionTypes.find(rt => rt.type === reaction.type);
                            const currentUserId = currentUser?._id?.toString?.() || currentUser?.id || currentUser?._id;
                            const isOwnReaction = (reaction.userId?._id || reaction.userId)?.toString() === (currentUserId as string);
                            
                            return (
                              <div key={idx} className="flex items-center gap-3 group">
                                <Link href={`/profile/${reaction.userId?._id || reaction.userId}`}>
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={reaction.userId?.avatar} alt={reaction.userId?.name || 'User'} />
                                    <AvatarFallback>{reaction.userId?.name?.slice(0,2)?.toUpperCase() || 'U'}</AvatarFallback>
                                  </Avatar>
                                </Link>
                                <div className="flex-1">
                                  <Link href={`/profile/${reaction.userId?._id || reaction.userId}`}>
                                    <p className="font-medium hover:underline">
                                      {reaction.userId?.name || 'Unknown User'}
                                    </p>
                                  </Link>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={`${reactionConfig?.color || 'text-muted-foreground'} text-lg`}>
                                    {reactionConfig?.emoji || '👍'}
                                  </div>
                                  {isOwnReaction && (
                                    <button
                                      onClick={() => handleReaction(post._id, reaction.type)}
                                      className="rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition"
                                      title="Remove your reaction"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Engagement Buttons */}
                <div className="p-3 md:p-4 flex gap-1 md:gap-2">
                  {/* Reaction Button with Picker */}
                  <div 
                    className="flex-1 relative"
                    onMouseEnter={() => setShowReactionPicker(post._id)}
                    onMouseLeave={() => setShowReactionPicker(null)}
                  >
                    {(() => {
                      const currentUserId = currentUser?._id?.toString?.() || currentUser?.id || currentUser?._id;
                      const userReaction = post.reactions?.find((r: any) => (r.userId?._id || r.userId)?.toString() === (currentUserId as string));
                      const reactionConfig = userReaction 
                        ? reactionTypes.find(rt => rt.type === userReaction.type)
                        : null;
                      
                      return (
                        <button
                          onClick={() => handleReaction(post._id, 'like')}
                          className={`w-full flex items-center justify-center gap-1 md:gap-2 hover:bg-secondary/10 rounded-lg py-2 transition text-xs md:text-sm ${
                            userReaction ? reactionConfig?.color : 'text-muted-foreground hover:text-secondary'
                          }`}
                        >
                          <span className="text-base">
                            {reactionConfig?.emoji || '👍'}
                          </span>
                          <span className="hidden sm:inline">
                            {reactionConfig?.label || 'Like'}
                          </span>
                        </button>
                      );
                    })()}
                    
                    {/* Reaction Picker */}
                    <AnimatePresence>
                      {showReactionPicker === post._id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card border border-border rounded-full shadow-lg px-2 py-2 flex gap-1 z-50"
                        >
                          {reactionTypes.map((reaction) => (
                            <button
                              key={reaction.type}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReaction(post._id, reaction.type);
                                setShowReactionPicker(null);
                              }}
                              className={`p-2 rounded-full hover:scale-125 transition-transform ${reaction.color} hover:bg-secondary/20 text-lg`}
                              title={reaction.label}
                            >
                              {reaction.emoji}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <button
                    onClick={() => setSelectedPostModal(post)}
                    className="flex-1 flex items-center justify-center gap-1 md:gap-2 text-muted-foreground hover:text-secondary hover:bg-secondary/10 rounded-lg py-2 transition text-xs md:text-sm"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Comment</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 md:gap-2 text-muted-foreground hover:text-secondary hover:bg-secondary/10 rounded-lg py-2 transition text-xs md:text-sm">
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <div className="py-8">
                <PostSkeletonList count={3} />
              </div>
            )}

            <div ref={observerTarget} className="h-4" />
          </div>
          </div>
          <div className="hidden xl:block">
            <RightSidebar />
          </div>
        </div>
      </div>

      {/* Post Detail Modal */}
      <PostDetailModal
        post={selectedPostModal}
        isOpen={!!selectedPostModal}
        onClose={() => setSelectedPostModal(null)}
        currentUser={currentUser}
        onCommentAdded={(updatedPost) => {
          setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
          setSelectedPostModal(updatedPost);
        }}
      />

      {/* Create Post Modal */}
      <PostCreateModal
        open={showPostModal}
        onClose={() => setShowPostModal(false)}
        currentUser={currentUser}
        onCreated={(newPost) => setPosts((prev) => [newPost, ...prev])}
      />
    </div>
  );
}
