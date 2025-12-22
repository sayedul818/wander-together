'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Flame, Globe, Sparkles, Users, Loader2, MapPin, TrendingUp, Trophy } from 'lucide-react';

interface Sponsor {
	_id: string;
	title: string;
	description?: string;
	image: string;
	link: string;
}

interface PopularDestination {
	name: string;
	image?: string | null;
	travelers: string;
}

interface TopTraveler {
	_id: string;
	name: string;
	username: string;
	avatar?: string;
	trips: number;
	posts: number;
}

interface UpcomingTrip {
	_id: string;
	date: string;
	label: string;
	title: string;
}

interface UserStats {
	trips: number;
	buddies: number;
	posts: number;
}

// Fallback destinations when no real data available
const fallbackDestinations: PopularDestination[] = [
	{ name: 'Bali, Indonesia', image: null, travelers: '0' },
	{ name: 'Tokyo, Japan', image: null, travelers: '0' },
	{ name: 'Paris, France', image: null, travelers: '0' },
	{ name: 'Santorini, Greece', image: null, travelers: '0' },
	{ name: 'Machu Picchu, Peru', image: null, travelers: '0' },
];

export default function RightSidebar() {
	const [sponsors, setSponsors] = useState<Sponsor[]>([]);
	const [isLoadingSponsors, setIsLoadingSponsors] = useState(true);
	const [popularDestinations, setPopularDestinations] = useState<PopularDestination[]>(fallbackDestinations);
	const [isLoadingDestinations, setIsLoadingDestinations] = useState(true);
	const [topTravelers, setTopTravelers] = useState<TopTraveler[]>([]);
	const [isLoadingTravelers, setIsLoadingTravelers] = useState(true);
	const [upcomingTrips, setUpcomingTrips] = useState<UpcomingTrip[]>([]);
	const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);
	const [userStats, setUserStats] = useState<UserStats>({ trips: 0, buddies: 0, posts: 0 });
	const [isLoadingStats, setIsLoadingStats] = useState(true);

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

		const fetchPopularDestinations = async () => {
			try {
				const res = await fetch('/api/destinations/popular');
				if (res.ok) {
					const data = await res.json();
					if (data.destinations && data.destinations.length > 0) {
						setPopularDestinations(data.destinations);
					}
				}
			} catch (error) {
				console.error('Error fetching popular destinations:', error);
			} finally {
				setIsLoadingDestinations(false);
			}
		};

		const fetchTopTravelers = async () => {
			try {
				const res = await fetch('/api/users/top-travelers');
				if (res.ok) {
					const data = await res.json();
					setTopTravelers(data.travelers || []);
				}
			} catch (error) {
				console.error('Error fetching top travelers:', error);
			} finally {
				setIsLoadingTravelers(false);
			}
		};

		const fetchUpcomingTrips = async () => {
			try {
				const res = await fetch('/api/travel-plans/upcoming');
				if (res.ok) {
					const data = await res.json();
					setUpcomingTrips(data.upcoming || []);
				}
			} catch (error) {
				console.error('Error fetching upcoming trips:', error);
			} finally {
				setIsLoadingUpcoming(false);
			}
		};

		fetchSponsors();
		fetchPopularDestinations();
		fetchTopTravelers();
		fetchUpcomingTrips();

		const fetchUserStats = async () => {
			try {
				const res = await fetch('/api/users/stats');
				if (res.ok) {
					const data = await res.json();
					setUserStats(data.stats || { trips: 0, buddies: 0, posts: 0 });
				}
			} catch (error) {
				console.error('Error fetching user stats:', error);
			} finally {
				setIsLoadingStats(false);
			}
		};

		fetchUserStats();
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

	return (
		<aside className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
			<div className="space-y-4 pb-4">
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

			{/* Popular Destinations */}
			<section className="bg-card border border-border rounded-lg p-3">
				<div className="flex items-center gap-2 mb-3">
					<TrendingUp className="h-4 w-4 text-orange-500" />
					<h3 className="font-semibold">Popular Destinations</h3>
				</div>
				{isLoadingDestinations ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
					</div>
				) : (
					<ul className="space-y-2 text-sm">
						{popularDestinations.map((dest, index) => (
							<li 
								key={dest.name} 
								className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-secondary/10 cursor-pointer transition-colors"
							>
								<div className="flex items-center gap-2">
									{dest.image ? (
										<div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
											<img 
												src={dest.image} 
												alt={dest.name}
												className="w-full h-full object-cover"
											/>
										</div>
									) : (
										<div className="w-8 h-8 rounded-md bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0">
											<MapPin className="h-4 w-4 text-white" />
										</div>
									)}
									<div>
										<p className="font-medium">{dest.name}</p>
										<p className="text-xs text-muted-foreground flex items-center gap-1">
											<Users className="h-3 w-3" />
											{dest.travelers} travelers
										</p>
									</div>
								</div>
								<span className="text-xs font-medium text-orange-500">#{index + 1}</span>
							</li>
						))}
					</ul>
				)}
				<Link 
					href="/explore" 
					className="block mt-3 text-center text-sm text-orange-500 hover:text-orange-600 font-medium"
				>
					Explore all destinations →
				</Link>
			</section>

			{/* Upcoming Events */}
			<section className="bg-card border border-border rounded-lg p-3">
				<div className="flex items-center gap-2 mb-2">
					<Calendar className="h-4 w-4 text-blue-500" />
					<h3 className="font-semibold">Upcoming Trips</h3>
				</div>
				{isLoadingUpcoming ? (
					<div className="flex items-center justify-center py-6">
						<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
					</div>
				) : upcomingTrips.length > 0 ? (
					<ul className="space-y-2 text-sm">
						{upcomingTrips.map((trip) => (
							<li key={trip._id}>
								<Link 
									href={`/travel-plans/${trip._id}`}
									className="flex items-center gap-3 hover:bg-secondary/10 rounded-md px-2 py-1.5 transition-colors"
								>
									<div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md px-2 py-1 text-xs font-medium min-w-[52px] text-center">
										{trip.date}
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-medium truncate">{trip.title}</p>
										<p className="text-xs text-muted-foreground truncate">{trip.label}</p>
									</div>
								</Link>
							</li>
						))}
					</ul>
				) : (
					<div className="text-center py-4 text-sm text-muted-foreground">
						No upcoming trips
					</div>
				)}
				<Link 
					href="/travel-plans" 
					className="block mt-3 text-center text-sm text-blue-500 hover:text-blue-600 font-medium"
				>
					View all trips →
				</Link>
			</section>

			{/* Top Travelers */}
			<section className="bg-card border border-border rounded-lg p-3">
				<div className="flex items-center gap-2 mb-3">
					<Trophy className="h-4 w-4 text-yellow-500" />
					<h3 className="font-semibold">Top Travelers</h3>
				</div>
				{isLoadingTravelers ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
					</div>
				) : topTravelers.length > 0 ? (
					<ul className="space-y-3 text-sm">
						{topTravelers.map((traveler, index) => (
							<li key={traveler._id}>
								<Link 
									href={`/profile/${traveler._id}`}
									className="flex items-center justify-between hover:bg-secondary/10 rounded-md px-2 py-1.5 transition-colors"
								>
									<div className="flex items-center gap-2">
										<div className="relative">
											{traveler.avatar ? (
												<img 
													src={traveler.avatar} 
													alt={traveler.name}
													className="w-8 h-8 rounded-full object-cover"
												/>
											) : (
												<div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-medium">
													{traveler.name.charAt(0).toUpperCase()}
												</div>
											)}
											{index < 3 && (
												<span className="absolute -top-1 -right-1 text-xs">
													{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
												</span>
											)}
										</div>
										<div>
											<p className="font-medium">{traveler.name}</p>
											<p className="text-xs text-muted-foreground">@{traveler.username}</p>
										</div>
									</div>
									<div className="text-right text-xs text-muted-foreground">
										<p>{traveler.trips} trips</p>
										<p>{traveler.posts} posts</p>
									</div>
								</Link>
							</li>
						))}
					</ul>
				) : (
					<div className="text-center py-4 text-sm text-muted-foreground">
						No travelers yet
					</div>
				)}
			</section>

			{/* Quick Stats */}
			<section className="bg-card border border-border rounded-lg p-3">
				<h3 className="font-semibold mb-2">My Stats</h3>
				{isLoadingStats ? (
					<div className="flex items-center justify-center py-4">
						<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
					</div>
				) : (
					<div className="grid grid-cols-3 gap-2">
						<div className="rounded-md border border-border p-2 text-center">
							<div className="text-lg font-semibold">{userStats.trips}</div>
							<div className="text-xs text-muted-foreground">Trips</div>
						</div>
						<div className="rounded-md border border-border p-2 text-center">
							<div className="text-lg font-semibold">{userStats.buddies}</div>
							<div className="text-xs text-muted-foreground">Buddies</div>
						</div>
						<div className="rounded-md border border-border p-2 text-center">
							<div className="text-lg font-semibold">{userStats.posts}</div>
							<div className="text-xs text-muted-foreground">Posts</div>
						</div>
					</div>
				)}
			</section>
			</div>
		</aside>
	);
}

