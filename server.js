import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ES Modules __dirname setup (Corrected fileURLToPath casing)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/leads', leadsRouter);
app.use('/api/twilio', geminiRouter);
app.use('/api/voice', missedRouter);
app.use('/api/ai', aiConciergeRouter); // ২. নতুন AI Concierge রাউট এখানে মাউন্ট করা হলো (/api/ai/chat)
app.use('/api/booking', bookingRouter);
app.use('/api/followup', followUpRouter);
app.use('/api/scoring', leadScoringRouter);
app.use('/api/reputation', reputationRouter);// Direct root route to serve index.html frontend
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

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 SmileWay Studio VIP Engine Active on Port ${PORT}`);
  console.log(`==================================================\n`);
});