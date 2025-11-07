export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

export type Mood = 'Calm Reset' | 'Creative Boost' | 'Date Night' | 'Family Fun' | 'Recharge Solo' | 'Burn Time';
export type MembershipTier = 'free' | 'premium' | 'elite' | 'elite_annual';
export type DurationType = 'minutes' | 'days' | 'week';
export type BudgetStyle = 'budget' | 'mid-range' | 'luxe';
export type ItineraryStyle = 'hidden-gems' | 'iconic-sights';

export interface LoopFormState {
  mood: Mood | string; // Can be a preset mood or a freeform text description
  time: number; // in minutes for short loops, or number of days/weeks for long ones
  budget: number; // in dollars
  durationType: DurationType;
  budgetStyle?: BudgetStyle;
  itineraryStyle: ItineraryStyle;
}

export interface Stop {
  name: string;
  description: string;
  address?: string;
  isBusiness?: boolean;
  claimStatus?: 'unclaimed' | 'claimed' | 'premium';
  rating?: number;
  reviewCount?: number;
}

export interface DayPlan {
    day: number;
    theme: string;
    stops: Stop[];
}

export interface Itinerary {
  id: string;
  loopTitle: string;
  loopDescription: string;
  stops: Stop[]; // Kept for backward compatibility and single day loops
  days?: DayPlan[]; // For multi-day trips
  authorId?: string;
  authorName?: string;
  createdAt?: string; // ISO 8601 date string
  participants?: UserProfile[];
}

export interface GroundingChunk {
  maps?: {
    uri: string;
    title: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  tastes: string[];
  followersCount: number;
  following: string[]; // Array of user IDs
  membership: MembershipTier;
}

export interface HiddenGem {
  name: string;
  description: string;
  category: string;
}

export interface ActiveLoop {
  itinerary: Itinerary;
  completedStops: string[]; // Array of stop names
}