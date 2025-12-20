import { CheckCircle2, Map, Users, Shield, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const quickTips = [
  'Send a hello with your trip dates and vibe so people can reply fast.',
  'Use the safety checklist before you meet—share itinerary, meet in public, verify IDs.',
  'Create a trip post instead of a chat blast so travelers can join and stay in sync.',
  'Pin your must-do items in the trip so the group can align expectations early.',
];

const steps = [
  {
    icon: Users,
    title: 'Create Your Profile',
    text: 'Share your interests, travel style, and availability so we can match you with the right travelers.',
  },
  {
    icon: Map,
    title: 'Find or Post Trips',
    text: 'Browse upcoming adventures or create your own trip with images, dates, and max travelers.',
  },
  {
    icon: Shield,
    title: 'Stay Safe',
    text: 'Use verified profiles, messaging, and our safety resources to plan confidently.',
  },
  {
    icon: Sparkles,
    title: 'Travel Together',
    text: 'Join the group, align on plans, and enjoy the journey with like-minded people.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <div className="page-shell py-12">
        <div className="max-w-5xl mx-auto space-y-10">
          <header className="space-y-3 text-center">
            <p className="text-sm font-semibold text-orange-500">Getting Started</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">How It Works</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Match with travelers, plan safely, and make trips happen together.</p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            {steps.map((step) => (
              <div key={step.title} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <step.icon className="h-6 w-6 text-orange-500" />
                  <h2 className="text-xl font-semibold text-foreground">{step.title}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">{step.text}</p>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Built for safety and ease</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-orange-50 to-teal-50 dark:from-orange-500/10 dark:to-teal-500/10 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg md:text-xl font-semibold text-foreground">Quick start tips</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {quickTips.map((tip) => (
                <div key={tip} className="card-surface p-4 h-full flex items-start gap-3">
                  <div className="mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
