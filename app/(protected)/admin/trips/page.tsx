'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Trash2, MapPin, Users, Calendar, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface TripRow {
  _id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  currentParticipants: number;
  maxParticipants: number;
  status: string;
  creator: { name: string; email: string };
}

export default function AdminTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check session
        const sessionRes = await fetch('/api/auth/session');
        if (!sessionRes.ok) {
          router.push('/login');
          return;
        }
        const sessionData = await sessionRes.json();

        if (sessionData.user.role !== 'admin') {
          router.push('/dashboard');
          return;
        }

        // Fetch trips
        const tripsRes = await fetch('/api/admin/trips');
        if (tripsRes.ok) {
          const data = await tripsRes.json();
          setTrips(data.trips || []);
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

  // Reset pagination on filter/search change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handleDeleteTrip = async (tripId: string, tripTitle: string) => {
    if (!confirm(`Are you sure you want to delete trip "${tripTitle}"?`)) return;

    try {
      const response = await fetch(`/api/admin/trips/${tripId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Trip deleted successfully');
        setTrips(trips.filter(t => t._id !== tripId));
      } else {
        toast.error('Failed to delete trip');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const filteredTrips = trips
    .filter((trip) =>
      `${trip.title} ${trip.destination} ${trip.creator?.name || ''} ${trip.creator?.email || ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter((trip) => statusFilter === 'all' || trip.status === statusFilter);

  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / pageSize));
  const paginatedTrips = filteredTrips.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="page-shell py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link href="/admin" className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Link>
        <h1 className="text-4xl font-bold text-foreground">Trips Management</h1>
        <p className="text-muted-foreground mt-2">Total Trips: {trips.length}</p>
      </motion.div>

      {/* Filters */}
      <div className="card-surface border border-border rounded-lg p-4 mb-8">
        <div className="grid gap-3 md:grid-cols-3 items-center">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, destination, or creator"
              className="w-full rounded-lg border border-border bg-background px-9 py-2 text-sm text-foreground"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
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

      {/* Trips Grid */}
      {filteredTrips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card-surface rounded-lg shadow-sm border border-border p-8 text-center"
        >
          <p className="text-muted-foreground text-lg">No trips found</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {paginatedTrips.map((trip, idx) => (
            <motion.div
              key={trip._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card-surface rounded-lg shadow-sm border border-border overflow-hidden"
            >
              {/* Header */}
              <div className="h-32 bg-gradient-to-br from-orange-300 to-pink-300 flex items-center justify-center relative">
                <MapPin className="h-8 w-8 text-white/50" />
                <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
                  trip.status === 'planning' ? 'bg-blue-500' :
                  trip.status === 'confirmed' ? 'bg-green-500' :
                  'bg-gray-500'
                } text-white`}>
                  {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-1">{trip.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{trip.destination}</p>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {trip.currentParticipants}/{trip.maxParticipants} travelers
                  </div>
                </div>

                {/* Creator */}
                <div className="mb-4 pb-4 border-b border-border">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Created by:</p>
                  {trip.creator ? (
                    <>
                      <p className="text-sm text-foreground">{trip.creator.name}</p>
                      <p className="text-xs text-muted-foreground">{trip.creator.email}</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Unknown (user deleted)</p>
                  )}
                </div>

                {/* Action */}
                <button
                  onClick={() => handleDeleteTrip(trip._id, trip.title)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded transition"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Trip
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {filteredTrips.length > 0 && (
        <div className="mt-10 flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredTrips.length)} of {filteredTrips.length}
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
            <span className="text-sm text-foreground">Page {page} of {totalPages}</span>
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
  );
}
