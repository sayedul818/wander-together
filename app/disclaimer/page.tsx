import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function DisclaimerPage() {
  const sections = [
    {
      title: 'Platform Role',
      body: 'TripBuddy Go connects travelers but does not organize, control, or guarantee any trips or traveler conduct.',
    },
    {
      title: 'Travel Risks',
      body: 'Travel involves inherent risks. Please evaluate destinations, partners, and activities carefully and follow local laws.',
    },
    {
      title: 'Third-Party Links',
      body: 'External links or resources are provided for convenience. We are not responsible for third-party content or services.',
    },
  ];

  return (
    <>
      <Navbar />
      <div className="page-shell py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="space-y-3">
            <p className="text-sm font-semibold text-orange-500">Disclaimer</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Disclaimer</h1>
            <p className="text-muted-foreground max-w-2xl">Important notes about responsibility and use of TripBuddy Go.</p>
          </header>

          <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-6 shadow-sm">
            {sections.map((section) => (
              <div key={section.title} className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
