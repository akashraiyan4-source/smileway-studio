import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    let message = '';
    let brandName = 'Elite Business';
    let niche = 'general';
    let expertName = 'Our Specialist';

    try {
        const body = await request.json().catch(() => ({}));
        message = body?.message?.trim() || '';
        niche = body?.niche?.trim() || 'general business';
        brandName = body?.brandName?.trim() || 'Elite Practice';
        expertName = body?.expertName?.trim() || 'Our Expert Specialist';

        if (!message) {
            return NextResponse.json({ success: false, error: 'Message is required.' }, { status: 400 });
        }

        const apiKeys = [
            process.env.GEMINI_API_KEY_1,
            process.env.GEMINI_API_KEY_2,
            process.env.GEMINI_API_KEY_3,
            process.env.GEMINI_API_KEY
        ].filter(Boolean) as string[];

        let text = '';
        let successGemini = false;

        // সম্পূর্ণ ডাইনামিক এবং ইউনিভার্সাল প্রম্পট - যেকোনো নিশের জন্য প্রযোজ্য
        const systemPrompt = `You are a friendly, professional human receptionist and sales assistant at a brand named "${brandName}", specializing in the "${niche}" industry. You work closely with ${expertName}. 
        The customer just sent this message: "${message}".
        Reply directly as a real human in 1-2 short, conversational sentences. Be helpful, relevant to ${niche}, and guide them naturally toward booking a quick consultation or time slot. Never sound like a robot or mention that you are an AI.`;

        for (const key of apiKeys) {
            try {
                const genAI = new GoogleGenerativeAI(key);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(systemPrompt);
                const response = await result.response;
                text = response.text()?.trim() || '';
                
                if (text) {
                    successGemini = true;
                    break;
                }
            } catch (err: any) {
                continue;
            }
        }

        // যদি জেমিনি থেকে না আসে, তবে যেকোনো নিশের জন্য জেনেরিক স্মার্ট ফলব্যাক
        if (!successGemini || !text) {
            text = `Thanks for reaching out to ${brandName}! We specialize in professional ${niche} services with ${expertName}. Would you like to schedule a quick consultation slot?`;
        }

        return NextResponse.json({ success: true, reply: text });

    } catch (error: any) {
        return NextResponse.json({ 
            success: true, 
            reply: `Thanks for reaching out to ${brandName || 'our team'}! Would you like to schedule a quick chat?` 
        });
    }
}