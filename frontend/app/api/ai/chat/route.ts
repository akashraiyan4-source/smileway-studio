import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    let message = '';
    let brandName = 'Aura Beverly Hills';
    let niche = 'cosmetics';
    let expertName = 'Dr. Sarah Alvi';

    try {
        const body = await request.json().catch(() => ({}));
        message = body?.message?.trim() || '';
        niche = body?.niche?.trim() || 'cosmetics';
        brandName = body?.brandName?.trim() || 'Aura Beverly Hills';
        expertName = body?.expertName?.trim() || 'Dr. Sarah Alvi';

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

        const systemPrompt = `You are a helpful, professional human receptionist and sales assistant at "${brandName}", specializing in "${niche}". You work closely with ${expertName}. 
        The customer just sent this message: "${message}".
        Reply directly as a real human in 1-2 short, conversational sentences. Be helpful, relevant to ${niche}, and guide them naturally toward booking a quick consultation or time slot. Never sound like a robot or mention that you are an AI.`;

        // একাধিক কি এবং একাধিক মডেল ট্রাই করার লজিক
        for (const key of apiKeys) {
            const modelsToTry = ["gemini-1.5-flash", "gemini-pro"];
            
            for (const modelName of modelsToTry) {
                try {
                    const genAI = new GoogleGenerativeAI(key);
                    const model = genAI.getGenerativeModel({ model: modelName });
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
            if (successGemini) break;
        }

        // যদি সব ট্রাই করার পরও না আসে, তবেই কেবল ফলব্যাক
        if (!successGemini || !text) {
            text = `Thanks for reaching out to ${brandName}! We specialize in professional ${niche} services with ${expertName}. Would you like to schedule a quick consultation slot?`;
        }

        return NextResponse.json({ success: true, reply: text });

    } catch (error: any) {
        return NextResponse.json({ 
            success: true, 
            reply: `Thanks for reaching out to ${brandName}! Would you like to schedule a quick chat?` 
        });
    }
}