'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Search, Calendar, Users, MapPin, Loader2, Heart, Filter } from 'lucide-react';
import { TripCardSkeletonList } from '@/components/skeletons/TripCardSkeleton';
import Image from 'next/image';

interface TravelPlan {
  _id: string;
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  currentParticipants: number;
  maxParticipants: number;
  interests: string[];
  creator: { name: string; avatar?: string; _id?: string };
  status: string;
  participants?: string[];
  image?: string;
}
export default function ExplorePage() {
  const router = useRouter();
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [interestFilter, setInterestFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [isLoading, setIsLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  // Join trip handler
  const handleJoin = async (planId: string) => {
    setJoiningId(planId);
    try {
      const response = await fetch(`/api/travel-plans/${planId}/join`, {
        method: 'POST',
      });
      if (response.ok) {
        toast.success('You have joined this trip!');
        const data = await response.json();
        // Update the plan in state with new participants and currentParticipants
        setPlans((prev) =>
          prev.map((plan) =>
            plan._id === planId
              ? {
                  ...plan,
                  currentParticipants: data.plan.currentParticipants,
                  participants: Array.isArray(data.plan.participants)
                    ? data.plan.participants.map((p: any) => p._id || p) // handle both populated and id
                    : [],
                }
              : plan
          )
        );
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to join trip');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setJoiningId(null);
    }
  };

  useEffect(() => {
    // Fetch user session and plans in parallel
    const fetchData = async () => {
      try {
        const [userRes, plansRes] = await Promise.all([
          fetch('/api/auth/session'),
          fetch('/api/travel-plans?limit=1000'),
        ]);
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserId(userData.user?.id || null);
        }
        if (plansRes.ok) {
          const data = await plansRes.json();
          // Always map participants to array of IDs for consistent checking
          setPlans(
            (data.plans || []).map((plan: any) => ({
              ...plan,
              participants: Array.isArray(plan.participants)
                ? plan.participants.map((p: any) => p._id || p)
                : [],
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, destinationFilter, interestFilter, statusFilter]);

  // Show all trips except those with creator name 'Unknown'
  const destinations = Array.from(new Set(plans.map((p) => p.destination))).sort();
  const interests = Array.from(new Set(plans.flatMap((p) => p.interests || []))).sort();

  const filteredPlans = plans
    .filter(plan => plan.creator && plan.creator.name !== 'Unknown')
    .filter(plan => !userId || (plan.creator && plan.creator._id !== userId))
    .filter(plan =>
      plan.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.interests.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(plan => destinationFilter === 'all' || plan.destination === destinationFilter)
    .filter(plan => interestFilter === 'all' || plan.interests.includes(interestFilter))
    .filter(plan => statusFilter === 'all' || plan.status === statusFilter);

  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / pageSize));
  const paginatedPlans = filteredPlans.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-background">
      <div className="section-shell">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">Explore Adventures</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover amazing trips planned by travelers like you and join the adventure.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-12 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by destination, activity, or keywords..."
              className="pl-12 py-3 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filters</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:col-span-2 gap-3">
              <select
                value={destinationFilter}
                onChange={(e) => setDestinationFilter(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="all">All destinations</option>
                {destinations.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={interestFilter}
                onChange={(e) => setInterestFilter(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="all">All interests</option>
                {interests.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="all">All statuses</option>
                <option value="planning">Planning</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <TripCardSkeletonList count={6} />
        ) : filteredPlans.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-foreground text-lg mb-2">No trips found matching your search.</p>
          <p className="text-muted-foreground">Try a different search or create your own trip!</p>
          <Button variant="outline" size="lg" className="mt-6" onClick={() => router.push('/travel-plans/add')}>
            Create a Trip
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPlans.map((plan, idx) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card-surface overflow-hidden hover:shadow-lg transition cursor-pointer"
              onClick={() => router.push(`/travel-plans/${plan._id}`)}
            >
              {/* Image */}
              <div className="h-48 relative">
                {plan.image ? (
                  <Image 
                    src={plan.image} 
                    alt={plan.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full bg-gradient-to-br from-orange-300 to-pink-300 flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-white/50" />
                  </div>
                )}
                <button className="absolute top-4 right-4 bg-background rounded-full p-2 shadow hover:shadow-md transition">
                  <Heart className="h-5 w-5 text-red-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">{plan.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{plan.description}</p>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {plan.destination}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(plan.startDate).toLocaleDateString()} -{' '}
                    {new Date(plan.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {plan.currentParticipants}/{plan.maxParticipants} travelers
                  </div>
                </div>

                {/* Tags */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {plan.interests.slice(0, 2).map((interest) => (
                    <span key={interest} className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-200 px-2 py-1 rounded text-xs">
                      {interest}
                    </span>
                  ))}
                </div>

                {/* Creator */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
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
                    <span className="text-sm font-medium text-foreground">{plan.creator?.name || "Unknown"}</span>
                  </div>
                  {userId && plan.participants && plan.participants.includes(userId) ? (
                    <Button size="sm" className="gradient-sunset text-white" disabled>
                      Already Joined
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="gradient-sunset text-white"
                      disabled={joiningId === plan._id}
                      onClick={e => {
                        e.stopPropagation();
                        handleJoin(plan._id);
                      }}
                    >
                      {joiningId === plan._id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join'}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && filteredPlans.length > 0 && (
        <div className="mt-10 flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredPlans.length)} of {filteredPlans.length}
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
