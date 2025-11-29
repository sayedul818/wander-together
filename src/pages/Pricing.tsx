import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Shield, Users, Star, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for getting started',
    features: [
      'Create up to 2 travel plans',
      'Basic profile',
      'View traveler profiles',
      'Limited messaging (5/day)',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Premium',
    price: { monthly: 9.99, yearly: 79.99 },
    description: 'For active travelers',
    features: [
      'Unlimited travel plans',
      'Verified badge',
      'Unlimited messaging',
      'Priority in search results',
      'Advanced matching algorithm',
      'Trip insights & analytics',
    ],
    cta: 'Subscribe Now',
    popular: true,
  },
  {
    name: 'Pro',
    price: { monthly: 19.99, yearly: 149.99 },
    description: 'For travel enthusiasts',
    features: [
      'Everything in Premium',
      'Featured profile placement',
      'Early access to new features',
      'Priority customer support',
      'Group trip planning tools',
      'Custom profile themes',
    ],
    cta: 'Go Pro',
    popular: false,
  },
];

export default function Pricing() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const handleSubscribe = (planName: string) => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to subscribe to a plan.',
        variant: 'destructive',
      });
      return;
    }

    // Mock subscription
    toast({
      title: 'Processing payment...',
      description: 'Redirecting to payment gateway.',
    });

    // Simulate payment success
    setTimeout(() => {
      if (planName !== 'Free') {
        updateUser({ isPremium: true });
        toast({
          title: 'Welcome to Premium!',
          description: 'Your account has been upgraded successfully.',
        });
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 gradient-sunset text-primary-foreground">
            <Crown className="h-3.5 w-3.5 mr-1" />
            Premium Plans
          </Badge>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Unlock Your <span className="text-gradient-sunset">Travel Potential</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Choose the plan that fits your travel style and connect with more travelers worldwide.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-secondary p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                billing === 'monthly'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                billing === 'yearly'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <Badge className="bg-green/10 text-green border-0 text-xs">Save 33%</Badge>
            </button>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`relative bg-card rounded-2xl border p-6 ${
                plan.popular
                  ? 'border-primary shadow-glow'
                  : 'border-border/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gradient-sunset text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    ${billing === 'monthly' ? plan.price.monthly : plan.price.yearly}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-muted-foreground">
                      /{billing === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? 'hero' : 'outline'}
                className="w-full"
                onClick={() => handleSubscribe(plan.name)}
                disabled={user?.isPremium && plan.name !== 'Pro'}
              >
                {user?.isPremium && plan.name === 'Premium' ? 'Current Plan' : plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Why Go <span className="text-gradient-sunset">Premium?</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'Priority Matching', description: 'Get matched with compatible travelers first' },
              { icon: Shield, title: 'Verified Badge', description: 'Stand out with a trusted verified profile' },
              { icon: Users, title: 'Unlimited Connections', description: 'Message as many travelers as you want' },
              { icon: Star, title: 'Featured Placement', description: 'Appear higher in search results' },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="bg-card rounded-2xl border border-border/50 p-6 text-center hover-lift"
              >
                <div className="h-12 w-12 rounded-xl gradient-sunset mx-auto mb-4 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <h2 className="font-heading text-2xl font-bold text-foreground text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              { q: 'Can I cancel my subscription anytime?', a: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.' },
              { q: 'Is there a free trial?', a: 'We offer a 7-day free trial for Premium plans. No credit card required to start.' },
              { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and Apple Pay through our secure payment processor.' },
              { q: 'Can I switch between plans?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.' },
            ].map((faq, i) => (
              <div key={i} className="bg-card rounded-xl border border-border/50 p-5">
                <h4 className="font-medium text-foreground mb-2">{faq.q}</h4>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
