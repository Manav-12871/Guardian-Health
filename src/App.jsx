import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Shield, ChevronRight, Activity, MapPin,
    Search, Star, Compass, LocateFixed, Clock,
    Phone, Navigation, AlertCircle, X, User, LogOut, Calendar,
    Globe, IndianRupee, MapPin as Pin, MessageSquare, Info
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { createBooking } from './services/bookingService';
import MyBookings from './components/MyBookings';
import ProviderDashboard from './components/ProviderDashboard';
import { hospitals as curatedHospitals } from './data/hospitals';
import { doctors as curatedDoctors } from './data/doctors';
import { pharmacies as curatedPharmacies } from './data/pharmacies';
import { locations } from './data/locations';
import { getCityDataUniversal, validateCoverage } from './data/dataGenerator';
import { getGuardianResponse } from './services/aiService';
import { specialtyLabels } from './data/specialties';
import { translateToEnglish, translateToTarget } from './services/translationService';

// ── IST helpers ──────────────────────────────────────────────────────────────
const getIST = () => {
    const now = new Date();
    return new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 5.5 * 3600000);
};

const formatIST = (date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m} AM IST`; // Simulated AM/PM for simplicity as per media
};

const isOpenNow = (item, ist) => {
    if (item.isOpenNow !== undefined) return item.isOpenNow;
    if (item.hours === '24/7' || item.availability?.includes('24/7')) return true;
    const cur = ist.getHours() * 60 + ist.getMinutes();
    if (Array.isArray(item.hours)) {
        const [oh, om] = item.hours[0].split(':').map(Number);
        const [ch, cm] = item.hours[1].split(':').map(Number);
        return cur >= oh * 60 + om && cur <= ch * 60 + cm;
    }
    return true;
};

const hoursLabel = (item) => {
    if (item.availability) return item.availability;
    if (item.hours === '24/7') return '24/7';
    if (Array.isArray(item.hours)) return `${item.hours[0]} – ${item.hours[1]}`;
    return item.hours || 'Hours vary';
};

const mapsUrl = (lat, lng, name) =>
    lat && lng ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` :
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;

const normalizeCityKey = (loc) => {
    const name = loc.name.toLowerCase();
    if (name.includes('karnal')) return 'karnal';
    if (name.includes('gurugram') || name.includes('gurgaon')) return 'gurugram';
    if (name.includes('delhi') || name.includes('new delhi')) return 'delhi';
    if (name.includes('mumbai') || name.includes('bombay')) return 'mumbai';
    if (name.includes('bangalore') || name.includes('bengaluru')) return 'bangalore';
    if (name.includes('chennai') || name.includes('madras')) return 'chennai';
    if (name.includes('hyderabad')) return 'hyderabad';
    if (name.includes('kolkata') || name.includes('calcutta')) return 'kolkata';
    if (name.includes('pune')) return 'pune';
    if (name.includes('kochi') || name.includes('cochin')) return 'kochi';
    if (name.includes('jaipur')) return 'jaipur';
    if (name.includes('ahmedabad')) return 'ahmedabad';
    if (name.includes('lucknow')) return 'lucknow';
    return loc.id?.toLowerCase() || name.split(',')[0].trim().replace(/\s+/g, '');
};

