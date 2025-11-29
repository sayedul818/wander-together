export interface Traveler {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  interests: string[];
  visitedCountries: string[];
  location: string;
  isPremium: boolean;
  rating: number;
  reviewCount: number;
  upcomingTrips: number;
}

export const mockTravelers: Traveler[] = [
  {
    id: '2',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'Adventure seeker | Photography enthusiast | Always looking for the next destination',
    interests: ['Hiking', 'Photography', 'Food Tours', 'Beach'],
    visitedCountries: ['France', 'Italy', 'Spain', 'Thailand', 'Japan'],
    location: 'New York, USA',
    isPremium: true,
    rating: 4.8,
    reviewCount: 23,
    upcomingTrips: 2,
  },
  {
    id: '3',
    name: 'Michael Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Digital nomad | Food lover | Exploring one city at a time',
    interests: ['Food Tours', 'Photography', 'Culture', 'Nightlife'],
    visitedCountries: ['Japan', 'Korea', 'Taiwan', 'Vietnam', 'Singapore'],
    location: 'San Francisco, USA',
    isPremium: true,
    rating: 4.5,
    reviewCount: 18,
    upcomingTrips: 1,
  },
  {
    id: '4',
    name: 'Emma Wilson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    bio: 'Beach lover | Yoga instructor | Seeking peaceful destinations',
    interests: ['Beach', 'Yoga', 'Wine Tasting', 'Romantic'],
    visitedCountries: ['Greece', 'Maldives', 'Bali', 'Portugal', 'Croatia'],
    location: 'London, UK',
    isPremium: true,
    rating: 4.9,
    reviewCount: 31,
    upcomingTrips: 3,
  },
  {
    id: '5',
    name: 'David Park',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    bio: 'Mountain climber | Wildlife photographer | Off-the-beaten-path explorer',
    interests: ['Hiking', 'Adventure', 'Wildlife', 'Photography'],
    visitedCountries: ['Nepal', 'Peru', 'New Zealand', 'Iceland', 'Kenya'],
    location: 'Seattle, USA',
    isPremium: false,
    rating: 4.7,
    reviewCount: 15,
    upcomingTrips: 2,
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    bio: 'Art enthusiast | Museum hopper | Architecture admirer',
    interests: ['Art', 'Architecture', 'Museums', 'History'],
    visitedCountries: ['Italy', 'France', 'Netherlands', 'Spain', 'Austria'],
    location: 'Chicago, USA',
    isPremium: false,
    rating: 4.6,
    reviewCount: 12,
    upcomingTrips: 1,
  },
  {
    id: '7',
    name: 'James Miller',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    bio: 'Backpacker | Budget traveler | Meeting locals is my thing',
    interests: ['Budget Travel', 'Local Culture', 'Street Food', 'Hostels'],
    visitedCountries: ['Thailand', 'Cambodia', 'Laos', 'India', 'Morocco'],
    location: 'Austin, USA',
    isPremium: false,
    rating: 4.4,
    reviewCount: 28,
    upcomingTrips: 4,
  },
  {
    id: '8',
    name: 'Sofia Garcia',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'Scuba diver | Ocean conservationist | Island hopper',
    interests: ['Diving', 'Beach', 'Marine Life', 'Snorkeling'],
    visitedCountries: ['Philippines', 'Indonesia', 'Australia', 'Egypt', 'Mexico'],
    location: 'Miami, USA',
    isPremium: true,
    rating: 4.8,
    reviewCount: 22,
    upcomingTrips: 2,
  },
];

export const interests = [
  'Hiking',
  'Photography',
  'Food Tours',
  'Beach',
  'Culture',
  'Nightlife',
  'Adventure',
  'History',
  'Art',
  'Architecture',
  'Wildlife',
  'Diving',
  'Yoga',
  'Wine Tasting',
  'Museums',
  'Local Culture',
  'Street Food',
  'Romantic',
];
