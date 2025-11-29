import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  interests?: string[];
  visitedCountries?: string[];
  location?: string;
  isPremium?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const mockUsers: { email: string; password: string; user: User }[] = [
  {
    email: 'admin@travelbuddy.com',
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@travelbuddy.com',
      name: 'Admin User',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      bio: 'Platform administrator',
      interests: ['Travel Management', 'Community Building'],
      visitedCountries: ['USA', 'UK', 'Japan'],
      location: 'San Francisco, USA',
      isPremium: true,
      rating: 5,
      reviewCount: 0,
      createdAt: '2024-01-01',
    },
  },
  {
    email: 'user@example.com',
    password: 'user123',
    user: {
      id: '2',
      email: 'user@example.com',
      name: 'Sarah Johnson',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      bio: 'Adventure seeker | Photography enthusiast | Always looking for the next destination',
      interests: ['Hiking', 'Photography', 'Food Tours', 'Beach'],
      visitedCountries: ['France', 'Italy', 'Spain', 'Thailand', 'Japan'],
      location: 'New York, USA',
      isPremium: true,
      rating: 4.8,
      reviewCount: 23,
      createdAt: '2024-03-15',
    },
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('travelbuddy_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const foundUser = mockUsers.find((u) => u.email === email && u.password === password);
    
    if (foundUser) {
      setUser(foundUser.user);
      localStorage.setItem('travelbuddy_user', JSON.stringify(foundUser.user));
      localStorage.setItem('travelbuddy_token', `mock_jwt_${foundUser.user.id}`);
      return { success: true };
    }
    
    return { success: false, error: 'Invalid email or password' };
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      return { success: false, error: 'Email already registered' };
    }

    const newUser: User = {
      id: `${Date.now()}`,
      email,
      name,
      role: 'user',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      bio: '',
      interests: [],
      visitedCountries: [],
      location: '',
      isPremium: false,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    mockUsers.push({ email, password, user: newUser });
    setUser(newUser);
    localStorage.setItem('travelbuddy_user', JSON.stringify(newUser));
    localStorage.setItem('travelbuddy_token', `mock_jwt_${newUser.id}`);
    
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('travelbuddy_user');
    localStorage.removeItem('travelbuddy_token');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('travelbuddy_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
