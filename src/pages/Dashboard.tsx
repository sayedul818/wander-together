import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plane, Users, Calendar, Star, MapPin, Bell, 
  Plus, ArrowRight, MessageCircle, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useTravelPlans } from '@/contexts/TravelPlansContext';
import { TravelPlanCard } from '@/components/cards/TravelPlanCard';
import { mockTravelers } from '@/data/mockTravelers';

export default function Dashboard() {
  const { user } = useAuth();
  const { getUserPlans, plans } = useTravelPlans();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const userPlans = getUserPlans(user.id);
  const matchedTravelers = mockTravelers.slice(0, 4);

  const stats = [
    { icon: Plane, label: 'Upcoming Trips', value: userPlans.length, color: 'text-primary' },
    { icon: Users, label: 'Matches', value: matchedTravelers.length, color: 'text-teal' },
    { icon: Star, label: 'Rating', value: user.rating || 0, color: 'text-gold' },
    { icon: Bell, label: 'Notifications', value: 3, color: 'text-coral' },
  ];

  const notifications = [
    { id: 1, type: 'request', message: 'Sarah wants to join your Bali trip', time: '2h ago', avatar: mockTravelers[0].avatar },
    { id: 2, type: 'match', message: 'New match! Michael is heading to Tokyo', time: '5h ago', avatar: mockTravelers[1].avatar },
    { id: 3, type: 'review', message: 'Emma left you a 5-star review', time: '1d ago', avatar: mockTravelers[2].avatar },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-4 border-secondary">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">
                  Welcome back, {user.name.split(' ')[0]}!
                </h1>
                <p className="text-muted-foreground">Ready for your next adventure?</p>
              </div>
            </div>
            <div className="flex gap-3">
              {!user.isPremium && (
                <Button variant="outline" asChild>
                  <Link to="/pricing">
                    <Crown className="h-4 w-4 mr-2 text-gold" />
                    Upgrade
                  </Link>
                </Button>
              )}
              <Button variant="hero" asChild>
                <Link to="/travel-plans/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Trip
                </Link>
              </Button>
            </div>
          </div>
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
              <div className={`h-10 w-10 rounded-xl bg-secondary flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="font-heading text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Trips */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  Your Upcoming Trips
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/travel-plans">
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>

              {userPlans.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {userPlans.slice(0, 2).map((plan, i) => (
                    <TravelPlanCard key={plan.id} plan={plan} index={i} />
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
                  <div className="h-16 w-16 rounded-2xl gradient-sunset mx-auto mb-4 flex items-center justify-center">
                    <Plane className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    No trips planned yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first travel plan and start finding buddies!
                  </p>
                  <Button variant="hero" asChild>
                    <Link to="/travel-plans/add">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Trip
                    </Link>
                  </Button>
                </div>
              )}
            </motion.section>

            {/* Matched Travelers */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  Matched Travelers
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/explore">
                    Explore More <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {matchedTravelers.map((traveler, i) => (
                  <motion.div
                    key={traveler.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="bg-card rounded-2xl border border-border/50 p-4 text-center hover-lift"
                  >
                    <Avatar className="h-14 w-14 mx-auto border-2 border-secondary mb-3">
                      <AvatarImage src={traveler.avatar} alt={traveler.name} />
                      <AvatarFallback>{traveler.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-medium text-sm text-foreground mb-1 truncate">
                      {traveler.name}
                    </h3>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-3">
                      <Star className="h-3 w-3 text-gold fill-gold" />
                      {traveler.rating}
                    </div>
                    <Button variant="teal" size="sm" className="w-full">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Chat
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Notifications */}
            <div className="bg-card rounded-2xl border border-border/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-foreground">Notifications</h3>
                <Badge variant="secondary">3 new</Badge>
              </div>
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={notif.avatar} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-3">
                View All Notifications
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-2xl border border-border/50 p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/travel-plans/add">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Trip
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/explore">
                    <Users className="h-4 w-4 mr-2" />
                    Find Travelers
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to={`/profile/${user.id}`}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </div>

            {/* Premium CTA */}
            {!user.isPremium && (
              <div className="gradient-sunset rounded-2xl p-5 text-primary-foreground">
                <Crown className="h-8 w-8 mb-3" />
                <h3 className="font-heading font-semibold text-lg mb-2">Go Premium</h3>
                <p className="text-sm text-primary-foreground/90 mb-4">
                  Unlock unlimited matches, verified badge, and exclusive features.
                </p>
                <Button size="sm" className="bg-background text-foreground hover:bg-background/90" asChild>
                  <Link to="/pricing">Upgrade Now</Link>
                </Button>
              </div>
            )}
          </motion.aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
