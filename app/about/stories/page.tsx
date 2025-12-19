import type { Metadata } from "next";
import { Star, Globe2, Heart, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Traveler Stories - TripBuddy Go",
  description: "Real connections and adventures from TripBuddy Go travelers around the world.",
};

const stories = [
  {
    name: "Priya & Matteo",
    location: "Lisbon, Portugal",
    highlight: "Met through Explore, co-planned a surf and food trip, and now run a shared travel blog.",
    stats: "12 days · 8 cafés · 3 sunsets",
  },
  {
    name: "Sam, Lina & Omar",
    location: "Kyoto, Japan",
    highlight: "Matched on similar dates and interests. Hiked Fushimi Inari at dawn and swapped photo tips.",
    stats: "5 cities · 2 rail passes · endless ramen",
  },
  {
    name: "Alex & Noor",
    location: "Mexico City, Mexico",
    highlight: "Started as remote work buddies, ended up exploring museums and co-working spots together.",
    stats: "10 tacos · 4 co-work days · 1 lucha libre night",
  },
];

export default function StoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="section-shell border-b border-border/50">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge className="mx-auto">Traveler Stories</Badge>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            Real Trips. Real Connections.
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            See how travelers use TripBuddy Go to find trustworthy companions, split costs, and create memories together.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="gradient-sunset text-white" size="lg" asChild>
              <a href="/explore">Find your match</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/travel-plans/add">Share your plan</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="page-shell grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div key={story.name} className="card-surface p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{story.location}</p>
                  <h3 className="font-heading text-xl text-foreground">{story.name}</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-secondary/20 text-secondary flex items-center justify-center">
                  <Star className="h-5 w-5" />
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">{story.highlight}</p>
              <div className="text-sm text-primary font-semibold">{story.stats}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell bg-secondary/20">
        <div className="page-shell max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <Badge>Why it works</Badge>
            <h2 className="font-heading text-3xl font-bold text-foreground">Travel is better together.</h2>
            <p className="text-muted-foreground">
              Smart matching pairs you by dates, destinations, and interests. Reviews, badges, and in-app chat help you build
              trust before you ever meet up.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card-surface p-4 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Globe2 className="h-4 w-4" />
                  50+ countries
                </div>
                <p className="text-muted-foreground text-sm">Members finding buddies across time zones.</p>
              </div>
              <div className="card-surface p-4 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Users className="h-4 w-4" />
                  Group-friendly
                </div>
                <p className="text-muted-foreground text-sm">Plan small crews or bigger trips with clear roles.</p>
              </div>
            </div>
          </div>
          <div className="card-surface p-6 space-y-3">
            <h3 className="font-heading text-xl text-foreground">Share your win</h3>
            <p className="text-muted-foreground">
              Tag @tripbuddygo and use #TravelTogether to be featured. We love showcasing creative itineraries and the
              friendships that start here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="gradient-sunset text-white" asChild>
                <a href="/contact">Submit your story</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/pricing">See Premium perks</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
