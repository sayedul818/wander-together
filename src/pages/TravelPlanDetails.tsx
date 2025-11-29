import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  ArrowLeft, Calendar, MapPin, Users, Wallet, Star, 
  MessageCircle, Share2, Heart, Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useTravelPlans } from '@/contexts/TravelPlansContext';
import { useToast } from '@/hooks/use-toast';

export default function TravelPlanDetails() {
  const { id } = useParams();
  const { plans, requestToJoin } = useTravelPlans();
  const { toast } = useToast();

  const plan = plans.find((p) => p.id === id);

  if (!plan) {
    return <Navigate to="/travel-plans" replace />;
  }

  const handleRequestJoin = () => {
    toast({
      title: 'Request Sent!',
      description: `Your request to join the ${plan.destination} trip has been sent to ${plan.userName}.`,
    });
  };

  const budgetColors = {
    Budget: 'bg-green/10 text-green border-green/20',
    'Mid-Range': 'bg-teal/10 text-teal border-teal/20',
    Luxury: 'bg-gold/10 text-gold border-gold/20',
  };

  const travelTypeColors = {
    Solo: 'bg-purple/10 text-purple border-purple/20',
    Friends: 'bg-sky/10 text-sky border-sky/20',
    Family: 'bg-coral/10 text-coral border-coral/20',
    Couple: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Image */}
        <div className="relative h-[40vh] md:h-[50vh]">
          <img
            src={plan.coverImage}
            alt={plan.destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
          
          <div className="absolute top-4 left-4">
            <Button variant="glass" size="sm" asChild>
              <Link to="/travel-plans">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="container mx-auto">
              <div className="flex gap-2 mb-4">
                <Badge className={travelTypeColors[plan.travelType]}>
                  <Users className="h-3 w-3 mr-1" />
                  {plan.travelType}
                </Badge>
                <Badge className={budgetColors[plan.budget]}>
                  <Wallet className="h-3 w-3 mr-1" />
                  {plan.budget}
                </Badge>
              </div>
              <h1 className="font-heading text-3xl md:text-5xl font-bold text-background mb-2">
                {plan.destination}
              </h1>
              <div className="flex items-center gap-2 text-background/90">
                <MapPin className="h-4 w-4" />
                {plan.country}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Trip Details */}
              <div className="bg-card rounded-2xl border border-border/50 p-6">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                  Trip Details
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Dates</p>
                      <p className="font-medium text-foreground">
                        {format(new Date(plan.startDate), 'MMM d')} - {format(new Date(plan.endDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                    <Users className="h-5 w-5 text-teal" />
                    <div>
                      <p className="text-sm text-muted-foreground">Travel Type</p>
                      <p className="font-medium text-foreground">{plan.travelType}</p>
                    </div>
                  </div>
                </div>

                <h3 className="font-medium text-foreground mb-2">About This Trip</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {plan.description}
                </p>

                <h3 className="font-medium text-foreground mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {plan.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" size="lg" className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="lg">
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            {/* Sidebar - Host Info */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-card rounded-2xl border border-border/50 p-6 sticky top-24">
                <h3 className="font-heading font-semibold text-foreground mb-4">
                  Meet Your Host
                </h3>

                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16 border-4 border-secondary">
                    <AvatarImage src={plan.userAvatar} alt={plan.userName} />
                    <AvatarFallback className="text-xl">{plan.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">{plan.userName}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-gold fill-gold" />
                      <span className="font-medium">{plan.userRating}</span>
                      <span className="text-sm text-muted-foreground">rating</span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full mb-3" asChild>
                  <Link to={`/profile/${plan.userId}`}>
                    View Full Profile
                  </Link>
                </Button>

                <div className="border-t border-border pt-4 mt-4">
                  <Button variant="hero" size="lg" className="w-full mb-3" onClick={handleRequestJoin}>
                    Request to Join
                  </Button>
                  <Button variant="teal" size="lg" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message Host
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By requesting to join, you agree to our community guidelines
                </p>
              </div>
            </motion.aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