const Badge = ({ label, color, bg }) => (
    <span style={{ background: bg, color, padding: '2px 8px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
        {label}
    </span>
);

const getPool = (cityId, cityName, lat, lng, type) => {
    let curated = [];
    if (type === 'hospital') curated = curatedHospitals.filter(h => h.city === cityId);
    else if (type === 'doctor') curated = curatedDoctors.filter(d => d.city === cityId);
    else curated = curatedPharmacies.filter(p => p.city === cityId);

    const gen = getCityDataUniversal(cityId, cityName, lat, lng);
    const generated = type === 'hospital' ? gen.hospitals : type === 'doctor' ? gen.doctors : gen.pharmacies;

    const combined = [...curated];
    generated.forEach(g => {
        if (!combined.find(c => c.id === g.id)) combined.push(g);
    });
    return combined;
};

export default function App() {
    const { user, isAuthenticated, loginWithGoogle, logout } = useAuth();
    const [loc, setLoc] = useState(locations[0]);
    const [isLocating, setIsLocating] = useState(false);
    const [locSearch, setLocSearch] = useState('');
    const [dropOpen, setDropOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('triage');
    const [entityType, setEntityType] = useState('hospital');
    const [activeSpecialty, setActiveSpecialty] = useState(null);
    const [showOpenOnly, setShowOpenOnly] = useState(true);
    const [ist, setIst] = useState(getIST());
    const [viewMode, setViewMode] = useState('patient');
    const [msgs, setMsgs] = useState([{
        type: 'bot',
        text: "Hello! I'm your Guardian AI.\n\nI monitor real-time health facilities near you."
    }]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [step, setStep] = useState(0);
    const chatEnd = useRef(null);
    const autoDetected = useRef(false);

    const [isTouristMode, setIsTouristMode] = useState(false);
    const [englishOnly, setEnglishOnly] = useState(false);
    const [lowCostOnly, setLowCostOnly] = useState(false);
    const [touristFriendlyOnly, setTouristFriendlyOnly] = useState(false);

    const [bookingModal, setBookingModal] = useState({ open: false, hospital: null });
    const [bookingForm, setBookingForm] = useState({ name: '', problem: '', preferredLanguage: 'English', date: '', time: '' });
    const [bookingTranslating, setBookingTranslating] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(null);
    const [reviewsModal, setReviewsModal] = useState({ open: false, item: null });
    const [sortBy, setSortBy] = useState('recommended');

    useEffect(() => {
        const t = setInterval(() => setIst(getIST()), 30000);
        if (!autoDetected.current) {
            autoDetected.current = true;
            autoDetect();
        }
        setTimeout(() => validateCoverage(locations), 2000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

    const dist = (a, b, c, d) => {
        const R = 6371, dL = (c - a) * Math.PI / 180, dG = (d - b) * Math.PI / 180;
        const x = Math.sin(dL / 2) ** 2 + Math.cos(a * Math.PI / 180) * Math.cos(c * Math.PI / 180) * Math.sin(dG / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    };

    const autoDetect = () => {
        if (!navigator.geolocation) return;
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
            let best = locations[0], minD = Infinity;
            locations.forEach(l => { const d = dist(latitude, longitude, l.lat, l.lng); if (d < minD) { minD = d; best = l; } });
            changeLocation(best);
            setIsLocating(false);
        }, () => setIsLocating(false), { timeout: 10000 });
    };

    const changeLocation = (newLoc) => {
        setLoc(newLoc);
        setActiveSpecialty(null);
        setDropOpen(false);
        setLocSearch('');
        setEntityType('hospital');
        setShowOpenOnly(true);
    };

    const results = useMemo(() => {
        const cityKey = normalizeCityKey(loc);
        let pool = getPool(cityKey, loc.name, loc.lat, loc.lng, entityType);
        if (activeSpecialty && entityType !== 'pharmacy') {
            pool = pool.filter(item => {
                const sp = item.specialties || (item.specialty ? [item.specialty] : []);
                return sp.includes(activeSpecialty);
            });
        }
        if (showOpenOnly) pool = pool.filter(item => isOpenNow(item, ist));
        if (isTouristMode) {
            if (englishOnly) pool = pool.filter(item => (item.languagesSupported || []).includes('English'));
            if (touristFriendlyOnly) pool = pool.filter(item => item.isTouristFriendly);
            if (lowCostOnly && entityType === 'hospital') {
                pool = pool.filter(item => {
                    if (!item.treatmentCosts) return false;
                    const spCost = item.treatmentCosts[activeSpecialty || 'general'];
                    const costMatch = spCost?.consultation?.match(/\d+/);
                    return costMatch && parseInt(costMatch[0], 10) <= 800;
                });
            }
        }
        return [...pool].sort((a, b) => {
            if (sortBy === 'rating') return Number(b.rating) - Number(a.rating);
            return Number(b.rating) - Number(a.rating);
        });
    }, [loc, entityType, activeSpecialty, showOpenOnly, ist, sortBy, isTouristMode, englishOnly, lowCostOnly, touristFriendlyOnly]);

    const handleSend = async () => {
        if (!input.trim() || typing) return;
        const msg = input.trim();
        setInput('');
        setMsgs(p => [...p, { type: 'user', text: msg }]);
        setTyping(true);
        const ctx = { location: loc.name, locationId: loc.id, hospital: loc.hospital, emergency: loc.emergency, step };
        const res = await getGuardianResponse(msg, ctx);
        setTimeout(() => {
            if (res.type === 'LOCATION_CHANGE') changeLocation(res.location);
            if (res.type === 'SPECIALTY_SEARCH') {
                setActiveSpecialty(res.specialty);
                setActiveTab('discover');
                setEntityType(res.intent === 'doctor' ? 'doctor' : 'hospital');
            }
            if (res.type === 'PHARMACY_SEARCH') {
                setActiveTab('discover');
                setEntityType('pharmacy');
            }
            setMsgs(p => [...p, { type: 'bot', text: res.text }]);
            setStep(s => s + 1);
            setTyping(false);
        }, 800);
    };

    const submitBooking = async (e) => {
        e.preventDefault();
        setBookingTranslating(true);
        const hosLang = (bookingModal.hospital.languagesSupported || ['English'])[0];
        let translatedMessage = bookingForm.problem;
        if (hosLang.toLowerCase() !== bookingForm.preferredLanguage.toLowerCase()) {
            const englishMsg = await translateToEnglish(bookingForm.problem);
            translatedMessage = await translateToTarget(englishMsg, hosLang);
        }
        try {
            const bookingId = await createBooking(user.uid, {
                providerName: bookingModal.hospital.name,
                providerType: entityType === 'doctor' ? 'doctor' : 'hospital',
                date: bookingForm.date,
                time: bookingForm.time,
                patientName: bookingForm.name,
                problem: bookingForm.problem,
                preferredLanguage: bookingForm.preferredLanguage,
                translatedMessage,
                status: 'pending',
                createdAt: new Date().toISOString()
            });
            setBookingSuccess({ hospitalLanguage: hosLang, messageDelivered: translatedMessage, bookingId });
        } catch (err) {
            console.error(err);
        }
        setBookingTranslating(false);
    };

    const filteredLocs = locations.filter(l =>
        l.name.toLowerCase().includes(locSearch.toLowerCase()) ||
        l.region.toLowerCase().includes(locSearch.toLowerCase())
    );

    const renderCard = (item, idx) => {
        const navUrl = mapsUrl(item.lat, item.lng, item.name);
        return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass provider-card" onClick={() => setReviewsModal({ open: true, item })}
                style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <Badge label={entityType.toUpperCase()} color="#10b981" bg="rgba(16,185,129,0.1)" />
                    {isOpenNow(item, ist) ? <Badge label="OPEN NOW" color="#10b981" bg="rgba(16,185,129,0.1)" /> : <Badge label="CLOSED" color="#ef4444" bg="rgba(239,68,68,0.1)" />}
                    {Number(item.rating) >= 4.5 && <Badge label="TOP RATED" color="#fbbf24" bg="rgba(251,191,36,0.1)" />}
                </div>

                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{item.name}</h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Star size={14} fill="#fbbf24" color="#fbbf24" />
                    <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.95rem' }}>{Number(item.rating).toFixed(1)}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>({item.reviewCount || '2,000+'} reviews)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <Globe size={16} color="var(--accent-blue)" />
                        <span>English, Hindi, Regional</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <IndianRupee size={16} color="#10b981" />
                        <span style={{ color: '#10b981', fontWeight: 600 }}>
                            {item.treatmentCosts ? (item.treatmentCosts[activeSpecialty || 'general']?.consultation || '₹300–800 consultation') : '₹300–800 consultation'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <Pin size={16} color="#ef4444" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.address}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <Clock size={16} color="#fbbf24" />
                        <span>{item.hours === '24/7' ? '24/7 Open' : 'Hours vary'}</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                    <button onClick={(e) => { e.stopPropagation(); window.open(navUrl); }} className="btn btn-secondary" style={{ padding: '10px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)' }}>Map</button>
                    <button onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${item.phone}`; }} className="btn btn-secondary" style={{ padding: '10px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)' }}>Call</button>
                </div>

                {entityType !== 'pharmacy' && (
                    <button onClick={(e) => { e.stopPropagation(); if (!isAuthenticated) return loginWithGoogle(); setBookingModal({ open: true, hospital: item }); }} className="btn btn-primary" style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700 }}>
                        {isAuthenticated ? '📅 Book Appointment' : 'Sign In to Book'}
                    </button>
                )}
            </motion.div>
        );
    };

    return (
        <div className="app-container">
            <div className="hero-gradient" />
            <div className="hero-gradient-2" />

            <nav className="container" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div onClick={() => setViewMode('patient')} style={{ fontWeight: '800', fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield color="var(--accent-blue)" size={26} />
                    Guardian<span style={{ color: 'var(--accent-blue)' }}> Health</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <Clock size={16} /> {formatIST(ist)}
                    </div>

                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setDropOpen(!dropOpen)} className="glass"
                            style={{ padding: '8px 16px', borderRadius: '50px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white', fontSize: '0.85rem', background: 'rgba(59,130,246,0.1)' }}>
                            <MapPin size={16} color="var(--accent-blue)" />
                            {loc.name}, {loc.region.split(',')[1] || loc.region}
                        </button>
                        <AnimatePresence>
                            {dropOpen && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                    className="glass" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '10px', width: '300px', borderRadius: '24px', padding: '20px', zIndex: 100, border: '1px solid var(--glass-border)', background: 'rgba(10,10,15,0.98)', backdropFilter: 'blur(30px)' }}>
                                    <div style={{ position: 'relative', marginBottom: '15px' }}>
                                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                        <input autoFocus placeholder="Search 231 cities..." value={locSearch} onChange={e => setLocSearch(e.target.value)}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '12px 12px 12px 40px', borderRadius: '14px', color: 'white', fontSize: '0.85rem', outline: 'none' }} />
                                    </div>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        <button onClick={autoDetect} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '12px', background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>
                                            <LocateFixed size={18} /> Use My Current Location
                                        </button>
                                        {filteredLocs.map(l => (
                                            <button key={l.id} onClick={() => changeLocation(l)}
                                                style={{ width: '100%', textAlign: 'left', padding: '12px', borderRadius: '12px', background: l.id === loc.id ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: 'white', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 700 }}>{l.name}</span>
                                                <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{l.region}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button onClick={() => setViewMode(viewMode === 'patient' ? 'provider' : 'patient')} className="glass"
                        style={{ padding: '8px 18px', borderRadius: '50px', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                        {viewMode === 'patient' ? 'Admin / Hospital' : 'Exit Dashboard'}
                    </button>

                    {isAuthenticated ? (
                        <button onClick={logout} className="glass" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 14px 5px 6px', borderRadius: '50px', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>
                            <img src={user.photoURL} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid var(--accent-blue)' }} />
                            <span>Sign Out</span>
                        </button>
                    ) : (
                        <button onClick={loginWithGoogle} className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700 }}>Sign In</button>
                    )}
                </div>
            </nav>

            <main className="container" style={{ padding: '20px 24px 100px' }}>
                {viewMode === 'provider' ? (
                    <ProviderDashboard />
                ) : (
                    <>
                        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
                            <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '10px', letterSpacing: '-1px' }}>
                                Real-Time Medical Intelligence
                            </h1>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '30px' }}>
                                for Every City in India
                            </h2>
                            <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.03)', padding: '5px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                                {['triage', 'discover', 'bookings'].map(tab => (
                                    (tab !== 'bookings' || isAuthenticated) &&
                                    <button key={tab} className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setActiveTab(tab)} style={{ textTransform: 'capitalize', border: 'none', borderRadius: '10px', minWidth: '130px', padding: '12px' }}>
                                        {tab === 'triage' ? 'AI Assistant' : tab === 'discover' ? 'Real-time Hub' : 'My Bookings'}
                                    </button>
                                ))}
                            </div>
                        </header>

                        <AnimatePresence mode="wait">
                            {activeTab === 'triage' && (
                                <motion.div key="triage" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                                    <div className="glass" style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '280px 1fr', borderRadius: '32px', overflow: 'hidden', height: '600px', border: '1px solid var(--glass-border)' }}>
                                        <div style={{ padding: '40px', borderRight: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ background: 'var(--accent-blue)', padding: '8px', borderRadius: '10px' }}>
                                                    <Heart color="white" size={20} />
                                                </div>
                                                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Guardian AI</span>
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                                                Active in <strong>{loc.name}</strong>. Providing intent-based medical routing and symptom triage.
                                            </p>
                                            <div style={{ marginTop: 'auto', background: 'rgba(59,130,246,0.1)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.2)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                                    <Info size={14} color="var(--accent-blue)" />
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)' }}>AI CAPABILITY</span>
                                                </div>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>Processing real-time availability from 15,000+ facilities.</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ flex: 1, overflowY: 'auto', padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                {msgs.map((m, i) => (
                                                    <div key={i} style={{ alignSelf: m.type === 'user' ? 'flex-end' : 'flex-start', background: m.type === 'user' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.06)', padding: '14px 20px', borderRadius: '20px', borderBottomRightRadius: m.type === 'user' ? '4px' : '20px', borderBottomLeftRadius: m.type === 'bot' ? '4px' : '20px', maxWidth: '80%', fontSize: '0.95rem', lineHeight: 1.5, color: 'white', border: m.type === 'bot' ? '1px solid var(--glass-border)' : 'none' }}>
                                                        {m.text}
                                                    </div>
                                                ))}
                                                {typing && <div className="glass" style={{ padding: '12px 20px', borderRadius: '14px', width: 'fit-content', fontSize: '0.85rem' }}>Guardian is analyzing...</div>}
                                                <div ref={chatEnd} />
                                            </div>
                                            <div style={{ padding: '25px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '12px' }}>
                                                <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()}
                                                    style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '16px', color: 'white', outline: 'none', fontSize: '0.95rem' }} placeholder="Explain your symptoms or ask for a doctor..." />
                                                <button onClick={handleSend} className="btn btn-primary" style={{ width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={24} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'discover' && (
                                <motion.div key="discover" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
                                        <div>
                                            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Top Results in {loc.name}</h2>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '5px' }}>{formatIST(ist)} • ({results.length} found)</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <button onClick={() => setShowOpenOnly(!showOpenOnly)} className={`glass ${showOpenOnly ? 'active' : ''}`}
                                                style={{ padding: '10px 18px', borderRadius: '12px', fontSize: '0.85rem', cursor: 'pointer', border: showOpenOnly ? '1px solid #10b981' : '1px solid var(--glass-border)', color: showOpenOnly ? '#10b981' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: showOpenOnly ? '#10b981' : 'rgba(255,255,255,0.2)' }} />
                                                Open Now Only
                                            </button>
                                            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                                {['hospital', 'doctor', 'pharmacy'].map(t => (
                                                    <motion.button
                                                        key={t}
                                                        whileHover={{ scale: 1.05, background: entityType === t ? 'var(--accent-blue)' : 'rgba(255,255,255,0.08)' }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setEntityType(t)}
                                                        style={{ background: entityType === t ? 'var(--accent-blue)' : 'transparent', color: entityType === t ? 'white' : 'var(--text-secondary)', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s' }}>
                                                        {t === 'pharmacy' ? '💊' : t === 'doctor' ? '👨‍⚕️' : '🏥'} {t.charAt(0).toUpperCase() + t.slice(1)}s
                                                    </motion.button>
                                                ))}
                                            </div>
                                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="glass" style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer', outline: 'none' }}>
                                                <option value="recommended">Sort: Recommended</option>
                                                <option value="rating">Sort: Top Rated</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="glass" style={{ padding: '12px 20px', borderRadius: '16px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div onClick={() => setIsTouristMode(!isTouristMode)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <div style={{ width: '44px', height: '24px', background: isTouristMode ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)', borderRadius: '20px', position: 'relative', transition: '0.3s' }}>
                                                <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isTouristMode ? '23px' : '3px', transition: '0.3s' }} />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem' }}>
                                                <Globe size={18} /> Tourist Mode
                                            </div>
                                        </div>
                                        {isTouristMode && (
                                            <div style={{ display: 'flex', gap: '12px', paddingLeft: '20px', borderLeft: '1px solid var(--glass-border)' }}>
                                                {[
                                                    { label: 'English Speaking', state: englishOnly, set: setEnglishOnly },
                                                    { label: 'Affordable (Under ₹800)', state: lowCostOnly, set: setLowCostOnly },
                                                    { label: 'Verified Global Standards', state: touristFriendlyOnly, set: setTouristFriendlyOnly }
                                                ].map(f => (
                                                    <button key={f.label} onClick={() => f.set(!f.state)} className="glass"
                                                        style={{ padding: '6px 14px', borderRadius: '50px', fontSize: '0.78rem', border: f.state ? '1px solid var(--accent-blue)' : '1px solid var(--glass-border)', color: f.state ? 'var(--accent-blue)' : 'white', cursor: 'pointer' }}>
                                                        {f.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {entityType !== 'pharmacy' && (
                                        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '25px', scrollbarWidth: 'none' }}>
                                            <motion.button
                                                whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.1)' }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setActiveSpecialty(null)}
                                                className={`glass ${!activeSpecialty ? 'active' : ''}`}
                                                style={{ padding: '10px 24px', borderRadius: '50px', whiteSpace: 'nowrap', fontSize: '0.85rem', border: !activeSpecialty ? '1px solid var(--accent-blue)' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontWeight: 600, color: !activeSpecialty ? 'var(--accent-blue)' : '#fff', background: !activeSpecialty ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.08)', transition: 'all 0.2s' }}>
                                                👨‍⚕️ All Specialties
                                            </motion.button>
                                            {Object.entries(specialtyLabels).map(([id, label]) => (
                                                <motion.button
                                                    key={id}
                                                    whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.1)' }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setActiveSpecialty(id)}
                                                    className={`glass ${activeSpecialty === id ? 'active' : ''}`}
                                                    style={{ padding: '10px 24px', borderRadius: '50px', whiteSpace: 'nowrap', fontSize: '0.85rem', border: activeSpecialty === id ? '1px solid var(--accent-blue)' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontWeight: 600, color: activeSpecialty === id ? 'var(--accent-blue)' : '#fff', background: activeSpecialty === id ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.08)', transition: 'all 0.2s' }}>
                                                    {label}
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '25px' }}>
                                        {results.map((item, i) => renderCard(item, i))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'bookings' && (
                                <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <MyBookings />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </main>

            {/* Modals */}
            {isLocating && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
                    <Compass size={60} color="var(--accent-blue)" className="spinner" />
                    <p style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '1px' }}>SYNCHRONIZING LOCATION...</p>
                </div>
            )}

            <AnimatePresence>
                {bookingModal.open && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div className="glass" style={{ width: '100%', maxWidth: '450px', padding: '40px', borderRadius: '32px', position: 'relative', border: '1px solid var(--glass-border)' }}>
                            <button onClick={() => setBookingModal({ open: false })} style={{ position: 'absolute', right: '25px', top: '25px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}><X size={20} /></button>
                            <h3 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Book Appointment</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', fontWeight: 700, marginBottom: '25px' }}>{bookingModal.hospital?.name}</p>
                            <form onSubmit={submitBooking} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>DATE & TIME</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <input required type="date" value={bookingForm.date} onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })} className="glass" style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }} />
                                        <input required type="time" value={bookingForm.time} onChange={e => setBookingForm({ ...bookingForm, time: e.target.value })} className="glass" style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>PATIENT NAME</label>
                                    <input required type="text" placeholder="Full Name" value={bookingForm.name} onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })} className="glass" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--glass-border)', color: 'white', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>SYMPTOMS & COMPLAINT</label>
                                    <textarea required placeholder="Describe your health concern in any language..." value={bookingForm.problem} onChange={e => setBookingForm({ ...bookingForm, problem: e.target.value })} className="glass" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--glass-border)', color: 'white', outline: 'none', minHeight: '100px', resize: 'none' }} />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={bookingTranslating} style={{ padding: '16px', borderRadius: '14px', fontWeight: 800, fontSize: '1rem', marginTop: '10px' }}>
                                    {bookingTranslating ? 'SYNCING DATA...' : 'CONFIRM APPOINTMENT'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
