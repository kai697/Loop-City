import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { GeolocationCoordinates, Itinerary, LoopFormState, GroundingChunk, HiddenGem, Stop, MembershipTier, ItineraryStyle } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function buildTravelPrompt(formState: LoopFormState, location: GeolocationCoordinates, tastes: string[]): string {
    const duration = formState.durationType === 'week' ? 7 : formState.time;
    
    const budgetStyleText = {
        'budget': 'budget-friendly (e.g., hostels, street food, free attractions)',
        'mid-range': 'comfortable mid-range (e.g., boutique hotels, local restaurants, some paid attractions)',
        'luxe': 'high-end and luxurious (e.g., premium hotels, fine dining, exclusive experiences)'
    };

    const dailyBudgetText = formState.budget >= 500 ? `$500+` : `$${formState.budget}`;

    const budgetDescription = `The user has a daily budget of approximately ${dailyBudgetText} per person, which MUST cover accommodation. Their preferred travel style is: ${budgetStyleText[formState.budgetStyle || 'mid-range']}. Tailor all recommendations (accommodation, food, activities) to fit this budget and style.`;

    const userTastes = tastes.length > 0
        ? `\n- Learned Interests: The user loves: ${tastes.join(', ')}. Build the itinerary around these themes.`
        : '';
        
    const itineraryStyleText = formState.itineraryStyle === 'hidden-gems'
        ? 'Focus on authentic, local restaurants and boutique accommodations. Avoid major tourist traps.'
        : 'Focus on famous restaurants and well-regarded hotels near iconic sights.';

    return `You are LoopCity+, an AI expert in crafting personalized travel itineraries.
Your task is to generate a complete, multi-day travel plan.

User's preferences:
- Trip Vibe: ${formState.mood}
- Trip Duration: ${duration} days
- Budget Details: ${budgetDescription}
- Itinerary Style: ${itineraryStyleText}
- Starting Location: Latitude ${location.latitude}, Longitude ${location.longitude} (plan the trip for this city/region)
${userTastes}

Itinerary requirements:
- Create a day-by-day plan for the entire duration.
- Each day should have a clear theme (e.g., "Historical Exploration", "Culinary Delights", "Relaxation & Scenery").
- For each day, suggest 2-4 activities or stops. You MUST include a verifiable, physical address for each stop.
- You MUST include specific recommendations for accommodation and meals (breakfast, lunch, dinner) that align with the user's budget and style.
- REAL LOCATIONS ONLY: Do not invent or "hallucinate" any business names, landmarks, or addresses. Every single piece of location information must correspond to a real, existing place that can be found on Google Maps. Use your grounding ability to verify.
- The tone should be that of a professional, enthusiastic travel agent.

Output requirements:
- Your entire response MUST be a single, valid JSON object.
- Do not include any markdown formatting, code block syntax, or any text outside of the JSON object.
- The JSON object must follow this exact structure:
{
  "loopTitle": "A creative and catchy title for this trip.",
  "loopDescription": "A short, one or two-sentence summary of the overall travel experience.",
  "days": [
    {
      "day": 1,
      "theme": "Theme for Day 1",
      "stops": [
        {
          "name": "Accommodation Suggestion: [Hotel Name/Type]",
          "description": "Briefly describe the accommodation style and why it fits the budget.",
          "address": "The full, physical street address of the accommodation."
        },
        {
          "name": "Name of the first stop/activity.",
          "description": "A compelling description of the stop and what to do there.",
          "address": "The full, physical street address of the stop."
        },
        { "name": "Lunch Suggestion: [Restaurant Name/Type]", "description": "Briefly describe the food or vibe.", "address": "The full, physical street address of the restaurant." }
      ]
    }
  ]
}`;
}


