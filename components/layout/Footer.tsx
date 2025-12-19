'use client';

import Link from 'next/link';
import { Compass, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white mt-20">
      <div className="page-shell py-16">
        {/* 4 columns always, scrollable on mobile */}
        <div className="flex gap-8 mb-12 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 min-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Brand */}
          <div className="min-w-[220px] max-w-[260px] flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-sunset">
                <Compass className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl">TripBuddy Go</span>
            </Link>
            <p className="text-gray-400">Connect with travelers and explore the world together.</p>
          </div>

          {/* Product */}
          <div className="min-w-[180px] max-w-[220px] flex-shrink-0">
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/explore" className="hover:text-white transition">Explore Trips</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
              <li><Link href="#" className="hover:text-white transition">Features</Link></li>
              <li><Link href="#" className="hover:text-white transition">How It Works</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="min-w-[180px] max-w-[220px] flex-shrink-0">
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
              <li><Link href="/about/safety" className="hover:text-white transition">Safety</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="min-w-[180px] max-w-[220px] flex-shrink-0">
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition">Cookie Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-gray-800 pt-8 flex items-center justify-between">
          <p className="text-gray-400">© {currentYear} TripBuddy Go. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
