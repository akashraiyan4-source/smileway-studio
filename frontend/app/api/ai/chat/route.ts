import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    let message = '';
    let niche = '';
    let brandName = '';
    let expertName = '';

    try {
        const body = await request.json().catch(() => ({}));
        message = body?.message?.trim() || '';
        
        // ১. ফ্রন্টএন্ড থেকে নিশ বা ব্র্যান্ড না আসলে ইউজারের মেসেজ দেখে অটো-ডিটেক্ট করবে
        niche = body?.niche?.trim() || autoDetectNiche(message);
        brandName = body?.brandName?.trim() || getDefaultBrand(niche);
        expertName = body?.expertName?.trim() || getDefaultExpert(niche);

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

        // ২. ইউনিভার্সাল ডাইনামিক প্রম্পট - যেকোনো নিশের জন্য এটি কাজ করবে
        const systemPrompt = `You are a friendly, live human receptionist and sales assistant at "${brandName}", specializing in "${niche}". You work closely with ${expertName}. 
        The customer just sent this message: "${message}".
        Reply directly as a real human in 1-2 short, conversational sentences. Be helpful, relevant to ${niche}, and guide them toward booking a quick slot or chat if appropriate. Never sound like a robot.`;

        // ৩. মাল্টি-কি রোটেশন লুপ দিয়ে জেমিনি কল করা
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
                continue; // একটা কি ফেইল করলে অটো পরের কি তে চলে যাবে
            }
        }

        // ৪. এআই থেকে উত্তর না আসলে বা কোটা শেষ হলে স্মার্ট ফলব্যাক
        if (!successGemini || !text) {
            text = getUniversalSmartFallback(message, brandName, niche);
        }

        return NextResponse.json({ success: true, reply: text });

    } catch (error: any) {
        return NextResponse.json({ 
            success: true, 
            reply: `Thanks for reaching out to ${brandName || 'our team'}! Would you like to schedule a quick chat?` 
        });
    }
}

// অটো-ডিটেক্ট ফাংশন: মেসেজ দেখে নিজেই বুঝে নেবে কোন নিশের কাস্টমার
function autoDetectNiche(msg: string): string {
    const text = msg.toLowerCase();
    if (text.includes('skin') || text.includes('skin care') || text.includes('cream') || text.includes('serum') || text.includes('moisturizer') || text.includes('cosmetics')) {
        return 'cosmetics';
    }
    if (text.includes('roof') || text.includes('shingle') || text.includes('leak') || text.includes('gutter')) {
        return 'commercial roofing';
    }
    if (text.includes('tooth') || text.includes('teeth') || text.includes('smile') || text.includes('whitening') || text.includes('dental')) {
        return 'dental';
    }
    if (text.includes('house') || text.includes('property') || text.includes('apartment') || text.includes('real estate')) {
        return 'real estate';
    }
    return 'general business';
}

function getDefaultBrand(niche: string): string {
    switch (niche) {
        case 'cosmetics': return 'Glowora Skincare';
        case 'commercial roofing': return 'Apex Roofing Solutions';
        case 'real estate': return 'Prime Luxury Estates';
        default: return 'Studio Elite';
    }
}

function getDefaultExpert(niche: string): string {
    switch (niche) {
        case 'cosmetics': return 'Dr. Sarah Alvi';
        case 'commercial roofing': return 'Mark Taylor';
        case 'real estate': return 'David Miller';
        default: return 'Dr. Julian Vance';
    }
}

// ইউনিভার্সাল স্মার্ট ফলব্যাক (যদি কখনো জেমিনি রিস্ট্রিক্ট করে)
function getUniversalSmartFallback(msg: string, brandName: string, niche: string): string {
    const text = msg.toLowerCase();
    
    if (niche === 'cosmetics') {
        if (text.includes('skin') || text.includes('dry') || text.includes('moisturizer')) {
            return `For your skin type, our Hydra-Calm Barrier Cream works wonders to lock in moisture. Would you like to check out our collection?`;
        }
        if (text.includes('serum') || text.includes('brightening')) {
            return `Our Radiance C-Glow Serum is packed with antioxidants to brighten skin. Shall I grab a quick product guide for you?`;
        }
    }

    if (niche === 'dental') {
        if (text.includes('whitening') || text.includes('veneers')) {
            return `Yes, we offer professional whitening and custom veneers! Want me to check an available time slot?`;
        }
    }

    return `Thanks for reaching out to ${brandName}! Would you like to schedule a quick chat with our team?`;
}