const hospitalPool = [
    'AIIMS', 'Manipal Hospital', 'Medanta - The Medicity', 'Narayana Health',
    'Aster Hospital', 'Yashoda Hospital', 'KIMS Hospital', 'Amrita Hospital',
    'Kokilaben Hospital', 'Lilavati Hospital', 'MGM Healthcare', 'Kauvery Hospital',
    'CMC Hospital', 'Wockhardt Hospital', 'Sahyadri Hospitals', 'Ruby Hall Clinic',
    'Jupiter Hospital', 'Medica Superspecialty', 'Christian Medical College',
    'Bombay Hospital', 'Tata Memorial', 'NIMS Hospital', 'Global Hospital',
    'Continental Hospital', 'MIOT International', 'Rela Hospital', 'AIG Hospital'
];

const pharmacyPool = [
    'MedPlus Pharmacy', 'Wellness Forever', 'Frank Ross Pharmacy',
    'Sanjivani Chemist', 'Noble Plus', 'Dawaisaaz', 'Guardian Pharmacy',
    'Lifeline Pharmacy', 'Medway Pharmacy', 'Healthkart Pharmacy',
    'Muthu Pharmacy', 'Metro Pharma', 'Dhanwantary Pharmacy',
    'Sri Suki Pharmacy', 'Om Healthcare Pharmacy'
];

const getPhone = (seed) => {
    const nums = ['98', '99', '97', '88', '77', '96', '95'];
    const n = seed % nums.length;
    const rest = (seed * 137 + 4) % 100000000;
    return `+91 ${nums[n]}${rest.toString().padStart(8, '0')}`;
};

export const getGenericProviders = (city, id) => {
    const seed = city.charCodeAt(0) + (city.charCodeAt(1) || 0);
    return [
        { id: `g-h1-${id}`, name: `${hospitalPool[seed % hospitalPool.length]} ${city}`, type: 'Hospital', rating: (4.5 + (seed % 49) / 100).toFixed(2), phone: getPhone(seed), address: `Medical Complex, ${city}`, hours: '24/7', mapsUrl: `https://maps.google.com/search?q=hospital+${city}` },
        { id: `g-h2-${id}`, name: `${hospitalPool[(seed + 3) % hospitalPool.length]}`, type: 'Hospital', rating: (4.3 + (seed % 60) / 100).toFixed(2), phone: getPhone(seed + 7), address: `Healthcare Road, ${city}`, hours: '24/7', mapsUrl: `https://maps.google.com/search?q=hospital+${city}` },
        { id: `g-h3-${id}`, name: `District Government Hospital ${city}`, type: 'Hospital', rating: (4.1 + (seed % 70) / 100).toFixed(2), phone: getPhone(seed + 13), address: `Civil Lines, ${city}`, hours: '24/7', mapsUrl: `https://maps.google.com/search?q=government+hospital+${city}` },
        { id: `g-p1-${id}`, name: `${pharmacyPool[seed % pharmacyPool.length]}`, type: 'Pharmacy', rating: (4.2 + (seed % 75) / 100).toFixed(2), phone: getPhone(seed + 2), address: `Main Market, ${city}`, hours: ['08:00', '23:00'], mapsUrl: `https://maps.google.com/search?q=pharmacy+${city}` },
        { id: `g-p2-${id}`, name: `${pharmacyPool[(seed + 5) % pharmacyPool.length]} 24hr`, type: 'Pharmacy', rating: (4.0 + (seed % 90) / 100).toFixed(2), phone: getPhone(seed + 19), address: `Station Road, ${city}`, hours: '24/7', mapsUrl: `https://maps.google.com/search?q=pharmacy+${city}` },
    ];
};

