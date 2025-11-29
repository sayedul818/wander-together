import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TravelPlanCard } from '@/components/cards/TravelPlanCard';
import { useAuth } from '@/contexts/AuthContext';
import { useTravelPlans, TravelType, BudgetRange } from '@/contexts/TravelPlansContext';
import { useToast } from '@/hooks/use-toast';

export default function TravelPlans() {
  const { user } = useAuth();
  const { plans, getUserPlans, searchPlans, deletePlan } = useTravelPlans();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [travelType, setTravelType] = useState<TravelType | ''>('');
  const [showMyPlans, setShowMyPlans] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userPlans = getUserPlans(user.id);
  
  const filteredPlans = showMyPlans
    ? userPlans
    : plans.filter((plan) => {
        if (!plan.isPublic) return false;
        
        if (searchQuery) {
          const search = searchQuery.toLowerCase();
          if (
            !plan.destination.toLowerCase().includes(search) &&
            !plan.country.toLowerCase().includes(search)
          ) {
            return false;
          }
        }
        
        if (travelType && plan.travelType !== travelType) {
          return false;
        }
        
        return true;
      });

  const handleDelete = (planId: string) => {
    deletePlan(planId);
    toast({
      title: 'Trip deleted',
      description: 'Your travel plan has been removed.',
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTravelType('');
  };

  const hasFilters = searchQuery || travelType;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
              Travel <span className="text-gradient-sunset">Plans</span>
            </h1>
            <p className="text-muted-foreground">
              {showMyPlans
                ? 'Manage your upcoming adventures'
                : 'Discover trips and find travel buddies'}
            </p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/travel-plans/add">
              <Plus className="h-4 w-4 mr-2" />
              Create Trip
            </Link>
          </Button>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          <Button
            variant={showMyPlans ? 'outline' : 'default'}
            onClick={() => setShowMyPlans(false)}
          >
            All Trips
          </Button>
          <Button
            variant={showMyPlans ? 'default' : 'outline'}
            onClick={() => setShowMyPlans(true)}
          >
            My Trips ({userPlans.length})
          </Button>
        </motion.div>

        {/* Search and Filters */}
        {!showMyPlans && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border/50 p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search destinations..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={travelType} onValueChange={(v) => setTravelType(v as TravelType)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Travel Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Solo">Solo</SelectItem>
                  <SelectItem value="Friends">Friends</SelectItem>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Couple">Couple</SelectItem>
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredPlans.length}</span> trips
            </p>
          </div>

          {filteredPlans.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map((plan, i) => (
                <TravelPlanCard
                  key={plan.id}
                  plan={plan}
                  index={i}
                  showActions={showMyPlans && plan.userId === user.id}
                  onDelete={() => handleDelete(plan.id)}
                  onEdit={() => {
                    toast({
                      title: 'Edit coming soon',
                      description: 'This feature is under development.',
                    });
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-secondary mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                {showMyPlans ? 'No trips planned yet' : 'No trips found'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {showMyPlans
                  ? 'Create your first travel plan and start finding buddies!'
                  : 'Try adjusting your filters or search criteria'}
              </p>
              {showMyPlans ? (
                <Button variant="hero" asChild>
                  <Link to="/travel-plans/add">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Trip
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
