import React, { useState, useEffect, useCallback } from 'react';
import type { GeolocationCoordinates, Itinerary, LoopFormState, GroundingChunk, UserProfile, HiddenGem, MembershipTier, ActiveLoop } from './types';
import { generateLoop, extractTastesFromLoop, discoverGems } from './services/geminiService';
import Header from './components/Header';
import LoopForm from './components/LoopForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import SavedLoopsDisplay from './components/SavedLoopsDisplay';
import ApiErrorDisplay from './components/ApiErrorDisplay';
import NavigationBar from './components/NavigationBar';
import DiscoverDisplay from './components/DiscoverDisplay';
import ProfileDisplay from './components/ProfileDisplay';
import FriendsDisplay from './components/FriendsDisplay';
import CurrentLoopDisplay from './components/CurrentLoopDisplay';
import { MOCK_USERS, MOCK_LOOPS } from './mockData';


const SAVED_LOOPS_KEY = 'loopcity_saved_loops';
const USER_PROFILE_KEY = 'loopcity_user_profile';
const ACTIVE_LOOP_KEY = 'loopcity_active_loop';
type View = 'generate' | 'discover' | 'saved' | 'profile' | 'friends' | 'currentLoop';

const App: React.FC = () => {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState<boolean>(true);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [savedLoops, setSavedLoops] = useState<Itinerary[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({ id: 'user_1', name: 'Explorer', tastes: [], followersCount: 42, following: ['user_2'], membership: 'free' });
  const [hiddenGems, setHiddenGems] = useState<HiddenGem[]>([]);
  const [activeLoop, setActiveLoop] = useState<ActiveLoop | null>(null);
  
  const [currentView, setCurrentView] = useState<View>('generate');
  
  // --- Social Feature State ---
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allLoops, setAllLoops] = useState<Itinerary[]>([]);
  const [friendSuggestions, setFriendSuggestions] = useState<UserProfile[]>([]);

  const getLocation = useCallback(() => {
    setIsLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationError(null);
        setIsLocationLoading(false);
        setIsLoading(false);
      },
      (error) => {
        let message = 'An unknown error occurred while trying to get your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access was denied. Please enable location permissions for this site in your browser settings to use LoopCity.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Your location could not be determined. Please check your network connection and ensure location services are on.';
            break;
          case error.TIMEOUT:
            message = 'The request to get your location timed out. Please try again.';
            break;
        }
        setLocationError(message);
        setIsLocationLoading(false);
        setIsLoading(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    // Load local data from localStorage
    try {
      const storedProfile = localStorage.getItem(USER_PROFILE_KEY);
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        // Ensure membership exists for older profiles
        if (!parsedProfile.membership) {
            parsedProfile.membership = 'free';
        }
        setUserProfile(parsedProfile);
      }
      const storedLoops = localStorage.getItem(SAVED_LOOPS_KEY);
      if (storedLoops) {
        setSavedLoops(JSON.parse(storedLoops));
      }
      const storedActiveLoop = localStorage.getItem(ACTIVE_LOOP_KEY);
      if (storedActiveLoop) {
        setActiveLoop(JSON.parse(storedActiveLoop));
      }
    } catch (error) {
      console.error("Failed to load from localStorage", error);
    }
    
    // Load mock social data
    setAllUsers(MOCK_USERS);
    setAllLoops(MOCK_LOOPS);

    // Get user location
    getLocation();
  }, [getLocation]);
  
  const handleUpdateProfile = useCallback((newProfile: UserProfile) => {
      setUserProfile(newProfile);
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(newProfile));
  }, []);
  
  const handleUpgradeMembership = useCallback((tier: MembershipTier) => {
      const newProfile = { ...userProfile, membership: tier };
      handleUpdateProfile(newProfile);
      // In a real app, this would trigger a payment flow.
      alert(`Congratulations! You are now a ${tier} member.`);
  }, [userProfile, handleUpdateProfile]);

  const handleGenerateLoop = useCallback(async (formState: LoopFormState) => {
    if (!location) {
      setApiError("Cannot generate a loop without your location.");
      return;
    }
    setIsGenerating(true);
    setItinerary(null);
    setApiError(null);
    setGroundingChunks([]);

    try {
      const result = await generateLoop(formState, location, userProfile.tastes, userProfile.membership);
      const itineraryWithId = { 
          ...result.itinerary, 
          id: Date.now().toString(), 
          authorId: userProfile.id,
          authorName: userProfile.name,
          createdAt: new Date().toISOString()
      };
      setItinerary(itineraryWithId);
      setGroundingChunks(result.groundingChunks);
    } catch (error) {
      console.error("Failed to generate loop:", error);
      setApiError("Sorry, I couldn't create a loop right now. The magic seems to be offline. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  }, [location, userProfile]);
  
  const handleDiscoverGems = useCallback(async () => {
    if (!location) return;
    setIsGenerating(true);
    setApiError(null);
    try {
        const gems = await discoverGems(location, userProfile.tastes);
        setHiddenGems(gems);
    } catch (error) {
        console.error("Failed to discover gems:", error);
        setApiError("Sorry, I couldn't find any hidden gems right now. Please try again later.");
    } finally {
        setIsGenerating(false);
    }
  }, [location, userProfile.tastes]);

  const handleReset = () => {
    setItinerary(null);
    setApiError(null);
    setGroundingChunks([]);
    setCurrentView('generate');
  };
  
  const handleSaveLoop = useCallback(async (loopToSave: Itinerary) => {
    if (savedLoops.some(loop => loop.id === loopToSave.id)) return;
    
    const newLoop = { ...loopToSave, authorId: userProfile.id, authorName: userProfile.name, createdAt: new Date().toISOString() };
    
    const newSavedLoops = [...savedLoops, newLoop];
    setSavedLoops(newSavedLoops);
    localStorage.setItem(SAVED_LOOPS_KEY, JSON.stringify(newSavedLoops));
    
    // Add to global feed for simulation
    setAllLoops(prev => [...prev, newLoop]);
    
    try {
      const newTastes = await extractTastesFromLoop(loopToSave);
      setUserProfile(prevProfile => {
        const updatedTastes = [...new Set([...prevProfile.tastes, ...newTastes])].slice(0, 20); // Limit to 20 tastes
        const updatedProfile = { ...prevProfile, tastes: updatedTastes };
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedProfile));
        return updatedProfile;
      });
    } catch (e) {
      console.error("Could not extract tastes:", e);
    }
  }, [savedLoops, userProfile.id, userProfile.name]);

  const handleDeleteLoop = useCallback((idToDelete: string) => {
    const newSavedLoops = savedLoops.filter(loop => loop.id !== idToDelete);
    setSavedLoops(newSavedLoops);
    localStorage.setItem(SAVED_LOOPS_KEY, JSON.stringify(newSavedLoops));
  }, [savedLoops]);

  const handleViewSavedLoop = (loopToView: Itinerary) => {
    setItinerary(loopToView);
    setGroundingChunks([]); 
    setCurrentView('generate');
  };
  
  const handleFindFriends = useCallback(() => {
    // Simulate finding friends: suggest users the current user isn't following.
    const suggestions = allUsers.filter(user => user.id !== userProfile.id && !userProfile.following.includes(user.id));
    // Sort by shared tastes for relevance
    suggestions.sort((a, b) => {
        const aShared = a.tastes.filter(t => userProfile.tastes.includes(t)).length;
        const bShared = b.tastes.filter(t => userProfile.tastes.includes(t)).length;
        return bShared - aShared;
    });
    setFriendSuggestions(suggestions);
  }, [allUsers, userProfile.id, userProfile.following, userProfile.tastes]);
  
  const handleFollow = useCallback((userId: string) => {
      if (userProfile.following.includes(userId)) return;
      const newProfile = { ...userProfile, following: [...userProfile.following, userId] };
      handleUpdateProfile(newProfile);
  }, [userProfile, handleUpdateProfile]);
  
  const handleUnfollow = useCallback((userId: string) => {
      const newProfile = { ...userProfile, following: userProfile.following.filter(id => id !== userId) };
      handleUpdateProfile(newProfile);
  }, [userProfile, handleUpdateProfile]);

  const handleNavigate = (view: View) => {
    setApiError(null);
    if (view === 'generate' && currentView !== 'generate') {
      setItinerary(null);
    }
    setCurrentView(view);
    if(view === 'discover' && hiddenGems.length === 0) {
        handleDiscoverGems();
    }
  };

  // --- Active Loop Handlers ---
  const handleStartLoop = useCallback((itineraryToStart: Itinerary) => {
    const isMyLoop = !itineraryToStart.authorId || itineraryToStart.authorId === userProfile.id;
    
    const participants = [userProfile];
    
    if (!isMyLoop) {
        // It's a friend's loop, so we "join". Include the author.
        const author = allUsers.find(u => u.id === itineraryToStart.authorId);
        if (author) {
            participants.push(author);
        }
        // And maybe one of our friends.
        participants.push(...allUsers.filter(u => userProfile.following.includes(u.id) && u.id !== author?.id).slice(0, 2));
    } else {
        // It's our own loop, invite our friends.
        participants.push(...allUsers.filter(u => userProfile.following.includes(u.id)).slice(0, 3));
    }

    const newActiveLoop: ActiveLoop = {
        itinerary: { ...itineraryToStart, participants: Array.from(new Set(participants)) }, // Use Set to avoid duplicates
        completedStops: []
    };
    setActiveLoop(newActiveLoop);
    localStorage.setItem(ACTIVE_LOOP_KEY, JSON.stringify(newActiveLoop));
    setCurrentView('currentLoop');
  }, [userProfile, allUsers]);

  const handleToggleStopCompletion = useCallback((stopName: string) => {
    if (!activeLoop) return;
    const completed = activeLoop.completedStops.includes(stopName);
    const newCompletedStops = completed
        ? activeLoop.completedStops.filter(s => s !== stopName)
        : [...activeLoop.completedStops, stopName];
    
    const newActiveLoop = { ...activeLoop, completedStops: newCompletedStops };
    setActiveLoop(newActiveLoop);
    localStorage.setItem(ACTIVE_LOOP_KEY, JSON.stringify(newActiveLoop));
  }, [activeLoop]);

  const handleCompleteLoop = useCallback(() => {
    setActiveLoop(null);
    localStorage.removeItem(ACTIVE_LOOP_KEY);
    setCurrentView('generate');
    setItinerary(null);
  }, []);


  const renderContent = () => {
    if (isLoading && isLocationLoading) {
      return (
        <div className="text-center mt-8">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-gray-400">Finding your location...</p>
        </div>
      );
    }

    if (locationError) {
      return (
        <div className="text-center bg-red-900/50 p-6 rounded-lg border border-red-700 mt-8">
          <h2 className="text-xl font-bold text-red-300">Location Access Required</h2>
          <p className="mt-2 text-red-200">{locationError}</p>
          <button
            onClick={getLocation}
            disabled={isLocationLoading}
            className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-full transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-wait"
          >
            {isLocationLoading ? 'Retrying...' : 'Retry Location'}
          </button>
        </div>
      );
    }

    if (isGenerating) {
        return (
            <div className="text-center mt-8">
                <LoadingSpinner />
                <p className="mt-4 text-lg text-gray-400">
                    {currentView === 'discover' ? 'Searching for hidden gems...' : 'Crafting your adventure...'}
                </p>
            </div>
        )
    }
    
    if (apiError) {
       return <ApiErrorDisplay message={apiError} onRetry={handleReset} />;
    }

    switch (currentView) {
        case 'discover':
            return <DiscoverDisplay gems={hiddenGems} onRefresh={handleDiscoverGems} tastes={userProfile.tastes} membership={userProfile.membership} onUpgrade={() => handleUpgradeMembership('premium')} />;
        case 'saved':
            return <SavedLoopsDisplay loops={savedLoops} onView={handleViewSavedLoop} onDelete={handleDeleteLoop} />;
        case 'profile':
            return <ProfileDisplay profile={userProfile} onUpdateProfile={handleUpdateProfile} onFindFriends={() => handleNavigate('friends')} onUpgradeMembership={handleUpgradeMembership} />;
        case 'friends':
            const followedLoops = allLoops
                .filter(loop => userProfile.following.includes(loop.authorId || ''))
                .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

            return <FriendsDisplay 
                followedLoops={followedLoops}
                allUsers={allUsers}
                suggestions={friendSuggestions}
                onFindFriends={handleFindFriends}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
                currentUser={userProfile}
                onView={handleViewSavedLoop}
            />
        case 'currentLoop':
            if (!activeLoop) {
                return <p className="text-center text-gray-400">No active loop. Go generate one!</p>;
            }
            return <CurrentLoopDisplay activeLoop={activeLoop} onToggleStop={handleToggleStopCompletion} onComplete={handleCompleteLoop} location={location} />;
        case 'generate':
        default:
            if (itinerary) {
                const isSaved = savedLoops.some(loop => loop.id === itinerary.id);
                return <ItineraryDisplay 
                    itinerary={itinerary} 
                    groundingChunks={groundingChunks} 
                    onReset={handleReset} 
                    onSave={handleSaveLoop} 
                    isSaved={isSaved}
                    onStartLoop={handleStartLoop}
                    activeLoop={activeLoop}
                    currentUser={userProfile}
                    location={location}
                 />;
            }
            if (location) {
                return <LoopForm onSubmit={handleGenerateLoop} membership={userProfile.membership} />;
            }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8 flex flex-col items-center">
       <div className="w-full max-w-2xl mx-auto">
        <Header />
        <NavigationBar currentView={currentView} onNavigate={handleNavigate} savedLoopsCount={savedLoops.length} activeLoop={activeLoop} />
        <main className="mt-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;