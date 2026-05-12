import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_AI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Dummy fast detector for known simple cases
const quickDetect = (text) => {
    const isHindi = /[\u0900-\u097F]/.test(text);
    if (isHindi) return "Hindi";
    const isTamil = /[\u0B80-\u0BFF]/.test(text);
    if (isTamil) return "Tamil";
    return null;
}

// Detect language of text, returns the language name, e.g. "French", "English", "Hindi"
export const detectLanguage = async (text) => {
    if (!genAI) return "English"; // fallback

    const quick = quickDetect(text);
    if (quick) return quick;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(`Detect the language of the following text, and ONLY output the language name (e.g. English, French, Hindi, Tamil) with no other text or punctuation: "${text}"`);
        const resp = await result.response;
        let lang = resp.text().trim().replace(/['"]/g, '');
        return lang || "English";
    } catch (e) {
        console.error("detectLanguage error:", e);
        return "English";
    }
}

// Translate text to English
export const translateToEnglish = async (text) => {
    if (!genAI) return text;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(`Translate the following text to English accurately. ONLY output the translated text. Do not add any conversational elements or markdown, just the translation.\n\n"${text}"`);
        const resp = await result.response;
        return resp.text().trim() || text;
    } catch (e) {
        console.error("translateToEnglish error:", e);
        return text;
    }
}

// Translate text to target language
export const translateToTarget = async (text, targetLang) => {
    if (!genAI || !targetLang || targetLang.toLowerCase() === 'english' || targetLang.toLowerCase() === 'en') return text;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(`Translate the following text to ${targetLang} accurately. Maintain the same formatting (markdown, bolding, etc) if present. ONLY output the translated text.\n\n"${text}"`);
        const resp = await result.response;
        return resp.text().trim() || text;
    } catch (e) {
        console.error("translateToTarget error:", e);
        return text;
    }
}
