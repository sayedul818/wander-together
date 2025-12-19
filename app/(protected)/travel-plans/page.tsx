'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, Plus, Loader2, ArrowLeft, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

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
  creator: { _id: string; name: string; avatar?: string };
  image?: string;
  participants?: Array<string | { _id: string }>;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function TravelPlansPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'created' | 'joined' | 'all'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch session
        const sessionRes = await fetch('/api/auth/session');
        if (!sessionRes.ok) {
          router.push('/login');
          return;
        }
        const sessionData = await sessionRes.json();
        setUser(sessionData.user);

        // Fetch user's travel plans
        const plansRes = await fetch('/api/travel-plans');
        if (plansRes.ok) {
          const plansData = await plansRes.json();
          const normalizedPlans = (plansData.plans || []).map((plan: any) => ({
            ...plan,
            participants: Array.isArray(plan.participants)
              ? plan.participants.map((p: any) => (typeof p === 'string' ? p : p._id))
              : [],
          }));
          setPlans(normalizedPlans);
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

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      const response = await fetch(`/api/travel-plans/${planId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Trip deleted successfully');
        setPlans(plans.filter(p => p._id !== planId));
      } else {
        toast.error('Failed to delete trip');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error('Error:', error);
    }
  };

  const userId = user?.id;

  const ownedOrJoined = plans.filter(
    (p) => p.creator?._id === userId || (userId && p.participants?.includes(userId))
  );

  const getFilteredPlans = () => {
    if (filter === 'created') {
      return ownedOrJoined.filter(p => p.creator?._id === userId);
    } else if (filter === 'joined') {
      return ownedOrJoined.filter(p => p.creator?._id !== userId && p.participants?.includes(userId as string));
    }
    return ownedOrJoined;
  };

  const filteredPlans = getFilteredPlans();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="page-shell py-12">
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
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-foreground">My Trips</h1>
          <Link href="/travel-plans/add">
            <Button className="gradient-sunset text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Trip
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-4 mb-8"
      >
        {['all', 'created', 'joined'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as 'all' | 'created' | 'joined')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            {f === 'all' ? 'All Trips' : f === 'created' ? 'Created' : 'Joined'}
          </button>
        ))}
      </motion.div>

      {/* Trips Grid */}
      {filteredPlans.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 card-surface"
        >
          <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-4">
            {filter === 'created' && "You haven't created any trips yet."}
            {filter === 'joined' && "You haven't joined any trips yet."}
            {filter === 'all' && "You don't have any trips yet."}
          </p>
          <Link href="/travel-plans/add">
            <Button className="gradient-sunset text-white">
              Create Your First Trip
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan, idx) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card-surface rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md hover:border-primary/40 transition cursor-pointer"
              onClick={() => router.push(`/travel-plans/${plan._id}`)}
            >
              {/* Image */}
              <div className="h-40 bg-gradient-to-br from-orange-300 to-pink-300 flex items-center justify-center relative overflow-hidden">
                {plan.image ? (
                  <Image 
                    src={plan.image} 
                    alt={plan.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <MapPin className="h-8 w-8 text-white/50" />
                )}
                {plan.creator?._id === user?.id && (
                  <span className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Created
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-1">{plan.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.destination}</p>

                {/* Creator Avatar */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                  {plan.creator?.avatar ? (
                    <Image 
                      src={plan.creator.avatar} 
                      alt={plan.creator.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-pink-300 flex items-center justify-center text-white font-bold text-xs">
                      {plan.creator?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <span className="text-sm text-muted-foreground">{plan.creator?.name || "Unknown"}</span>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {plan.currentParticipants}/{plan.maxParticipants} travelers
                  </div>
                </div>

                {/* Tags */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {plan.interests.slice(0, 2).map(interest => (
                    <span key={interest} className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-200 px-2 py-1 rounded text-xs">
                      {interest}
                    </span>
                  ))}
                </div>

                {/* Status */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    plan.status === 'planning' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-100' :
                    plan.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-100' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </span>
                </div>

                {/* Actions */}
                {plan.creator?._id === user?.id && (
                  <div className="flex gap-2 pt-4 border-t border-border">
                    <button
                      className="flex-1 flex items-center justify-center gap-2 py-2 text-foreground hover:text-primary transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/travel-plans/${plan._id}/edit`);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      className="flex-1 flex items-center justify-center gap-2 py-2 text-foreground hover:text-red-500 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(plan._id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
