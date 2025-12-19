'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Compass, Users, MapPin, Calendar, Star, ArrowRight,
  Globe, Shield, Heart, CheckCircle2, Plane, Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Image from 'next/image';

const MotionButton = motion.create(Button);

const testimonials = [
  {
    name: 'Emily Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    location: 'San Francisco',
    text: 'Found my perfect travel buddy for a 2-week trip to Japan. We shared amazing experiences and made memories that will last forever!',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    location: 'London',
    text: 'As a solo traveler, I was nervous about meeting strangers. TravelBuddy made it easy and safe to connect with like-minded adventurers.',
    rating: 5,
  },
  {
    name: 'Sofia Garcia',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    location: 'Barcelona',
    text: 'The matching system is incredible! It found me travel companions with the exact same interests and travel style.',
    rating: 5,
  },
];

const howItWorks = [
  { icon: Users, title: 'Create Your Profile', description: 'Share your travel style, interests, and destinations you dream of exploring.' },
  { icon: Plane, title: 'Post Your Trip', description: 'Share your upcoming travel plans and let others discover your adventure.' },
  { icon: Heart, title: 'Find Your Buddy', description: 'Connect with travelers heading to the same destination and start planning together.' },
];

const stats = [
  { value: '50K+', label: 'Active Travelers' },
  { value: '120+', label: 'Countries' },
  { value: '15K+', label: 'Trips Matched' },
  { value: '4.9', label: 'Average Rating' },
];

