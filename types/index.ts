// Global type definitions

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string;
      JWT_SECRET: string;
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;
      STRIPE_SECRET_KEY: string;
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
      NEXT_PUBLIC_API_URL: string;
    }
  }

  interface Mongoose {
    conn: any;
    promise: any;
  }
}

export interface SessionUser {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export interface CreateTravelPlanRequest {
  title: string;
  description: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget?: number;
  interests: string[];
  maxParticipants?: number;
  travelStyle?: string;
  accommodationType?: string;
}

export interface TravelPlanResponse {
  _id: string;
  title: string;
  description: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget?: number;
  interests: string[];
  maxParticipants: number;
  currentParticipants: number;
  participants: string[];
  creator: string;
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  bio?: string;
  interests?: string[];
  visitedCountries?: string[];
  location?: string;
  isPremium: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    isPremium?: boolean;
  };
}

export interface ApiError {
  error: string;
  details?: any[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pages: number;
  currentPage: number;
}

export {};
