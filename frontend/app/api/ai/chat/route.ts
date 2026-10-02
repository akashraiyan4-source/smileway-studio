import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const message = body?.message?.trim() || '';
        const niche = body?.niche?.trim() || 'general business';
        const brandName = body?.brandName?.trim() || 'Our Practice';
        const expertName = body?.expertName?.trim() || 'Our Specialist';

        if (!message) {
            return NextResponse.json({ success: false, error: 'Message is required.' }, { status: 400 });
        }

        const apiKeys = [
            process.env.GEMINI_API_KEY_1,
            process.env.GEMINI_API_KEY_2,
            process.env.GEMINI_API_KEY_3,
            process.env.GEMINI_API_KEY
        ].filter(Boolean) as string[];

        if (apiKeys.length === 0) {
            return NextResponse.json({ success: false, error: 'API key not configured.' }, { status: 500 });
        }

        let text = '';
        const prompt = `You are a helpful, professional human receptionist at "${brandName}", specializing in "${niche}". You work closely with ${expertName}. 
The customer says: "${message}".
Reply directly as a real human in 1-2 short, conversational sentences. Guide them toward booking a consultation. Never mention you are an AI.`;

        for (const key of apiKeys) {
            try {
                const genAI = new GoogleGenerativeAI(key);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                text = response.text()?.trim() || '';

                if (text) {
                    break;
                }
            } catch (err) {
                continue;
            }
        }

        if (!text) {
            return NextResponse.json({ success: false, error: 'Failed to generate AI response.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, reply: text });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
    }
}