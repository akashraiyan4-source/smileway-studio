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

        const apiKey = (process.env.GEMINI_API_KEY || '').trim();
        
        // যদি এপিআই কি না থাকে, তবুও জেনেরিক ফলব্যাক না দিয়ে ইনপুট অনুযায়ী রিয়েল হিউম্যানের মতো স্মার্ট ফলব্যাক দিব
        if (!apiKey) {
            return NextResponse.json({ 
                success: true, 
                reply: getSmartHumanFallback(message, brandName, niche)
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const humanStealthPrompt = `
You are a real, live human receptionist and front-desk coordinator at "${brandName}" specializing in ${niche}. You work directly with ${expertName}.
The user just sent you a message. Reply to them directly as a real human chatting on a live website widget.

RULES:
1. Never sound like an AI, robot, or automated bot. No corporate jargon.
2. Keep it extremely short, natural, and conversational (1-2 sentences, under 30 words).
3. Directly answer or react to what the user actually said. If they ask about the process, briefly explain it. If they say hi, greet them back warmly.
4. Language Match: Reply strictly in the exact same language/script the user used.
`;

        const fullPrompt = `${humanStealthPrompt}\n\nUser's Message: "${message}"\nReply naturally:`;
        
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text()?.trim();

        if (!text) {
            return NextResponse.json({ success: true, reply: getSmartHumanFallback(message, brandName, niche) });
        }

        return NextResponse.json({
            success: true,
            reply: text
        });

    } catch (error: any) {
        console.error("AI Chat API Error:", error?.message || error);
        
        const body = await request.clone().json().catch(() => ({}));
        const message = body?.message || '';
        const brandName = body?.brandName || 'Our Studio';
        const niche = body?.niche || 'dental';

        return NextResponse.json({
            success: true,
            reply: getSmartHumanFallback(message, brandName, niche)
        });
    }
}

// জেমিনি এপিআই কি না থাকলে বা কোনো কারণে এরর খেলে ইউজার ইনপুট অনুযায়ী ১০০% হিউম্যান-লাইক স্মার্ট ডাইনামিক উত্তর জেনারেট করবে
function getUserInputText(msg: string) {
    return msg.toLowerCase();
}

function getSmartHumanFallback(message: string, brandName: string, niche: string): string {
    const text = getUserInputText(message);

    if (text.includes('how') || text.includes('process') || text.includes('work') || text.includes('কেমন')) {
        return `We start with a quick digital preview so you can see your exact results before anything begins. Want me to check an available time slot for a chat?`;
    }
    if (text.includes('price') || text.includes('cost') || text.includes('how much') || text.includes('দাম')) {
        return `Pricing usually depends on your specific requirements. Would you like me to grab a quick slot for you to discuss it with our specialist?`;
    }
    if (text.includes('book') || text.includes('appointment') || text.includes('slot') || text.includes('schedule') || text.includes('বুক')) {
        return `I can definitely help set that up for you! Let me pull up the schedule so you can pick your preferred time.`;
    }
    if (text.includes('hi') || text.includes('hello') || text.includes('hey') || text.includes('হ্যালো') || text.includes('হাই')) {
        return `Hey there! Welcome to ${brandName}. What can I help you out with today?`;
    }
    
    return `Thanks for reaching out to ${brandName}. Would you like to schedule a quick chat or consultation with our team?`;
}