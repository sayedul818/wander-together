'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Search, Calendar, Users, MapPin, Loader2, Heart } from 'lucide-react';

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
  creator: { name: string; avatar?: string };
  status: string;
}

export default function ExplorePage() {
  const router = useRouter();
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/travel-plans');
        if (res.ok) {
          const data = await res.json();
          setPlans(data.plans || []);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Only show plans with a valid creator
  const filteredPlans = plans
    .filter(plan => plan.creator && plan.creator.name && plan.creator.name !== 'Unknown')
    .filter(plan =>
      plan.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.interests.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Adventures</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Discover amazing trips planned by travelers like you and join the adventure.
        </p>
      </motion.div>

      {/* Search Section */}
      <div className="mb-12">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by destination, activity, or keywords..."
            className="pl-12 py-3 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No trips found matching your search.</p>
          <p className="text-gray-500">Try a different search or create your own trip!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan, idx) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer"
              onClick={() => router.push(`/travel-plans/${plan._id}`)}
            >
              {/* Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-orange-300 to-pink-300 flex items-center justify-center relative">
                <button className="absolute top-4 right-4 bg-white rounded-full p-2 shadow hover:shadow-md transition">
                  <Heart className="h-5 w-5 text-red-500" />
                </button>
                <MapPin className="h-12 w-12 text-white/50" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{plan.description}</p>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {plan.destination}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {new Date(plan.startDate).toLocaleDateString()} -{' '}
                    {new Date(plan.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    {plan.currentParticipants}/{plan.maxParticipants} travelers
                  </div>
                </div>

                {/* Tags */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {plan.interests.slice(0, 2).map((interest) => (
                    <span key={interest} className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                      {interest}
                    </span>
                  ))}
                </div>

                {/* Creator */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    by <span className="font-medium">{plan.creator?.name || "Unknown"}</span>
                  </div>
                  <Button size="sm" className="gradient-sunset text-white">Join</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
