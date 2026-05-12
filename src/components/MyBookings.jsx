import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, AlertCircle, Star, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserBookings, cancelBooking } from '../services/bookingService';

const statusStyles = {
    pending: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', label: '⏳ Pending' },
    confirmed: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', label: '✓ Confirmed' },
    completed: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', label: '✔ Completed' },
    cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.09)', label: '✕ Cancelled' },
};

export default function MyBookings() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(null);

    const fetchBookings = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getUserBookings(user.uid);
            setBookings(data);
        } catch (err) {
            console.error('[MyBookings] Fetch error:', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBookings();
    }, [user]);

    const handleCancel = async (id) => {
        setCancelling(id);
        try {
            await cancelBooking(id);
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
        } catch (err) {
            console.error('[MyBookings] Cancel error:', err);
        }
        setCancelling(null);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Clock size={30} color="var(--accent-blue)" className="spinner" />
                <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>Loading your bookings...</p>
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="glass" style={{ padding: '50px', textAlign: 'center', borderRadius: '16px' }}>
                <Calendar size={34} color="var(--text-secondary)" style={{ marginBottom: '12px' }} />
                <h3 style={{ marginBottom: '6px', fontSize: '1.1rem' }}>No Bookings Yet</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Browse the Real-time Hub and click 📅 Book on any hospital or doctor to get started.
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            <AnimatePresence>
                {bookings.map((b, i) => {
                    const st = statusStyles[b.status] || statusStyles.pending;
                    const dateStr = b.createdAt?.toDate ? b.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                    return (
                        <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(i * 0.05, 0.3) }}
                            className="glass" style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>

                            {/* Status Badge */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ background: st.bg, color: st.color, padding: '3px 10px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                                    {st.label}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{dateStr}</span>
                            </div>

                            {/* Provider */}
                            <h3 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{b.providerName}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: '0 0 12px', textTransform: 'capitalize' }}>
                                {b.providerType}
                            </p>

                            {/* Appointment Details */}
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', marginBottom: '12px', fontSize: '0.8rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>📅 Date</span>
                                    <span style={{ color: 'white' }}>{b.date}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>⏰ Time</span>
                                    <span style={{ color: 'white' }}>{b.time}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>👤 Patient</span>
                                    <span style={{ color: 'white' }}>{b.patientName}</span>
                                </div>
                            </div>

                            {/* Problem Description */}
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 8px', fontStyle: 'italic', borderLeft: '2px solid var(--glass-border)', paddingLeft: '10px' }}>
                                "{b.problem}"
                            </p>

                            {/* Translation info */}
                            {b.translatedMessage && (
                                <p style={{ fontSize: '0.72rem', color: '#a78bfa', margin: '0 0 14px' }}>
                                    🌐 Translated to {b.hospitalLanguage}: "{b.translatedMessage}"
                                </p>
                            )}

                            {/* Cancel Button */}
                            {b.status === 'pending' && (
                                <button onClick={() => handleCancel(b.id)} disabled={cancelling === b.id}
                                    className="btn btn-secondary"
                                    style={{ width: '100%', padding: '9px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    {cancelling === b.id ? <Clock size={13} className="spinner" /> : <X size={13} />}
                                    {cancelling === b.id ? 'Cancelling...' : 'Cancel Booking'}
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
