import React, { useState } from 'react';
import type { Itinerary, UserProfile } from '../types';

interface FriendsDisplayProps {
    followedLoops: Itinerary[];
    allUsers: UserProfile[];
    suggestions: UserProfile[];
    onFindFriends: () => void;
    onFollow: (userId: string) => void;
    onUnfollow: (userId: string) => void;
    currentUser: UserProfile;
    onView: (loop: Itinerary) => void;
}

const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

const FriendsDisplay: React.FC<FriendsDisplayProps> = ({ followedLoops, suggestions, onFindFriends, onFollow, onUnfollow, currentUser, onView }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleFindClick = () => {
        onFindFriends();
        setShowSuggestions(true);
    }

    const filteredSuggestions = suggestions.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-200">Activity Feed</h2>
                <p className="text-gray-400 mt-1">See what other explorers are up to.</p>
            </div>

            {followedLoops.length > 0 ? (
                <div className="space-y-4">
                    {followedLoops.map(loop => (
                        <div key={loop.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <p className="text-sm text-gray-400">
                                <span className="font-bold text-indigo-300">{loop.authorName}</span> saved a new loop
                                <span className="text-gray-500"> • {timeSince(loop.createdAt!)}</span>
                            </p>
                            <div className="flex justify-between items-start mt-1">
                                <div>
                                    <h3 className="font-semibold text-lg text-white">{loop.loopTitle}</h3>
                                    <p className="text-sm text-gray-400">{loop.stops.map(s => s.name).join(' → ')}</p>
                                </div>
                                <button 
                                    onClick={() => onView(loop)} 
                                    className="flex-shrink-0 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-full transition-colors"
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400 text-center py-8">Follow some friends to see their saved loops here!</p>
            )}

            <div className="border-t border-gray-700 pt-8">
                <h2 className="text-2xl font-bold text-gray-200 mb-4">Find Friends</h2>
                
                {!showSuggestions ? (
                     <div className="text-center bg-gray-800/50 p-6 rounded-lg">
                        <p className="text-gray-300">Connect with other explorers and get inspired!</p>
                        <button onClick={handleFindClick} className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-full transition-colors">
                            🔗 Link Socials to Find Friends
                        </button>
                    </div>
                ) : (
                    <>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for explorers by name..."
                            className="w-full bg-gray-700/50 text-white p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow mb-4"
                        />
                        {filteredSuggestions.length > 0 ? (
                            <div className="space-y-3">
                                {filteredSuggestions.map(user => (
                                    <div key={user.id} className="bg-gray-800/50 p-3 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-white">{user.name}</p>
                                            <p className="text-xs text-gray-400">Interests: {user.tastes.slice(0,3).join(', ')}</p>
                                        </div>
                                        <button onClick={() => onFollow(user.id)} className="text-sm bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-full transition-colors">
                                            Follow
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <p className="text-gray-400 text-center py-8">
                                {searchQuery ? 'No explorers found.' : 'Looks like you\'re following everyone!'}
                             </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FriendsDisplay;