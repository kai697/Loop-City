import React, { useState } from 'react';
import type { LoopFormState, Mood, MembershipTier, DurationType, BudgetStyle, ItineraryStyle } from '../types';
import { MOODS } from '../constants';

interface LoopFormProps {
  onSubmit: (formState: LoopFormState) => void;
  membership: MembershipTier;
}

type InputMode = 'vibe' | 'text';

const LoopForm: React.FC<LoopFormProps> = ({ onSubmit, membership }) => {
  const [inputMode, setInputMode] = useState<InputMode>('vibe');
  const [selectedMood, setSelectedMood] = useState<Mood>(MOODS[0].name);
  const [freeformMood, setFreeformMood] = useState('');
  
  // Time state
  const [timeValue, setTimeValue] = useState(60);
  const [durationType, setDurationType] = useState<DurationType>('minutes');
  
  const [budget, setBudget] = useState(20);
  const [budgetStyle, setBudgetStyle] = useState<BudgetStyle>('mid-range');
  const [itineraryStyle, setItineraryStyle] = useState<ItineraryStyle>('hidden-gems');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mood = inputMode === 'vibe' ? selectedMood : freeformMood;
    if (!mood) {
        alert("Please describe your mood if you're not picking a vibe!");
        return;
    }
    onSubmit({ mood, time: timeValue, budget, durationType, budgetStyle, itineraryStyle });
  };
  
  const MAX_BUDGET = 500;
  const isTravelPlan = (membership === 'elite' || membership === 'elite_annual') && (durationType === 'days' || durationType === 'week');

  const renderTimeSelector = () => {
    if (membership !== 'elite' && membership !== 'elite_annual') {
      return (
        <div className="flex items-center space-x-4">
          <input
            id="time"
            type="range"
            min="30"
            max="240"
            step="15"
            value={timeValue}
            onChange={(e) => setTimeValue(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <span className="font-semibold text-indigo-300 w-28 text-center">{timeValue} minutes</span>
        </div>
      );
    }

    // Elite Member Time Selector
    return (
        <div>
            <div className="flex items-center bg-gray-800 p-1 rounded-full mb-4 max-w-sm mx-auto">
                {(['minutes', 'days', 'week'] as DurationType[]).map(type => (
                    <button 
                      key={type}
                      type="button" 
                      onClick={() => {
                        setDurationType(type);
                        // Reset to sensible defaults
                        if (type === 'minutes') setTimeValue(60);
                        if (type === 'days') setTimeValue(3);
                        if (type === 'week') setTimeValue(1);
                      }} 
                      className={`capitalize w-full px-3 py-1 text-sm font-bold rounded-full ${durationType === type ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
                    >
                      {type}
                    </button>
                ))}
            </div>
            <div className="flex items-center space-x-4">
                <input
                    id="time"
                    type="range"
                    min={durationType === 'minutes' ? 30 : 1}
                    max={durationType === 'minutes' ? 240 : (durationType === 'days' ? 10 : 2)}
                    step={durationType === 'minutes' ? 15 : 1}
                    value={timeValue}
                    onChange={(e) => setTimeValue(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                 <span className="font-semibold text-indigo-300 w-32 text-center">
                    {timeValue} {timeValue > 1 ? durationType : durationType.slice(0, -1)}
                 </span>
            </div>
        </div>
    );
  };
  
  const renderBudgetSelector = () => (
    <div>
        <label htmlFor="budget" className="block text-lg font-semibold text-gray-200 mb-3">3. What's your daily budget?</label>
        {isTravelPlan && (
            <div className="flex items-center bg-gray-800 p-1 rounded-full mb-4 max-w-sm mx-auto">
                {(['budget', 'mid-range', 'luxe'] as BudgetStyle[]).map(style => (
                    <button
                        key={style}
                        type="button"
                        onClick={() => setBudgetStyle(style)}
                        className={`capitalize w-full px-3 py-1 text-sm font-bold rounded-full ${budgetStyle === style ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
                    >
                        {style.replace('-', ' ')}
                    </button>
                ))}
            </div>
        )}
        <div className="flex items-center space-x-4">
          <input
            id="budget"
            type="range"
            min="0"
            max={MAX_BUDGET}
            step="10"
            value={budget}
            onChange={(e) => setBudget(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <span className="font-semibold text-purple-300 w-28 text-center">
            {budget < MAX_BUDGET ? `$${budget}` : `$${MAX_BUDGET}+`}
          </span>
        </div>
      </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      <div>
        <div className="flex justify-between items-center mb-3">
            <label className="block text-lg font-semibold text-gray-200">1. What's the vibe?</label>
            <div className="flex items-center bg-gray-800 p-1 rounded-full">
                <button type="button" onClick={() => setInputMode('vibe')} className={`px-3 py-1 text-xs font-bold rounded-full ${inputMode === 'vibe' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>Pick a Vibe</button>
                <button type="button" onClick={() => setInputMode('text')} className={`px-3 py-1 text-xs font-bold rounded-full ${inputMode === 'text' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>Describe It</button>
            </div>
        </div>
        
        {inputMode === 'vibe' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {MOODS.map(({ name, icon, color, hoverColor }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedMood(name)}
                  className={`p-3 rounded-lg flex flex-col items-center justify-center text-center transition-all duration-200 transform hover:scale-105 ${
                    selectedMood === name
                      ? `${color} ring-2 ring-offset-2 ring-offset-gray-900 ring-white`
                      : `bg-gray-700/50 ${hoverColor}`
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mb-2">
                    <path d={icon} />
                  </svg>
                  <span className="text-sm font-medium">{name}</span>
                </button>
              ))}
            </div>
        ) : (
             <textarea
                value={freeformMood}
                onChange={(e) => setFreeformMood(e.target.value)}
                placeholder="e.g., 'A relaxing weekend getaway with my partner, focus on nature and good food' or 'a solo trip to explore art and history'"
                className="w-full h-24 bg-gray-700/50 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
            />
        )}
      </div>

      <div>
        <label htmlFor="time" className="block text-lg font-semibold text-gray-200 mb-3">2. How much time do you have?</label>
        {renderTimeSelector()}
      </div>
      
      {renderBudgetSelector()}

      <div>
        <label className="block text-lg font-semibold text-gray-200 mb-3">4. What's your style?</label>
        <div className="flex items-center bg-gray-800 p-1 rounded-full max-w-sm mx-auto">
            <button
                type="button"
                onClick={() => setItineraryStyle('iconic-sights')}
                className={`capitalize w-full px-3 py-1 text-sm font-bold rounded-full transition-colors ${itineraryStyle === 'iconic-sights' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            >
                Iconic Sights
            </button>
            <button
                type="button"
                onClick={() => setItineraryStyle('hidden-gems')}
                className={`capitalize w-full px-3 py-1 text-sm font-bold rounded-full transition-colors ${itineraryStyle === 'hidden-gems' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
            >
                Hidden Gems
            </button>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 px-4 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
        >
          ✨ Generate My Adventure
        </button>
      </div>
    </form>
  );
};

export default LoopForm;