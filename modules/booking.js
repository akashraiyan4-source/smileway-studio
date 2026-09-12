// ==========================================
// MODULE: SMART CALENDAR & APPOINTMENT BOOKING
// ==========================================
import express from 'express';
const router = express.Router();

// সাময়িকভাবে বুকিং ডাটা সেভ করার জন্য অ্যারে (পরে ডাটাবেজে যুক্ত করা যাবে)
export const appointmentsDatabase = [];

router.post('/book', async (req, res) => {
    try {
        const { fullName, phone, appointmentDate, treatment } = req.body;

        if (!fullName || !phone || !appointmentDate) {
            return res.status(400).json({ success: false, error: 'Missing required booking fields.' });
        }

        const newAppointment = {
            fullName,
            phone,
            appointmentDate,
            treatment: treatment || 'General Consultation',
            createdAt: new Date()
        };

        appointmentsDatabase.push(newAppointment);

        console.log(`[Smart Booking Success] Appointment booked for ${fullName} (${phone}) on ${appointmentDate}`);

        // এখানে ফিউচারে Google Calendar API বা Twilio রিমাইন্ডার ট্রিগার করা যাবে

        res.status(200).json({
            success: true,
            message: 'VIP Appointment successfully scheduled!',
            appointment: newAppointment
        });

    } catch (error) {
        console.error('[Smart Booking Error]:', error);
        res.status(500).json({ success: false, error: 'Failed to process appointment booking.' });
    }
});

export default router;