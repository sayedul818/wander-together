'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, DollarSign, ArrowLeft, Loader2, Heart, Share2, MessageCircle, Star } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface TravelPlan {
  _id: string;
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget?: number;
  interests: string[];
  maxParticipants: number;
  currentParticipants: number;
  participants: Array<{ _id: string; name: string; email: string }>;
  creator: { _id: string; name: string; email: string; avatar?: string };
  status: string;
  travelStyle?: string;
  accommodationType?: string;
  createdAt: string;
  image?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Review {
  _id: string;
  author: { _id: string; name: string; avatar?: string };
  target: { _id: string; name: string; avatar?: string };
  travelPlan?: { _id: string; title: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export default function TravelPlanDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params?.id as string;

  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch session
        const sessionRes = await fetch('/api/auth/session');
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setUser(sessionData.user);
        }

        // Fetch travel plan
        const planRes = await fetch(`/api/travel-plans/${planId}`);
        if (planRes.ok) {
          const planData = await planRes.json();
          setPlan(planData.plan);
          
          // Fetch reviews for the creator
          if (planData.plan?.creator?._id) {
            fetchReviews(planData.plan.creator._id);
          }
        } else if (planRes.status === 404) {
          toast.error('Trip not found');
          router.push('/explore');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load trip details');
      } finally {
        setIsLoading(false);
      }
    };

    if (planId) {
      fetchData();
    }
  }, [planId, router]);

  const fetchReviews = async (creatorId: string) => {
    try {
      setIsLoadingReviews(true);
      const res = await fetch(`/api/reviews?target=${creatorId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        
        // Calculate average rating
        if (data.reviews && data.reviews.length > 0) {
          const total = data.reviews.reduce((sum: number, review: Review) => sum + review.rating, 0);
          setAverageRating(total / data.reviews.length);
          setTotalReviews(data.reviews.length);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: plan?.creator._id,
          rating: newRating,
          comment: newComment,
          travelPlan: planId
        })
      });

      if (res.ok) {
        toast.success('Review submitted successfully!');
        setNewComment('');
        setNewRating(5);
        // Refresh reviews
        if (plan?.creator._id) {
          fetchReviews(plan.creator._id);
        }
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch(`/api/travel-plans/${planId}/join`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('You have joined this trip!');
        // Refresh plan data
        const planRes = await fetch(`/api/travel-plans/${planId}`);
        if (planRes.ok) {
          const planData = await planRes.json();
          setPlan(planData.plan);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to join trip');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Trip not found</p>
          <Link href="/explore">
            <Button>Back to Explore</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = user?.id === plan.creator._id;
  const isParticipant = plan.participants.some(p => p._id === user?.id);
  const isFull = plan.currentParticipants >= plan.maxParticipants;

  return (
    <div className="page-shell py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link href="/explore" className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Link>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:col-span-2"
        >
          {/* Image */}
          <div className="w-full h-96 rounded-lg mb-8 overflow-hidden relative">
            {plan.image ? (
              <Image 
                src={plan.image} 
                alt={plan.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-300 to-pink-300 flex items-center justify-center">
                <MapPin className="h-24 w-24 text-white/50" />
              </div>
            )}
          </div>

          {/* Title & Status */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground">{plan.title}</h1>
                <p className="text-xl text-muted-foreground mt-2">{plan.destination}</p>
              </div>
              <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
                plan.status === 'planning' ? 'bg-blue-100 text-blue-700' :
                plan.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              </span>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-orange-50 dark:bg-orange-500/10 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Dates</span>
                </div>
                <p className="text-sm text-foreground">
                  {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Travelers</span>
                </div>
                <p className="text-sm text-foreground">
                  {plan.currentParticipants}/{plan.maxParticipants}
                </p>
              </div>

              {plan.budget && (
                <div className="bg-green-50 dark:bg-green-500/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">Budget</span>
                  </div>
                  <p className="text-sm text-foreground">${plan.budget}</p>
                </div>
              )}

              {plan.travelStyle && (
                <div className="bg-purple-50 dark:bg-purple-500/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                    <span className="text-sm font-medium">Style</span>
                  </div>
                  <p className="text-sm text-foreground">{plan.travelStyle}</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">About This Trip</h2>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{plan.description}</p>
          </div>

          {/* Interests */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {plan.interests.map(interest => (
                <span key={interest} className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Creator Info */}
          <div className="card-surface rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Trip Creator</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {plan.creator.avatar ? (
                  <Image 
                    src={plan.creator.avatar} 
                    alt={plan.creator.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-300 to-pink-300 flex items-center justify-center text-white font-bold text-xl">
                    {plan.creator.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">{plan.creator.name}</p>
                  <p className="text-muted-foreground">{plan.creator.email}</p>
                  {totalReviews > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-foreground">{averageRating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                    </div>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Reviews & Ratings</CardTitle>
                <CardDescription>
                  {totalReviews > 0 
                    ? `${totalReviews} ${totalReviews === 1 ? 'review' : 'reviews'} for ${plan.creator.name}`
                    : `No reviews yet for ${plan.creator.name}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Submit Review Form */}
                {user && user.id !== plan.creator._id && (
                  <form onSubmit={handleSubmitReview} className="mb-8 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-4">Write a Review</h3>
                    
                    {/* Star Rating */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-8 w-8 ${
                                star <= newRating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground self-center">
                          {newRating} {newRating === 1 ? 'star' : 'stars'}
                        </span>
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-foreground mb-2">Comment</label>
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your experience traveling with this person..."
                        className="min-h-[100px]"
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="gradient-sunset text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Review'
                      )}
                    </Button>
                  </form>
                )}

                {/* Reviews List */}
                {isLoadingReviews ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b border-border pb-4 last:border-0">
                        <div className="flex items-start gap-3">
                          {review.author.avatar ? (
                            <Image
                              src={review.author.avatar}
                              alt={review.author.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center text-white font-bold">
                              {review.author.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-foreground">{review.author.name}</p>
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-foreground">{review.comment}</p>
                            {review.travelPlan && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Trip: {review.travelPlan.title}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No reviews yet. Be the first to review {plan.creator.name}!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Participants */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Travelers ({plan.currentParticipants})</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {plan.participants.map(participant => (
                <div key={participant._id} className="card-surface rounded-lg p-4 border border-border">
                  {(participant as any).avatar ? (
                    <Image 
                      src={(participant as any).avatar} 
                      alt={participant.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover mb-3 mx-auto"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center text-white font-bold mx-auto mb-3">
                      {participant.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="font-semibold text-foreground text-center">{participant.name}</p>
                  <p className="text-sm text-muted-foreground text-center">{participant.email}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="card-surface rounded-lg shadow-sm border border-border p-6 sticky top-24">
            {isCreator ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">This is your trip</p>
                <Link href={`/travel-plans/${planId}/edit`}>
                  <Button className="w-full gradient-sunset text-white">Edit Trip</Button>
                </Link>
              </div>
            ) : isParticipant ? (
              <div className="text-center py-4">
                <p className="text-green-600 font-semibold mb-4">✓ You've joined this trip</p>
                <Button variant="outline" className="w-full">
                  View Itinerary
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {isFull ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 font-semibold">This trip is full</p>
                  </div>
                ) : (
                  <>
                    <Button
                      className="w-full gradient-sunset text-white"
                      size="lg"
                      onClick={handleJoin}
                      disabled={isJoining}
                    >
                      {isJoining ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Joining...
                        </>
                      ) : (
                        'Join This Trip'
                      )}
                    </Button>
                    <p className="text-sm text-muted-foreground text-center">
                      {plan.maxParticipants - plan.currentParticipants} spots available
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="border-t border-border pt-4 mt-6">
              <button className="w-full flex items-center justify-center gap-2 py-2 text-foreground hover:text-primary transition">
                <Heart className="h-4 w-4" />
                <span>Save</span>
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-2 text-foreground hover:text-primary transition">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
