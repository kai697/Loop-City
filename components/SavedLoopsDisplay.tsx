import React from 'react';
import type { Itinerary } from '../types';

interface SavedLoopsDisplayProps {
  loops: Itinerary[];
  onView: (loop: Itinerary) => void;
  onDelete: (id: string) => void;
}

const SavedLoopsDisplay: React.FC<SavedLoopsDisplayProps> = ({ loops, onView, onDelete }) => {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-200">My Saved Loops</h2>
      </div>
      {loops.length === 0 ? (
        <p className="text-gray-400 text-center py-8">You haven't saved any loops yet.</p>
      ) : (
        <ul className="space-y-4">
          {loops.map((loop) => (
            <li key={loop.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex justify-between items-center transition-shadow hover:shadow-lg">
              <div>
                <h3 className="font-semibold text-lg text-indigo-300">{loop.loopTitle}</h3>
                <p className="text-sm text-gray-400">{loop.stops.map(s => s.name).join(' → ')}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => onView(loop)} className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-full transition-colors">
                  View
                </button>
                <button onClick={() => onDelete(loop.id)} className="text-sm bg-red-800 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-full transition-colors">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedLoopsDisplay;