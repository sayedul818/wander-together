'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	Home,
	Compass,
	User,
	CalendarCheck,
	Users,
	PlusCircle,
	Gauge,
	Settings,
	UserCheck,
	UserPlus,
} from 'lucide-react';
import FollowSuggestions from '@/components/FollowSuggestions';

type NavItem = { href: string; label: string; icon: React.ElementType; exact?: boolean };

export default function LeftSidebar() {
	const pathname = usePathname();

	const mainNav: NavItem[] = [
		{ href: '/feed', label: 'Home', icon: Home, exact: true },
		{ href: '/explore', label: 'Explore', icon: Compass },
		{ href: '/my-profile', label: 'My Profile', icon: User },
		{ href: '/travel-plans', label: 'Travel Plans', icon: CalendarCheck },
		{ href: '/matchmaking', label: 'Travel Buddies', icon: Users },
		{ href: '/following', label: 'Following', icon: UserCheck },
		{ href: '/followers', label: 'Followers', icon: UserPlus },
		{ href: '/dashboard', label: 'Dashboard', icon: Gauge },
		{ href: '/settings', label: 'Settings', icon: Settings },
	];

	const shortcuts: NavItem[] = [
		{ href: '/travel-plans/add', label: 'Create Trip', icon: PlusCircle },
	];

	// Mobile-only link
	const mobileOnlyNav: NavItem[] = [
		{ href: '/suggestions', label: 'Discover', icon: Compass },
	];

	const isActive = (href: string, exact?: boolean) => {
		if (exact) return pathname === href;
		return pathname?.startsWith(href);
	};

	return (
		<aside className="sticky top-16 space-y-4">
			{/* Mobile-only Discover button */}
			<nav aria-label="Mobile Only" className="block lg:hidden bg-card border border-border rounded-lg p-3">
				<ul className="space-y-1">
					{mobileOnlyNav.map((item) => {
						const active = isActive(item.href, item.exact);
						const Icon = item.icon;
						return (
							<li key={item.href}>
								<Link
									href={item.href}
									className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition hover:bg-secondary/10 ${
										active ? 'bg-secondary/20 text-foreground' : 'text-muted-foreground'
									}`}
								>
									<Icon className="h-4 w-4" />
									<span>{item.label}</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			<nav aria-label="Primary" className="bg-card border border-border rounded-lg p-3">
				<ul className="space-y-1">
					{mainNav.map((item) => {
						const active = isActive(item.href, item.exact);
						const Icon = item.icon;
						return (
							<li key={item.href}>
								<Link
									href={item.href}
									className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition hover:bg-secondary/10 ${
										active ? 'bg-secondary/20 text-foreground' : 'text-muted-foreground'
									}`}
								>
									<Icon className="h-4 w-4" />
									<span>{item.label}</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			<nav aria-label="Shortcuts" className="bg-card border border-border rounded-lg p-3">
				<h3 className="font-semibold text-sm mb-2">Quick Actions</h3>
				<ul className="space-y-1">
					{shortcuts.map((item) => {
						const Icon = item.icon;
						return (
							<li key={item.href}>
								<Link
									href={item.href}
									className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition hover:bg-secondary/10 text-muted-foreground"
								>
									<Icon className="h-4 w-4" />
									<span>{item.label}</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			{/* Follow Suggestions */}
			<FollowSuggestions title="Suggestions" titleHref="/suggestions" limit={6} />
		</aside>
	);
}
