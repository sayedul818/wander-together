import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter, MoreHorizontal, Trash2, Edit, Eye, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useTravelPlans } from '@/contexts/TravelPlansContext';
import { useToast } from '@/hooks/use-toast';

export default function AdminPlans() {
  const { user } = useAuth();
  const { plans, deletePlan } = useTravelPlans();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const filteredPlans = plans.filter((plan) => {
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        plan.destination.toLowerCase().includes(search) ||
        plan.country.toLowerCase().includes(search) ||
        plan.userName.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const handleDelete = (planId: string, destination: string) => {
    deletePlan(planId);
    toast({
      title: 'Plan deleted',
      description: `Trip to ${destination} has been removed.`,
    });
  };

  const handleAction = (action: string, destination: string) => {
    toast({
      title: `${action} action`,
      description: `${action} performed on ${destination} trip`,
    });
  };

  const budgetColors = {
    Budget: 'bg-green/10 text-green',
    'Mid-Range': 'bg-teal/10 text-teal',
    Luxury: 'bg-gold/10 text-gold',
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="ghost" className="mb-6" asChild>
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
                Manage Travel Plans
              </h1>
              <p className="text-muted-foreground">
                {filteredPlans.length} travel plans in the platform
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search destinations, hosts..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Plans Table */}
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Destination</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Host</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Budget</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Dates</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((plan, i) => (
                    <motion.tr
                      key={plan.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={plan.coverImage}
                            alt={plan.destination}
                            className="h-12 w-16 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-foreground">{plan.destination}</p>
                            <p className="text-xs text-muted-foreground">{plan.country}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {plan.userName}
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="secondary">{plan.travelType}</Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={budgetColors[plan.budget]}>{plan.budget}</Badge>
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {plan.startDate} - {plan.endDate}
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={plan.isPublic ? 'default' : 'outline'}>
                          {plan.isPublic ? 'Public' : 'Private'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAction('View', plan.destination)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('Edit', plan.destination)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Plan
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleAction('Hide', plan.destination)}
                              className="text-gold"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Hide Plan
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(plan.id, plan.destination)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Plan
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
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
