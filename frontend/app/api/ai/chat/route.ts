import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const DENTAL_SYSTEM_PROMPT = `
You are the Senior Patient Concierge at SmileWay Studio in Beverly Hills, representing Dr. Julian Vance, DDS.
Strict rules:
1. Tone: Ultra-polite, reassuring, concise (under 40 words).
2. Never give explicit price tags. Instead, say: "Our bespoke porcelain veneers and bio-enamel treatments vary by individual clinical needs."
3. Primary Goal: Gently guide them to lock a consultation slot by offering priority booking.
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
                reply: "Welcome to SmileWay Studio. How may I assist with your smile journey today?" 
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(`${DENTAL_SYSTEM_PROMPT}\n\nPatient Query: ${message}`);
        const response = await result.response;
        const text = response.text()?.trim();

        return NextResponse.json({
            success: true,
            reply: text || "Would you like to reserve a priority consultation slot with Dr. Vance this week?"
        });

    } catch (error: any) {
        // কোনো সিভিয়ার এরর এলেও কনসোলে 500 ক্র্যাশ না দেখিয়ে স্মুথ ফলব্যাক মেসেজ পাঠাবে
        return NextResponse.json({
            success: true,
            reply: "Our bespoke porcelain veneers and bio-enamel treatments vary by individual clinical needs. Would you like to secure a priority consultation with Dr. Julian Vance?"
        });
    }
}