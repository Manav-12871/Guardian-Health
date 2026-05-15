import { GoogleGenerativeAI } from "@google/generative-ai";
import { locations } from "../data/locations";
import { detectSpecialty, specialtyLabels } from "../data/specialties";
import { detectLanguage, translateToEnglish, translateToTarget } from "./translationService";

const API_KEY = import.meta.env.VITE_AI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Extract location name from text
export const extractLocation = (text) => {
    const lower = text.toLowerCase();
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    for (const loc of locations) {
        const cityName = loc.name.split(',')[0].toLowerCase().trim();
        const regionName = loc.region.toLowerCase().trim();

        const cityRegex = new RegExp(`\\b${escapeRegExp(cityName)}\\b`, 'i');
        const regionRegex = new RegExp(`\\b${escapeRegExp(regionName)}\\b`, 'i');

        if (cityRegex.test(lower) || regionRegex.test(lower)) {
            return loc;
        }
    }
    return null;
};

// Detect intent: doctor | hospital | pharmacy | symptom
export const detectIntent = (text) => {
    const lower = text.toLowerCase();
    if (lower.match(/\b(book|schedule|appointment|time)\b/)) return 'book';
    if (lower.match(/\b(cost|price|rupees|amount|fee|expensive|cheap)\b/)) return 'cost';
    if (lower.match(/\b(doctor|dr\.|specialist|consult|meet|see a)\b/)) return 'doctor';
    if (lower.match(/\b(pharmacy|medicine|chemist|drug|tablet|buy medicine)\b/)) return 'pharmacy';
    if (lower.match(/\b(hospital|clinic|admit|emergency|icu|bed)\b/)) return 'hospital';
    return 'symptom';
};

const expertFallback = {
    headache: { advice: 'Drink 500ml water immediately. Lie in a dark, quiet room. Apply a cool damp cloth to your forehead. Take paracetamol 500mg if needed.', assessment: 'Likely tension headache or dehydration.', followUp: 'Is the pain throbbing or pressure-like? Any nausea or sensitivity to light?' },
    fever: { advice: 'Take paracetamol (500mg–1g). Sponge your forehead with cool water. Stay hydrated — drink ORS if available.', assessment: 'Your body is fighting an infection.', followUp: 'How high is the temperature? Any sore throat, body aches, or chills?' },
    stomach: { advice: 'Sip ORS or plain water slowly. Avoid solid food for 2–4 hours. A warm compress helps. Avoid spicy or dairy food.', assessment: 'Likely gastritis or food sensitivity.', followUp: 'Is the pain sharp or dull? Did it start after eating? Any vomiting?' },
    cold: { advice: 'Steam inhalation 2–3 times/day. Gargle with warm salt water. Drink hot ginger tea with honey. Rest well.', assessment: 'Common cold or viral URTI.', followUp: 'How many days? Any ear pain or blocked sinuses?' },
    allergy: { advice: 'Avoid the allergen immediately. Wash the area with cold water if localized. Over-the-counter antihistamines like Cetirizine may help.', assessment: 'Likely an allergic reaction.', followUp: 'Are you having any trouble breathing or swelling in your throat/lips?' },
    injury: { advice: 'Rest the injured area immediately. Apply an ice pack wrapped in cloth for 15-20 mins. Compress lightly and elevate.', assessment: 'Applying initial R.I.C.E. protocol for potential sprain.', followUp: 'Can you bear weight on it, or is the bone visibly deformed?' },
    burn: { advice: 'Hold the burn under cool (not cold) running water for 10-15 minutes. Do NOT apply ice or butter. Cover with a sterile, non-fluffy cloth.', assessment: 'Thermal contact protocol.', followUp: 'Is the burn larger than your hand, or located on your face/joints?' },
    default: { advice: 'Rest in a comfortable position. Drink water and do not self-medicate without a clear diagnosis. Monitor your symptoms.', assessment: 'I need more details to give you accurate guidance.', followUp: 'Can you describe exactly where the discomfort is and when it started?' },
};

