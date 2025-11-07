import type { Mood, MembershipTier } from './types';

export const MOODS: { name: Mood; icon: string; color: string; hoverColor: string }[] = [
  { name: 'Calm Reset', icon: 'M10 21h4v-9h-4v9zm-6 0h4v-5h-4v5zm12 0h4v-13h-4v13zm-3-18h-2v2h2v-2zm-5-2c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z', color: 'bg-blue-600', hoverColor: 'hover:bg-blue-500' },
  { name: 'Creative Boost', icon: 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z', color: 'bg-purple-600', hoverColor: 'hover:bg-purple-500' },
  { name: 'Date Night', icon: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', color: 'bg-pink-600', hoverColor: 'hover:bg-pink-500' },
  { name: 'Family Fun', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-4h4v-2h-4v2zm0-4h4v-2h-4v2zm0-4h4V6h-4v2z', color: 'bg-yellow-500', hoverColor: 'hover:bg-yellow-400' },
  { name: 'Recharge Solo', icon: 'M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z', color: 'bg-green-600', hoverColor: 'hover:bg-green-500' },
  { name: 'Burn Time', icon: 'M6 2v6h12V2H6zm10 4H8V4h8v2zM6 20v-6h12v6H6zm2-4h8v2H8v-2z', color: 'bg-teal-600', hoverColor: 'hover:bg-teal-500' },
];

export const MEMBERSHIP_TIERS: { tier: MembershipTier; name: string; price: string; features: string[], color: string }[] = [
    { 
        tier: 'free', 
        name: 'Local Explorer', 
        price: '$0', 
        features: [
            'Standard loop generation',
            'Save your favorite loops',
            'Discover up to 3 hidden gems',
            'Follow other explorers'
        ],
        color: 'gray'
    },
    { 
        tier: 'premium', 
        name: 'LoopCity Insider', 
        price: '$7.99 / month', 
        features: [
            'All Free features, plus:',
            'Enhanced AI for exclusive loops',
            'Unlimited hidden gem discovery',
            'Exclusive discounts at partner venues',
            'Early access to new features',
            'Premium profile badge'
        ],
        color: 'indigo'
    },
    { 
        tier: 'elite', 
        name: 'LoopCity+', 
        price: '$14.99 / month', 
        features: [
            'All Premium features, plus:',
            'Highest-priority AI for insider tips',
            'Full day & multi-day trip planning',
            'Personalized travel itineraries',
            'Elite profile badge'
        ],
        color: 'purple'
    },
    { 
        tier: 'elite_annual', 
        name: 'Loop Pass', 
        price: '$79 / year', 
        features: [
            'All LoopCity+ features, plus:',
            'Best value annual pricing (save ~50%)',
            'Exclusive access to partner perks',
            'Priority support',
            'Annual Pass profile badge'
        ],
        color: 'amber'
    },
];