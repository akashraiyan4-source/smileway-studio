import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const message = body?.message?.trim() || '';
        const niche = body?.niche?.trim() || 'cosmetics';
        const brandName = body?.brandName?.trim() || 'Aura Beverly Hills';
        const expertName = body?.expertName?.trim() || 'Dr. Sarah Alvi';

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
            return NextResponse.json({ success: true, reply: `Please configure Gemini API keys in Vercel environment variables.` });
        }

        let text = '';
        const systemPrompt = `You are a helpful, professional human receptionist at "${brandName}", specializing in "${niche}". You work closely with ${expertName}. 
The customer says: "${message}".
Reply directly as a real human in 1-2 short, conversational sentences. Guide them toward booking a consultation. Never mention you are an AI.`;

        for (const key of apiKeys) {
            try {
                const genAI = new GoogleGenerativeAI(key);
                // Try gemini-1.5-flash first, then gemini-pro
                for (const modelName of ["gemini-1.5-flash", "gemini-pro"]) {
                    try {
                        const model = genAI.getGenerativeModel({ model: modelName });
                        const result = await model.generateContent(systemPrompt);
                        const response = await result.response;
                        text = response.text()?.trim() || '';
                        if (text) break;
                    } catch (innerErr) {
                        continue;
                    }
                }
                if (text) break;
            } catch (err) {
                continue;
            }
        }

        // Final fallback if all keys/models fail
        if (!text) {
            text = `Thanks for reaching out to ${brandName}! Would you like to schedule a quick consultation with ${expertName}?`;
        }

        return NextResponse.json({ success: true, reply: text });

    } catch (error: any) {
        return NextResponse.json({ 
            success: true, 
            reply: `Thanks for reaching out! Would you like to schedule a quick chat with our team?` 
        });
    }
}