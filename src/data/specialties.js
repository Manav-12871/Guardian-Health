// Doctor specialty → keywords map
export const specialtyKeywords = {
    cardiologist: ['heart', 'cardiac', 'chest pain', 'cardiologist', 'cardio', 'palpitation', 'bp', 'blood pressure', 'heart attack'],
    neurologist: ['brain', 'neuro', 'neurologist', 'headache severe', 'stroke', 'seizure', 'epilepsy', 'memory', 'nerve'],
    orthopedic: ['bone', 'joint', 'ortho', 'fracture', 'knee', 'spine', 'back pain', 'shoulder pain', 'physiotherapy'],
    gastroenterologist: ['stomach', 'gastro', 'liver', 'digestion', 'ulcer', 'ibs', 'acidity', 'vomiting', 'abdomen'],
    pulmonologist: ['lung', 'breathing', 'cough', 'asthma', 'pulmo', 'tb', 'pneumonia', 'respiratory', 'oxygen'],
    dermatologist: ['skin', 'rash', 'acne', 'derma', 'itch', 'allergy', 'hair loss', 'fungal', 'eczema'],
    ophthalmologist: ['eye', 'vision', 'ophth', 'opthal', 'cataract', 'glaucoma', 'retina', 'sight'],
    ent: ['ear', 'nose', 'throat', 'ent', 'sinus', 'tonsil', 'hearing', 'vertigo'],
    pediatrician: ['child', 'baby', 'infant', 'pediatric', 'kids', 'toddler', 'fever child', 'newborn'],
    gynecologist: ['gynec', 'pregnancy', 'women', 'periods', 'delivery', 'obstetric', 'menstrual', 'female'],
    oncologist: ['cancer', 'tumor', 'oncology', 'chemo', 'radiation', 'mass', 'lump'],
    urologist: ['kidney', 'urine', 'uro', 'bladder', 'prostate', 'stone', 'uti'],
    endocrinologist: ['diabetes', 'thyroid', 'hormone', 'sugar', 'endocrine', 'endo', 'insulin', 'pcos'],
    psychiatrist: ['mental', 'anxiety', 'depression', 'psychiatr', 'stress', 'panic', 'sleep disorder', 'phobia'],
    dentist: ['tooth', 'dental', 'gum', 'cavity', 'dentist', 'jaw', 'molar'],
    general: ['fever', 'cold', 'flu', 'infection', 'general', 'checkup', 'weakness', 'doctor'],
};

export const detectSpecialty = (text) => {
    const lower = text.toLowerCase();
    for (const [specialty, keywords] of Object.entries(specialtyKeywords)) {
        if (keywords.some(kw => lower.includes(kw))) return specialty;
    }
    return null;
};

// Which hospitals are known for which specialties
export const hospitalSpecialties = {
    'AIIMS New Delhi': ['cardiologist', 'neurologist', 'oncologist', 'general', 'orthopedic', 'gastroenterologist', 'pulmonologist', 'pediatrician', 'gynecologist', 'urologist', 'endocrinologist'],
    'Max Super Speciality, Saket': ['cardiologist', 'neurologist', 'oncologist', 'orthopedic', 'general'],
    'Medanta - The Medicity, Gurugram': ['cardiologist', 'oncologist', 'neurologist', 'orthopedic', 'gastroenterologist'],
    'Sir Ganga Ram Hospital': ['cardiologist', 'neurologist', 'gastroenterologist', 'general', 'orthopedic'],
    'BLK-Max Super Speciality': ['oncologist', 'cardiologist', 'neurologist', 'general'],
    'MIOT International': ['orthopedic', 'cardiologist', 'neurologist', 'general'],
    'MGM Healthcare': ['cardiologist', 'gastroenterologist', 'neurologist', 'general'],
    'Kauvery Hospital': ['cardiologist', 'general', 'pediatrician', 'gynecologist'],
    'Rela Hospital': ['oncologist', 'gastroenterologist', 'urologist', 'general'],
    'Kokilaben Dhirubhai Ambani Hospital': ['oncologist', 'cardiologist', 'neurologist', 'orthopedic', 'general'],
    'Nanavati Max Super Speciality': ['orthopedic', 'cardiologist', 'neurologist', 'gastroenterologist'],
    'Lilavati Hospital': ['general', 'gynecologist', 'pediatrician', 'cardiologist'],
    'Tata Memorial Hospital': ['oncologist'],
    'Aster CMI Hospital': ['cardiologist', 'neurologist', 'orthopedic', 'general'],
    'Manipal Hospital HAL': ['cardiologist', 'oncologist', 'neurologist', 'orthopedic', 'general'],
    'Narayana Health City': ['cardiologist', 'oncologist', 'neurologist', 'pediatrician'],
    'Sakra World Hospital': ['orthopedic', 'neurologist', 'general', 'gastroenterologist'],
    'Yashoda Hospital, Secunderabad': ['cardiologist', 'neurologist', 'gastroenterologist', 'general', 'oncologist'],
    'KIMS Hospitals': ['general', 'cardiologist', 'neurologist', 'orthopedic'],
    'AIG Hospitals': ['gastroenterologist', 'general', 'urologist'],
    'Continental Hospitals': ['cardiologist', 'orthopedic', 'general'],
    'Medica Superspecialty Hospital': ['cardiologist', 'neurologist', 'general', 'orthopedic'],
    'Manipal Hospital (AMRI) Saltlake': ['general', 'cardiologist', 'orthopedic'],
    'Woodlands Multispecialty': ['general', 'gynecologist', 'pediatrician'],
    'Ruby Hall Clinic': ['cardiologist', 'general', 'orthopedic', 'gynecologist'],
    'Sahyadri Hospital': ['general', 'neurologist', 'orthopedic'],
    'Amrita Hospital Kochi': ['cardiologist', 'neurologist', 'oncologist', 'pediatrician', 'general'],
    'SGPGI Lucknow': ['neurologist', 'gastroenterologist', 'cardiologist', 'general', 'urologist'],
    'Zydus Hospital': ['cardiologist', 'oncologist', 'general', 'gastroenterologist'],
    'SMS Medical College Hospital': ['general', 'traumatology', 'orthopedic', 'pediatrician'],
};

export const specialtyLabels = {
    cardiologist: 'Cardiology (Heart)',
    neurologist: 'Neurology (Brain)',
    orthopedic: 'Orthopedics (Bones/Joints)',
    gastroenterologist: 'Gastroenterology (Stomach/Liver)',
    pulmonologist: 'Pulmonology (Lungs)',
    dermatologist: 'Dermatology (Skin)',
    ophthalmologist: 'Ophthalmology (Eyes)',
    ent: 'ENT (Ear, Nose, Throat)',
    pediatrician: 'Pediatrics (Children)',
    gynecologist: 'Gynecology (Women\'s Health)',
    oncologist: 'Oncology (Cancer)',
    urologist: 'Urology (Kidney/Bladder)',
    endocrinologist: 'Endocrinology (Diabetes/Thyroid)',
    psychiatrist: 'Psychiatry (Mental Health)',
    dentist: 'Dentistry',
    general: 'General Medicine',
};
