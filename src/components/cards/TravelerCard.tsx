import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Crown, MessageCircle, Plane } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Traveler } from '@/data/mockTravelers';

interface TravelerCardProps {
  traveler: Traveler;
  index?: number;
}

export function TravelerCard({ traveler, index = 0 }: TravelerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-card rounded-2xl border border-border/50 p-6 hover-lift"
    >
      {traveler.isPremium && (
        <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-gold flex items-center justify-center">
          <Crown className="h-4 w-4 text-foreground" />
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        <Avatar className="h-20 w-20 border-4 border-secondary mb-4">
          <AvatarImage src={traveler.avatar} alt={traveler.name} />
          <AvatarFallback className="text-xl">{traveler.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <h3 className="font-heading font-semibold text-lg text-foreground mb-1">
          {traveler.name}
        </h3>

        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="h-3.5 w-3.5" />
          {traveler.location}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gold/10">
            <Star className="h-3.5 w-3.5 text-gold fill-gold" />
            <span className="text-sm font-medium">{traveler.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            ({traveler.reviewCount} reviews)
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {traveler.bio}
        </p>

        <div className="flex flex-wrap gap-1.5 justify-center mb-4">
          {traveler.interests.slice(0, 3).map((interest) => (
            <Badge key={interest} variant="secondary" className="text-xs">
              {interest}
            </Badge>
          ))}
          {traveler.interests.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{traveler.interests.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Plane className="h-3.5 w-3.5 text-teal" />
            <span>{traveler.upcomingTrips} upcoming</span>
          </div>
          <span>•</span>
          <span>{traveler.visitedCountries.length} countries</span>
        </div>

        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to={`/profile/${traveler.id}`}>View Profile</Link>
          </Button>
          <Button variant="teal" size="sm" className="flex-1">
            <MessageCircle className="h-4 w-4 mr-1" />
            Connect
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
