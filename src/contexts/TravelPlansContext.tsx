import React, { createContext, useContext, useState, ReactNode } from 'react';

export type TravelType = 'Solo' | 'Friends' | 'Family' | 'Couple';
export type BudgetRange = 'Budget' | 'Mid-Range' | 'Luxury';

export interface TravelPlan {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRating: number;
  destination: string;
  country: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  travelType: TravelType;
  budget: BudgetRange;
  description: string;
  interests: string[];
  isPublic: boolean;
  createdAt: string;
  requests: string[];
}

interface TravelPlansContextType {
  plans: TravelPlan[];
  addPlan: (plan: Omit<TravelPlan, 'id' | 'createdAt' | 'requests'>) => void;
  updatePlan: (id: string, updates: Partial<TravelPlan>) => void;
  deletePlan: (id: string) => void;
  getUserPlans: (userId: string) => TravelPlan[];
  searchPlans: (filters: SearchFilters) => TravelPlan[];
  requestToJoin: (planId: string, userId: string) => void;
}

interface SearchFilters {
  destination?: string;
  startDate?: string;
  endDate?: string;
  travelType?: TravelType;
  interests?: string[];
}

const TravelPlansContext = createContext<TravelPlansContextType | undefined>(undefined);

// Mock travel plans
const initialPlans: TravelPlan[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Sarah Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    userRating: 4.8,
    destination: 'Bali',
    country: 'Indonesia',
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    startDate: '2025-01-15',
    endDate: '2025-01-25',
    travelType: 'Solo',
    budget: 'Mid-Range',
    description: 'Looking for travel buddies to explore the beautiful temples and beaches of Bali. Planning to visit Ubud, Seminyak, and the Gili Islands.',
    interests: ['Beach', 'Temples', 'Food Tours', 'Photography'],
    isPublic: true,
    createdAt: '2024-11-20',
    requests: [],
  },
  {
    id: '2',
    userId: '3',
    userName: 'Michael Chen',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    userRating: 4.5,
    destination: 'Tokyo',
    country: 'Japan',
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    startDate: '2025-02-01',
    endDate: '2025-02-14',
    travelType: 'Friends',
    budget: 'Luxury',
    description: 'Cherry blossom season adventure! Looking for fellow travelers to explore Tokyo, Kyoto, and Osaka. Focus on food, culture, and photography.',
    interests: ['Food Tours', 'Photography', 'Culture', 'Nightlife'],
    isPublic: true,
    createdAt: '2024-11-18',
    requests: [],
  },
  {
    id: '3',
    userId: '4',
    userName: 'Emma Wilson',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    userRating: 4.9,
    destination: 'Santorini',
    country: 'Greece',
    coverImage: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
    startDate: '2025-03-10',
    endDate: '2025-03-17',
    travelType: 'Couple',
    budget: 'Luxury',
    description: 'Romantic getaway to Santorini! Looking for other couples to share experiences, sunset views, and wine tasting adventures.',
    interests: ['Beach', 'Wine Tasting', 'Photography', 'Romantic'],
    isPublic: true,
    createdAt: '2024-11-15',
    requests: [],
  },
  {
    id: '4',
    userId: '5',
    userName: 'David Park',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    userRating: 4.7,
    destination: 'Machu Picchu',
    country: 'Peru',
    coverImage: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
    startDate: '2025-04-05',
    endDate: '2025-04-15',
    travelType: 'Solo',
    budget: 'Mid-Range',
    description: 'Hiking the Inca Trail to Machu Picchu! Looking for adventurous travelers to join this once-in-a-lifetime experience.',
    interests: ['Hiking', 'Adventure', 'History', 'Photography'],
    isPublic: true,
    createdAt: '2024-11-10',
    requests: [],
  },
  {
    id: '5',
    userId: '6',
    userName: 'Lisa Anderson',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    userRating: 4.6,
    destination: 'Barcelona',
    country: 'Spain',
    coverImage: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    startDate: '2025-05-20',
    endDate: '2025-05-27',
    travelType: 'Friends',
    budget: 'Budget',
    description: 'Art, architecture, and tapas in Barcelona! Looking for culture lovers to explore Gaudí masterpieces and enjoy Spanish nightlife.',
    interests: ['Art', 'Architecture', 'Food Tours', 'Nightlife'],
    isPublic: true,
    createdAt: '2024-11-08',
    requests: [],
  },
];

export function TravelPlansProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<TravelPlan[]>(initialPlans);

  const addPlan = (plan: Omit<TravelPlan, 'id' | 'createdAt' | 'requests'>) => {
    const newPlan: TravelPlan = {
      ...plan,
      id: `${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      requests: [],
    };
    setPlans((prev) => [newPlan, ...prev]);
  };

  const updatePlan = (id: string, updates: Partial<TravelPlan>) => {
    setPlans((prev) =>
      prev.map((plan) => (plan.id === id ? { ...plan, ...updates } : plan))
    );
  };

  const deletePlan = (id: string) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== id));
  };

  const getUserPlans = (userId: string) => {
    return plans.filter((plan) => plan.userId === userId);
  };

  const searchPlans = (filters: SearchFilters) => {
    return plans.filter((plan) => {
      if (!plan.isPublic) return false;
      
      if (filters.destination) {
        const search = filters.destination.toLowerCase();
        if (!plan.destination.toLowerCase().includes(search) && 
            !plan.country.toLowerCase().includes(search)) {
          return false;
        }
      }
      
      if (filters.travelType && plan.travelType !== filters.travelType) {
        return false;
      }
      
      if (filters.startDate && plan.startDate < filters.startDate) {
        return false;
      }
      
      if (filters.endDate && plan.endDate > filters.endDate) {
        return false;
      }
      
      if (filters.interests && filters.interests.length > 0) {
        const hasMatchingInterest = filters.interests.some((interest) =>
          plan.interests.includes(interest)
        );
        if (!hasMatchingInterest) return false;
      }
      
      return true;
    });
  };

  const requestToJoin = (planId: string, userId: string) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? { ...plan, requests: [...plan.requests, userId] }
          : plan
      )
    );
  };

  return (
    <TravelPlansContext.Provider
      value={{ plans, addPlan, updatePlan, deletePlan, getUserPlans, searchPlans, requestToJoin }}
    >
      {children}
    </TravelPlansContext.Provider>
  );
}

export function useTravelPlans() {
  const context = useContext(TravelPlansContext);
  if (context === undefined) {
    throw new Error('useTravelPlans must be used within a TravelPlansProvider');
  }
  return context;
}
