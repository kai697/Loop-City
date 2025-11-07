import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { Itinerary, GroundingChunk, Stop, ActiveLoop, UserProfile, GeolocationCoordinates } from '../types';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import StarRating from './StarRating';


interface ItineraryDisplayProps {
  itinerary: Itinerary;
  groundingChunks: GroundingChunk[];
  onReset: () => void;
  onSave: (itinerary: Itinerary) => void;
  isSaved: boolean;
  onStartLoop: (itinerary: Itinerary) => void;
  activeLoop: ActiveLoop | null;
  currentUser: UserProfile;
  location: GeolocationCoordinates | null;
}

const StopDisplay: React.FC<{ 
  stop: Stop; 
  index: number; 
  stopNumber: number;
  itineraryTitle: string; 
  onAudioPlay: (stop: Stop, uniqueIndex: number) => void;
  audioState: { loadingIndex: number | null; playingIndex: number | null; errorIndex: number | null };
  location: GeolocationCoordinates | null;
}> = ({ stop, index, stopNumber, itineraryTitle, onAudioPlay, audioState, location }) => {

  const BusinessInfo: React.FC<{ stop: Stop }> = ({ stop }) => {
    if (!stop.isBusiness) return null;

    const getBadge = () => {
        switch (stop.claimStatus) {
            case 'premium':
                return <span className="text-xs font-bold text-yellow-300 bg-yellow-600/50 px-2 py-1 rounded">✨ Premium Partner</span>;
            case 'claimed':
                return <span className="text-xs font-bold text-blue-300 bg-blue-600/50 px-2 py-1 rounded">✓ Verified</span>;
            case 'unclaimed':
                return <span className="text-xs font-bold text-gray-300 bg-gray-600/50 px-2 py-1 rounded">Claim This Profile</span>;
            default:
                return null;
        }
    };
    return (
        <div className="mt-3 flex items-center gap-4 flex-wrap">
            {typeof stop.rating === 'number' && typeof stop.reviewCount === 'number' && (
                <div className="flex items-center gap-1">
                    <StarRating rating={stop.rating} />
                    <span className="text-xs text-gray-400">({stop.reviewCount})</span>
                </div>
            )}
            {getBadge()}
        </div>
    );
  };
  
  const handleGoClick = () => {
      if (!location || !stop.address) return;
      const origin = `${location.latitude},${location.longitude}`;
      const destination = encodeURIComponent(stop.address);
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div>
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-xl">
                {stopNumber}
            </div>
            <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">{stop.name}</h3>
                {stop.address && (
                    <p className="text-xs text-gray-500 mt-1">{stop.address}</p>
                )}
                <p className="text-gray-400 mt-1">{stop.description}</p>
                <BusinessInfo stop={stop} />
                <div className="flex items-center gap-4 h-8 mt-2">
                    <button 
                      onClick={() => onAudioPlay(stop, index)}
                      className="flex items-center gap-2 text-sm font-semibold text-indigo-300 hover:text-indigo-200 transition-colors disabled:text-gray-500 disabled:cursor-wait"
                      disabled={audioState.loadingIndex === index}
                      aria-label={`Play audio guide for ${stop.name}`}
                    >
                      {audioState.loadingIndex === index ? (
                        <><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>Generating...</>
                      ) : audioState.playingIndex === index ? (
                        <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>Stop Guide</>
                      ) : (
                        <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>Audio Guide</>
                      )}
                    </button>
                    {stop.address && location && (
                         <button
                            onClick={handleGoClick}
                            className="flex items-center gap-1 text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                         >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" /></svg>
                            Go
                         </button>
                    )}
                    {audioState.errorIndex === index && <p className="text-red-400 text-xs mt-1">Audio failed to load.</p>}
                 </div>
            </div>
        </div>
    </div>
  );
};


