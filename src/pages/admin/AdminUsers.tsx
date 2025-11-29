import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter, MoreHorizontal, UserX, Edit, Eye, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { mockTravelers } from '@/data/mockTravelers';
import { useToast } from '@/hooks/use-toast';

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const filteredUsers = mockTravelers.filter((traveler) => {
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        traveler.name.toLowerCase().includes(search) ||
        traveler.location.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const handleAction = (action: string, userName: string) => {
    toast({
      title: `${action} action`,
      description: `${action} performed on ${userName}`,
    });
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
                Manage Users
              </h1>
              <p className="text-muted-foreground">
                {filteredUsers.length} users in the platform
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-card rounded-2xl border border-border/50 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
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

          {/* Users Table */}
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Rating</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Trips</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((traveler, i) => (
                    <motion.tr
                      key={traveler.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-border">
                            <AvatarImage src={traveler.avatar} />
                            <AvatarFallback>{traveler.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{traveler.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {traveler.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {traveler.name.toLowerCase().replace(' ', '.')}@email.com
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {traveler.location}
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant={traveler.isPremium ? 'default' : 'secondary'}
                          className={traveler.isPremium ? 'gradient-sunset text-primary-foreground' : ''}
                        >
                          {traveler.isPremium ? 'Premium' : 'Free'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-sm text-foreground">
                        {traveler.rating} ({traveler.reviewCount})
                      </td>
                      <td className="py-4 px-6 text-sm text-foreground">
                        {traveler.upcomingTrips}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAction('View', traveler.name)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('Edit', traveler.name)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleAction('Block', traveler.name)}
                              className="text-destructive"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Block User
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleAction('Delete', traveler.name)}
                              className="text-destructive"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Delete User
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
