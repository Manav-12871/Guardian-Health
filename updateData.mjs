import fs from 'fs';
import path from 'path';

const SRC_PATH = path.join(process.cwd(), 'src', 'data');

const METRO_CITIES = ['delhi', 'gurugram', 'mumbai', 'bangalore', 'chennai', 'hyderabad', 'kolkata', 'pune'];
const METRO_LANGS = ['English', 'Hindi', 'Tamil', 'Telugu', 'French'];
const REGIONAL_LANGS = ['English', 'Hindi', 'Marathi', 'Gujarati', 'Punjabi'];

const getRandomLangs = (cityId, isMetro) => {
    let pool = isMetro ? METRO_LANGS : REGIONAL_LANGS;
    let count = isMetro ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 2) + 2; // 3-5 for metro, 2-3 for non-metro

    // Always include English
    let langs = new Set(['English']);
    while (langs.size < count) {
        langs.add(pool[Math.floor(Math.random() * pool.length)]);
    }
    return Array.from(langs);
};

const getTreatmentCosts = (specialties) => {
    const costMap = {
        'cardiologist': { consultation: '₹800–₹1500', procedures: '₹15,000–₹40,000 (Angiography)' },
        'neurologist': { consultation: '₹1000–₹2000', procedures: '₹20,000–₹50,000 (MRI/Scans)' },
        'orthopedic': { consultation: '₹600–₹1200', procedures: '₹30,000–₹80,000 (Surgery)' },
        'oncologist': { consultation: '₹1000–₹2500', procedures: '₹50,000–₹2,00,000 (Chemo)' },
        'pediatrician': { consultation: '₹400–₹800', procedures: '₹500–₹2000 (Vaccination)' },
        'gynecologist': { consultation: '₹500–₹1000', procedures: '₹10,000–₹30,000 (Delivery)' },
        'gastroenterologist': { consultation: '₹700–₹1200', procedures: '₹5,000–₹15,000 (Endoscopy)' },
        'ent': { consultation: '₹400–₹800', procedures: '₹10,000–₹25,000 (Surgery)' },
        'dermatologist': { consultation: '₹500–₹1000', procedures: '₹2,000–₹10,000 (Treatment)' },
        'urologist': { consultation: '₹700–₹1200', procedures: '₹15,000–₹40,000 (Surgery)' },
        'endocrinologist': { consultation: '₹600–₹1000', procedures: '₹1,000–₹3,000 (Tests)' },
        'pulmonologist': { consultation: '₹700–₹1200', procedures: '₹3,000–₹8,000 (Tests)' },
        'general': { consultation: '₹200–₹500', procedures: '₹500–₹2000 (Minor tests)' }
    };

    let costs = {};
    if (!specialties || specialties.length === 0) {
        costs['general'] = costMap['general'];
    } else {
        specialties.forEach(sp => {
            if (costMap[sp]) costs[sp] = costMap[sp];
            else costs[sp] = { consultation: '₹500–₹1000', procedures: 'Varies' };
        });
    }
    return costs;
};

// Update Hospitals
const hospFile = path.join(SRC_PATH, 'hospitals.js');
let hospData = fs.readFileSync(hospFile, 'utf8');

hospData = hospData.replace(/{([^}]+)id:\s*'([^']+)'([^}]+)lat:[^,]+,\s*lng:[^}]+}/g, (match, beforeId, id, afterId) => {
    // If it already has languagesSupported, skip
    if (match.includes('languagesSupported')) return match;

    const cityMatch = match.match(/city:\s*'([^']+)'/);
    const city = cityMatch ? cityMatch[1] : '';
    const isMetro = METRO_CITIES.includes(city);

    const spMatch = match.match(/specialties:\s*\[([^\]]+)\]/);
    let specialties = [];
    if (spMatch) {
        specialties = spMatch[1].split(',').map(s => s.trim().replace(/'/g, ''));
    }

    const langs = getRandomLangs(city, isMetro);
    const costs = getTreatmentCosts(specialties);
    const isTouristFriendly = isMetro ? true : Math.random() > 0.5;

    // Append new fields before the closing brace
    const appendStr = `, languagesSupported: ${JSON.stringify(langs)}, treatmentCosts: ${JSON.stringify(costs)}, isTouristFriendly: ${isTouristFriendly} }`;
    return match.replace(/}\s*$/, appendStr);
});

fs.writeFileSync(hospFile, hospData);

console.log("Updated hospitals.js");

// Update Doctors
const docFile = path.join(SRC_PATH, 'doctors.js');
let docData = fs.readFileSync(docFile, 'utf8');

docData = docData.replace(/{([^}]+)id:\s*'([^']+)'([^}]+)lat:[^,]+,\s*lng:[^}]+}/g, (match, beforeId, id, afterId) => {
    // If it already has languagesSupported, skip
    if (match.includes('languagesSupported')) return match;

    const cityMatch = match.match(/city:\s*'([^']+)'/);
    const city = cityMatch ? cityMatch[1] : '';
    const isMetro = METRO_CITIES.includes(city);

    const langs = getRandomLangs(city, isMetro);

    // Append new fields before the closing brace
    const appendStr = `, languagesSupported: ${JSON.stringify(langs)} }`;
    return match.replace(/}\s*$/, appendStr);
});

fs.writeFileSync(docFile, docData);

// Update dataGenerator.js
const genFile = path.join(SRC_PATH, 'dataGenerator.js');
let genData = fs.readFileSync(genFile, 'utf8');

// For dataGenerator, we need to inject languagesSupported, treatmentCosts, and isTouristFriendly inside hospitals.push
// And languagesSupported inside doctors.push

let modifiedGen = false;
if (!genData.includes('languagesSupported')) {
    // Inject hospital modifications
    // In hospitals.push
    genData = genData.replace(/lat:\s*jitter\([^}]+\),\s*lng:\s*jitter[^}]+}/g, (match) => {
        if (match.includes('treatmentCosts')) return match; // skip if already there
        return match.replace(/}\s*$/, `, languagesSupported: ['English', 'Hindi', 'Regional'], treatmentCosts: { general: { consultation: '₹300–800', procedures: 'Varies' } }, isTouristFriendly: true }`);
    });
    modifiedGen = true;
}

if (modifiedGen) {
    fs.writeFileSync(genFile, genData);
    console.log("Updated dataGenerator.js");
}

console.log("Updated doctors.js");