const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, groundingChunks, onReset, onSave, isSaved, onStartLoop, activeLoop, currentUser, location }) => {
  const [audioState, setAudioState] = useState<{ loadingIndex: number | null; playingIndex: number | null; errorIndex: number | null }>({ loadingIndex: null, playingIndex: null, errorIndex: null });
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const latestAudioRequestRef = useRef(0);
  
  const stopAudio = useCallback(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }
    // Don't reset errors when stopping audio for a new one to play
    setAudioState(prevState => ({...prevState, loadingIndex: null, playingIndex: null }));
  }, []);
  
  useEffect(() => {
    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      }
      if(audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
      }
    }
  }, []);

  const handlePlayAudio = useCallback(async (stop: Stop, uniqueIndex: number) => {
    const currentRequestId = ++latestAudioRequestRef.current;

    if (audioState.playingIndex === uniqueIndex) {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
      }
      return;
    }

    if (audioSourceRef.current) {
      audioSourceRef.current.onended = null;
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    
    setAudioState(prevState => ({
      ...prevState,
      loadingIndex: uniqueIndex,
      playingIndex: null,
      errorIndex: prevState.errorIndex === uniqueIndex ? null : prevState.errorIndex,
    }));

    try {
      const audioBase64 = await generateSpeech(stop, itinerary.loopTitle);

      if (latestAudioRequestRef.current !== currentRequestId) {
        return; 
      }

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const audioContext = audioContextRef.current;
      const audioBuffer = await decodeAudioData(decode(audioBase64), audioContext, 24000, 1);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      source.onended = () => {
        setAudioState(prevState => {
          if (prevState.playingIndex === uniqueIndex) {
            return { ...prevState, playingIndex: null };
          }
          return prevState;
        });
        audioSourceRef.current = null;
      };

      source.start();
      audioSourceRef.current = source;
      
      setAudioState(prevState => ({ ...prevState, loadingIndex: null, playingIndex: uniqueIndex }));
    } catch (error) {
      console.error("Audio guide error:", error);
      if (latestAudioRequestRef.current === currentRequestId) {
        setAudioState(prevState => ({
          ...prevState,
          loadingIndex: null,
          playingIndex: null,
          errorIndex: uniqueIndex,
        }));
      }
    }
  }, [audioState, itinerary.loopTitle]);
  
  const hasMultiDayPlan = itinerary.days && itinerary.days.length > 0;
  let stopCounter = 0;

  const getActionButton = () => {
    const isMyLoop = !itinerary.authorId || itinerary.authorId === currentUser.id;
    const isThisLoopActive = activeLoop && activeLoop.itinerary.id === itinerary.id;
    const isAnotherLoopActive = activeLoop && activeLoop.itinerary.id !== itinerary.id;
    
    const isDisabled = isThisLoopActive || isAnotherLoopActive;

    let text: string;
    let className = "bg-green-600 hover:bg-green-500";

    if (isThisLoopActive) {
        text = "✓ Loop in Progress";
        className = "bg-gray-600";
    } else if (isAnotherLoopActive) {
        text = "Another Loop Active";
        className = "bg-gray-600";
    } else if (isMyLoop) {
        text = "🚀 Start Loop Together";
        className = "bg-teal-600 hover:bg-teal-500";
    } else {
        text = "🙋 Join Loop";
        className = "bg-green-600 hover:bg-green-500";
    }

    return (
        <button
          onClick={() => onStartLoop(itinerary)}
          disabled={isDisabled}
          className={`${className} disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-full transition-colors duration-300 flex items-center justify-center gap-2 w-full sm:w-auto`}
        >
            {text}
        </button>
    );
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl shadow-2xl border border-gray-700 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          {itinerary.loopTitle}
        </h2>
        <p className="text-gray-300 mt-2">{itinerary.loopDescription}</p>
         {itinerary.authorName && (
            <p className="text-xs text-gray-500 mt-2">
                Saved by {itinerary.authorName}
            </p>
         )}
      </div>

      {hasMultiDayPlan ? (
        <div className="space-y-10">
          {itinerary.days?.map(day => (
            <div key={day.day}>
              <h3 className="text-2xl font-bold text-purple-300 border-b-2 border-purple-800 pb-2 mb-4">Day {day.day}: {day.theme}</h3>
              <div className="space-y-8">
                {day.stops.map((stop) => {
                    const uniqueIndex = stopCounter++;
                    return (
                        <StopDisplay
                            key={uniqueIndex}
                            stop={stop}
                            index={uniqueIndex}
                            stopNumber={uniqueIndex + 1}
                            itineraryTitle={itinerary.loopTitle}
                            onAudioPlay={handlePlayAudio}
                            audioState={audioState}
                            location={location}
                        />
                    );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
            {itinerary.stops.map((stop, index) => {
                const uniqueIndex = stopCounter++;
                return (
                    <StopDisplay
                        key={uniqueIndex}
                        stop={stop}
                        index={uniqueIndex}
                        stopNumber={index + 1}
                        itineraryTitle={itinerary.loopTitle}
                        onAudioPlay={handlePlayAudio}
                        audioState={audioState}
                        location={location}
                    />
                );
            })}
        </div>
      )}
      
      <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={() => { if (audioSourceRef.current) { audioSourceRef.current.stop(); } onReset(); }}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full transition-colors duration-300 w-full sm:w-auto"
        >
          Back
        </button>
        <button
          onClick={() => onSave(itinerary)}
          disabled={isSaved}
          className="bg-gray-700 hover:bg-indigo-500 disabled:bg-indigo-900/50 disabled:cursor-not-allowed disabled:text-gray-400 text-white font-bold py-2 px-6 rounded-full transition-colors duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          {isSaved ? (
             <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Saved
             </>
          ) : (
             <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3-5 3V4z" />
                </svg>
                Save Loop
             </>
          )}
        </button>
        {getActionButton()}
      </div>
    </div>
  );
};

export default ItineraryDisplay;