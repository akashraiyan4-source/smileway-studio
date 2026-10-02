import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    let message = '';
    let niche = 'business';
    let brandName = 'Our Professional Studio';
    let expertName = 'our Specialist';

    try {
        const body = await request.json().catch(() => ({}));
        message = body?.message?.trim();
        niche = body?.niche?.trim() || 'business';
        brandName = body?.brandName?.trim() || 'Our Studio';
        expertName = body?.expertName?.trim() || 'our Lead Specialist';

        if (!message) {
            return NextResponse.json({ success: false, error: 'Message is required.' }, { status: 400 });
        }

        const apiKey = (process.env.GEMINI_API_KEY || '').trim();
        if (!apiKey) {
            return NextResponse.json({ 
                success: true, 
                reply: `Hi there! Welcome to ${brandName}. How can I help you today?` 
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // ১০০% রিয়েল হিউম্যান পারসোনা প্রম্পট (কোনো এআই বা রোবট টোন থাকবে না)
        const humanStealthPrompt = `
You are a real, live human receptionist, front-desk coordinator, and client relationship manager working directly at "${brandName}" (${niche} industry). You assist ${expertName}.

ABSOLUTE LAWS TO SOUND 100% HUMAN:
1. Zero AI Traits: NEVER use robotic phrases like "As an AI...", "How may I assist you today?", "Here is the information", or any overly formal, stiff corporate jargon. Speak like a real person typing casually yet professionally on a chat widget.
2. Natural Flow & Short Replies: Keep your replies very short, conversational, and natural (1 to 2 sentences max, under 30 words). Real humans on web chats don't write long essays.
3. Contextual Empathy: If they say hi, greet them back warmly and casually (e.g., "Hey there! Welcome to ${brandName}. What can I help you with?"). If they ask a question, answer it directly like an expert sitting right at the desk.
4. Pricing/Cost Handling: Never give rigid price tags. Casually mention, "Pricing or packages usually depend on what you need specifically. Want me to check a quick time slot for a chat with ${expertName}?"
5. Language Match: Reply strictly in the exact same language and script the user uses (if they type in Bengali, reply in natural conversational Bengali; if English, reply in natural American English).
`;

        const fullPrompt = `${humanStealthPrompt}\n\nCustomer's Message: "${message}"\nReply as a real human receptionist (short, natural, friendly):`;
        
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text()?.trim();

        if (!text) {
            throw new Error("Empty response");
        }

        return NextResponse.json({
            success: true,
            reply: text
        });

    } catch (error: any) {
        console.error("Chat Error:", error?.message || error);
        
        const lowerMsg = message?.toLowerCase() || "";
        let fallback = `Hey! Thanks for reaching out to ${brandName}. Would you like to schedule a quick chat with our team?`;
        
        if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey') || lowerMsg.includes('হ্যালো') || lowerMsg.includes('হাই')) {
            fallback = `Hi there! Welcome to ${brandName}. How can I help you out today?`;
        }

        return NextResponse.json({
            success: true,
            reply: fallback
        });
    }
}