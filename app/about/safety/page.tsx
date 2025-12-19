import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, PhoneCall, Users, AlertTriangle, Heart, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Safety Guidelines - TripBuddy Go",
  description:
    "Stay safe while finding travel buddies. Learn how TripBuddy Go keeps you protected and what you can do to travel confidently.",
};

const safetyTips = [
  {
    title: "Verify Profiles",
    description: "Look for verified badges and reviews before meeting up. Message through the platform first.",
    icon: ShieldCheck,
  },
  {
    title: "Meet in Public",
    description: "Choose busy, well-lit locations for first meetups and share your plans with a trusted friend.",
    icon: Users,
  },
  {
    title: "Trust Your Instincts",
    description: "If something feels off, pause the conversation, report the profile, and move on.",
    icon: AlertTriangle,
  },
  {
    title: "Secure Payments",
    description: "Never send deposits or payments off-platform. Use trusted providers and avoid wire transfers.",
    icon: Heart,
  },
  {
    title: "Stay In-App",
    description: "Keep chats inside TripBuddy Go until you are comfortable. This helps us protect you if issues arise.",
    icon: MessageSquare,
  },
  {
    title: "Emergency Ready",
    description: "Save local emergency numbers and your embassy contacts when traveling abroad.",
    icon: PhoneCall,
  },
];

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="section-shell border-b border-border/50">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge className="mx-auto">Safety First</Badge>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            Travel Confidently, Stay Safe
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Your safety is our priority. Follow these guidelines and use TripBuddy Go tools to keep every connection positive.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="gradient-sunset text-white" size="lg">
              <Link href="/auth/register">Create a safe profile</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/faq">View FAQs</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="page-shell grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {safetyTips.map((tip) => (
            <div key={tip.title} className="card-surface p-6 flex flex-col gap-3">
              <div className="h-12 w-12 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center">
                <tip.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-xl text-foreground">{tip.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{tip.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell bg-secondary/20">
        <div className="page-shell max-w-4xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <Badge>Reporting</Badge>
            <h2 className="font-heading text-3xl font-bold text-foreground">See something off? Tell us.</h2>
            <p className="text-muted-foreground">
              Use the in-app report button on profiles or messages. Our safety team reviews reports within 24 hours and may
              restrict or remove accounts that violate our guidelines.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/matchmaking">Find trusted matches</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact support</Link>
              </Button>
            </div>
          </div>
          <div className="card-surface p-6 space-y-4">
            <h3 className="font-heading text-xl text-foreground">Quick Safety Checklist</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li>• Share your trip plan with a friend.</li>
              <li>• Use video chat before meeting in person.</li>
              <li>• Keep copies of IDs and travel insurance.</li>
              <li>• Agree on boundaries and expectations early.</li>
              <li>• Avoid sharing sensitive documents over chat.</li>
            </ul>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