export default function Home() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [topTravelers, setTopTravelers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch travel plans for destinations
        const plansRes = await fetch('/api/travel-plans?limit=100');
        if (plansRes.ok) {
          const data = await plansRes.json();
          // Group by destination and count
          const destinationMap = new Map();
          data.plans.forEach((plan: any) => {
            const dest = plan.destination;
            if (!destinationMap.has(dest)) {
              destinationMap.set(dest, {
                name: dest,
                image: plan.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600',
                travelers: 0
              });
            }
            destinationMap.get(dest).travelers += plan.currentParticipants || 1;
          });
          
          // Convert to array and sort by travelers count
          const destArray = Array.from(destinationMap.values())
            .sort((a, b) => b.travelers - a.travelers)
            .slice(0, 4);
          
          setDestinations(destArray);
        }

        // Fetch users with reviews
        const usersRes = await fetch('/api/reviews');
        if (usersRes.ok) {
          const reviewData = await usersRes.json();
          // Group reviews by user and calculate stats
          const userStatsMap = new Map();
          
          reviewData.reviews?.forEach((review: any) => {
            const userId = review.target?._id || review.target;
            if (!userId) return;
            
            if (!userStatsMap.has(userId)) {
              userStatsMap.set(userId, {
                id: userId,
                name: review.target?.name || 'Unknown',
                avatar: review.target?.avatar,
                location: review.target?.location || 'Unknown',
                interests: review.target?.interests || [],
                totalRating: 0,
                count: 0
              });
            }
            
            const userStats = userStatsMap.get(userId);
            userStats.totalRating += review.rating;
            userStats.count += 1;
          });
          
          // Calculate average ratings and sort
          const topUsers = Array.from(userStatsMap.values())
            .filter(u => u.count > 0)
            .map(u => ({
              ...u,
              rating: u.totalRating / u.count,
              reviewCount: u.count
            }))
            .sort((a, b) => {
              if (b.rating !== a.rating) return b.rating - a.rating;
              return b.reviewCount - a.reviewCount;
            })
            .slice(0, 4);
          
          setTopTravelers(topUsers);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--coral)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--teal)/0.1),transparent_50%)]" />

        <div className="page-shell py-20 lg:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 gradient-sunset text-primary-foreground px-4 py-1.5">
                <Globe className="h-3.5 w-3.5 mr-1" />
                Join 50,000+ travelers worldwide
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
            >
              Find Your Perfect{' '}
              <span className="text-gradient-sunset">Travel Buddy</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Connect with like-minded travelers, plan amazing adventures together,
              and turn solo journeys into shared experiences.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <MotionButton
                variant="hero"
                size="lg"
                asChild
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link href="/register">
                  Start Your Journey
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </MotionButton>
              <MotionButton
                variant="outline"
                size="lg"
                asChild
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link href="/explore">
                  <Compass className="h-5 w-5 mr-2" />
                  Explore Travelers
                </Link>
              </MotionButton>
            </motion.div>

            {/* Floating avatars */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-12 flex justify-center items-center gap-2"
            >
              {topTravelers.length > 0 ? (
                <>
                  <div className="flex -space-x-3">
                    {topTravelers.slice(0, 5).map((traveler, i) => (
                      <Avatar key={i} className="h-10 w-10 border-2 border-background">
                        {traveler.avatar ? (
                          <Image
                            src={traveler.avatar}
                            alt={traveler.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <AvatarFallback>{traveler.name.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground ml-3">
                    <span className="font-semibold text-foreground">Join our community</span> of travelers
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Join our community</span> of travelers
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-shell border-y border-border/50 bg-card/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-heading text-3xl md:text-4xl font-bold text-gradient-sunset mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="section-shell">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4">How It Works</Badge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Start Your Adventure in <span className="text-gradient-sunset">3 Simple Steps</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform makes it easy to find compatible travel companions and plan unforgettable trips together.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {howItWorks.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative text-center group"
            >
              <div className="relative inline-flex mb-6">
                <div className="h-20 w-20 rounded-2xl gradient-sunset flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="h-10 w-10 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-teal text-accent-foreground font-bold flex items-center justify-center text-sm">
                  {i + 1}
                </div>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="section-shell bg-secondary/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
        >
          <div>
            <Badge variant="secondary" className="mb-4">Top Destinations</Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
              Popular <span className="text-gradient-sunset">Destinations</span>
            </h2>
            <p className="text-muted-foreground">Where travelers are heading next</p>
          </div>
          <Button variant="ghost" className="mt-4 md:mt-0" asChild>
            <Link href="/explore">
              View all destinations
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
            ))
          ) : destinations.length > 0 ? (
            destinations.map((dest, i) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer hover-lift"
              >
                {dest.image && dest.image.startsWith('http') ? (
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-300 to-pink-300 flex items-center justify-center">
                    <MapPin className="h-16 w-16 text-white/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-heading text-lg font-semibold text-background mb-1">{dest.name}</h3>
                  <div className="flex items-center gap-1 text-background/80 text-sm">
                    <Users className="h-3.5 w-3.5" />
                    {dest.travelers} travelers interested
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-4 text-center py-12 text-muted-foreground">
              No destinations available yet
            </div>
          )}
        </div>
      </section>

      {/* Featured Travelers */}
      <section className="section-shell">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">Community</Badge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Meet Our <span className="text-gradient-sunset">Top Travelers</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect with experienced travelers who are ready to share their next adventure
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
            ))
          ) : topTravelers.length > 0 ? (
            topTravelers.map((traveler, i) => (
              <motion.div
                key={traveler.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border/50 p-6 text-center hover-lift"
              >
                <Avatar className="h-20 w-20 mx-auto border-4 border-secondary mb-4">
                  {traveler.avatar ? (
                    <AvatarImage src={traveler.avatar} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-orange-300 to-pink-300 text-white text-xl font-bold">
                      {traveler.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h3 className="font-heading font-semibold text-foreground mb-1">{traveler.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{traveler.location}</p>
                <div className="flex items-center justify-center gap-1 mb-3">
                  <Star className="h-4 w-4 text-gold fill-gold" />
                  <span className="font-medium">{traveler.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({traveler.reviewCount})</span>
                </div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {traveler.interests.slice(0, 3).map((interest: string) => (
                    <Badge key={interest} variant="secondary" className="text-xs">{interest}</Badge>
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-4 text-center py-12 text-muted-foreground">
              No top travelers available yet
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" size="lg" asChild>
            <Link href="/explore">
              Explore All Travelers
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-shell bg-muted">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-coral/20 text-coral border-coral/30">Testimonials</Badge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Travelers <span className="text-coral">Love Us</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from travelers who found their perfect companions through our platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-surface p-6"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-gold fill-gold" />
                ))}
              </div>
              <p className="text-foreground mb-6 italic">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={testimonial.avatar} />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-shell">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4">Why TravelBuddy</Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
              Travel Together, <span className="text-gradient-sunset">Create Memories</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              We're more than just a matching platform. We're a community of passionate travelers
              who believe that the best adventures are shared ones.
            </p>

            <div className="space-y-4">
              {[
                { icon: Shield, text: 'Verified profiles and secure messaging' },
                { icon: Users, text: 'Smart matching based on interests and travel style' },
                { icon: Camera, text: 'Share photos and experiences with your matches' },
                { icon: Globe, text: 'Connect with travelers from 120+ countries' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-foreground">{item.text}</span>
                </div>
              ))}
            </div>

            <MotionButton
              variant="hero"
              size="lg"
              className="mt-8"
              asChild
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link href="/register">
                Join the Community
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </MotionButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative h-[500px] rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800"
                alt="Travelers"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
            </div>

            {/* Floating card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-4 shadow-xl border border-border/50 max-w-xs"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-full gradient-sunset flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">15,000+</p>
                  <p className="text-sm text-muted-foreground">Successful matches</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-shell">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 gradient-sunset" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_50%)]" />

          <div className="relative px-8 py-16 lg:py-24 text-center">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              Ready to Find Your Travel Buddy?
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of travelers who have found their perfect companions.
              Your next adventure is just a click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <MotionButton
                size="lg"
                className="bg-background text-foreground hover:bg-background/90"
                asChild
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </MotionButton>
              <MotionButton
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link href="/pricing">
                  View Premium Plans
                </Link>
              </MotionButton>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
