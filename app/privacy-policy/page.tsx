import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: 'Information We Collect',
      body: 'We collect account details, profile information, and travel preferences you provide, along with usage data to improve TripBuddy Go. We do not sell your personal data.',
    },
    {
      title: 'How We Use Your Data',
      body: 'We use your data to operate the platform, enable matchmaking, personalize recommendations, and keep your account secure.',
    },
    {
      title: 'Sharing',
      body: 'We share data only with trusted providers that help run TripBuddy Go (e.g., hosting, analytics, payments). We do not share your data with advertisers.',
    },
    {
      title: 'Your Controls',
      body: 'You can update your profile, change notification settings, and request data deletion by contacting support.',
    },
    {
      title: 'Data Security',
      body: 'We use encryption in transit, access controls, and regular reviews to protect your data.',
    },
  ];

  return (
    <>
      <Navbar />
      <div className="page-shell py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="space-y-3">
            <p className="text-sm font-semibold text-orange-500">Privacy</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-muted-foreground max-w-2xl">How we collect, use, and protect your information on TripBuddy Go.</p>
          </header>

          <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-6 shadow-sm">
            {sections.map((section) => (
              <div key={section.title} className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.body}</p>
              </div>
            ))}
            <p className="text-sm text-muted-foreground">For any privacy requests, contact us at support@tripbuddygo.com.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
