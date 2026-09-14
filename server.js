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
import bookingRouter from './modules/booking.js';
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
import voiceAgentRouter from './modules/voiceAgentBridge.js';

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

// স্ট্যাটিক ফ্রন্টএন্ড পরিবেশন
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// ৫. রিয়েল-টাইম VIP বুকিং ক্রিয়েট এন্ডপয়েন্ট (404 ফিক্স)
app.post('/api/booking/create', (req, res) => {
  const { name, phone, niche, appointmentDate } = req.body;
  if (!name || !phone || !appointmentDate) {
    return res.status(400).json({ success: false, error: 'Missing required booking fields.' });
  }

  const newBooking = scheduleAppointment({ 
    name, 
    phone, 
    niche: niche || 'dental', 
    appointmentDate 
  });
  
  return res.status(200).json({ success: true, booking: newBooking });
});

// API Routes
app.use('/api/leads', leadsRouter);
app.use('/api/twilio', geminiRouter);
app.use('/api/voice', missedRouter);
app.use('/api/ai', chatLimiter, aiConciergeRouter);
app.use('/api/booking', bookingRouter);
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
app.use('/api/voice-agent', voiceAgentRouter);

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