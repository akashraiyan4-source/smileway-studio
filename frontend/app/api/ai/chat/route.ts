import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    let message = '';
    let niche = 'dental';
    let brandName = 'SmileWay Studio';
    let expertName = 'Dr. Julian Vance';

    try {
        const body = await request.json().catch(() => ({}));
        message = body?.message?.trim() || '';
        niche = body?.niche?.trim() || 'dental';
        brandName = body?.brandName?.trim() || 'SmileWay Studio';
        expertName = body?.expertName?.trim() || 'Dr. Julian Vance';

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

        const prompt = `You are a real, live human receptionist at "${brandName}" specializing in ${niche}. You work directly with ${expertName}.
        The user just sent you a message: "${message}". 
        Reply to them directly as a real human chatting on a live website widget in 1-2 short natural sentences. No robot talk. Be conversational, friendly, and helpful.`;

        for (const key of apiKeys) {
            try {
                const genAI = new GoogleGenerativeAI(key);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                text = response.text()?.trim() || '';
                if (text) {
                    successGemini = true;
                    break;
                }
            } catch (err) {
                continue;
            }
        }

        if (!successGemini || !text) {
            text = getSmartFallback(message, brandName);
        }

        return NextResponse.json({ success: true, reply: text });

    } catch (error: any) {
        return NextResponse.json({ success: true, reply: getSmartFallback(message, brandName) });
    }
}

function getSmartFallback(msg: string, brandName: string): string {
    const text = msg.toLowerCase();
    if (text.includes('how') || text.includes('process') || text.includes('work')) {
        return `We start with a quick digital preview so you can see your exact results. Want me to check an available time slot?`;
    }
    if (text.includes('price') || text.includes('cost') || text.includes('how much')) {
        return `Pricing usually depends on your specific requirements. Would you like me to grab a quick slot to discuss it?`;
    }
    if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
        return `Hey there! Welcome to ${brandName}. What can I help you out with today?`;
    }
    return `Thanks for reaching out! Would you like me to grab a quick time slot for a chat?`;
}