const internalGetGuardianResponse = async (englishInput, rawInput, context) => {
    const input = englishInput.toLowerCase().trim();

    // 1. Emergency Red Flags (Highest Priority)
    const redFlags = ['chest pain', "can't breathe", 'unconscious', 'heart attack', 'stroke', 'severe bleeding', 'overdose', 'collapsed', 'not breathing'];
    if (redFlags.some(f => input.includes(f))) {
        return {
            type: 'EMERGENCY',
            text: `⚠️ CRITICAL EMERGENCY\n\nCall ${context.emergency} immediately or go to the nearest emergency room right now.\n\nDo NOT wait. If you cannot move, ask someone nearby for immediate help.`,
            escalate: true
        };
    }

    // 2. Location Change Detection
    const mentionedLocation = extractLocation(input);
    const hasLocationContext = /\b(in|at|from|near|am|reached|moved to|currently in)\b/.test(input) || input.split(' ').length <= 4;
    if (mentionedLocation && hasLocationContext && mentionedLocation.id !== context.locationId) {
        return {
            type: 'LOCATION_CHANGE',
            text: `Location updated: ${mentionedLocation.name}.\nEmergency: ${mentionedLocation.emergency} | Lead facility: ${mentionedLocation.hospital}`,
            location: mentionedLocation,
            escalate: false
        };
    }

    // 3. Explicit Intent Parsing (Price, Pharmacy, Booking)
    const intent = detectIntent(input);
    const mentionedLoc = extractLocation(input);

    if (intent === 'pharmacy') {
        return {
            type: 'PHARMACY_SEARCH',
            text: `Looking for pharmacies${mentionedLoc ? ` in ${mentionedLoc.name}` : ' in your area'}. Switching to the Real-time Hub — pharmacy tab is now active.`,
            locationOverride: mentionedLoc,
            escalate: false
        };
    }

    if (intent === 'book') {
        return {
            type: 'BOOKING_INTENT',
            text: `You can book appointments securely through the Real-time Hub. Just click the 📅 Book button on any hospital or doctor card.\n\nWould you like me to find a specific specialist for you?`,
            escalate: false
        };
    }

    if (intent === 'cost') {
        return {
            type: 'COST_INTENT',
            text: `Medical costs vary by facility. General consultations are usually around ₹300 - ₹800.\n\n💡 Tip: You can use the Tourist Mode → Low Cost filter in the Real-time Hub to find budget-friendly facilities!`,
            escalate: false
        };
    }

    // 4. AI Symptom Triage (LLM) - Priority for minor issues
    if (genAI) {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
            const prompt = `You are Guardian AI, a professional medical triage assistant in ${context.location}, India. The user says: "${rawInput}" (translated: "${englishInput}"). Message ${context.step + 1}.

GOAL: Help the user manage minor health problems at home first.

RULES:
1. If the problem seems minor (cold, minor headache, slight stomach upset, etc.), prioritize specific, safe HOME REMEDIES (fluids, rest, steam, salt gargles).
2. DO NOT advise a doctor visit or routing in the first response for minor issues.
3. If the user mentions major symptoms (high fever, severe pain, persistent vomiting) or specifically ASKS for a doctor, then suggest consulting a professional.
4. Always ask ONE targeted follow-up question.
5. No asterisks or raw markdown. Use clean plain text with line breaks.`;

            const result = await model.generateContent(prompt);
            const resp = await result.response;
            const text = resp.text();

            // Logic to determine if we should suggest the Real-time Hub
            const isSeverePrompt = /\b(worse|hospital|severe|emergency|intense|doctor|appointment|visit a)\b/i.test(text) || /\b(doctor|dr\.|specialist|hospital|clinic|appointment|visit a)\b/i.test(input);
            const escalate = context.step >= 3 || isSeverePrompt;

            return { type: 'AI_RESPONSE', text, escalate };
        } catch (e) {
            console.error('Gemini error:', e);
        }
    }

    // 5. Fallback Specialty Detection (If AI fails or explicitly requested)
    const specialty = detectSpecialty(input);
    if (specialty && (intent === 'doctor' || intent === 'hospital' || /\b(suggest|find|need)\b/.test(input))) {
        const locationNote = mentionedLoc ? ` in ${mentionedLoc.name}` : ` in ${context.location}`;
        return {
            type: 'SPECIALTY_SEARCH',
            specialty,
            intent,
            locationOverride: mentionedLoc,
            text: `Understood. You need a ${specialtyLabels[specialty] || specialty} specialist${locationNote}.\n\nI've filtered the Real-time Hub to show best available options.`,
            escalate: false
        };
    }

    // 6. Expert Fallback (Static)
    let key = 'default';
    if (/headache|migraine/.test(input)) key = 'headache';
    else if (/fever|temperature|hot/.test(input)) key = 'fever';
    else if (/stomach|vomit|nausea|abdomen|acidity/.test(input)) key = 'stomach';
    else if (/cold|cough|runny|sneez|respiratory/.test(input)) key = 'cold';
    else if (/allergy|rash|itch|hive|swelling/.test(input)) key = 'allergy';
    else if (/pain|hurt|sprain|twist|fall|hit|injury|bone/.test(input)) key = 'injury';
    else if (/burn|fire|scald/.test(input)) key = 'burn';

    const data = expertFallback[key];
    const escalate = context.step >= 3 || /\b(hospital|doctor|severe|worse)\b/.test(input);

    if (escalate) {
        return {
            type: 'EXPERT_REFERRAL',
            text: `Based on the persistence of your symptoms, I recommend visiting ${context.hospital} in ${context.location}.\n\nSwitch to the "Real-time Hub" tab to see nearby facilities.`,
            escalate: true
        };
    }

    return {
        type: 'EXPERT_ANALYSIS',
        text: `Home Care First:\n${data.advice}\n\nAssessment: ${data.assessment}\n\nNext Question: ${data.followUp}`,
        escalate: false
    };
};

export const getGuardianResponse = async (userInput, context) => {
    const userLang = await detectLanguage(userInput);
    const englishInput = await translateToEnglish(userInput);
    console.log(`[Guardian AI] Detected: ${userLang} | Trans: "${englishInput}"`);

    const response = await internalGetGuardianResponse(englishInput, userInput, context);

    if (response.text && userLang.toLowerCase() !== 'english') {
        response.text = await translateToTarget(response.text, userLang);
    }

    response.userLang = userLang;
    return response;
};
