import React, { useState, useEffect } from 'react';
import type { UserProfile, MembershipTier } from '../types';
import { MEMBERSHIP_TIERS } from '../constants';
import MembershipTierCard from './MembershipTierCard';

interface ProfileDisplayProps {
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onFindFriends: () => void;
  onUpgradeMembership: (tier: MembershipTier) => void;
}

const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ profile, onUpdateProfile, onFindFriends, onUpgradeMembership }) => {
  const [name, setName] = useState(profile.name);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setName(profile.name);
  }, [profile.name]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSaveName = () => {
    if (name.trim()) {
      onUpdateProfile({ ...profile, name: name.trim() });
      setIsEditing(false);
    }
  };
  
  const handleResetTastes = () => {
      if(window.confirm("Are you sure you want to reset your learned tastes? The AI will start learning your preferences from scratch.")) {
          onUpdateProfile({ ...profile, tastes: [] });
      }
  }
  
  const currentTier = MEMBERSHIP_TIERS.find(t => t.tier === profile.membership) || MEMBERSHIP_TIERS[0];
  const upgradeTiers = MEMBERSHIP_TIERS.filter(t => t.tier !== 'free');

  return (
    <div className="animate-fade-in space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold">
          {profile.name.charAt(0)}
        </div>
        <div className="flex-1 text-center sm:text-left">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                aria-label="Edit user name"
              />
              <button onClick={handleSaveName} className="bg-green-600 hover:bg-green-500 px-3 py-2 rounded-md text-sm font-semibold">Save</button>
              <button onClick={() => setIsEditing(false)} className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-md text-sm">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <h2 className="text-3xl font-bold text-gray-100">{profile.name}</h2>
              <button onClick={() => setIsEditing(true)} className="text-indigo-400 hover:text-indigo-300" aria-label="Edit name">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
              </button>
            </div>
          )}
          <div className="flex items-center gap-4 mt-2 justify-center sm:justify-start">
            <span className={`text-xs font-bold px-2 py-1 rounded-full bg-${currentTier.color}-600/50 text-${currentTier.color}-200`}>{currentTier.name}</span>
            <p className="text-sm text-gray-400"><span className="font-bold text-white">{profile.followersCount}</span> Followers</p>
            <p className="text-sm text-gray-400"><span className="font-bold text-white">{profile.following.length}</span> Following</p>
          </div>
        </div>
      </div>
      
      {profile.membership === 'free' && (
        <div className="border-t border-gray-700 pt-8">
            <h3 className="text-xl font-semibold text-gray-200 mb-4 text-center">Upgrade Your Membership</h3>
            <div className="grid sm:grid-cols-2 gap-4">
                {upgradeTiers.map(tier => (
                    <MembershipTierCard key={tier.tier} tier={tier} onUpgrade={onUpgradeMembership} />
                ))}
            </div>
        </div>
      )}

      {/* Learned Tastes */}
      <div className="border-t border-gray-700 pt-8">
        <h3 className="text-xl font-semibold text-gray-200 mb-3">Your Learned Tastes</h3>
        {profile.tastes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.tastes.map((taste) => (
              <span key={taste} className="bg-purple-600/50 text-purple-200 text-sm font-medium px-3 py-1 rounded-full">
                {taste}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Save some loops to help the AI learn what you like!</p>
        )}
         <button onClick={handleResetTastes} className="text-xs text-gray-500 hover:text-red-400 mt-4 transition-colors">
            Reset Tastes
         </button>
      </div>

       {/* For Business Owners */}
       <div className="border-t border-gray-700 pt-8 text-center">
         <h3 className="text-xl font-semibold text-gray-200 mb-3">Are you a Business Owner?</h3>
         <p className="text-gray-400 max-w-md mx-auto">Get your business featured on LoopCity! Claim your profile to collect reviews, connect with new customers, and become a <span className="font-bold text-yellow-300">Premium Partner</span> for priority recommendations.</p>
         <button className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full transition-colors">
            Learn More
         </button>
       </div>
    </div>
  );
};

export default ProfileDisplay;
