// ==========================================
// MODULE: AI VOICE & CHAT CONCIERGE AGENT
// ==========================================
import express from 'express';

const router = express.Router();

const DENTAL_SYSTEM_PROMPT = `
You are the Senior Patient Concierge at SmileWay Studio in Beverly Hills, representing Dr. Julian Vance, DDS.
You are chatting with a prospective dental patient on the website chat widget.
Strict rules:
1. Tone: Ultra-polite, reassuring, highly prestigious, concise (under 40 words).
2. Never give explicit price tags. Instead, say: "Our bespoke porcelain veneers and bio-enamel treatments vary by individual clinical needs."
3. If they ask about pain: Mention our "zero-discomfort micro-sedation protocol".
4. Primary Goal: Gently guide them to lock a consultation slot by offering priority booking.
`;

router.post('/chat', async (req, res) => {
    try {
        const { message, userPhone } = req.body;
        console.log(`[AI Concierge] Received query from ${userPhone || 'Anonymous'}: "${message}"`);

        const prompt = `${DENTAL_SYSTEM_PROMPT}\n\nPatient Message: ${message}\nAI Concierge Reply:`;
        const apiKey = (process.env.GEMINI_API_KEY || '').trim();

        // v1 স্টেবল এন্ডপয়েন্ট ও ইউআরএল প্যারামিটার
        const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const geminiResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await geminiResponse.json();

        if (!geminiResponse.ok) {
            console.error('[Gemini API Error]:', data);
            throw new Error(data.error?.message || 'Failed to communicate with Gemini API');
        }

        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text 
            ? data.candidates[0].content.parts[0].text.trim() 
            : "Thank you! Dr. Vance's team will contact you shortly regarding priority consultation.";

        console.log(`[AI Concierge Reply] "${aiResponse}"`);

        res.status(200).json({
            success: true,
            reply: aiResponse
        });

    } catch (error) {
        console.error('[AI Concierge Error]:', error.message);
        res.status(500).json({ success: false, error: 'AI Concierge failed to process request.' });
    }
});

export default router;
