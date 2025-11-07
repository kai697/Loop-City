import React from 'react';
import type { HiddenGem, MembershipTier } from '../types';

interface DiscoverDisplayProps {
  gems: HiddenGem[];
  onRefresh: () => void;
  tastes: string[];
  membership: MembershipTier;
  onUpgrade: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
    'Food & Drink': 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    'Art & Culture': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
    'Outdoors': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12 6c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 12c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z',
    'Unique Shop': 'M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z',
    'Quirky Landmark': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z',
    'Default': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'
};

const GemCard: React.FC<{ gem: HiddenGem }> = ({ gem }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d={CATEGORY_ICONS[gem.category] || CATEGORY_ICONS['Default']}></path>
            </svg>
        </div>
        <div className="flex-1">
            <h3 className="font-semibold text-lg text-purple-300">{gem.name}</h3>
            <p className="text-sm text-gray-400 mt-1">{gem.description}</p>
            <span className="text-xs font-bold text-gray-500 mt-2 inline-block bg-gray-700 px-2 py-1 rounded">{gem.category}</span>
        </div>
    </div>
);

const UpgradeCallToAction: React.FC<{ onUpgrade: () => void }> = ({ onUpgrade }) => (
    <div className="text-center bg-gray-800/50 border-2 border-dashed border-purple-600/50 p-6 rounded-lg mt-6">
        <h3 className="text-xl font-bold text-purple-300">Unlock More Gems</h3>
        <p className="text-gray-400 mt-2">You're seeing a preview of local gems. Upgrade to LoopCity Insider to discover them all!</p>
        <button
            onClick={onUpgrade}
            className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2 px-6 rounded-full transition-all"
        >
            Upgrade Now
        </button>
    </div>
);

const DiscoverDisplay: React.FC<DiscoverDisplayProps> = ({ gems, onRefresh, tastes, membership, onUpgrade }) => {
  const isPremium = membership === 'premium' || membership === 'elite';
  const displayedGems = isPremium ? gems : gems.slice(0, 3);
  
  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-200">Discover Hidden Gems</h2>
        {tastes.length > 0 ? (
          <p className="text-gray-400 mt-1 text-sm">
            Personalized gems based on your interest in <span className="font-semibold text-purple-300">{tastes.slice(0, 3).join(', ')}</span>...
          </p>
        ) : (
          <p className="text-gray-400 mt-1">AI-curated local spots you might love.</p>
        )}
      </div>
      
      {displayedGems.length === 0 && gems.length > 0 ? (
         // This case handles when the initial load has gems but free user sees none
         <div className="space-y-4">
             {gems.slice(0, 3).map((gem, index) => (
                <GemCard key={`${gem.name}-${index}`} gem={gem} />
             ))}
         </div>
      ) : displayedGems.length > 0 ? (
        <div className="space-y-4">
          {displayedGems.map((gem, index) => (
            <GemCard key={`${gem.name}-${index}`} gem={gem} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">No hidden gems found yet. Try refreshing!</p>
      )}

      {!isPremium && gems.length > 3 && (
        <UpgradeCallToAction onUpgrade={onUpgrade} />
      )}
      
      <div className="pt-4 text-center">
          <button
            onClick={onRefresh}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300"
          >
            Find More Gems
          </button>
      </div>
    </div>
  );
};

export default DiscoverDisplay;
