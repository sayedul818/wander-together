import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function TermsOfServicePage() {
  const sections = [
    {
      title: 'Using TripBuddy Go',
      body: 'You must be 18+ and provide accurate information. Do not misuse the platform, spam others, or violate local laws when organizing or joining trips.',
    },
    {
      title: 'User Content',
      body: 'You are responsible for content you post. Do not share harmful, illegal, or infringing material. We may remove content that violates our guidelines.',
    },
    {
      title: 'Assumption of Risk',
      body: 'Travel involves risk. TripBuddy Go connects travelers but does not control trip execution. Please verify partners, review safety guidance, and use your judgment.',
    },
    {
      title: 'Payments',
      body: 'Any paid features or memberships are subject to the pricing shown at purchase time. Refunds follow the policy shown at checkout.',
    },
    {
      title: 'Account Suspension',
      body: 'We may suspend accounts that violate these terms, harm others, or abuse the platform.',
    },
  ];

  return (
    <>
      <Navbar />
      <div className="page-shell py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="space-y-3">
            <p className="text-sm font-semibold text-orange-500">Terms</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Terms of Service</h1>
            <p className="text-muted-foreground max-w-2xl">Rules for using TripBuddy Go responsibly and safely.</p>
          </header>

          <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-6 shadow-sm">
            {sections.map((section) => (
              <div key={section.title} className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.body}</p>
              </div>
            ))}
            <p className="text-sm text-muted-foreground">If you have questions about these terms, email support@tripbuddygo.com.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
