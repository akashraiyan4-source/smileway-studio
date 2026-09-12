// ==========================================
// MODULE: AI VOICE & CHAT CONCIERGE AGENT
// ==========================================
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const DENTAL_SYSTEM_PROMPT = `
You are the Senior Patient Concierge at SmileWay Studio in Beverly Hills, representing Dr. Julian Vance, DDS.
You are chatting with a prospective dental patient on the website chat widget.
Strict rules:
1. Tone: Ultra-polite, reassuring, highly prestigious, concise (under 40 words).
2. Never give explicit price tags. Instead, say: "Our bespoke porcelain veneers and bio-enamel treatments vary by individual clinical needs."
3. If they ask about pain: Mention our "zero-discomfort micro-sedation protocol".
4. Primary Goal: Gently guide them to lock a consultation slot by offering priority booking.
`;

// চ্যাট বা ভয়েস কোয়েরি হ্যান্ডেল করার জন্য এআই এন্ডপয়েন্ট
router.post('/chat', async (req, res) => {
    try {
        const { message, userPhone } = req.body;
        console.log(`[AI Concierge] Received query from ${userPhone || 'Anonymous'}: "${message}"`);

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `${DENTAL_SYSTEM_PROMPT}\n\nPatient Message: ${message}\nAI Concierge Reply:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResponse = response.text() ? response.text().trim() : "Thank you! Dr. Vance's team will contact you shortly regarding priority consultation.";

        console.log(`[AI Concierge Reply] "${aiResponse}"`);

        res.status(200).json({
            success: true,
            reply: aiResponse
        });

    } catch (error) {
        console.error('[AI Concierge Error]:', error);
        res.status(500).json({ success: false, error: 'AI Concierge failed to process request.' });
    }
});

export default router;