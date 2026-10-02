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

        const apiKey = process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ 
                success: true, 
                reply: `Thanks for reaching out to ${brandName}! Would you like to schedule a quick consultation with ${expertName}?` 
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a helpful, professional human receptionist at "${brandName}", specializing in "${niche}". You work closely with ${expertName}. 
The customer says: "${message}".
Reply directly as a real human in 1-2 short, conversational sentences. Guide them toward booking a consultation. Never mention you are an AI.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text()?.trim();

        if (!text) {
            return NextResponse.json({ 
                success: true, 
                reply: `Thanks for reaching out to ${brandName}! Would you like to schedule a quick consultation with ${expertName}?` 
            });
        }

        return NextResponse.json({ success: true, reply: text });

    } catch (error: any) {
        return NextResponse.json({ 
            success: true, 
            reply: `Thanks for reaching out! Would you like to schedule a quick chat with our team?` 
        });
    }
}