function buildPrompt(formState: LoopFormState, location: GeolocationCoordinates, tastes: string[], membership: MembershipTier): string {
  const isTravelPlan = (membership === 'elite' || membership === 'elite_annual') && (formState.durationType === 'days' || formState.durationType === 'week');
  if (isTravelPlan) {
      return buildTravelPrompt(formState, location, tastes);
  }

  const budgetText = formState.budget >= 250 
    ? 'flexible / high-end (suggest unique or premium experiences if they fit the mood)'
    : `around $${formState.budget} (if $0, focus on free activities)`;

  const userTastes = tastes.length > 0
    ? `\n- Learned Interests: The user has shown interest in things like: ${tastes.join(', ')}. Use these as inspiration to find similar or complementary experiences.`
    : '';
    
  const moodText = typeof formState.mood === 'string' && formState.mood.length > 20
    ? `The user described their mood as: "${formState.mood}". Analyze the tone, keywords, and sentiment of this description to create a perfectly tailored loop.`
    : `The user chose the vibe: "${formState.mood}"`;
    
  const burnTimeText = formState.mood === 'Burn Time'
    ? 'This is a "Burn Time" request. Generate ONE single, simple, hyper-local stop perfect for a short, unplanned break. It should be very easy to get to.'
    : 'Generate a cohesive \'loop\' itinerary with 2-3 interesting, walkable stops.';

  const itineraryStyleText = formState.itineraryStyle === 'hidden-gems'
    ? 'For this loop, find real insider experiences. Avoid major tourist traps and find things only a local would know.'
    : 'For this loop, focus on iconic, popular, and essential sights. This can include well-known tourist attractions if they fit the vibe.';

  let membershipInstructions = '';
  switch (membership) {
    case 'premium':
      membershipInstructions = '\n- Membership Tier: Premium. Prioritize more exclusive, unique, or higher-quality experiences.';
      break;
    case 'elite_annual':
    case 'elite':
      const tierName = membership === 'elite_annual' ? 'Elite (Annual Pass)' : 'Elite';
      membershipInstructions = `\n- Membership Tier: ${tierName}. Prioritize the highest quality, "insider" recommendations and hidden gems that only a local would know.`;
      break;
  }


  return `You are LoopCity, an AI expert in crafting unique, local micro-adventures. You are also a savvy local guide who understands the city's business landscape.
Your task is to generate a personalized itinerary.

User's preferences:
- Mood: ${moodText}
- Time Available: ${formState.time} minutes
- Budget: ${budgetText}
- Current Location: Latitude ${location.latitude}, Longitude ${location.longitude}${userTastes}${membershipInstructions}

Itinerary Style:
- ${burnTimeText}
- ${itineraryStyleText}

Output requirements:
- Your entire response MUST be a single, valid JSON object.
- Do not include any markdown formatting, code block syntax, or any text outside of the JSON object.
- For EACH stop, you must determine if it is a commercial business (cafe, shop, museum, etc.) or a public space (park, landmark).
- CRITICAL: You MUST provide a real, verifiable physical address for every single stop. Use your grounding in Google Maps to ensure accuracy. Do NOT invent addresses.
- REAL LOCATIONS ONLY: Do not invent or "hallucinate" any business names, landmarks, or addresses. Every single piece of location information must correspond to a real, existing place that can be found on Google Maps.
- If a stop IS a business, you MUST simulate realistic data for it. Give "premium" status a higher chance for high-budget requests.
- The JSON object must follow this exact structure:
{
  "loopTitle": "A creative and catchy title for this micro-adventure.",
  "loopDescription": "A short, one or two-sentence, engaging summary of the loop's vibe and experience.",
  "stops": [
    {
      "name": "Name of the first stop.",
      "description": "A brief, compelling reason why this stop is perfect and a suggested activity.",
      "address": "The full, physical street address of the stop.",
      "isBusiness": true, // or false if it's a public space
      "claimStatus": "premium", // "premium", "claimed", or "unclaimed" (only if isBusiness is true)
      "rating": 4.7, // A number between 3.5 and 5.0 (only if isBusiness is true)
      "reviewCount": 182 // A plausible number of reviews (only if isBusiness is true)
    }
  ]
}
- IMPORTANT: All stops must be physically located very close to the user's provided latitude and longitude. Prioritize hyper-local results. Do not include information about places in other cities, states, or countries.
- The tone should be exciting and inspiring, like a savvy local friend giving a recommendation.`;
}


export async function generateLoop(
  formState: LoopFormState,
  location: GeolocationCoordinates,
  tastes: string[],
  membership: MembershipTier,
): Promise<{ itinerary: Itinerary; groundingChunks: GroundingChunk[] }> {
  try {
    const prompt = buildPrompt(formState, location, tastes, membership);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
        }
      },
    });

    const text = response.text;
    
    const sanitizedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedJson = JSON.parse(sanitizedText);
    
    // Ensure stops is an array for single-day loops, even if the AI returns a single object for "Burn Time"
    if (parsedJson.stops && !Array.isArray(parsedJson.stops)) {
        parsedJson.stops = [parsedJson.stops];
    } else if (!parsedJson.stops) {
        // If it's a travel plan, it won't have a top-level stops array.
        // We can create a flat one for compatibility if needed, but the new UI handles `days`.
        parsedJson.stops = [];
    }
    
    const itinerary: Itinerary = parsedJson;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];

    const hasStops = itinerary.stops && itinerary.stops.length > 0;
    const hasDays = itinerary.days && Array.isArray(itinerary.days) && itinerary.days.length > 0;

    if (!itinerary.loopTitle || (!hasStops && !hasDays)) {
        throw new Error("Received incomplete itinerary data from AI.");
    }

    return { itinerary, groundingChunks };
  } catch (error) {
    console.error("Error in generateLoop service:", error);
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse the AI's response. It might not be valid JSON.");
    }
    throw error;
  }
}

