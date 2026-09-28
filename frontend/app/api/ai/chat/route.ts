import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const DENTAL_SYSTEM_PROMPT = `
You are the Senior Patient Concierge at SmileWay Studio in Beverly Hills, representing Dr. Julian Vance, DDS.
Strict rules:
1. Tone: Ultra-polite, reassuring, concise (under 40 words).
2. Answer the user's specific message naturally and contextually.
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
                reply: "API Key is missing in environment variables." 
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Updated to gemini-1.5-flash to fix the 404 Not Found error
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `${DENTAL_SYSTEM_PROMPT}\n\nUser Message: ${message}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text()?.trim();

        if (!text) {
            return NextResponse.json({
                success: true,
                reply: "Would you like to reserve a priority consultation slot with Dr. Vance this week?"
            });
        }

        return NextResponse.json({
            success: true,
            reply: text
        });

    } catch (error: any) {
        console.error("Detailed AI Generation Error:", error?.message || error);
        return NextResponse.json({
            success: true,
            reply: "Our bespoke dental treatments vary by individual clinical needs. Would you like to secure a priority consultation with Dr. Julian Vance?"
        });
    }
}