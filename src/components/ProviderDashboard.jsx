import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Clock, CheckCircle, XCircle, User,
    MessageSquare, AlertCircle, RefreshCw, ChevronRight, Shield, Globe, IndianRupee, Calendar
} from 'lucide-react';
import { db } from '../services/firebase';
import {
    collection, query, where, onSnapshot,
    doc, updateDoc, orderBy
} from 'firebase/firestore';

const statusConfig = {
    pending: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', label: '⏳ Pending' },
    confirmed: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: '✓ Confirmed' },
    completed: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: '✔ Completed' },
    cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.09)', label: '✕ Cancelled' },
};

const roleMap = {
    hospital: { title: 'Hospital', label: 'Inpatient & Triage', color: '#3b82f6', icon: Shield },
    doctor: { title: 'Doctor', label: 'Consultation & Clinic', color: '#10b981', icon: User },
    pharmacy: { title: 'Pharmacy', label: 'Medical Inquiry & Chat', color: '#8b5cf6', icon: MessageSquare }
};

export default function ProviderDashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [providerRole, setProviderRole] = useState(null);

    useEffect(() => {
        if (!providerRole) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'bookings'),
            where('providerType', '==', providerRole === 'pharmacy' ? 'pharmacy' : providerRole),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setBookings(data);
            setLoading(false);
        }, (err) => {
            console.error('[ProviderDashboard] Error:', err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [providerRole]);

    const updateStatus = async (id, newStatus) => {
        try {
            const ref = doc(db, 'bookings', id);
            await updateDoc(ref, { status: newStatus });
        } catch (err) {
            console.error('[ProviderDashboard] Update error:', err);
        }
    };

    const filteredBookings = bookings.filter(b =>
        filter === 'all' ? true : b.status === filter
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
                <Activity size={40} color="var(--accent-blue)" className="spinner" />
                <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Syncing with Health Network...</p>
            </div>
        );
    }

    if (!providerRole) {
        return (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '10px', letterSpacing: '-1px' }}>Provider Access Control</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '50px', fontSize: '1.1rem' }}>Select your facility type to manage real-time patient requests.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', maxWidth: '1000px', margin: '0 auto' }}>
                    {Object.entries(roleMap).map(([id, role]) => (
                        <motion.div
                            key={id}
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setProviderRole(id)}
                            className="glass"
                            style={{ padding: '40px', borderRadius: '32px', cursor: 'pointer', border: `1px solid ${role.color}40`, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px' }}
                        >
                            <div style={{ background: `${role.color}15`, width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <role.icon color={role.color} size={28} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{role.title}</h3>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{role.label}</p>
                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: role.color, fontWeight: 700, fontSize: '0.85rem' }}>
                                Access Portal <ChevronRight size={16} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    const renderBookingCard = (b, i) => {
        const st = statusConfig[b.status] || statusConfig.pending;
        const dateStr = b.createdAt?.toDate ? b.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (b.date || 'N/A');

        return (
            <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '15px' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: st.bg, color: st.color, padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                        {st.label}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{dateStr}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                        👤
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{b.patientName}</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.providerName}</p>
                    </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>📅 Date</span>
                        <span style={{ fontWeight: 700 }}>{b.date}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>⏰ Time</span>
                        <span style={{ fontWeight: 700 }}>{b.time}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>🌐 Language</span>
                        <span style={{ fontWeight: 700 }}>{b.preferredLanguage || 'English'}</span>
                    </div>
                </div>

                <div style={{ paddingLeft: '15px', borderLeft: '3px solid var(--accent-blue)', margin: '5px 0' }}>
                    <p style={{ margin: '0 0 6px', fontSize: '0.9rem', color: 'white', fontStyle: 'italic', lineHeight: 1.5 }}>
                        "{b.translatedMessage || b.problem}"
                    </p>
                    {b.translatedMessage && (
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Original: "{b.problem}"
                        </p>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: b.status === 'pending' ? '1fr 1fr' : '1fr', gap: '12px', marginTop: '5px' }}>
                    {b.status === 'pending' && (
                        <>
                            <button onClick={() => updateStatus(b.id, 'confirmed')} className="btn btn-primary" style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 800 }}>Confirm</button>
                            <button onClick={() => updateStatus(b.id, 'cancelled')} className="btn btn-secondary" style={{ padding: '12px', fontSize: '0.85rem' }}>Reject</button>
                        </>
                    )}
                    {b.status === 'confirmed' && (
                        <button onClick={() => updateStatus(b.id, 'completed')} className="btn btn-primary" style={{ padding: '12px', fontSize: '0.85rem', background: '#10b981', fontWeight: 800 }}>Mark Complete</button>
                    )}
                    {b.status === 'completed' && <div style={{ textAlign: 'center', color: '#10b981', fontWeight: 800, fontSize: '0.9rem', padding: '10px', background: 'rgba(16,185,129,0.1)', borderRadius: '10px' }}>✓ Service Completed</div>}
                    {b.status === 'cancelled' && <div style={{ textAlign: 'center', color: '#ef4444', fontWeight: 800, fontSize: '0.9rem', padding: '10px', background: 'rgba(239,68,68,0.1)', borderRadius: '10px' }}>✕ Rejected/Cancelled</div>}
                </div>
            </motion.div>
        );
    };

    return (
        <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px', margin: 0 }}>
                        {roleMap[providerRole].title} <span style={{ color: 'var(--accent-blue)' }}>Dashboard</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Real-time Booking & Ecosystem Management</p>
                </div>
                <button onClick={() => setProviderRole(null)} className="glass" style={{ padding: '10px 22px', borderRadius: '16px', border: '1px solid var(--glass-border)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>Switch Role</button>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`glass ${filter === f ? 'active' : ''}`}
                        style={{ padding: '10px 20px', borderRadius: '14px', border: filter === f ? '1px solid var(--accent-blue)' : '1px solid var(--glass-border)', color: filter === f ? 'var(--accent-blue)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize' }}>
                        {f} ({bookings.filter(b => f === 'all' ? true : b.status === f).length})
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '25px' }}>
                <AnimatePresence mode="popLayout">
                    {filteredBookings.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ gridColumn: '1/-1', padding: '100px', textAlign: 'center', borderRadius: '32px' }}>
                            <Calendar size={40} color="var(--text-secondary)" style={{ marginBottom: '20px' }} />
                            <h3>No {filter !== 'all' ? filter : ''} bookings found.</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>New inquiries will appear here automatically.</p>
                        </motion.div>
                    ) : (
                        filteredBookings.map((b, i) => renderBookingCard(b, i))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
