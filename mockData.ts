import type { UserProfile, Itinerary } from './types';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user_2',
    name: 'Wanderlust Weaver',
    tastes: ['street art', 'artisan coffee', 'bookshops', 'urban exploration'],
    followersCount: 125,
    following: ['user_3'],
    membership: 'premium',
  },
  {
    id: 'user_3',
    name: 'Foodie Explorer',
    tastes: ['hidden cafes', 'bakeries', 'local markets', 'desserts'],
    followersCount: 340,
    following: ['user_2', 'user_4'],
    membership: 'elite',
  },
  {
    id: 'user_4',
    name: 'Alex the Adventurer',
    tastes: ['parks & playgrounds', 'scenic views', 'outdoor fun', 'cycling'],
    followersCount: 88,
    following: [],
    membership: 'free',
  },
   {
    id: 'user_5',
    name: 'Culture Vulture',
    tastes: ['museums', 'art galleries', 'live music', 'architecture'],
    followersCount: 512,
    following: ['user_2'],
    membership: 'elite',
  },
];

export const MOCK_LOOPS: Itinerary[] = [
    {
        id: 'loop_101',
        loopTitle: 'Graffiti & Grinds',
        loopDescription: 'A quick tour of the city\'s most vibrant street art, ending with a perfect cup of coffee.',
        stops: [
            { name: 'The Mural Mile', description: 'Walk down this alley packed with amazing graffiti.' },
            { name: 'Brew & Browse Cafe', description: 'A cozy spot with great single-origin coffee and art books.' },
        ],
        authorId: 'user_2',
        authorName: 'Wanderlust Weaver',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
        id: 'loop_102',
        loopTitle: 'Sweet Escape',
        loopDescription: 'Indulge your sweet tooth with a visit to the best little bakery in town.',
        stops: [
            { name: 'The Flour Box Bakery', description: 'Famous for their seasonal cronuts and delicious pastries.' },
            { name: 'City Park Fountain', description: 'Enjoy your treats with a view of the park.' },
        ],
        authorId: 'user_3',
        authorName: 'Foodie Explorer',
        createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), // 22 hours ago
    },
     {
        id: 'loop_103',
        loopTitle: 'Riverside Recharge',
        loopDescription: 'A calming walk along the river to clear your head and enjoy some nature.',
        stops: [
            { name: 'Riverside Park Trail', description: 'A beautiful, paved trail perfect for a stroll.' },
            { name: 'The Lookout Point', description: 'A quiet bench with the best scenic view of the water.' },
        ],
        authorId: 'user_4',
        authorName: 'Alex the Adventurer',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    }
];