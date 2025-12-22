'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Settings, Edit3, Upload, MapPin, Compass,
  Award, Heart, MessageCircle, Share2, Loader2, MoreVertical,
  Pencil, Trash2, Flag, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import PostDetailModal from '@/components/PostDetailModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  location?: string;
  interests?: string[];
  rating?: number;
  followers?: any[];
  following?: any[];
}

interface Post {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
    location?: string;
  };
  content: string;
  postType?: 'text' | 'image' | 'video' | 'memory';
  images?: string[];
  videoUrl?: string;
  location?: string;
  tripId?: {
    _id: string;
    title: string;
    destination: string;
  };
  reactions?: Array<{ userId: any; type: string; createdAt?: string }>;
  comments?: Array<{ _id: string; userId: any; content: string; createdAt: string }>;
  privacy?: string;
  createdAt: string;
}

const INTERESTS = [
  'Adventure', 'Beach', 'Culture', 'Food', 'History', 'Nature',
  'Photography', 'Hiking', 'Shopping', 'Art', 'Music', 'Sports',
  'Backpacking', 'Luxury', 'Solo Travel', 'Group Tours'
];

export default function MyProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'photos' | 'about'>('posts');
  const [isUploading, setIsUploading] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [selectedPostModal, setSelectedPostModal] = useState<any>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showReactorsModal, setShowReactorsModal] = useState<string | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    interests: [] as string[]
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const sessionData = await res.json();
          const userRes = await fetch(`/api/users/${sessionData.user.id}`);
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData.user);
            setFormData({
              name: userData.user.name || '',
              bio: userData.user.bio || '',
              location: userData.user.location || '',
              interests: userData.user.interests || []
            });

            // Fetch user posts
            const postsRes = await fetch(`/api/users/${userData.user._id}/posts`);
            if (postsRes.ok) {
              const postsData = await postsRes.json();
              setPosts(postsData.posts || []);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Reaction types and helpers
  const reactionTypes = [
    { type: 'like', label: 'Like', emoji: '👍', color: 'text-blue-500' },
    { type: 'love', label: 'Love', emoji: '❤️', color: 'text-red-500' },
    { type: 'care', label: 'Care', emoji: '🥰', color: 'text-amber-500' },
    { type: 'haha', label: 'Haha', emoji: '😂', color: 'text-yellow-500' },
    { type: 'wow', label: 'Wow', emoji: '😮', color: 'text-yellow-500' },
    { type: 'sad', label: 'Sad', emoji: '😢', color: 'text-blue-400' },
    { type: 'angry', label: 'Angry', emoji: '😡', color: 'text-orange-600' },
  ];

  const getReactionSummary = (reactions: Array<{ type: string }>) => {
    const counts: Record<string, number> = {};
    reactions.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => ({ type }));
  };

  const getTruncatedText = (text: string, postId: string) => {
    if (!text) return '';
    const words = text.split(' ');
    if (expandedPosts[postId] || words.length <= 60) return text;
    return words.slice(0, 60).join(' ') + '...';
  };

  const togglePostExpansion = (postId: string) => {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
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
    } catch (e) {
      toast.error('Failed to update post');
    }
  };

  const deletePost = async (postId: string) => {
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
    try {
      const res = await fetch(`/api/posts/${postId}/report`, { method: 'POST' });
      if (res.ok) toast.success('Reported');
    } catch {}
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    try {
      const post = posts.find((p) => p._id === postId);
      if (!post) return;
      const currentUserId = user?._id?.toString?.() || (user as any)?.id || user?._id;
      const existing = post.reactions?.find((r: any) => (r.userId?._id || r.userId)?.toString() === (currentUserId as string));

      if (existing) {
        if (existing.type === reactionType) {
          setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, reactions: p.reactions?.filter((r: any) => (r.userId?._id || r.userId)?.toString() !== (currentUserId as string)) } : p));
        } else {
          setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, reactions: p.reactions?.map((r: any) => (r.userId?._id || r.userId)?.toString() === (currentUserId as string) ? { ...r, type: reactionType } : r) } : p));
        }
      } else {
        setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, reactions: [ ...(p.reactions || []), { userId: user, type: reactionType, createdAt: new Date().toISOString() } ] } : p));
      }

      const res = await fetch(`/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType })
      });
      if (res.ok) {
        const updated = await res.json();
        setPosts((prev) => prev.map((p) => (p._id === postId ? updated : p)));
      }
    } catch {
      toast.error('Failed to react');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsEditing(false);
        toast.success('Profile updated');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleImageUpload = async (
    file: File,
    uploadType: 'avatar' | 'coverPhoto'
  ) => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', uploadType === 'avatar' ? 'avatars' : 'covers');

      const uploadRes = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const uploadData = await uploadRes.json();

      if (!uploadData.url) {
        throw new Error('No URL returned from upload');
      }

      // Update user profile with new image
      const updateRes = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [uploadType]: uploadData.url,
        }),
      });

      if (!updateRes.ok) {
        const errorData = await updateRes.json();
        throw new Error(errorData.error || 'Update failed');
      }

      const data = await updateRes.json();
      setUser(data.user);
      toast.success(`${uploadType === 'avatar' ? 'Avatar' : 'Cover'} updated`);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, 'avatar');
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, 'coverPhoto');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Profile not found</p>
          <Button onClick={() => router.push('/dashboard')}>Back to dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Photo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-64 md:h-80 bg-gradient-to-br from-secondary via-purple-400 to-coral relative overflow-hidden group"
      >
        {user.coverPhoto && (
          <Image
            src={user.coverPhoto}
            alt="Cover"
            fill
            className="object-cover"
          />
        )}
        {isEditing && (
          <>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
              disabled={isUploading}
            />
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 bg-black/40 hover:bg-black/50 transition flex items-center justify-center opacity-0 group-hover:opacity-100"
            >
              {isUploading ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Upload className="h-6 w-6 text-white" />
              )}
            </button>
          </>
        )}
      </motion.div>

      {/* Profile Header */}
      <div className="page-shell relative -mt-20 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface p-6 flex flex-col md:flex-row gap-6 items-start md:items-end justify-between"
        >
          <div className="flex gap-6 items-end flex-1">
            {/* Avatar */}
            <div className="flex-shrink-0 -mt-8">
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-background bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden group relative">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={160}
                    height={160}
                    className="object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
                {isEditing && (
                  <>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute inset-0 bg-black/40 hover:bg-black/50 transition flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                      {isUploading ? (
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      ) : (
                        <Upload className="h-6 w-6 text-white" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Info */}
            {!isEditing ? (
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {user.name}
                </h1>
                {user.bio && (
                  <p className="text-muted-foreground mb-3 max-w-lg">{user.bio}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {user.location}
                    </div>
                  )}
                  {user.rating && (
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      {user.rating.toFixed(1)} rating
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSaveProfile}
                  className="gradient-sunset text-white"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-surface p-4 text-center"
          >
            <p className="text-2xl font-bold text-gradient-sunset">{posts.length}</p>
            <p className="text-sm text-muted-foreground">Posts</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-surface p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <Link href="/followers" className="block">
              <p className="text-2xl font-bold text-gradient-sunset">
                {user.followers?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-surface p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <Link href="/following" className="block">
              <p className="text-2xl font-bold text-gradient-sunset">
                {user.following?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Following</p>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Followers/Following Buttons */}
      <div className="page-shell mb-8">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link href="/followers" className="flex-1 min-w-[120px]">
            <Button variant="outline" className="w-full">
              View Followers
            </Button>
          </Link>
          <Link href="/following" className="flex-1 min-w-[120px]">
            <Button variant="outline" className="w-full">
              View Following
            </Button>
          </Link>
        </div>
      </div>

      {/* Interests Section */}
      {isEditing ? (
        <div className="page-shell mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-surface p-6"
          >
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Compass className="h-5 w-5 text-secondary" />
              Travel Interests
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      interests: formData.interests.includes(interest)
                        ? formData.interests.filter((i) => i !== interest)
                        : [...formData.interests, interest]
                    });
                  }}
                  className={`px-4 py-2 rounded-lg border transition ${
                    formData.interests.includes(interest)
                      ? 'border-secondary bg-secondary/10 text-secondary font-semibold'
                      : 'border-border text-muted-foreground hover:border-secondary'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      ) : user.interests && user.interests.length > 0 ? (
        <div className="page-shell mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-surface p-6"
          >
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Compass className="h-5 w-5 text-secondary" />
              Travel Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest) => (
                <Badge key={interest} className="bg-secondary/10 text-secondary">
                  {interest}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="page-shell mb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-1 border-b border-border"
        >
          {['posts', 'photos', 'about'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 font-semibold border-b-2 transition ${
                activeTab === tab
                  ? 'text-secondary border-secondary'
                  : 'text-muted-foreground border-transparent hover:border-border'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Content */}
      <div className="page-shell max-w-2xl mx-auto mb-12">
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="card-surface p-12 text-center">
                <p className="text-muted-foreground">No posts yet. Start sharing your travel stories!</p>
                <Button className="mt-4 gradient-sunset text-white" asChild>
                  <Link href="/feed">Go to Feed</Link>
                </Button>
              </div>
            ) : (
              posts.map((post, i) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-surface overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="p-4 md:p-6 border-b border-border/60">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.userId?.avatar || user?.avatar} alt={post.userId?.name || user?.name} />
                          <AvatarFallback>{(post.userId?.name || user?.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{post.userId?.name || user?.name || 'Unknown User'}</h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-accent rounded-full transition-colors">
                            <MoreVertical className="h-5 w-5 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => startEditPost(post)} className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" />
                            <span>Edit Post</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deletePost(post._id)} className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Post</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => reportPost(post._id)} className="flex items-center gap-2">
                            <Flag className="h-4 w-4" />
                            <span>Report Post</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-4 md:p-6">
                    {editingPostId === post._id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full min-h-[100px] p-3 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="What's on your mind?"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingPostId(null);
                              setEditContent('');
                            }}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveEditPost(post._id)}
                            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-foreground whitespace-pre-wrap mb-4">
                          {expandedPosts[post._id] ? post.content : getTruncatedText(post.content, post._id)}
                        </p>
                        {post.content.length > 300 && (
                          <button
                            onClick={() => togglePostExpansion(post._id)}
                            className="text-primary hover:underline text-sm font-medium mb-4"
                          >
                            {expandedPosts[post._id] ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </>
                    )}

                    {post.images && post.images.length > 0 && (
                      <div className="mt-4 -mx-4 md:-mx-6">
                        <img
                          src={post.images[0]}
                          alt="Post image"
                          className="w-full max-h-[600px] object-cover cursor-pointer"
                          onClick={() => setSelectedPostModal(post)}
                        />
                        {post.images && post.images.length > 1 && (
                          <div className="grid grid-cols-2 gap-1 mt-1 px-4 md:px-6">
                            {post.images.slice(1, 5).map((img, idx) => (
                              <div
                                key={idx}
                                className="relative h-48 overflow-hidden cursor-pointer"
                                onClick={() => setSelectedPostModal(post)}
                              >
                                <img src={img} alt={`Post image ${idx + 2}`} className="w-full h-full object-cover" />
                                {idx === 3 && post.images && post.images.length > 5 && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <span className="text-white text-2xl font-bold">+{post.images.length - 5}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {post.videoUrl && (
                      <div className="mt-4 -mx-4 md:-mx-6">
                        <video controls className="w-full max-h-[600px]">
                          <source src={post.videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>

                  {/* Engagement Stats */}
                  <div className="px-4 md:px-6 pb-3 flex items-center justify-between text-sm text-muted-foreground border-b border-border/60">
                    <div className="flex items-center gap-2">
                      {post.reactions && post.reactions.length > 0 && (
                        <>
                          <div className="flex -space-x-1">
                            {Array.from(new Set(post.reactions.map(r => r.type))).slice(0, 3).map((type) => {
                              const reaction = reactionTypes.find(r => r.type === type);
                              return reaction ? (
                                <span
                                  key={type}
                                  className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs"
                                  style={{ backgroundColor: reaction.color }}
                                >
                                  {reaction.emoji}
                                </span>
                              ) : null;
                            })}
                          </div>
                          <button
                            onClick={() => setShowReactorsModal(post._id)}
                            className="hover:underline"
                          >
                            {post.reactions.length}
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {post.comments && post.comments.length > 0 && (
                        <button
                          onClick={() => setSelectedPostModal(post)}
                          className="hover:underline"
                        >
                          {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                        </button>
                      )}
                    </div>
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
                          className="bg-background rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-4 border-b border-border flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Reactions</h3>
                            <button
                              onClick={() => setShowReactorsModal(null)}
                              className="p-2 hover:bg-accent rounded-full transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
                            {post.reactions && post.reactions.map((reaction, idx) => {
                              const reactionType = reactionTypes.find(r => r.type === reaction.type);
                              return (
                                <div key={idx} className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={reaction.userId?.avatar} alt={reaction.userId?.name} />
                                      <AvatarFallback>{(reaction.userId?.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{reaction.userId?.name || 'Unknown User'}</span>
                                  </div>
                                  {reactionType && (
                                    <span className="text-2xl">{reactionType.emoji}</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Engagement Buttons */}
                  <div className="p-3 md:p-4 flex items-center gap-2">
                    <div className="relative flex-1">
                      <button
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg hover:bg-accent transition-colors group"
                        onMouseEnter={() => setShowReactionPicker(post._id)}
                        onMouseLeave={() => setShowReactionPicker(null)}
                        onClick={() => handleReaction(post._id, 'like')}
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            post.reactions?.some(r => r.userId?._id === user?._id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-muted-foreground group-hover:text-foreground'
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            post.reactions?.some(r => r.userId?._id === user?._id)
                              ? 'text-red-500'
                              : 'text-muted-foreground group-hover:text-foreground'
                          }`}
                        >
                          {post.reactions?.some(r => r.userId?._id === user?._id)
                            ? reactionTypes.find(r => r.type === post.reactions?.find(r => r.userId?._id === user?._id)?.type)?.label || 'Like'
                            : 'Like'}
                        </span>
                      </button>

                      <AnimatePresence>
                        {showReactionPicker === post._id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-background border border-border rounded-full shadow-lg p-2 flex gap-1 z-10"
                            onMouseEnter={() => setShowReactionPicker(post._id)}
                            onMouseLeave={() => setShowReactionPicker(null)}
                          >
                            {reactionTypes.map((reaction) => (
                              <button
                                key={reaction.type}
                                onClick={() => {
                                  handleReaction(post._id, reaction.type);
                                  setShowReactionPicker(null);
                                }}
                                className="hover:scale-125 transition-transform p-1 text-2xl"
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
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg hover:bg-accent transition-colors group"
                    >
                      <MessageCircle className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Comment</span>
                    </button>

                    <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg hover:bg-accent transition-colors group">
                      <Share2 className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Share</span>
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'photos' && (
          <div>
            {posts.filter((p) => p.images && p.images.length > 0).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {posts
                  .filter((p): p is Post & { images: string[] } => !!(p.images && p.images.length > 0))
                  .flatMap((p) => p.images.map((img) => ({ img })))
                  .map(({ img }, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative h-48 rounded-lg overflow-hidden"
                    >
                      <img
                        src={img}
                        alt={`Photo ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No photos yet
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="card-surface p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Email</h3>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            {user.rating && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Rating</h3>
                <p className="text-muted-foreground">{user.rating.toFixed(1)} stars</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      <PostDetailModal
        post={selectedPostModal}
        isOpen={!!selectedPostModal}
        onClose={() => setSelectedPostModal(null)}
        currentUser={user}
        onCommentAdded={(updatedPost) => {
          setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
          setSelectedPostModal(updatedPost);
        }}
      />
    </div>
  );
}
