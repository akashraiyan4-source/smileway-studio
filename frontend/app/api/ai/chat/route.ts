import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPTS: Record<string, { prompt: string, brand: string }> = {
    dental: {
        brand: "SmileWay Studio",
        prompt: `
You are the Senior Patient Concierge at SmileWay Studio in Beverly Hills, representing Dr. Julian Vance, DDS.
Strict behavior rules:
1. Tone: Ultra-polite, warm, reassuring, upscale, and concise (under 40 words).
2. Direct Intelligence: Read the user's specific input carefully (whether it's "hi", "hello", "how are you", a general question, or a statement) and respond directly and naturally to what they just said. Do not give a canned or disconnected response.
3. Service Integration: After answering their input naturally, smoothly guide them toward scheduling a consultation or discussing our bespoke dental care.
4. Pricing: Never give explicit price tags. Instead, say: "Our bespoke dental treatments vary by individual clinical needs."
        `
    },
    cosmetic: {
        brand: "Aura Beverly Hills",
        prompt: `
You are the Senior Patient Concierge at Aura Beverly Hills, representing our elite plastic surgeons.
Strict behavior rules:
1. Tone: Ultra-polite, warm, upscale, prestigious, and concise (under 40 words).
2. Direct Intelligence: Read the user's specific input carefully (whether it's "hi", "hello", "how are you", a general question, or a statement) and respond directly and naturally to what they just said. Do not give a canned or disconnected response.
3. Service Integration: After answering their input naturally, smoothly guide them toward a private consultation or discussing our facial architecture services.
4. Pricing: Never give explicit price tags. Instead, say: "Our permanent structural SMAS repositioning and bespoke cosmetic treatments are completely customized to your facial harmony."
        `
    }
};

export async function POST(request: Request) {
    let message = '';
    let niche = 'dental';

    try {
        const body = await request.json().catch(() => ({}));
        message = body?.message?.trim();
        if (body?.niche && SYSTEM_PROMPTS[body.niche]) {
            niche = body.niche;
        }

        if (!message) {
            return NextResponse.json({ success: false, error: 'Message is required.' }, { status: 400 });
        }

        const activeConfig = SYSTEM_PROMPTS[niche];
        const apiKey = (process.env.GEMINI_API_KEY || '').trim();
        
        if (!apiKey) {
            return NextResponse.json({ 
                success: true, 
                reply: `Welcome to ${activeConfig.brand}. How may I assist you today?` 
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // প্রম্পটে ইউজারের কথাটি পরিষ্কারভাবে বুঝিয়ে দেওয়া হচ্ছে
        const prompt = `${activeConfig.prompt}\n\nUser Input: "${message}"\nRespond naturally and politely to the user's input:`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text()?.trim();

        return NextResponse.json({
            success: true,
            reply: text || `Welcome to ${activeConfig.brand}. How can we assist you today?`
        });

    } catch (error: any) {
        console.error("Gemini AI API Error:", error?.message || error);
        
        // ফলব্যাক লজিক
        const lowerMsg = message?.toLowerCase() || "";
        let fallbackReply = "Thank you for reaching out. How would you like to proceed with your consultation?";

        if (lowerMsg.includes('how are you') || lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hy')) {
            fallbackReply = niche === 'cosmetic' 
                ? "I am doing wonderfully, thank you! Welcome to Aura Beverly Hills. How can I assist with your facial architecture goals today?"
                : "I am doing wonderfully, thank you! Welcome to SmileWay Studio. How can I assist with your dental care today?";
        }

        return NextResponse.json({
            success: true,
            reply: fallbackReply
        });
    }
}