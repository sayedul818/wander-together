"use client";

import React from "react";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Accordion components for FAQ
const Accordion = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-4">{children}</div>
);

const AccordionItem = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`card-surface px-6 border-0 ${className}`}>{children}</div>
);

const AccordionTrigger = ({ children }: { children: React.ReactNode }) => (
  <div className="text-left font-medium text-foreground hover:text-primary py-4 px-6 cursor-pointer border-b">
    {children}
  </div>
);

const AccordionContent = ({ children }: { children: React.ReactNode }) => (
  <div className="pb-4 pt-0 px-6 text-muted-foreground">{children}</div>
);

export function FAQContent() {
  const faqCategories = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click the "Sign Up" button in the navigation bar, fill in your details, and verify your email. You can then complete your profile with travel preferences and interests.',
        },
        {
          q: 'Is TripBuddy Go free to use?',
          a: 'Yes! Creating an account and browsing travelers is completely free. We also offer a Premium membership with additional features like unlimited messaging, priority matching, and verified badge.',
        },
        {
          q: 'How does the matching system work?',
          a: 'Our smart algorithm matches you with travelers based on shared destinations, travel dates, interests, budget preferences, and travel style. The more complete your profile, the better your matches!',
        },
      ],
    },
    {
      category: 'Safety & Security',
      questions: [
        {
          q: 'How do you verify user profiles?',
          a: 'We verify profiles through email confirmation, phone verification, and government ID checks for Premium members. Users can also earn trust badges through positive reviews from other travelers.',
        },
        {
          q: 'Is my personal information safe?',
          a: 'Absolutely. We use industry-standard encryption to protect your data. Your email and phone number are never shared publicly, and you control what information appears on your profile.',
        },
        {
          q: 'What should I do if I encounter suspicious behavior?',
          a: 'Report any suspicious users or messages immediately using the report button on their profile or in the message thread. Our safety team reviews all reports within 24 hours.',
        },
      ],
    },
    {
      category: 'Finding Travel Buddies',
      questions: [
        {
          q: 'How do I find travel companions?',
          a: 'Use the Explore page to browse travelers, filter by destination and dates, or post your own trip plan to let others find you. Our Best Matches feature also suggests compatible travelers.',
        },
        {
          q: 'Can I travel with multiple people?',
          a: 'Yes! You can create group trips and invite multiple travelers to join. Each trip can accommodate up to 10 participants.',
        },
        {
          q: 'What if my travel plans change?',
          a: 'You can update or cancel your trip plans anytime. If youve already connected with travelers, we recommend informing them as soon as possible.',
        },
      ],
    },
    {
      category: 'Premium Membership',
      questions: [
        {
          q: 'What are the benefits of Premium membership?',
          a: 'Premium members get unlimited messaging, priority in search results, verified badge, advanced filters, ad-free experience, and access to exclusive travel tips and deals.',
        },
        {
          q: 'How much does Premium cost?',
          a: 'Premium membership is $9.99/month or $79.99/year (save 33%). You can cancel anytime with no cancellation fees.',
        },
        {
          q: 'Can I try Premium before purchasing?',
          a: 'Yes! We offer a 7-day free trial for first-time Premium subscribers. You can cancel anytime during the trial without being charged.',
        },
      ],
    },
    {
      category: 'Technical Support',
      questions: [
        {
          q: 'I forgot my password. How do I reset it?',
          a: 'Click "Forgot Password" on the login page, enter your email, and we\'ll send you a reset link. Check your spam folder if you don\'t see the email within 5 minutes.',
        },
        {
          q: 'Why am I not receiving notifications?',
          a: 'Check your notification settings in your profile. Ensure you\'ve allowed browser notifications and that our emails aren\'t going to spam. Contact support if issues persist.',
        },
        {
          q: 'Is there a mobile app?',
          a: 'Our mobile app is currently in development! For now, our website is fully responsive and works great on mobile browsers.',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="section-shell border-b border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6">FAQ</Badge>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Frequently Asked <span className="text-gradient-sunset">Questions</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about TripBuddy Go. Can't find what you're looking for? Contact our support team.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="section-shell">
        <div className="max-w-4xl mx-auto space-y-12">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <span className="h-8 w-1 rounded-full gradient-sunset" />
                {category.category}
              </h2>
              <Accordion>
                {category.questions.map((faq, faqIndex) => (
                  <AccordionItem
                    key={faqIndex}
                    className="border border-b"
                  >
                    <AccordionTrigger>
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent>
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-shell bg-secondary/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
            Still Have Questions?
          </h2>
          <p className="text-muted-foreground mb-6">
            Our support team is here to help. Reach out anytime and we'll get back to you quickly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gradient-sunset text-white" asChild>
              <a href="/contact">Contact Support</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/about/safety">Safety Guidelines</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
