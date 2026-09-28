import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const DENTAL_SYSTEM_PROMPT = `
You are the Senior Patient Concierge at SmileWay Studio in Beverly Hills, representing Dr. Julian Vance, DDS.
Strict rules:
1. Tone: Ultra-polite, reassuring, concise (under 40 words).
2. Directly and naturally answer the user's specific input (whether greeting, question, or casual text).
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
                reply: "Welcome to SmileWay Studio. How may I assist with your smile today?" 
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Using the officially supported model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `${DENTAL_SYSTEM_PROMPT}\n\nPatient Query: ${message}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text()?.trim();

        return NextResponse.json({
            success: true,
            reply: text || "Would you like to reserve a priority consultation slot with Dr. Vance this week?"
        });

    } catch (error: any) {
        console.error("Gemini AI API Error:", error?.message || error);
        
        const lowerMsg = message?.toLowerCase() || "";
        let dynamicFallback = "Our bespoke dental treatments vary by individual clinical needs. Would you like to secure a priority consultation with Dr. Julian Vance?";
        
        if (lowerMsg.includes('how are you') || lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            dynamicFallback = "I am doing wonderfully, thank you! Welcome to SmileWay Studio. How can I assist with your dental care today?";
        } else if (lowerMsg.includes('pain') || lowerMsg.includes('toothache') || lowerMsg.includes('hurt')) {
            dynamicFallback = "We completely understand and offer a zero-discomfort micro-sedation protocol. Would you like to book an emergency consultation with Dr. Vance?";
        }

        return NextResponse.json({
            success: true,
            reply: dynamicFallback
        });
    }
}