export const providerData = {
    delhi: [
        { id: 'd-h1', name: 'AIIMS New Delhi', type: 'Hospital', rating: '4.95', phone: '011-26588500', address: 'Ansari Nagar, New Delhi', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=AIIMS+Delhi' },
        { id: 'd-h2', name: 'Max Super Speciality, Saket', type: 'Hospital', rating: '4.88', phone: '011-26515050', address: 'Press Enclave Road, Saket', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Max+Hospital+Saket' },
        { id: 'd-h3', name: 'Medanta - The Medicity, Gurugram', type: 'Hospital', rating: '4.85', phone: '0124-4141414', address: 'Sector 38, Gurugram', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Medanta+Gurugram' },
        { id: 'd-h4', name: 'Sir Ganga Ram Hospital', type: 'Hospital', rating: '4.82', phone: '011-25750000', address: 'Rajinder Nagar, New Delhi', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Sir+Ganga+Ram+Hospital' },
        { id: 'd-h5', name: 'BLK-Max Super Speciality', type: 'Hospital', rating: '4.78', phone: '011-30403040', address: 'Pusa Road, New Delhi', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=BLK+Max+hospital' },
        { id: 'd-p1', name: 'Sanjivani Chemist (24hr)', type: 'Pharmacy', rating: '4.83', phone: '011-23456789', address: 'Connaught Place, Delhi', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Sanjivani+Chemist+Delhi' },
        { id: 'd-p2', name: 'MedPlus Delhi', type: 'Pharmacy', rating: '4.71', phone: '011-44445555', address: 'Green Park, Delhi', hours: ['07:00', '23:30'], mapsUrl: 'https://maps.google.com/search?q=MedPlus+pharmacy+Delhi' },
        { id: 'd-p3', name: 'Wellness Forever Delhi', type: 'Pharmacy', rating: '4.65', phone: '011-55556666', address: 'Lajpat Nagar, Delhi', hours: ['08:00', '22:00'], mapsUrl: 'https://maps.google.com/search?q=Wellness+Forever+Delhi' },
    ],
    chennai: [
        { id: 'cn-h1', name: 'MIOT International', type: 'Hospital', rating: '4.92', phone: '044-42002288', address: 'Manapakkam, Chennai', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=MIOT+International+Chennai' },
        { id: 'cn-h2', name: 'MGM Healthcare', type: 'Hospital', rating: '4.89', phone: '044-45242424', address: 'Aminjikarai, Chennai', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=MGM+Healthcare+Chennai' },
        { id: 'cn-h3', name: 'Kauvery Hospital', type: 'Hospital', rating: '4.84', phone: '044-40006000', address: 'Alwarpet, Chennai', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Kauvery+Hospital+Chennai' },
        { id: 'cn-h4', name: 'Rela Hospital', type: 'Hospital', rating: '4.80', phone: '044-62800000', address: 'CIT Nagar, Chennai', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Rela+Hospital+Chennai' },
        { id: 'cn-p1', name: 'Muthu Pharmacy', type: 'Pharmacy', rating: '4.79', phone: '044-24351234', address: 'T. Nagar, Chennai', hours: ['08:00', '22:00'], mapsUrl: 'https://maps.google.com/search?q=Muthu+Pharmacy+Chennai' },
        { id: 'cn-p2', name: 'MedPlus Chennai', type: 'Pharmacy', rating: '4.73', phone: '044-99887766', address: 'Adyar, Chennai', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=MedPlus+Chennai' },
    ],
    mumbai: [
        { id: 'mb-h1', name: 'Kokilaben Dhirubhai Ambani Hospital', type: 'Hospital', rating: '4.94', phone: '022-30666666', address: 'Andheri West, Mumbai', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Kokilaben+Hospital+Mumbai' },
        { id: 'mb-h2', name: 'Nanavati Max Super Speciality', type: 'Hospital', rating: '4.86', phone: '022-26267500', address: 'Vile Parle, Mumbai', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Nanavati+Hospital+Mumbai' },
        { id: 'mb-h3', name: 'Lilavati Hospital', type: 'Hospital', rating: '4.83', phone: '022-26568000', address: 'Bandra West, Mumbai', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Lilavati+Hospital+Mumbai' },
        { id: 'mb-h4', name: 'Tata Memorial Hospital', type: 'Hospital', rating: '4.90', phone: '022-24177000', address: 'Parel, Mumbai', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Tata+Memorial+Hospital' },
        { id: 'mb-p1', name: 'Noble Plus Pharmacy', type: 'Pharmacy', rating: '4.81', phone: '022-23459999', address: 'Colaba, Mumbai', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Noble+Plus+Pharmacy+Mumbai' },
        { id: 'mb-p2', name: 'Wellness Forever Mumbai', type: 'Pharmacy', rating: '4.76', phone: '022-99998888', address: 'Andheri, Mumbai', hours: ['07:00', '23:00'], mapsUrl: 'https://maps.google.com/search?q=Wellness+Forever+Mumbai' },
    ],
    bangalore: [
        { id: 'bg-h1', name: 'Aster CMI Hospital', type: 'Hospital', rating: '4.91', phone: '080-43420100', address: 'Hebbal, Bangalore', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Aster+CMI+Hospital+Bangalore' },
        { id: 'bg-h2', name: 'Manipal Hospital HAL', type: 'Hospital', rating: '4.88', phone: '080-25024444', address: 'HAL Airport Road, Bangalore', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Manipal+Hospital+Bangalore' },
        { id: 'bg-h3', name: 'Narayana Health City', type: 'Hospital', rating: '4.85', phone: '080-71222222', address: 'Bommasandra, Bangalore', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Narayana+Health+Bangalore' },
        { id: 'bg-h4', name: 'Sakra World Hospital', type: 'Hospital', rating: '4.80', phone: '080-49694969', address: 'Marathahalli, Bangalore', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Sakra+World+Hospital+Bangalore' },
        { id: 'bg-p1', name: 'MedPlus Pharmacy Bangalore', type: 'Pharmacy', rating: '4.77', phone: '080-99008877', address: 'Indiranagar, Bangalore', hours: ['07:00', '23:00'], mapsUrl: 'https://maps.google.com/search?q=MedPlus+Bangalore' },
        { id: 'bg-p2', name: 'Dawaisaaz Bangalore', type: 'Pharmacy', rating: '4.68', phone: '080-88887777', address: 'Koramangala, Bangalore', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=pharmacy+Koramangala+Bangalore' },
    ],
    hyderabad: [
        { id: 'hyd-h1', name: 'Yashoda Hospital, Secunderabad', type: 'Hospital', rating: '4.90', phone: '040-45678910', address: 'SP Road, Secunderabad', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Yashoda+Hospital+Hyderabad' },
        { id: 'hyd-h2', name: 'KIMS Hospitals', type: 'Hospital', rating: '4.87', phone: '040-44885000', address: 'Secunderabad', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=KIMS+Hospital+Hyderabad' },
        { id: 'hyd-h3', name: 'AIG Hospitals', type: 'Hospital', rating: '4.84', phone: '040-42444222', address: 'Gachibowli, Hyderabad', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=AIG+Hospital+Hyderabad' },
        { id: 'hyd-h4', name: 'Continental Hospitals', type: 'Hospital', rating: '4.82', phone: '040-67000111', address: 'Gachibowli, Hyderabad', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Continental+Hospital+Hyderabad' },
        { id: 'hyd-p1', name: 'MedPlus Hyderabad', type: 'Pharmacy', rating: '4.75', phone: '040-22334455', address: 'Banjara Hills, Hyderabad', hours: ['08:00', '22:00'], mapsUrl: 'https://maps.google.com/search?q=MedPlus+Hyderabad' },
        { id: 'hyd-p2', name: 'Wellness Forever Hyderabad', type: 'Pharmacy', rating: '4.69', phone: '040-66667777', address: 'Jubilee Hills, Hyderabad', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=pharmacy+Jubilee+Hills+Hyderabad' },
    ],
    kolkata: [
        { id: 'kol-h1', name: 'Medica Superspecialty Hospital', type: 'Hospital', rating: '4.88', phone: '033-66520000', address: 'Mukundapur, Kolkata', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Medica+Hospital+Kolkata' },
        { id: 'kol-h2', name: 'Manipal Hospital (AMRI) Saltlake', type: 'Hospital', rating: '4.84', phone: '033-25225222', address: 'Salt Lake, Kolkata', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=AMRI+Hospital+Kolkata' },
        { id: 'kol-h3', name: 'Woodlands Multispecialty', type: 'Hospital', rating: '4.80', phone: '033-40907090', address: 'Alipore, Kolkata', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Woodlands+Hospital+Kolkata' },
        { id: 'kol-p1', name: 'Frank Ross Pharmacy', type: 'Pharmacy', rating: '4.78', phone: '033-22225566', address: 'Park Street, Kolkata', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Frank+Ross+Pharmacy+Kolkata' },
        { id: 'kol-p2', name: 'Metro Pharma', type: 'Pharmacy', rating: '4.70', phone: '033-33334444', address: 'Salt Lake, Kolkata', hours: ['08:00', '23:00'], mapsUrl: 'https://maps.google.com/search?q=Metro+Pharma+Kolkata' },
    ],
    pune: [
        { id: 'pn-h1', name: 'Ruby Hall Clinic', type: 'Hospital', rating: '4.89', phone: '020-66455100', address: 'Sassoon Road, Pune', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Ruby+Hall+Clinic+Pune' },
        { id: 'pn-h2', name: 'Sahyadri Hospital', type: 'Hospital', rating: '4.84', phone: '020-67213000', address: 'Hadapsar, Pune', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Sahyadri+Hospital+Pune' },
        { id: 'pn-p1', name: 'Guardian Pharmacy Pune', type: 'Pharmacy', rating: '4.72', phone: '020-25253535', address: 'Shivajinagar, Pune', hours: ['08:00', '22:00'], mapsUrl: 'https://maps.google.com/search?q=pharmacy+Pune' },
    ],
    kochi: [
        { id: 'kc-h1', name: 'Amrita Hospital Kochi', type: 'Hospital', rating: '4.93', phone: '0484-2858000', address: 'AIMS Ponekkara, Kochi', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Amrita+Hospital+Kochi' },
        { id: 'kc-h2', name: 'Lakeshore Hospital', type: 'Hospital', rating: '4.86', phone: '0484-2701032', address: 'Maradu, Kochi', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Lakeshore+Hospital+Kochi' },
        { id: 'kc-p1', name: 'MedPlus Kochi', type: 'Pharmacy', rating: '4.74', phone: '0484-99887766', address: 'MG Road, Kochi', hours: ['07:30', '22:30'], mapsUrl: 'https://maps.google.com/search?q=MedPlus+Kochi' },
    ],
    lucknow: [
        { id: 'lk-h1', name: 'SGPGI Lucknow', type: 'Hospital', rating: '4.92', phone: '0522-2668700', address: 'Raebareli Road, Lucknow', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=SGPGI+Lucknow' },
        { id: 'lk-h2', name: 'Medanta Hospital Lucknow', type: 'Hospital', rating: '4.85', phone: '0522-4505050', address: 'Sec B Pocket 1, Lucknow', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Medanta+Lucknow' },
        { id: 'lk-p1', name: 'MedPlus Lucknow', type: 'Pharmacy', rating: '4.71', phone: '0522-22223333', address: 'Hazratganj, Lucknow', hours: ['08:00', '22:00'], mapsUrl: 'https://maps.google.com/search?q=pharmacy+Lucknow' },
    ],
    jaipur: [
        { id: 'jp-h1', name: 'SMS Medical College Hospital', type: 'Hospital', rating: '4.87', phone: '0141-2518501', address: 'Sawai Ram Singh Road, Jaipur', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=SMS+Hospital+Jaipur' },
        { id: 'jp-h2', name: 'Narayana Multispeciality Jaipur', type: 'Hospital', rating: '4.82', phone: '0141-7128700', address: 'Sodala, Jaipur', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Narayana+Hospital+Jaipur' },
        { id: 'jp-p1', name: 'Wellness Forever Jaipur', type: 'Pharmacy', rating: '4.70', phone: '0141-44445555', address: 'MI Road, Jaipur', hours: ['08:00', '23:00'], mapsUrl: 'https://maps.google.com/search?q=pharmacy+Jaipur' },
    ],
    ahmedabad: [
        { id: 'ahm-h1', name: 'Zydus Hospital', type: 'Hospital', rating: '4.90', phone: '079-66190000', address: 'Thaltej, Ahmedabad', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=Zydus+Hospital+Ahmedabad' },
        { id: 'ahm-h2', name: 'HCG Cancer Centre', type: 'Hospital', rating: '4.84', phone: '079-40072222', address: 'Mithakhali, Ahmedabad', hours: '24/7', mapsUrl: 'https://maps.google.com/search?q=HCG+Hospital+Ahmedabad' },
        { id: 'ahm-p1', name: 'MedPlus Ahmedabad', type: 'Pharmacy', rating: '4.73', phone: '079-55556666', address: 'CG Road, Ahmedabad', hours: ['08:00', '22:30'], mapsUrl: 'https://maps.google.com/search?q=MedPlus+Ahmedabad' },
    ],
};
