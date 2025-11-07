import React from 'react';
import type { ActiveLoop, Stop, DayPlan, GeolocationCoordinates } from '../types';

interface CurrentLoopDisplayProps {
  activeLoop: ActiveLoop;
  onToggleStop: (stopName: string) => void;
  onComplete: () => void;
  location: GeolocationCoordinates | null;
}

const StopChecklistItem: React.FC<{ 
    stop: Stop; 
    isCompleted: boolean; 
    onToggle: () => void;
    location: GeolocationCoordinates | null;
}> = ({ stop, isCompleted, onToggle, location }) => {

    const handleGoClick = () => {
      if (!location || !stop.address) return;
      const origin = `${location.latitude},${location.longitude}`;
      const destination = encodeURIComponent(stop.address);
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="flex items-start gap-4 p-3 bg-gray-800/50 rounded-lg">
            <input
            type="checkbox"
            checked={isCompleted}
            onChange={onToggle}
            className="mt-1 h-6 w-6 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-600"
            />
            <div className="flex-1">
                <label className={`font-semibold text-lg ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
                    {stop.name}
                </label>
                {stop.address && (
                    <p className={`text-xs mt-1 ${isCompleted ? 'text-gray-600' : 'text-gray-500'}`}>{stop.address}</p>
                )}
                <p className={`text-sm mt-1 ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>{stop.description}</p>
                {stop.address && location && (
                    <button
                        onClick={handleGoClick}
                        className="flex items-center gap-1 text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors mt-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" /></svg>
                        Go
                    </button>
                )}
            </div>
        </div>
    );
};

const CurrentLoopDisplay: React.FC<CurrentLoopDisplayProps> = ({ activeLoop, onToggleStop, onComplete, location }) => {
  const { itinerary, completedStops } = activeLoop;
  const hasMultiDayPlan = itinerary.days && itinerary.days.length > 0;

  const renderStops = (stops: Stop[]) => (
    <div className="space-y-3">
      {stops.map((stop) => (
        <StopChecklistItem
          key={stop.name}
          stop={stop}
          isCompleted={completedStops.includes(stop.name)}
          onToggle={() => onToggleStop(stop.name)}
          location={location}
        />
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">
          {itinerary.loopTitle}
        </h2>
        <p className="text-gray-300 mt-2">{itinerary.loopDescription}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">Participants:</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {itinerary.participants?.map(p => (
            <span key={p.id} className="flex items-center gap-2 bg-gray-700/50 px-3 py-1 rounded-full">
              <span className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                {p.name.charAt(0)}
              </span>
              <span className="text-sm font-medium text-gray-200">{p.name}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {hasMultiDayPlan ? (
          itinerary.days?.map(day => (
            <div key={day.day}>
              <h3 className="text-2xl font-bold text-teal-300 border-b-2 border-teal-800 pb-2 mb-4">Day {day.day}: {day.theme}</h3>
              {renderStops(day.stops)}
            </div>
          ))
        ) : (
          renderStops(itinerary.stops)
        )}
      </div>

      <div className="pt-6 border-t border-gray-700 text-center">
        <button
          onClick={onComplete}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full transition-colors duration-300"
        >
          Complete Loop
        </button>
      </div>
    </div>
  );
};

export default CurrentLoopDisplay;