import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPTS: Record<string, { prompt: string, brand: string }> = {
    dental: {
        brand: "SmileWay Studio",
        prompt: `
You are the Senior Patient Concierge at SmileWay Studio in Beverly Hills, representing Dr. Julian Vance, DDS.
Strict behavior rules:
1. Tone: Ultra-polite, warm, reassuring, upscale, and concise (under 40 words).
2. Direct Intelligence: Read the user's specific input carefully and respond directly and naturally.
3. Service Integration: After answering naturally, smoothly guide them toward scheduling a consultation or discussing our bespoke dental care.
4. Pricing: Never give explicit price tags. Instead, say: "Our bespoke dental treatments vary by individual clinical needs."
        `
    },
    cosmetic: {
        brand: "Aura Beverly Hills",
        prompt: `
You are the Senior Patient Concierge at Aura Beverly Hills, representing our elite plastic surgeons.
Strict behavior rules:
1. Tone: Ultra-polite, warm, upscale, prestigious, and concise (under 40 words).
2. Direct Intelligence: Read the user's specific input carefully and respond directly and naturally.
3. Service Integration: After answering naturally, smoothly guide them toward a private consultation or discussing our facial architecture services.
4. Pricing: Never give explicit price tags. Instead, say: "Our permanent structural SMAS repositioning and bespoke cosmetic treatments are completely customized to your facial harmony."
        `
    }
};

export async function POST(request: Request) {
    let message = '';
    let niche = 'dental'; // ডিফল্ট

    try {
        const body = await request.json().catch(() => ({}));
        message = body?.message?.trim();

        if (!message) {
            return NextResponse.json({ success: false, error: 'Message is required.' }, { status: 400 });
        }

        // ১. যদি ফ্রন্টএন্ড থেকে নিশ পাঠানো হয়, সেটি গ্রহণ করবে
        if (body?.niche && SYSTEM_PROMPTS[body.niche]) {
            niche = body.niche;
        } else {
            // ২. ফ্রন্টএন্ড থেকে না পাঠালে ইউজারের মেসেজ বা পেজের রেফারেন্স দেখে ব্যাকএন্ড নিজে থেকে বুঝে নেবে
            const lowerMsg = message.toLowerCase();
            const referer = request.headers.get('referer') || '';
            
            if (referer.includes('cosmetic') || lowerMsg.includes('surgery') || lowerMsg.includes('facelift') || lowerMsg.includes('botox') || lowerMsg.includes('skin')) {
                niche = 'cosmetic';
            } else if (referer.includes('dental') || lowerMsg.includes('tooth') || lowerMsg.includes('smile') || lowerMsg.includes('veneers') || lowerMsg.includes('canal')) {
                niche = 'dental';
            }
        }

        const activeConfig = SYSTEM_PROMPTS[niche] || SYSTEM_PROMPTS.dental;
        const apiKey = (process.env.GEMINI_API_KEY || '').trim();
        
        if (!apiKey) {
            return NextResponse.json({ 
                success: true, 
                reply: `Welcome to ${activeConfig.brand}. How may I assist you today?` 
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
        
        const activeConfig = SYSTEM_PROMPTS[niche] || SYSTEM_PROMPTS.dental;
        let fallbackReply = `Welcome to ${activeConfig.brand}. How can we assist you today?`;

        const lowerMsg = message?.toLowerCase() || "";
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