'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isPremium: boolean;
  avatar?: string;
  bio?: string;
  location?: string;
  interests?: string[];
  visitedCountries?: string[];
  rating: number;
  reviewCount: number;
}

const INTERESTS = [
  'Adventure', 'Beach', 'Culture', 'Food', 'History', 'Nature',
  'Photography', 'Hiking', 'Shopping', 'Art', 'Music', 'Sports'
];

interface Review {
  _id: string;
  author: { name: string; avatar?: string };
  rating: number;
  comment: string;
  createdAt: string;
  travelPlan?: { title: string };
}

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    interests: [] as string[],
    visitedCountries: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        const data = await response.json();
        setUser(data.user);
        setFormData({
          name: data.user.name || '',
          bio: data.user.bio || '',
          location: data.user.location || '',
          interests: data.user.interests || [],
          visitedCountries: data.user.visitedCountries?.join(', ') || '',
        });
        // Fetch reviews for this user
        setIsLoadingReviews(true);
        const reviewsRes = await fetch(`/api/reviews?target=${data.user.id}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.reviews || []);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
        setIsLoadingReviews(false);
      }
    };

    // Check for upgrade
    const upgraded = searchParams.get('upgraded');
    if (upgraded === '1') {
      fetch('/api/auth/upgrade-status', { method: 'POST' })
        .then(async (res) => {
          if (res.ok) {
            toast.success('Your account is now Premium!');
            await fetchUser();
          } else {
            toast.error('Failed to upgrade account.');
            fetchUser();
          }
        })
        .catch(() => {
          toast.error('Failed to upgrade account.');
          fetchUser();
        });
    } else {
      fetchUser();
    }
  }, [router, searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
          location: formData.location,
          interests: formData.interests,
          visitedCountries: formData.visitedCountries
            .split(',')
            .map(c => c.trim())
            .filter(c => c),
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.user);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error('Error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link href="/dashboard" className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-orange-300 to-pink-300 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User Info */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">{user?.name}</h2>
            <p className="text-gray-600 text-center mb-4">{user?.email}</p>

            {/* Status Badges */}
            <div className="flex gap-2 justify-center mb-4">
              {user?.isPremium && (
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Premium
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user?.role === 'admin'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {user?.role === 'admin' ? 'Administrator' : 'Traveler'}
              </span>
            </div>

            {/* Rating */}
            <div className="text-center mb-6 py-4 border-t border-b">
              <div className="text-3xl font-bold text-orange-500">{(user?.rating || 0).toFixed(1)}</div>
              <p className="text-sm text-gray-600">
                ({user?.reviewCount || 0} reviews)
              </p>
            </div>

            {/* Edit Button */}
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full gradient-sunset text-white"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </motion.div>

        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {isEditing ? (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h3>

                {/* Name */}
                <div className="mb-6">
                  <Label htmlFor="name" className="block mb-2 font-semibold">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="border-gray-300"
                  />
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <Label htmlFor="bio" className="block mb-2 font-semibold">
                    Bio
                  </Label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Location */}
                <div className="mb-6">
                  <Label htmlFor="location" className="block mb-2 font-semibold">
                    Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Your location"
                    className="border-gray-300"
                  />
                </div>

                {/* Visited Countries */}
                <div className="mb-6">
                  <Label htmlFor="visitedCountries" className="block mb-2 font-semibold">
                    Visited Countries
                  </Label>
                  <Input
                    id="visitedCountries"
                    name="visitedCountries"
                    value={formData.visitedCountries}
                    onChange={handleInputChange}
                    placeholder="e.g., France, Japan, Brazil (comma-separated)"
                    className="border-gray-300"
                  />
                </div>

                {/* Interests */}
                <div className="mb-6">
                  <Label className="block mb-4 font-semibold">Interests</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {INTERESTS.map(interest => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          formData.interests.includes(interest)
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 gradient-sunset text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* View Mode */}
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h3>

                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">Bio</p>
                    <p className="text-gray-900">
                      {user?.bio || 'No bio added yet'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">Location</p>
                    <p className="text-gray-900">
                      {user?.location || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">Interests</p>
                    <div className="flex gap-2 flex-wrap">
                      {user?.interests && user.interests.length > 0 ? (
                        user.interests.map(interest => (
                          <span
                            key={interest}
                            className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-600">No interests added yet</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">Visited Countries</p>
                    <div className="flex gap-2 flex-wrap">
                      {user?.visitedCountries && user.visitedCountries.length > 0 ? (
                        user.visitedCountries.map(country => (
                          <span
                            key={country}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                          >
                            {country}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-600">No countries visited yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
        {isLoadingReviews ? (
          <div className="flex items-center justify-center min-h-[100px]">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-gray-600">No reviews yet.</div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  {review.author.avatar ? (
                    <img src={review.author.avatar} alt={review.author.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center font-bold text-orange-700">
                      {review.author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-gray-900">{review.author.name}</span>
                  <span className="ml-auto text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-500 font-bold">{'★'.repeat(review.rating)}</span>
                  <span className="text-gray-400">{'★'.repeat(5 - review.rating)}</span>
                  {review.travelPlan?.title && (
                    <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">{review.travelPlan.title}</span>
                  )}
                </div>
                <div className="text-gray-800">{review.comment}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
