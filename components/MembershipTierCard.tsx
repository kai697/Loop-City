import React from 'react';
import type { MembershipTier } from '../types';

interface MembershipTierCardProps {
    tier: {
        tier: MembershipTier;
        name: string;
        price: string;
        features: string[];
        color: string;
    };
    onUpgrade: (tier: MembershipTier) => void;
}

const MembershipTierCard: React.FC<MembershipTierCardProps> = ({ tier, onUpgrade }) => {
    return (
        <div className={`bg-gray-800/50 border border-${tier.color}-600/50 rounded-lg p-6 flex flex-col`}>
            <h4 className={`text-xl font-bold text-${tier.color}-300`}>{tier.name}</h4>
            <p className="text-2xl font-extrabold text-white mt-2">{tier.price}</p>
            <ul className="space-y-2 mt-4 text-sm text-gray-300 flex-grow">
                {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 flex-shrink-0 text-${tier.color}-400`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <button
                onClick={() => onUpgrade(tier.tier)}
                className={`mt-6 w-full bg-${tier.color}-600 hover:bg-${tier.color}-500 text-white font-bold py-2 px-4 rounded-full transition-colors`}
            >
                Upgrade to {tier.name}
            </button>
        </div>
    );
};

export default MembershipTierCard;
