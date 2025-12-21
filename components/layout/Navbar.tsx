'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Compass,
  Menu,
  X,
  LogOut,
  User,
  Home,
  MapPin,
  BarChart3,
  Zap,
  Plane,
  Globe2,
  Sparkles,
  ShieldCheck,
  Gift,
  Map,
  Heart,
  Info,
  Sun,
  ChevronDown,
} from 'lucide-react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { MessagesDropdown } from '@/components/layout/MessagesDropdown';
import { NotificationsDropdown } from '@/components/layout/NotificationsDropdown';
import { cn } from '@/lib/utils';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchUser = async () => {
      try {
        // Suppress 401 logs by catching and handling silently
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
          signal: abortController.signal,
        }).catch(() => null);

        if (response?.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        // Ignore abort errors (normal when component unmounts)
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching user:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
    
    return () => abortController.abort();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        setUser(null);
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const megaMenuSections = [
    {
      title: 'Trips',
      items: [
        { label: 'Upcoming group trips', href: '/travel-plans', icon: Plane },
        { label: 'Solo-friendly routes', href: '/explore?type=solo', icon: Compass },
        { label: 'Adventure & treks', href: '/explore?tag=adventure', icon: Map },
      ],
    },
    {
      title: 'Services',
      items: [
        ...(user ? [{ label: 'Best matches', href: '/matchmaking', icon: Sparkles }] : []),
        { label: 'Premium perks', href: '/pricing', icon: Gift },
        { label: 'Safety center', href: '/about/safety', icon: ShieldCheck },
        ...(user ? [{ label: 'About', href: '/about', icon: Info }] : []),
      ],
    },
    {
      title: 'Community',
      items: [
        { label: 'Top travelers', href: '/explore?sort=rating', icon: Heart },
        { label: 'Travel stories', href: '/about/stories', icon: Globe2 },
        { label: 'Support', href: '/contact', icon: Sun },
      ],
    },
  ];

  // Desired order: Feed, Explore, Discover, Dashboard
  const leftLinks = user
    ? [
        { href: '/feed', label: 'Feed', icon: Heart },
        { href: '/explore', label: 'Explore', icon: MapPin },
      ]
    : [
        { href: '/explore', label: 'Explore', icon: MapPin },
      ];

  const afterDiscoverLinks = user
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
      ]
    : [];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-white/90 dark:bg-background/90 border-b border-gray-200/70 dark:border-border sticky top-0 z-50 backdrop-blur-md">
      <div className="page-shell">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Go to feed if logged in, home if not */}
          <Link href={user ? '/feed' : '/'} className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-sunset shadow-md">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl">
              TripBuddy <span className="text-gradient-sunset">Go</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <NavigationMenu.Root className="relative">
              <NavigationMenu.List className="flex items-center gap-1">
                {leftLinks.map((link) => (
                  <NavigationMenu.Item key={link.href}>
                    <NavigationMenu.Link asChild>
                      <Link
                        href={link.href}
                        className={cn(
                          'px-4 py-2 rounded-lg transition-colors flex items-center gap-2',
                          isActive(link.href)
                            ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-200'
                            : 'text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-border/70'
                        )}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    </NavigationMenu.Link>
                  </NavigationMenu.Item>
                ))}

                <NavigationMenu.Item>
                  <NavigationMenu.Trigger className="px-4 py-2 rounded-lg text-gray-700 dark:text-foreground hover:bg-gray-100 dark:hover:bg-border/60 data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-border/60">
                    <div className="flex items-center gap-2">
                      <Compass className="h-4 w-4" />
                      Discover
                    </div>
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content className="absolute left-1/2 top-12 -translate-x-1/2 w-[720px] rounded-2xl bg-white dark:bg-card border border-border shadow-xl p-6">
                    <div className="grid grid-cols-3 gap-6">
                      {megaMenuSections.map((section) => (
                        <div key={section.title}>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{section.title}</p>
                          <div className="space-y-2">
                            {section.items.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted/80 text-sm text-foreground"
                              >
                                <item.icon className="h-4 w-4 text-orange-500" />
                                <span>{item.label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>

                {afterDiscoverLinks.map((link) => (
                  <NavigationMenu.Item key={link.href}>
                    <NavigationMenu.Link asChild>
                      <Link
                        href={link.href}
                        className={cn(
                          'px-4 py-2 rounded-lg transition-colors flex items-center gap-2',
                          isActive(link.href)
                            ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-200'
                            : 'text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-border/70'
                        )}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    </NavigationMenu.Link>
                  </NavigationMenu.Item>
                ))}
              </NavigationMenu.List>
              <NavigationMenu.Viewport className="absolute left-1/2 top-12 h-0 w-0" />
            </NavigationMenu.Root>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {!isLoading && user ? (
              <>
                <NotificationsDropdown />
                {user.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="hidden sm:flex">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <MessagesDropdown />
                <ThemeToggle className="hidden sm:inline-flex" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push('/my-profile')}>
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/pricing')}>
                      Premium Membership
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/my-profile?edit=true')}>
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <ThemeToggle className="hidden sm:inline-flex" />
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" className="hidden sm:block">
                  <Button size="sm" className="gradient-sunset text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-4 bg-background">
            <div className="space-y-1">
              <button
                onClick={() => setIsDiscoverOpen(!isDiscoverOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Compass className="h-5 w-5" />
                  <span className="font-medium">Discover</span>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isDiscoverOpen && 'rotate-180'
                  )}
                />
              </button>
              {isDiscoverOpen && (
                <div className="space-y-1 pl-2">
                  {megaMenuSections.map((section) => (
                    <div key={section.title} className="space-y-1">
                      <div className="px-4 pt-2 pb-1 text-xs font-medium text-muted-foreground/70">{section.title}</div>
                      {section.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-2 rounded-lg text-foreground hover:bg-muted transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className="h-4 w-4 text-primary" />
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile navigation links before Discover */}
            <div className="space-y-1">
              <div className="px-4 text-xs uppercase tracking-wide text-muted-foreground font-semibold">Navigation</div>
              {(user ? [
                { href: '/feed', label: 'Feed', icon: Heart },
                { href: '/explore', label: 'Explore', icon: MapPin },
              ] : [
                { href: '/explore', label: 'Explore', icon: MapPin },
              ]).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
                    isActive(link.href)
                      ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-200'
                      : 'text-foreground hover:bg-muted'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Dashboard link after Discover */}
            {user && (
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-foreground hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <BarChart3 className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-foreground hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <BarChart3 className="h-5 w-5" />
                <span className="font-medium">Admin</span>
              </Link>
            )}

            {!user && (
              <div className="space-y-2 px-4 pt-2">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full gradient-sunset text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            <div className="px-4 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
