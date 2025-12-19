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


  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="page-shell py-12">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-500/10 dark:to-pink-500/10 rounded-lg p-8 mb-12"
      >
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-muted-foreground mb-6">
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
                <div className="card-surface border border-orange-200 dark:border-orange-500/30 rounded px-4 py-2 text-orange-700 dark:text-orange-400 font-semibold text-sm shadow w-full text-center sm:w-auto">
                  Trip Plan Credits: <span className={creditsLeft === 0 ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-300'}>{creditsLeft}</span>{!isPremium && ` / ${MAX_FREE_TRIP_PLANS}`}
                </div>
                <div className="card-surface border border-blue-200 dark:border-blue-500/30 rounded px-4 py-2 text-blue-700 dark:text-blue-400 font-semibold text-sm shadow w-full text-center sm:w-auto">
                  Join Trip Credits: <span className={joinCreditsLeft === 0 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-300'}>{joinCreditsLeft}</span>{!isPremium && ` / ${MAX_FREE_JOINED_TRIPS}`}
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
            className="card-surface rounded-lg p-6 shadow-sm border border-border"
          >
            <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Trips Shortcut */}
      <div className="card-surface rounded-lg shadow-sm border border-border mb-12 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Trips</h2>
          <div className="flex gap-2">
            <Link href="/travel-plans/add">
              <Button size="sm" className="gradient-sunset text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Trip
              </Button>
            </Link>
            <Link href="/travel-plans">
              <Button variant="outline" size="sm">Open My Trips</Button>
            </Link>
          </div>
        </div>
        <p className="text-muted-foreground">Manage your created and joined trips on the My Trips page.</p>
      </div>
    </div>
  );
}
