import type { Metadata } from 'next';
import { motion } from 'framer-motion';
import { Shield, Users, Heart, Globe, CheckCircle2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'About Us - TripBuddy Go',
  description: 'Learn about TripBuddy Go - connecting travelers worldwide to create unforgettable adventures together.',
};

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Verified profiles, secure messaging, and comprehensive safety guidelines for worry-free travel connections.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Built by travelers for travelers, fostering genuine connections and shared experiences.',
    },
    {
      icon: Heart,
      title: 'Authentic Connections',
      description: 'Smart matching algorithms help you find travel companions who share your values and interests.',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connect with adventurers from 120+ countries, exploring destinations worldwide together.',
    },
  ];

  const milestones = [
    { year: '2020', event: 'TripBuddy Go founded with a vision to connect solo travelers' },
    { year: '2021', event: 'Reached 10,000 active travelers across 50 countries' },
    { year: '2023', event: 'Launched premium membership and smart matching algorithm' },
    { year: '2024', event: 'Celebrated 15,000+ successful travel matches' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="section-shell border-b border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6">About Us</Badge>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Connecting Travelers,{' '}
            <span className="text-gradient-sunset">Creating Adventures</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We believe that the best journeys are shared. TripBuddy Go brings together like-minded travelers
            from around the world to turn solo adventures into memorable experiences.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-shell">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="secondary" className="mb-4">Our Mission</Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
              Making Travel <span className="text-gradient-sunset">More Social</span>
            </h2>
            <p className="text-muted-foreground mb-4">
              Founded in 2020, TripBuddy Go was born from a simple idea: traveling is better when shared with others.
              Whether you're a solo adventurer looking for companionship, or someone seeking travel buddies with
              similar interests, we're here to help.
            </p>
            <p className="text-muted-foreground">
              Our platform uses smart matching technology to connect you with compatible travelers, ensuring
              your journey is safe, enjoyable, and filled with meaningful connections.
            </p>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800"
              alt="Travelers exploring together"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-shell bg-secondary/30">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Our Values</Badge>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            What We <span className="text-gradient-sunset">Stand For</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our core values guide everything we do, ensuring a safe, inclusive, and enriching platform for all travelers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => (
            <div key={value.title} className="card-surface p-6 text-center hover:shadow-lg transition-shadow">
              <div className="h-16 w-16 rounded-2xl gradient-sunset flex items-center justify-center mx-auto mb-4">
                <value.icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{value.title}</h3>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section-shell">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Our Journey</Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              <span className="text-gradient-sunset">Milestones</span> That Matter
            </h2>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full gradient-sunset flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
                <div className="flex-1 pb-8 border-b border-border/50 last:border-0">
                  <div className="font-heading text-xl font-bold text-gradient-sunset mb-2">{milestone.year}</div>
                  <p className="text-foreground">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-shell relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 dark:from-orange-600 dark:via-pink-700 dark:to-purple-800 text-white shadow-2xl max-w-6xl mx-auto">
        <div className="absolute inset-0 opacity-60 mix-blend-overlay bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.15),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.18),transparent_35%)]" />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur text-white text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Join Our Community
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight">
            Join Our <span className="text-white">Global Community</span>
          </h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Become part of a thriving community of 50,000+ travelers who know the best adventures are the ones we share.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="inline-flex items-center justify-center h-11 px-8 rounded-lg bg-white text-orange-600 font-semibold shadow-lg shadow-orange-500/30 transition-transform hover:-translate-y-0.5"
            >
              Start Your Journey
            </a>
            <a
              href="/explore"
              className="inline-flex items-center justify-center h-11 px-8 rounded-lg border border-white/70 text-white/95 hover:bg-white/10 transition-colors"
            >
              Explore Travelers
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
