import { NextResponse } from 'next/server';

// গ্লোবাল ডাটাবেস মেমোরি নিরাপদ রাখার জন্য টাইপ সেফটিসহ
declare global {
    var globalFaqDatabase: any[] | undefined;
}

export const faqDatabase = global.globalFaqDatabase || [];
if (!global.globalFaqDatabase) {
    global.globalFaqDatabase = faqDatabase;
}

interface FaqRequestBody {
    question?: string;
    userPhone?: string;
}

export async function POST(request: Request) {
    try {
        let body: FaqRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { question, userPhone } = body;

        // ইনপুট ভ্যালিডেশন
        if (!question || typeof question !== 'string' || question.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Question is required for FAQ bot.' },
                { status: 400 }
            );
        }

        let answer = 'We are open Saturday through Thursday from 10:00 AM to 8:00 PM. Feel free to book a consultation!';

        const lowerQ = question.toLowerCase().trim();
        if (lowerQ.includes('location') || lowerQ.includes('address') || lowerQ.includes('where')) {
            answer = 'Our clinic is located in a prime accessible area in Dhaka with parking facilities.';
        } else if (lowerQ.includes('pain') || lowerQ.includes('hurt')) {
            answer = 'Our treatments are performed under modern local anesthesia to ensure a completely painless experience.';
        } else if (lowerQ.includes('cost') || lowerQ.includes('price') || lowerQ.includes('fee')) {
            answer = 'Consultation fees start at an affordable range, and specific treatment costs depend on individual dental assessments.';
        }

        const faqRecord = {
            id: `faq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            userPhone: userPhone ? userPhone.trim() : 'Anonymous',
            question: question.trim(),
            answer,
            askedAt: new Date().toISOString()
        };

        faqDatabase.push(faqRecord);

        console.log(`[Smart FAQ Bot] Question answered: "${question}"`);

        return NextResponse.json(
            {
                success: true,
                message: 'FAQ query successfully processed!',
                data: faqRecord
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Smart FAQ Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to process FAQ query. Please try again later.' 
            },
            { status: 500 }
        );
    }
}