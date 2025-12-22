'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Heart, MessageCircle, Share2, UserPlus, UserCheck,
  Loader2, Image as ImageIcon, Compass, Award,
  ThumbsUp, Send, Calendar, Users, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
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

interface Trip {
  _id: string;
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  image?: string;
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
  maxParticipants: number;
  currentParticipants: number;
  interests: string[];
}

export default function ProfilePage() {
  const params = useParams();
  const userId = (params?.userId as string) || '';
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'photos' | 'trips'>('posts');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [openCommentsFor, setOpenCommentsFor] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [commentReactions, setCommentReactions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setIsFollowing(data.isFollowing || false);

          // Fetch user posts
          const postsRes = await fetch(`/api/users/${userId}/posts`);
          if (postsRes.ok) {
            const postsData = await postsRes.json();
            setPosts(postsData.posts || []);
          }

          // Fetch user trips
          const tripsRes = await fetch(`/api/users/${userId}/trips`);
          if (tripsRes.ok) {
            const tripsData = await tripsRes.json();
            setTrips(tripsData.trips || []);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const handleFollow = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST'
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(!isFollowing);
        toast.success(data.following ? 'Following' : 'Unfollowed');
      }
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
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
      }
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const toggleCommentReaction = (commentId: string) => {
    setCommentReactions((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
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
          <p className="text-muted-foreground mb-4">User not found</p>
          <Button asChild>
            <Link href="/explore">Back to explore</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === userId;

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Photo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-64 md:h-80 bg-gradient-to-br from-secondary via-purple-400 to-coral relative overflow-hidden"
      >
        {user.coverPhoto && (
          <Image
            src={user.coverPhoto}
            alt="Cover"
            fill
            className="object-cover"
          />
        )}
      </motion.div>

      {/* Profile Header */}
      <div className="page-shell relative -mt-20 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface p-6 flex flex-col md:flex-row gap-6 items-start md:items-end"
        >
          {/* Profile Picture */}
          <div className="flex-shrink-0 -mt-8">
            <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-background bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden">
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
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {user.name}
                </h1>
                {user.bio && (
                  <p className="text-muted-foreground mb-3">{user.bio}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
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

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleFollow}
                    className={isFollowing ? 'gradient-sunset' : ''}
                    variant={isFollowing ? 'default' : 'outline'}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/messages?userId=${userId}`}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-surface p-4 text-center"
          >
            <p className="text-2xl font-bold text-gradient-sunset">
              {posts.length}
            </p>
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
          {user.interests && user.interests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-surface p-4 text-center"
            >
              <p className="text-2xl font-bold text-gradient-sunset">
                {user.interests.length}
              </p>
              <p className="text-sm text-muted-foreground">Interests</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Interests Section */}
      {user.interests && user.interests.length > 0 && (
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
      )}

      {/* Tabs */}
      <div className="page-shell mb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-1 border-b border-border"
        >
          {['posts', 'photos', 'trips'].map((tab) => (
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

      {/* Posts Feed */}
      {activeTab === 'posts' && (
        <div className="page-shell max-w-2xl mx-auto mb-12">
          {posts.length === 0 ? (
            <div className="card-surface p-12 text-center">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, i) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-surface overflow-hidden"
                >
                  {/* Post Content */}
                  <div className="p-4 md:p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback>{user?.name?.slice(0,2)?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-foreground text-sm md:text-base mb-3">{post.content}</p>
                  </div>
                  
                  {/* Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="-mx-0 mb-0">
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

                  {/* Engagement Stats */}
                  <div className="px-4 md:px-6 py-3 flex items-center justify-between text-sm">
                    {post.reactions && post.reactions.length > 0 && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <div className="flex -space-x-1">
                          <div className="bg-blue-500 text-white rounded-full p-0.5">
                            <ThumbsUp className="h-3 w-3" />
                          </div>
                          <div className="bg-red-500 text-white rounded-full p-0.5">
                            <Heart className="h-3 w-3" />
                          </div>
                        </div>
                        <span className="text-xs">{post.reactions.length}</span>
                      </div>
                    )}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {post.comments && post.comments.length > 0 && (
                        <button 
                          onClick={() => toggleComments(post._id)}
                          className="hover:underline"
                        >
                          {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                        </button>
                      )}
                      <span>128 shares</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-y border-border px-4 md:px-6 py-2 flex items-center gap-1">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-secondary/10 transition text-sm text-muted-foreground hover:text-foreground">
                      <ThumbsUp className="h-4 w-4" />
                      <span>Like</span>
                    </button>
                    <button 
                      onClick={() => toggleComments(post._id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-secondary/10 transition text-sm text-muted-foreground hover:text-foreground"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Comment</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-secondary/10 transition text-sm text-muted-foreground hover:text-foreground">
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {openCommentsFor[post._id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border"
                      >
                        <div className="p-4 md:p-6 space-y-4">
                          {/* Sort Dropdown */}
                          <div className="flex items-center gap-2">
                            <button className="text-sm font-medium text-foreground">Most relevant</button>
                            <span className="text-muted-foreground">▼</span>
                          </div>

                          {/* Comments List */}
                          <div className="space-y-4">
                            {post.comments && post.comments.map((comment: any, idx: number) => (
                              <div key={comment._id || idx} className="flex gap-2">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  <AvatarImage src={comment.userId?.avatar} alt={comment.userId?.name} />
                                  <AvatarFallback>{comment.userId?.name?.slice(0,2)?.toUpperCase() || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="bg-secondary/20 rounded-2xl px-4 py-2">
                                    <Link href={`/profile/${comment.userId?._id}`}>
                                      <p className="font-semibold text-sm hover:underline">
                                        {comment.userId?.name || 'Unknown User'}
                                      </p>
                                    </Link>
                                    <p className="text-sm text-foreground">{comment.content}</p>
                                  </div>
                                  <div className="flex items-center gap-4 mt-1 px-4">
                                    <button 
                                      onClick={() => toggleCommentReaction(comment._id)}
                                      className={`text-xs font-semibold hover:underline ${
                                        commentReactions[comment._id] ? 'text-blue-500' : 'text-muted-foreground'
                                      }`}
                                    >
                                      Like
                                    </button>
                                    <button className="text-xs font-semibold text-muted-foreground hover:underline">
                                      Reply
                                    </button>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                    {commentReactions[comment._id] && (
                                      <div className="flex items-center gap-1">
                                        <ThumbsUp className="h-3 w-3 text-blue-500 fill-blue-500" />
                                        <span className="text-xs text-blue-500">1</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Comment Input */}
                          <div className="flex gap-2 items-center pt-2">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={currentUser?.avatar} alt={currentUser?.name || 'You'} />
                              <AvatarFallback>{currentUser?.name?.slice(0,2)?.toUpperCase() || 'Y'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex items-center gap-2 bg-secondary/20 rounded-full px-4 py-2">
                              <input
                                type="text"
                                value={newComment[post._id] || ''}
                                onChange={(e) => setNewComment((prev) => ({ ...prev, [post._id]: e.target.value }))}
                                onKeyPress={(e) => e.key === 'Enter' && submitComment(post._id)}
                                placeholder={`Comment as ${currentUser?.name || 'User'}...`}
                                className="flex-1 bg-transparent outline-none text-sm"
                              />
                              <button 
                                onClick={() => submitComment(post._id)}
                                disabled={!newComment[post._id]?.trim()}
                                className="text-muted-foreground hover:text-secondary disabled:opacity-30"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Photos Tab */}
      {activeTab === 'photos' && (
        <div className="page-shell mb-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {posts
              .filter((p) => p.images && p.images.length > 0)
              .flatMap((p) => p.images?.map((img, idx) => ({ img, idx })) || [])
              .map(({ img, idx }, i) => (
                <motion.div
                  key={`${i}-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative h-48 rounded-lg overflow-hidden hover:opacity-90 transition cursor-pointer"
                >
                  <img
                    src={img}
                    alt={`Photo ${i}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
          </div>
          {posts.filter((p) => p.images && p.images.length > 0).length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No photos yet
            </div>
          )}
        </div>
      )}

      {/* Trips Tab */}
      {activeTab === 'trips' && (
        <div className="page-shell max-w-2xl mx-auto mb-12">
          <div className="space-y-4">
            {trips.length === 0 ? (
              <div className="card-surface p-12 text-center">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No trips created yet.</p>
              </div>
            ) : (
              trips.map((trip, i) => (
                <motion.div
                  key={trip._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/travel-plans/${trip._id}`}>
                    <div className="card-surface overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                      {trip.image && (
                        <div className="h-48 relative">
                          <Image
                            src={trip.image}
                            alt={trip.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <Badge className={`
                              ${trip.status === 'planning' ? 'bg-yellow-500' : ''}
                              ${trip.status === 'confirmed' ? 'bg-green-500' : ''}
                              ${trip.status === 'completed' ? 'bg-blue-500' : ''}
                              ${trip.status === 'cancelled' ? 'bg-red-500' : ''}
                              text-white
                            `}>
                              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{trip.title}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{trip.destination}</span>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground text-sm mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {' - '}
                              {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{trip.currentParticipants}/{trip.maxParticipants}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{trip.description}</p>
                        {trip.interests && trip.interests.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {trip.interests.slice(0, 3).map((interest) => (
                              <Badge key={interest} variant="secondary" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                            {trip.interests.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{trip.interests.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
