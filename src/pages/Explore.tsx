import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, X } from 'lucide-react';
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
import { TravelerCard } from '@/components/cards/TravelerCard';
import { mockTravelers, interests } from '@/data/mockTravelers';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [travelType, setTravelType] = useState<string>('');

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedInterests([]);
    setTravelType('');
  };

  const filteredTravelers = mockTravelers.filter((traveler) => {
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      if (
        !traveler.name.toLowerCase().includes(search) &&
        !traveler.location.toLowerCase().includes(search)
      ) {
        return false;
      }
    }

    if (selectedInterests.length > 0) {
      const hasMatchingInterest = selectedInterests.some((interest) =>
        traveler.interests.includes(interest)
      );
      if (!hasMatchingInterest) return false;
    }

    return true;
  });

  const hasFilters = searchQuery || selectedInterests.length > 0 || travelType;

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
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
            Explore <span className="text-gradient-sunset">Travelers</span>
          </h1>
          <p className="text-muted-foreground">
            Find your perfect travel companion from our community of adventurers
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border/50 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or location..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={travelType} onValueChange={setTravelType}>
              <SelectTrigger className="w-full lg:w-48">
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

          {/* Interest Tags */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filter by interests:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <Badge
                  key={interest}
                  variant={selectedInterests.includes(interest) ? 'default' : 'secondary'}
                  className={`cursor-pointer transition-all ${
                    selectedInterests.includes(interest)
                      ? 'gradient-sunset text-primary-foreground'
                      : 'hover:bg-secondary/80'
                  }`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredTravelers.length}</span> travelers
            </p>
          </div>

          {filteredTravelers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTravelers.map((traveler, i) => (
                <TravelerCard key={traveler.id} traveler={traveler} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-secondary mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                No travelers found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search criteria
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