export async function generateSpeech(stop: Stop, itineraryTitle: string): Promise<string> {
    try {
        const prompt = `You are an expert tour guide for the app LoopCity. Your task is to generate and speak a short, engaging audio script (around 45 seconds) for a tour stop.

Tour Name: "${itineraryTitle}"
Stop Name: "${stop.name}"
Stop Description: "${stop.description}"

Instructions:
- Your tone should be friendly, enthusiastic, and informative.
- If the stop is a landmark, park, or public space, include a fun fact, a brief historical note, or interesting information about its significance.
- If the stop is a business (like a cafe or shop), describe its unique ambiance, what it's known for, or what makes it special.
- Keep the script concise and captivating.

Now, generate and speak the script.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error in generateSpeech service:", error);
        throw new Error("Failed to generate audio guide.");
    }
}

export async function extractTastesFromLoop(itinerary: Itinerary): Promise<string[]> {
    const prompt = `You are an expert at analyzing user preferences from text. Your task is to extract a list of keywords representing a user's interests from the provided itinerary details.

**Instructions:**
1.  Analyze the \`loopTitle\`, \`loopDescription\`, and \`stops\`.
2.  Identify 5 to 7 key themes, concepts, or types of places.
3.  Focus on generalizable interests, not specific names of places. For example, prefer "artisan coffee" over "The Daily Grind Cafe".
4.  Keywords should be concise, 1-3 words long, and in lowercase.
5.  Your entire response MUST be a single, valid JSON object with a single key "tastes" which is an array of strings. Do not include any other text or markdown.

**Example 1 (Creative Vibe):**
- Itinerary: A "Mural Mile & Artisan Roast" loop, exploring vibrant street art and a cozy independent coffee shop.
- Correct Output: {"tastes": ["street art", "artisan coffee", "urban exploration", "creative inspiration", "independent shops"]}

**Example 2 (Family Vibe):**
- Itinerary: A "Park Play & Sweet Treats" loop, visiting a large playground and then getting ice cream.
- Correct Output: {"tastes": ["family activities", "outdoor fun", "parks & playgrounds", "desserts", "kid-friendly"]}

**Itinerary to Analyze:**
- Title: ${itinerary.loopTitle}
- Description: ${itinerary.loopDescription}
- Stops: ${itinerary.stops.map(s => `${s.name}: ${s.description}`).join('; ')}

**Your JSON Output:**`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        const result = JSON.parse(response.text);

        if (result.tastes && Array.isArray(result.tastes)) {
            // Further sanitize to ensure they are strings and trimmed
            return result.tastes.map(taste => String(taste).trim().toLowerCase()).filter(Boolean);
        }
        
        console.warn("Tastes response was not in the expected format:", result);
        return [];
    } catch (error) {
        console.error("Error extracting tastes:", error);
        return []; // Return empty array on failure
    }
}

export async function discoverGems(location: GeolocationCoordinates, tastes: string[]): Promise<HiddenGem[]> {
    const userTastes = tastes.length > 0
    ? `The user seems to enjoy things like: ${tastes.join(', ')}. Prioritize gems related to these themes.`
    : 'The user is open to anything new and interesting.';

    const prompt = `You are LoopCity's "Gem Finder". Your goal is to identify 6 truly unique "hidden gems" near the user's location. These should be lesser-known spots that locals love, not major tourist traps.

User's Location: Latitude ${location.latitude}, Longitude ${location.longitude}
User's Profile: ${userTastes}

Output requirements:
- Your entire response MUST be a single, valid JSON object.
- The JSON object must contain a single key "gems" which is an array of objects.
- Do not include any markdown formatting, code block syntax, or any text outside of the JSON object.
- Each object in the "gems" array must follow this exact structure:
{
  "name": "The name of the hidden gem.",
  "description": "A short, enticing description explaining why it's a special place.",
  "category": "A relevant category, like 'Food & Drink', 'Art & Culture', 'Outdoors', 'Unique Shop', or 'Quirky Landmark'."
}
- IMPORTANT: All gems must be hyper-local to the user's coordinates.
`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            gems: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "The name of the hidden gem." },
                        description: { type: Type.STRING, description: "A short, enticing description explaining why it's a special place." },
                        category: { type: Type.STRING, description: "A relevant category, like 'Food & Drink', 'Art & Culture', 'Outdoors', 'Unique Shop', or 'Quirky Landmark'." }
                    },
                    required: ['name', 'description', 'category']
                }
            }
        },
        required: ['gems']
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        const result = JSON.parse(response.text);
        if (!result.gems || !Array.isArray(result.gems)) {
             throw new Error("Invalid format for hidden gems response.");
        }
        return result.gems as HiddenGem[];
    } catch (e) {
        console.error("Failed to discover gems:", e);
        throw new Error("Could not find hidden gems at this time.");
    }
}