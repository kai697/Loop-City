import React from 'react';
import type { ActiveLoop } from '../types';

type View = 'generate' | 'discover' | 'saved' | 'profile' | 'friends' | 'currentLoop';

interface NavigationBarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  savedLoopsCount: number;
  activeLoop: ActiveLoop | null;
}

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}> = ({ label, isActive, onClick, count }) => (
  <button
    onClick={onClick}
    className={`relative w-full px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
      isActive
        ? 'bg-indigo-600 text-white'
        : 'bg-gray-700/50 hover:bg-gray-600/80 text-gray-300'
    }`}
  >
    {label}
    {typeof count !== 'undefined' && count > 0 && (
      <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
        {count}
      </span>
    )}
  </button>
);


const NavigationBar: React.FC<NavigationBarProps> = ({ currentView, onNavigate, savedLoopsCount, activeLoop }) => {
  return (
    <nav className="mt-6 p-2 bg-gray-800/60 rounded-lg flex justify-around items-center gap-2">
      <NavButton
        label="Generate"
        isActive={currentView === 'generate'}
        onClick={() => onNavigate('generate')}
      />
      <NavButton
        label="Discover"
        isActive={currentView === 'discover'}
        onClick={() => onNavigate('discover')}
      />
      {activeLoop && (
        <NavButton
            label="Current Loop"
            isActive={currentView === 'currentLoop'}
            onClick={() => onNavigate('currentLoop')}
        />
      )}
       <NavButton
        label="Friends"
        isActive={currentView === 'friends'}
        onClick={() => onNavigate('friends')}
      />
      <NavButton
        label="My Loops"
        isActive={currentView === 'saved'}
        onClick={() => onNavigate('saved')}
        count={savedLoopsCount}
      />
      <NavButton
        label="Profile"
        isActive={currentView === 'profile'}
        onClick={() => onNavigate('profile')}
      />
    </nav>
  );
};

export default NavigationBar;