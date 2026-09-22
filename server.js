import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// বিদ্যমান সব মডিউল
import leadsRouter from './modules/leads.js';
import geminiRouter from './modules/geminiConcierge.js';
import missedRouter from './modules/missedCall.js';
import aiConciergeRouter from './modules/aiConcierge.js';
import bookingRouter, { appointmentsDatabase } from './modules/booking.js';
import followUpRouter from './modules/followUp.js';
import leadScoringRouter from './modules/leadScoring.js';
import reputationRouter from './modules/reputation.js';
import costEstimatorRouter from './modules/costEstimator.js';
import insuranceRouter from './modules/insuranceCheck.js';
import onboardingRouter from './modules/onboarding.js';
import prepRouter from './modules/prepReminder.js';
import postTreatmentRouter from './modules/postTreatment.js';
import loyaltyRouter from './modules/loyalty.js';
import faqRouter from './modules/smartFaq.js';
import referralRouter from './modules/referral.js';
import analyticsRouter from './modules/analytics.js';
import broadcastRouter from './modules/broadcast.js';
import smileSimulatorRouter from './modules/smileSimulator.js';
import vectorKnowledgeRouter from './modules/vectorKnowledge.js';
import whatsappRouter from './modules/whatsappIntegration.js';

// ৩টি আপগ্রেডেড মডিউল
import voiceAgentRouter from './modules/voiceAgentBridge.js';
import { sendStaffAlert } from './modules/staffAlert.js';

// পার্ট ৩: অটোমেটেড রিকল ইঞ্জিন ও অ্যাপয়েন্টমেন্ট শিডিউলার
import { initRecallEngine, scheduleAppointment } from './modules/recallEngine.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ১. Helmet সিকিউরিটি
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// ২. সুরক্ষিত CORS কনফিগারেশন
const allowedOrigins = [
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy: Access Denied'));
    }
  }
}));

// ৩. ইনপুট সাইজ গার্ড (সর্বোচ্চ 10KB)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ৪. চ্যাটবট রেট লিমিটিং (১৫ মিনিটে সর্বোচ্চ ২৫ রিকোয়েস্ট)
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: { success: false, error: 'Too many chat requests. Please try again after 15 minutes.' }
});

// স্ট্যাটিক ফ্রন্টএন্ড পরিবেশন (ডেন্টাল প্রোজেক্টের public ফোল্ডার)
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// ৫. রিয়েল-টাইম VIP বুকিং ক্রিয়েট এন্ডপয়েন্ট (রিকল ইঞ্জিন + ইনস্ট্যান্ট স্টাফ এসএমএস অ্যালার্ট সিঙ্ক)
app.post('/api/booking/create', async (req, res) => {
  try {
    const { name, fullName, phone, niche, appointmentDate, treatment } = req.body;
    const clientName = fullName || name;

    if (!clientName || !phone) {
      return res.status(400).json({ success: false, error: 'Missing required booking fields (Name and Phone are required).' });
    }

    // ১. ব্যাকগ্রাউন্ড রিকল শিডিউলার যুক্ত করা
    const scheduledBooking = scheduleAppointment({ 
      name: clientName, 
      phone: phone.trim(), 
      niche: niche || 'dental', 
      appointmentDate: appointmentDate || new Date().toISOString().split('T')[0]
    });

    // ২. ইন-মেমোরি বুকিং ডাটাবেজে রেকর্ড সংরক্ষণ
    const newAppointment = {
      id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fullName: clientName,
      phone: phone.trim(),
      appointmentDate: appointmentDate || new Date().toISOString().split('T')[0],
      treatment: treatment || niche || 'Comprehensive Dental Consultation',
      status: 'CONFIRMED',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    appointmentsDatabase.push(newAppointment);

    // ৩. আপগ্রেডেড স্টাফ অ্যালার্ট মডিউল ট্রিগার (ডেন্টাল ক্লিনিক টিমের মোবাইলে তাৎক্ষণিক SMS অ্যালার্ট)
    await sendStaffAlert({
      fullName: clientName,
      phone: phone.trim(),
      treatment: newAppointment.treatment
    });

    console.log(`[SmileWay Lead Automation] VIP Lead Confirmed & Staff Alert Sent for ${clientName} (${phone})`);

    return res.status(200).json({ 
      success: true, 
      message: 'VIP Dental Appointment Scheduled Successfully!', 
      booking: scheduledBooking,
      appointment: newAppointment 
    });

  } catch (error) {
    console.error('[SmileWay Booking Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to process dental appointment.' });
  }
});

// API Routes
app.use('/api/leads', leadsRouter);
app.use('/api/twilio', geminiRouter);
app.use('/api/voice-missed', missedRouter);
app.use('/api/ai', chatLimiter, aiConciergeRouter);

// আপগ্রেডেড বুকিং ও ভয়েস রাউটার মাউন্ট (Twilio TwiML রুট পাথ সিঙ্ক ফিক্স)
app.use('/api/booking', bookingRouter);
app.use('/api/voice', voiceAgentRouter); // voiceAgentBridge.js-এর ভেতরের Twilio ওয়েবহুক পাথের সাথে নিখুঁতভাবে সিঙ্ক করা

app.use('/api/followup', followUpRouter);
app.use('/api/scoring', leadScoringRouter);
app.use('/api/reputation', reputationRouter);
app.use('/api/estimator', costEstimatorRouter);
app.use('/api/insurance', insuranceRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/prep', prepRouter);
app.use('/api/recovery', postTreatmentRouter);
app.use('/api/loyalty', loyaltyRouter);
app.use('/api/faq', faqRouter);
app.use('/api/referral', referralRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/broadcast', broadcastRouter);
app.use('/api/simulation', smileSimulatorRouter);
app.use('/api/rag', vectorKnowledgeRouter);
app.use('/api/whatsapp', whatsappRouter);

// ডেন্টাল ফ্রন্টএন্ড পরিবেশন (public/index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Status check route
app.get('/status', (req, res) => {
  res.json({ status: 'Online', system: 'SmileWay VIP Conversion Engine v1.0' });
});

// ক্রন রিকল ব্যাকগ্রাউন্ড শিডিউলার চালু
initRecallEngine();

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 SmileWay Studio VIP Engine Active on Port ${PORT}`);
  console.log(`==================================================\n`);
});