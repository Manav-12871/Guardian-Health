import { db } from './firebase';
import {
    collection, addDoc, query, where, getDocs,
    doc, updateDoc, orderBy, serverTimestamp
} from 'firebase/firestore';

const BOOKINGS_COL = 'bookings';

/**
 * Create a new booking in Firestore.
 * @returns {string} The new booking document ID
 */
export const createBooking = async (userId, bookingData) => {
    const docRef = await addDoc(collection(db, BOOKINGS_COL), {
        userId,
        providerName: bookingData.providerName,
        providerType: bookingData.providerType, // 'hospital' | 'doctor'
        date: bookingData.date,
        time: bookingData.time,
        patientName: bookingData.patientName,
        problem: bookingData.problem,
        preferredLanguage: bookingData.preferredLanguage,
        translatedMessage: bookingData.translatedMessage || null,
        hospitalLanguage: bookingData.hospitalLanguage || null,
        status: 'pending', // pending → confirmed → completed → cancelled
        createdAt: serverTimestamp(),
    });
    console.log('[Booking] Created:', docRef.id);
    return docRef.id;
};

/**
 * Fetch all bookings for a given user, ordered by creation date (newest first).
 */
export const getUserBookings = async (userId) => {
    const q = query(
        collection(db, BOOKINGS_COL),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Cancel a booking (soft update to 'cancelled' status).
 */
export const cancelBooking = async (bookingId) => {
    const ref = doc(db, BOOKINGS_COL, bookingId);
    await updateDoc(ref, { status: 'cancelled' });
    console.log('[Booking] Cancelled:', bookingId);
};
