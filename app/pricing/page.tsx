'use client';


import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';

const pricingPlans = [
  {
    name: 'Traveler',
    price: 'Free',
    description: 'Get started on your journey',
    features: [
      'Create up to 3 trips',
      'Join unlimited trips',
      'Basic profile',
      'Message with travelers',
      'Community access',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Explorer',
    price: '$9.99',
    period: '/month',
    description: 'For serious travelers',
    features: [
      'Unlimited trip creation',
      'Join unlimited trips',
      'Premium profile badge',
      'Advanced search filters',
      'Video calls with travelers',
      'Priority support',
      'Trip planning tools',
    ],
    cta: 'Upgrade Now',
    highlighted: true,
  },
  {
    name: 'Adventurer',
    price: '$24.99',
    period: '/month',
    description: 'The ultimate travel experience',
    features: [
      'Everything in Explorer',
      'Dedicated trip organizer',
      'Verified traveler badge',
      'Travel insurance options',
      '24/7 support',
      'Custom trip planning',
      'Group discount access',
      'Annual trip review',
    ],
    cta: 'Upgrade Now',
    highlighted: false,
  },
];


export default function PricingPage() {
  const router = useRouter();
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {}
      setIsLoadingUser(false);
    };
    fetchUser();
  }, []);

  // Helper to handle Stripe checkout
  const handleUpgrade = async (planName: string, idx: number) => {
    // Redirect to login if user is not logged in
    if (!user) {
      router.push('/login');
      return;
    }

    setLoadingIdx(idx);
    try {
      if (user?.isPremium) {
        alert('Already upgraded');
        return;
      }
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName.toLowerCase() }),
      });
      if (!res.ok) throw new Error('Failed to create checkout session');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Could not start checkout.');
      }
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    } finally {
      setLoadingIdx(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="section-shell">
        <div className="page-shell text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Simple, Transparent <span className="text-gradient-sunset">Pricing</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Choose the perfect plan for your travel adventures. No hidden fees, cancel anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="section-shell flex-1">
        <div className="page-shell">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`card-surface border-2 p-8 transition ${
                  plan.highlighted
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 shadow-lg scale-105'
                    : 'border-border hover:border-orange-200'
                }`}
              >
                {/* Badge */}
                {plan.highlighted && (
                  <div className="mb-4 inline-block">
                    <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-4xl font-bold text-foreground">
                    {plan.price}
                    {plan.period && <span className="text-lg text-muted-foreground">{plan.period}</span>}
                  </div>
                </div>

                {/* CTA */}
                {plan.price === 'Free' ? (
                  <Link href="/register">
                    <Button
                      className="w-full mb-8"
                      size="lg"
                      variant={plan.highlighted ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="w-full mb-8"
                    size="lg"
                    variant={plan.highlighted ? 'default' : 'outline'}
                    onClick={() => handleUpgrade(plan.name, idx)}
                    disabled={loadingIdx === idx || user?.isPremium}
                  >
                    {user?.isPremium ? 'Already upgraded' : (loadingIdx === idx ? 'Redirecting...' : plan.cta)}
                  </Button>
                )}

                {/* Features */}
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-shell bg-background">
        <div className="page-shell max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {[
              {
                q: 'Can I change my plan anytime?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'Do you offer refunds?',
                a: "We offer a 30-day money-back guarantee on all premium plans if you're not satisfied.",
              },
              {
                q: 'Is there a long-term contract?',
                a: 'No contracts! You can cancel your subscription at any time without penalties.',
              },
              {
                q: 'Can groups get discounts?',
                a: 'Adventurer members can access group discounts. Contact our support team for details.',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="card-surface p-6"
              >
                <h3 className="font-semibold text-foreground mb-2">{item.q}</h3>
                <p className="text-muted-foreground">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
