import { Link } from 'react-router-dom';
import { Compass, Instagram, Twitter, Facebook, Youtube, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-sunset">
                <Compass className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-heading text-2xl font-bold">
                Travel<span className="text-coral">Buddy</span>
              </span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">
              Connect with fellow travelers, plan amazing adventures together, and create memories that last a lifetime.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-coral transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {['About Us', 'How It Works', 'Destinations', 'Blog', 'Success Stories'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-background/70 hover:text-coral transition-colors text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-3">
              {['Help Center', 'Safety Tips', 'Community Guidelines', 'Contact Us', 'FAQs'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-background/70 hover:text-coral transition-colors text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Refund Policy'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-background/70 hover:text-coral transition-colors text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            © {new Date().getFullYear()} TravelBuddy. All rights reserved.
          </p>
          <p className="text-background/50 text-sm flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-coral fill-coral" /> for travelers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
