'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Users, MapPin, TrendingUp, LogOut, Loader2, ArrowLeft, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  totalTrips: number;
  premiumUsers: number;
  activeTrips: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
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
        
        // Check if admin
        if (sessionData.user.role !== 'admin') {
          router.push('/dashboard');
          return;
        }

        setUser(sessionData.user);

        // Fetch stats
        const statsRes = await fetch('/api/admin/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="page-shell py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-foreground font-medium">{user.name}</span>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="page-shell py-12">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-4 gap-6 mb-12"
        >
          {/* Total Users */}
          <div className="card-surface rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats?.totalUsers || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </div>

          {/* Premium Users */}
          <div className="card-surface rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Premium Users</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats?.premiumUsers || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
              </div>
            </div>
          </div>

          {/* Total Trips */}
          <div className="card-surface rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Trips</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats?.totalTrips || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </div>

          {/* Active Trips */}
          <div className="card-surface rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Active Trips</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats?.activeTrips || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/20 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-orange-600 dark:text-orange-300" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Management Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Users Management */}
          <Link href="/admin/users">
            <div className="card-surface rounded-lg shadow-sm border border-border p-8 hover:shadow-md transition cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Users Management</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                View, manage, and moderate user accounts. Update roles and permissions.
              </p>
              <Button className="gradient-sunset text-white">
                Manage Users →
              </Button>
            </div>
          </Link>

          {/* Trips Management */}
          <Link href="/admin/trips">
            <div className="card-surface rounded-lg shadow-sm border border-border p-8 hover:shadow-md transition cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Trips Management</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                View all trips, monitor activity, and remove inappropriate content.
              </p>
              <Button className="gradient-sunset text-white">
                Manage Trips →
              </Button>
            </div>
          </Link>

          {/* Sponsors Management */}
          <Link href="/admin/sponsors">
            <div className="card-surface rounded-lg shadow-sm border border-border p-8 hover:shadow-md transition cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Megaphone className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Sponsors Management</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Create and manage sponsored ads that appear in the feed sidebar.
              </p>
              <Button className="gradient-sunset text-white">
                Manage Sponsors →
              </Button>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
