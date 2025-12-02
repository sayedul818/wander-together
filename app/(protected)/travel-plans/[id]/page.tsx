'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, DollarSign, ArrowLeft, Loader2, Heart, Share2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

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
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function TravelPlanDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params?.id as string;

  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

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
          <p className="text-gray-600 mb-4">Trip not found</p>
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
    <div className="container mx-auto px-4 py-12">
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
          <div className="w-full h-96 bg-gradient-to-br from-orange-300 to-pink-300 rounded-lg mb-8 flex items-center justify-center">
            <MapPin className="h-24 w-24 text-white/50" />
          </div>

          {/* Title & Status */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{plan.title}</h1>
                <p className="text-xl text-gray-600 mt-2">{plan.destination}</p>
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
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Dates</span>
                </div>
                <p className="text-sm text-gray-700">
                  {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Travelers</span>
                </div>
                <p className="text-sm text-gray-700">
                  {plan.currentParticipants}/{plan.maxParticipants}
                </p>
              </div>

              {plan.budget && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">Budget</span>
                  </div>
                  <p className="text-sm text-gray-700">${plan.budget}</p>
                </div>
              )}

              {plan.travelStyle && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <span className="text-sm font-medium">Style</span>
                  </div>
                  <p className="text-sm text-gray-700">{plan.travelStyle}</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Trip</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{plan.description}</p>
          </div>

          {/* Interests */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {plan.interests.map(interest => (
                <span key={interest} className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Creator Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Creator</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{plan.creator.name}</p>
                <p className="text-gray-600">{plan.creator.email}</p>
              </div>
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          </div>

          {/* Participants */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Travelers ({plan.currentParticipants})</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {plan.participants.map(participant => (
                <div key={participant._id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="font-semibold text-gray-900">{participant.name}</p>
                  <p className="text-sm text-gray-600">{participant.email}</p>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
            {isCreator ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">This is your trip</p>
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
                    <p className="text-sm text-gray-600 text-center">
                      {plan.maxParticipants - plan.currentParticipants} spots available
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-4 mt-6">
              <button className="w-full flex items-center justify-center gap-2 py-2 text-gray-700 hover:text-orange-500 transition">
                <Heart className="h-4 w-4" />
                <span>Save</span>
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-2 text-gray-700 hover:text-orange-500 transition">
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
