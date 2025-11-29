import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, MapPin, Star, Users, Wallet, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TravelPlan } from '@/contexts/TravelPlansContext';

interface TravelPlanCardProps {
  plan: TravelPlan;
  index?: number;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TravelPlanCard({ plan, index = 0, showActions, onEdit, onDelete }: TravelPlanCardProps) {
  const budgetColors = {
    Budget: 'bg-green/10 text-green',
    'Mid-Range': 'bg-teal/10 text-teal',
    Luxury: 'bg-gold/10 text-gold',
  };

  const travelTypeColors = {
    Solo: 'bg-purple/10 text-purple',
    Friends: 'bg-sky/10 text-sky',
    Family: 'bg-coral/10 text-coral',
    Couple: 'bg-destructive/10 text-destructive',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover-lift"
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={plan.coverImage}
          alt={plan.destination}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
        
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className={travelTypeColors[plan.travelType]}>
            <Users className="h-3 w-3 mr-1" />
            {plan.travelType}
          </Badge>
          <Badge className={budgetColors[plan.budget]}>
            <Wallet className="h-3 w-3 mr-1" />
            {plan.budget}
          </Badge>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-heading font-bold text-xl text-background mb-1">
            {plan.destination}
          </h3>
          <div className="flex items-center gap-1 text-background/80 text-sm">
            <MapPin className="h-3.5 w-3.5" />
            {plan.country}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Host Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-border">
              <AvatarImage src={plan.userAvatar} alt={plan.userName} />
              <AvatarFallback>{plan.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{plan.userName}</p>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-gold fill-gold" />
                <span className="text-xs text-muted-foreground">{plan.userRating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Calendar className="h-4 w-4 text-primary" />
          <span>
            {format(new Date(plan.startDate), 'MMM d')} - {format(new Date(plan.endDate), 'MMM d, yyyy')}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {plan.description}
        </p>

        {/* Interests */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {plan.interests.slice(0, 3).map((interest) => (
            <Badge key={interest} variant="secondary" className="text-xs">
              {interest}
            </Badge>
          ))}
          {plan.interests.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{plan.interests.length - 3}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {showActions ? (
            <>
              <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" className="flex-1" onClick={onDelete}>
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link to={`/travel-plans/${plan.id}`}>View Details</Link>
              </Button>
              <Button variant="hero" size="sm" className="flex-1">
                Request to Join
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
