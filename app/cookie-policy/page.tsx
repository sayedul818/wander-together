import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function CookiePolicyPage() {
  const sections = [
    {
      title: 'What Are Cookies?',
      body: 'Cookies are small text files that help us remember your preferences, keep you signed in, and analyze site performance.',
    },
    {
      title: 'How We Use Cookies',
      body: 'We use essential cookies for security and session management, and optional analytics to improve the product. We do not use third-party advertising cookies.',
    },
    {
      title: 'Your Choices',
      body: 'You can manage cookies in your browser settings. Blocking essential cookies may impact core features like login and trip creation.',
    },
  ];

  return (
    <>
      <Navbar />
      <div className="page-shell py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="space-y-3">
            <p className="text-sm font-semibold text-orange-500">Cookies</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Cookie Policy</h1>
            <p className="text-muted-foreground max-w-2xl">How TripBuddy Go uses cookies and how you can control them.</p>
          </header>

          <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-6 shadow-sm">
            {sections.map((section) => (
              <div key={section.title} className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.body}</p>
              </div>
            ))}
            <p className="text-sm text-muted-foreground">Questions? Reach us at support@tripbuddygo.com.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
