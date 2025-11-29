import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, Plane, DollarSign, TrendingUp, 
  AlertCircle, CheckCircle2, Clock, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useTravelPlans } from '@/contexts/TravelPlansContext';
import { mockTravelers } from '@/data/mockTravelers';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { plans } = useTravelPlans();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const stats = [
    { icon: Users, label: 'Total Users', value: mockTravelers.length + 1, change: '+12%', color: 'text-teal' },
    { icon: Plane, label: 'Active Trips', value: plans.length, change: '+8%', color: 'text-primary' },
    { icon: DollarSign, label: 'Revenue', value: '$12,450', change: '+23%', color: 'text-green' },
    { icon: TrendingUp, label: 'Conversions', value: '24%', change: '+5%', color: 'text-gold' },
  ];

  const recentUsers = mockTravelers.slice(0, 5);
  const recentPlans = plans.slice(0, 5);

  const pendingActions = [
    { id: 1, type: 'report', message: 'User report needs review', status: 'pending' },
    { id: 2, type: 'verification', message: '3 profile verifications pending', status: 'pending' },
    { id: 3, type: 'refund', message: 'Refund request from user #2341', status: 'urgent' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}. Here's what's happening today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="bg-card rounded-2xl border border-border/50 p-5 hover-lift"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="text-green">
                  {stat.change}
                </Badge>
              </div>
              <p className="font-heading text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  Recent Users
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/users">
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Location</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rating</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((traveler) => (
                      <tr key={traveler.id} className="border-b border-border/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={traveler.avatar} />
                              <AvatarFallback>{traveler.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground text-sm">{traveler.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {traveler.location}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={traveler.isPremium ? 'default' : 'secondary'}>
                            {traveler.isPremium ? 'Premium' : 'Free'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground">
                          {traveler.rating}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Pending Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
                Pending Actions
              </h2>

              <div className="space-y-3">
                {pendingActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                  >
                    {action.status === 'urgent' ? (
                      <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                    ) : (
                      <Clock className="h-5 w-5 text-gold shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{action.message}</p>
                      <Badge
                        variant="outline"
                        className={`mt-1 ${
                          action.status === 'urgent'
                            ? 'border-destructive/50 text-destructive'
                            : 'border-gold/50 text-gold'
                        }`}
                      >
                        {action.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4">
                View All Actions
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Recent Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="bg-card rounded-2xl border border-border/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Recent Travel Plans
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/plans">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Destination</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Host</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Dates</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPlans.map((plan) => (
                    <tr key={plan.id} className="border-b border-border/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground text-sm">{plan.destination}</p>
                          <p className="text-xs text-muted-foreground">{plan.country}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {plan.userName}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{plan.travelType}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {plan.startDate}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={plan.isPublic ? 'default' : 'outline'}>
                          {plan.isPublic ? 'Public' : 'Private'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
