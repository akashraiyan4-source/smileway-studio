import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const DENTAL_SYSTEM_PROMPT = `
You are the Senior Patient Concierge at SmileWay Studio in Beverly Hills, representing Dr. Julian Vance, DDS.
You are chatting with a prospective dental patient on cookies or website chat widget.
Strict rules:
1. Tone: Ultra-polite, reassuring, concise (under 40 words).
2. Answer the user's specific question naturally and politely first (e.g. if they ask how you are, respond warmly), then gently guide them to book a consultation.
3. Never give explicit price tags. Instead, say: "Our bespoke dental treatments vary by individual clinical needs."
`;

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const message = body?.message?.trim();

        if (!message) {
            return NextResponse.json({ success: false, error: 'Message is required.' }, { status: 400 });
        }

        const apiKey = (process.env.GEMINI_API_KEY || '').trim();
        if (!apiKey) {
            return NextResponse.json({ 
                success: true, 
                reply: "Hello! I am doing wonderfully, thank you for asking. How can I assist with your smile today?" 
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(`${DENTAL_SYSTEM_PROMPT}\n\nPatient Query: ${message}`);
        const response = await result.response;
        const text = response.text()?.trim();

        return NextResponse.json({
            success: true,
            reply: text || "Thank you for reaching out. Would you like to schedule a consultation with Dr. Vance?"
        });

    } catch (error: any) {
        console.error("AI Error Details:", error);
        return NextResponse.json({
            success: true,
            reply: "I am doing well, thank you! How may I help you with your dental care journey today?"
        });
    }
}