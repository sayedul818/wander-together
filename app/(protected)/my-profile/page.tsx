'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LogOut, Settings, Edit3, Upload, MapPin, Compass,
  Award, Heart, MessageCircle, Share2, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

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
  content: string;
  images?: string[];
  createdAt: string;
  reactions?: any[];
  comments?: any[];
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
            className="card-surface p-4 text-center"
          >
            <p className="text-2xl font-bold text-gradient-sunset">
              {user.followers?.length || 0}
            </p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-surface p-4 text-center"
          >
            <p className="text-2xl font-bold text-gradient-sunset">
              {user.following?.length || 0}
            </p>
            <p className="text-sm text-muted-foreground">Following</p>
          </motion.div>
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
                  className="card-surface p-6"
                >
                  <p className="text-foreground mb-3">{post.content}</p>
                  {post.images && post.images.length > 0 && (
                    <div className="-mx-6 mb-4">
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
                  <p className="text-xs text-muted-foreground mb-3">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
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
                  .filter((p) => p.images && p.images.length > 0)
                  .flatMap((p) => p.images?.map((img) => ({ img })) || [])
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
    </div>
  );
}
