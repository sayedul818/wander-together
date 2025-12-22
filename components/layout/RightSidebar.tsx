'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Flame, Globe, Sparkles, Users, Loader2 } from 'lucide-react';

interface Sponsor {
	_id: string;
	title: string;
	description?: string;
	image: string;
	link: string;
}

export default function RightSidebar() {
	const [sponsors, setSponsors] = useState<Sponsor[]>([]);
	const [isLoadingSponsors, setIsLoadingSponsors] = useState(true);

	useEffect(() => {
		const fetchSponsors = async () => {
			try {
				const res = await fetch('/api/sponsors');
				if (res.ok) {
					const data = await res.json();
					setSponsors(data.sponsors || []);
				}
			} catch (error) {
				console.error('Error fetching sponsors:', error);
			} finally {
				setIsLoadingSponsors(false);
			}
		};

		fetchSponsors();
	}, []);

	const trackClick = async (sponsorId: string) => {
		try {
			await fetch('/api/sponsors', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sponsorId }),
			});
		} catch (error) {
			// Silent fail for tracking
		}
	};

	const trending = [
		{ label: 'Visa-free gems', icon: Globe },
		{ label: 'Budget Asia loop', icon: Flame },
		{ label: 'Packing hacks', icon: Sparkles },
	];

	const upcoming = [
		{ date: 'Jan 12', label: 'Group hike • Alps' },
		{ date: 'Feb 02', label: 'Food crawl • Osaka' },
		{ date: 'Mar 15', label: 'Roadtrip • Utah' },
	];

	const suggested = [
		{ name: 'Alex', note: 'Hiking • Peru' },
		{ name: 'Maya', note: 'Food • Japan' },
		{ name: 'Leo', note: 'Roadtrip • USA' },
	];

	const stats = [
		{ label: 'Trips', value: 8 },
		{ label: 'Buddies', value: 23 },
		{ label: 'Posts', value: 142 },
	];

	return (
		<aside className="sticky top-16 space-y-4">
			{/* Sponsored */}
			<section className="bg-card border border-border rounded-lg overflow-hidden">
				<div className="p-3 border-b border-border">
					<h3 className="font-semibold">Sponsored</h3>
				</div>
				<div className="grid grid-cols-1 gap-3 p-3">
					{isLoadingSponsors ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
						</div>
					) : sponsors.length > 0 ? (
						sponsors.map((s) => (
							<a
								key={s._id}
								href={s.link}
								target="_blank"
								rel="noopener noreferrer"
								onClick={() => trackClick(s._id)}
								className="block rounded-md overflow-hidden border border-border hover:shadow-sm transition"
							>
								<div className="h-28 bg-muted">
									<img src={s.image} alt={s.title} className="w-full h-full object-cover" />
								</div>
								<div className="p-2 text-sm">
									<p className="font-medium">{s.title}</p>
									{s.description && (
										<p className="text-muted-foreground text-xs line-clamp-1">{s.description}</p>
									)}
									<p className="text-muted-foreground text-xs">Promoted</p>
								</div>
							</a>
						))
					) : (
						<div className="text-center py-4 text-sm text-muted-foreground">
							No sponsored content
						</div>
					)}
				</div>
			</section>

			{/* Trending */}
			<section className="bg-card border border-border rounded-lg p-3">
				<h3 className="font-semibold mb-2">Trending Now</h3>
				<ul className="space-y-1 text-sm">
					{trending.map((t) => (
						<li key={t.label} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-secondary/10">
							{(() => { const I = t.icon; return <I className="h-4 w-4 text-muted-foreground" />; })()}
							<span>{t.label}</span>
						</li>
					))}
				</ul>
			</section>

			{/* Upcoming Events */}
			<section className="bg-card border border-border rounded-lg p-3">
				<h3 className="font-semibold mb-2">Upcoming</h3>
				<ul className="space-y-2 text-sm">
					{upcoming.map((u) => (
						<li key={u.label} className="flex items-center gap-3">
							<Calendar className="h-4 w-4 text-muted-foreground" />
							<span className="inline-flex items-center gap-2">
								<span className="font-medium">{u.date}</span>
								<span className="text-muted-foreground">{u.label}</span>
							</span>
						</li>
					))}
				</ul>
			</section>

			{/* Suggested Buddies */}
			<section className="bg-card border border-border rounded-lg p-3">
				<h3 className="font-semibold mb-2">Suggested Buddies</h3>
				<ul className="space-y-2 text-sm">
					{suggested.map((u) => (
						<li key={u.name} className="flex items-center justify-between">
							<span className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /> {u.name}</span>
							<span className="text-muted-foreground">{u.note}</span>
						</li>
					))}
				</ul>
			</section>

			{/* Quick Stats */}
			<section className="bg-card border border-border rounded-lg p-3">
				<h3 className="font-semibold mb-2">Quick Stats</h3>
				<div className="grid grid-cols-3 gap-2">
					{stats.map((s) => (
						<div key={s.label} className="rounded-md border border-border p-2 text-center">
							<div className="text-lg font-semibold">{s.value}</div>
							<div className="text-xs text-muted-foreground">{s.label}</div>
						</div>
					))}
				</div>
			</section>
		</aside>
	);
}

