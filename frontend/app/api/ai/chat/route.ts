import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const message = body?.message?.trim() || '';
        const niche = body?.niche?.trim() || 'dental';
        const brandName = body?.brandName?.trim() || 'SmileWay Studio';
        const expertName = body?.expertName?.trim() || 'Dr. Julian Vance';

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

        const systemPrompt = `You are a friendly, human receptionist at "${brandName}" specializing in ${niche}, working with ${expertName}. 
        Answer the customer's message naturally in 1-2 short sentences like a real human chat. 
        Customer message: "${message}"`;

        for (const key of apiKeys) {
            try {
                const genAI = new GoogleGenerativeAI(key);
                // gemini-1.5-flash এর পরিবর্তে gemini-1.5-flash-latest ব্যবহার করা অধিক নিরাপদ
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(systemPrompt);
                const response = await result.response;
                text = response.text()?.trim() || '';
                
                if (text) {
                    successGemini = true;
                    break;
                }
            } catch (err) {
                console.error("Key failed, trying next...", err);
                continue;
            }
        }

        if (!successGemini || !text) {
            text = getSmartFallback(message, brandName);
        }

        return NextResponse.json({ success: true, reply: text });

    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ 
            success: true, 
            reply: "Thanks for reaching out! Would you like to schedule a quick chat with our team?" 
        });
    }
}

function getSmartFallback(msg: string, brandName: string): string {
    const text = msg.toLowerCase();
    if (text.includes('whitening') || text.includes('veneers') || text.includes('teeth')) {
        return `Yes, we offer professional whitening and custom veneers! Want me to check an available time slot?`;
    }
    if (text.includes('locate') || text.includes('where') || text.includes('open') || text.includes('hour')) {
        return `We are located in Beverly Hills and open Monday through Saturday. Shall I grab a quick slot for you?`;
    }
    if (text.includes('price') || text.includes('cost') || text.includes('how much')) {
        return `Pricing depends on your specific needs. Would you like me to reserve a quick consultation slot?`;
    }
    return `Hey there! Welcome to ${brandName}. What can I help you out with today?`;
}