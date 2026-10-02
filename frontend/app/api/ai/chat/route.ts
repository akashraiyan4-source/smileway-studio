import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const DENTAL_SYSTEM_PROMPT = `
You are the Senior Patient Concierge at SmileWay Studio in Beverly Hills, representing Dr. Julian Vance, DDS.
Strict rules:
1. Tone: Ultra-polite, reassuring, concise (under 40 words).
2. Directly and naturally answer the user's specific input (whether greeting, question, or casual text).
3. Never give explicit price tags. Instead, say: "Our bespoke dental treatments vary by individual clinical needs."
`;

const COSMETICS_SYSTEM_PROMPT = `
You are the Senior VIP Concierge at Aura Beverly Hills, representing elite board-certified plastic surgeons.
Strict rules:
1. Tone: Ultra-polite, ultra-discreet, luxurious, concise (under 40 words).
2. Focus on privacy, anonymous valet entries, strict legal NDAs, and deep-plane architectural facial harmony.
3. Directly and naturally answer the user's specific input.
4. Never give explicit price tags. Instead, say: "Our bespoke surgical and architectural procedures vary by individual clinical anatomy."
`;

export async function POST(request: Request) {
    let message = '';
    let niche = 'dental';
    try {
        const body = await request.json().catch(() => ({}));
        message = body?.message?.trim();
        niche = body?.niche?.trim() || 'dental';

        if (!message) {
            return NextResponse.json({ success: false, error: 'Message is required.' }, { status: 400 });
        }

        const apiKey = (process.env.GEMINI_API_KEY || '').trim();
        if (!apiKey) {
            const defaultReply = niche === 'cosmetics' 
                ? "Welcome to Aura Beverly Hills. How may I discreetly guide your consultation candidacy today?"
                : "Welcome to SmileWay Studio. How may I assist with your smile today?";
            return NextResponse.json({ success: true, reply: defaultReply });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const activeSystemPrompt = niche === 'cosmetics' ? COSMETICS_SYSTEM_PROMPT : DENTAL_SYSTEM_PROMPT;
        const prompt = `${activeSystemPrompt}\n\nVisitor Query: ${message}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text()?.trim();

        const fallbackReply = niche === 'cosmetics'
            ? "Our bespoke surgical procedures vary by individual clinical anatomy. Would you like to secure a confidential consultation?"
            : "Would you like to reserve a priority consultation slot with Dr. Vance this week?";

        return NextResponse.json({
            success: true,
            reply: text || fallbackReply
        });

    } catch (error: any) {
        console.error("Gemini AI API Error:", error?.message || error);
        
        const lowerMsg = message?.toLowerCase() || "";
        let dynamicFallback = niche === 'cosmetics'
            ? "Our bespoke surgical procedures vary by individual clinical anatomy. Would you like to secure a confidential consultation?"
            : "Our bespoke dental treatments vary by individual clinical needs. Would you like to secure a priority consultation with Dr. Julian Vance?";
        
        if (lowerMsg.includes('how are you') || lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hy')) {
            dynamicFallback = niche === 'cosmetics'
                ? "I am doing wonderfully, thank you! Welcome to Aura Beverly Hills. How can I discreetly assist with your consultation today?"
                : "I am doing wonderfully, thank you! Welcome to SmileWay Studio. How can I assist with your dental care today?";
        }

        return NextResponse.json({
            success: true,
            reply: dynamicFallback
        });
    }
}