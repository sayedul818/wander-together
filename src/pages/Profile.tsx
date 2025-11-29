import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, Star, Crown, Calendar, Globe, Edit, 
  MessageCircle, Share2, Flag
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

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const { getUserPlans } = useTravelPlans();

  // Find profile data
  const isOwnProfile = user?.id === id;
  const profileData = isOwnProfile
    ? user
    : mockTravelers.find((t) => t.id === id) || {
        id: id || '',
        name: 'Traveler',
        avatar: '',
        bio: 'No bio available',
        interests: [],
        visitedCountries: [],
        location: 'Unknown',
        isPremium: false,
        rating: 0,
        reviewCount: 0,
      };

  const userPlans = getUserPlans(id || '');

  const reviews = [
    { id: 1, author: 'Michael C.', avatar: mockTravelers[1].avatar, rating: 5, text: 'Amazing travel companion! Super organized and fun to be around.', date: '2024-10-15' },
    { id: 2, author: 'Emma W.', avatar: mockTravelers[2].avatar, rating: 5, text: 'Had a wonderful time exploring together. Highly recommended!', date: '2024-09-22' },
    { id: 3, author: 'David P.', avatar: mockTravelers[3].avatar, rating: 4, text: 'Great person to travel with. Very respectful and adventurous.', date: '2024-08-10' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-card rounded-2xl border border-border/50 p-6 sticky top-24">
              <div className="relative mb-6">
                <Avatar className="h-28 w-28 mx-auto border-4 border-secondary">
                  <AvatarImage src={profileData.avatar} alt={profileData.name} />
                  <AvatarFallback className="text-3xl">{profileData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {profileData.isPremium && (
                  <div className="absolute top-0 right-1/4 h-8 w-8 rounded-full bg-gold flex items-center justify-center">
                    <Crown className="h-4 w-4 text-foreground" />
                  </div>
                )}
              </div>

              <div className="text-center mb-6">
                <h1 className="font-heading text-2xl font-bold text-foreground mb-1">
                  {profileData.name}
                </h1>
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4" />
                  {profileData.location}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gold/10">
                    <Star className="h-4 w-4 text-gold fill-gold" />
                    <span className="font-semibold">{profileData.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({profileData.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground text-center mb-6">
                {profileData.bio}
              </p>

              {isOwnProfile ? (
                <Button variant="outline" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button variant="hero" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="border-t border-border mt-6 pt-6">
                <h3 className="font-medium text-foreground mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.interests?.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t border-border mt-6 pt-6">
                <h3 className="font-medium text-foreground mb-3">
                  <Globe className="h-4 w-4 inline mr-2" />
                  Countries Visited
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.visitedCountries?.map((country) => (
                    <Badge key={country} variant="outline">
                      {country}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Trips */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                {isOwnProfile ? 'Your Travel Plans' : 'Upcoming Trips'}
              </h2>
              
              {userPlans.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {userPlans.map((plan, i) => (
                    <TravelPlanCard key={plan.id} plan={plan} index={i} />
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming trips</p>
                  {isOwnProfile && (
                    <Button variant="hero" className="mt-4" asChild>
                      <Link to="/travel-plans/add">Create a Trip</Link>
                    </Button>
                  )}
                </div>
              )}
            </motion.section>

            {/* Reviews */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                Reviews ({reviews.length})
              </h2>
              
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-card rounded-2xl border border-border/50 p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.avatar} />
                          <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{review.author}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-gold fill-gold" />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.text}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
