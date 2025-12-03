'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, Plus, Loader2 } from 'lucide-react';

interface TravelPlan {
  _id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  currentParticipants: number;
  maxParticipants: number;
  interests: string[];
  status: string;
  creator?: string;
  participants?: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isPremium?: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [joinedPlans, setJoinedPlans] = useState<TravelPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Show 'Unlimited' for premium, 3 for free users
  const MAX_FREE_TRIP_PLANS = 3;
  const MAX_FREE_JOINED_TRIPS = 3;
  const isPremium = !!user && user.isPremium === true;
  const creditsLeft = isPremium ? 'Unlimited' : (user ? MAX_FREE_TRIP_PLANS - plans.length : null);
  const joinCreditsLeft = isPremium ? 'Unlimited' : (user ? MAX_FREE_JOINED_TRIPS - joinedPlans.length : null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch session
        const sessionRes = await fetch('/api/auth/session', { credentials: 'include' });
        if (!sessionRes.ok) {
          router.push('/login');
          return;
        }
        const sessionData = await sessionRes.json();
        if (!sessionData.user) {
          router.push('/login');
          return;
        }
        setUser(sessionData.user);

        // Fetch created and joined trips
        if (sessionData.user && sessionData.user.id) {
          const [createdRes, joinedRes] = await Promise.all([
            fetch(`/api/travel-plans?creator=${sessionData.user.id}`),
            fetch(`/api/travel-plans?participant=${sessionData.user.id}`),
          ]);
          if (createdRes.ok) {
            const createdData = await createdRes.json();
            setPlans(createdData.plans || []);
          } else {
            setPlans([]);
          }
          if (joinedRes.ok) {
            const joinedData = await joinedRes.json();
            // Exclude trips where user is the creator (avoid duplicates)
            setJoinedPlans((joinedData.plans || []).filter((plan: TravelPlan) => plan.creator !== sessionData.user.id));
          } else {
            setJoinedPlans([]);
          }
        } else {
          setPlans([]);
          setJoinedPlans([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);


  // Tab state: 0 = Your Trips, 1 = Tours You've Joined
  const [activeTab, setActiveTab] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-8 mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mb-6">
          Plan your next adventure and connect with fellow travelers.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-3 w-full items-center sm:flex-row sm:items-center sm:gap-4">
            <Link href="/travel-plans/add" className="w-full sm:w-auto">
              <Button className="gradient-sunset text-white w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create New Trip
              </Button>
            </Link>
            {user && (
              <div className="flex flex-col gap-2 w-full items-center sm:flex-row sm:gap-2 sm:w-auto sm:items-center">
                <div className="bg-white border border-orange-200 rounded px-4 py-2 text-orange-700 font-semibold text-sm shadow w-full text-center sm:w-auto">
                  Trip Plan Credits: <span className={creditsLeft === 0 ? 'text-red-600' : 'text-orange-600'}>{creditsLeft}</span>{!isPremium && ` / ${MAX_FREE_TRIP_PLANS}`}
                </div>
                <div className="bg-white border border-blue-200 rounded px-4 py-2 text-blue-700 font-semibold text-sm shadow w-full text-center sm:w-auto">
                  Join Trip Credits: <span className={joinCreditsLeft === 0 ? 'text-red-600' : 'text-blue-600'}>{joinCreditsLeft}</span>{!isPremium && ` / ${MAX_FREE_JOINED_TRIPS}`}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Active Trips', value: plans.filter(p => p.status === 'planning').length },
          { label: 'Completed Trips', value: plans.filter(p => p.status === 'completed').length },
          { label: 'Total Companions', value: plans.reduce((sum, p) => sum + p.currentParticipants, 0) },
          { label: 'Countries Visited', value: 5 },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold focus:outline-none transition border-b-2 ${activeTab === 0 ? 'border-orange-500 text-orange-700 bg-orange-50' : 'border-transparent text-gray-600 bg-white hover:bg-orange-50'}`}
          onClick={() => setActiveTab(0)}
        >
          Your Trips
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold focus:outline-none transition border-b-2 ${activeTab === 1 ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-transparent text-gray-600 bg-white hover:bg-blue-50'}`}
          onClick={() => setActiveTab(1)}
        >
          Tours You've Joined
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-12">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Your Trips</h2>
          </div>
          <div className="divide-y">
            {plans.length === 0 ? (
              <div className="p-12 text-center">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">You haven't created any trips yet.</p>
                <Link href="/travel-plans/add">
                  <Button className="mt-4 gradient-sunset text-white">Create Your First Trip</Button>
                </Link>
              </div>
            ) : (
              plans.map((plan) => (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="p-6 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => router.push(`/travel-plans/${plan._id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                      <p className="text-gray-600">{plan.destination}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      plan.status === 'planning' ? 'bg-blue-100 text-blue-700' :
                      plan.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 w-full">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(plan.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {plan.currentParticipants}/{plan.maxParticipants}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1 xs:mt-0">
                        {plan.interests.slice(0, 2).map((interest) => (
                          <span key={interest} className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs whitespace-nowrap">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 mb-12">
          <div className="p-6 border-b border-blue-200">
            <h2 className="text-2xl font-bold text-blue-900">Tours You've Joined</h2>
          </div>
          <div className="divide-y">
            {joinedPlans.length === 0 ? (
              <div className="p-12 text-center">
                <MapPin className="h-12 w-12 text-blue-200 mx-auto mb-4" />
                <p className="text-blue-600">You haven't joined any tours yet.</p>
              </div>
            ) : (
              joinedPlans.map((plan) => (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="p-6 hover:bg-blue-50 transition cursor-pointer"
                  onClick={() => router.push(`/travel-plans/${plan._id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">{plan.title}</h3>
                      <p className="text-blue-600">{plan.destination}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      plan.status === 'planning' ? 'bg-blue-100 text-blue-700' :
                      plan.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-blue-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(plan.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {plan.currentParticipants}/{plan.maxParticipants}
                    </div>
                    <div className="flex gap-1">
                      {plan.interests.slice(0, 2).map((interest) => (
                        <span key={interest} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
