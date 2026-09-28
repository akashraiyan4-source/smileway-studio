import { NextResponse } from 'next/server';
import { multilanguageLogs } from '@/app/api/db'; // যদি db.ts ফাইলে এই অ্যারে যুক্ত থাকে

interface MultilanguageRequestBody {
    userMessage?: string;
    preferredLanguage?: string;
}

export async function POST(request: Request) {
    try {
        let body: MultilanguageRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { userMessage, preferredLanguage } = body;

        // ইনপুট ভ্যালিডেশন
        if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'User message is required for multi-language processing.' },
                { status: 400 }
            );
        }

        const cleanMessage = userMessage.trim();
        const lang = preferredLanguage ? preferredLanguage.toLowerCase().trim() : 'en';

        let localizedResponse = 'Thank you for contacting our practice. How can we assist you with your treatment needs today?';

        // বাংলা ভাষা বা স্ক্রিপ্ট ডিটেকশন লজিক
        if (lang === 'bn' || /[অ-হ্]/.test(cleanMessage)) {
            localizedResponse = 'আমাদের ক্লিনিকে যোগাযোগ করার জন্য আপনাকে ধন্যবাদ। আজ আপনার চিকিৎসায় আমরা কীভাবে সাহায্য করতে পারি?';
        } else if (lang === 'es') {
            // স্প্যানিশ বা অন্য ভাষার জন্য ফলব্যাক বা এক্সটেন্ডেড সাপোর্ট
            localizedResponse = 'Gracias por contactarnos. ¿Cómo podemos ayudarle con sus necesidades de tratamiento hoy?';
        }

        const translationRecord = {
            id: `ml_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            originalMessage: cleanMessage,
            detectedLanguage: lang,
            synthesizedResponse: localizedResponse,
            processedAt: new Date().toISOString()
        };

        // সেন্ট্রাল ডেটাবেজে লগ রাখার ব্যবস্থা (যদি অ্যারে থাকে)
        try {
            if (typeof multilanguageLogs !== 'undefined' && Array.isArray(multilanguageLogs)) {
                multilanguageLogs.push(translationRecord);
            }
        } catch (dbError) {
            console.warn('[Multi-Language DB Warning]: Could not push to central log database, proceeding with response.');
        }

        console.log(`[Multi-Language Engine] Processed message for language: ${lang}`);

        return NextResponse.json(
            {
                success: true,
                message: 'Multi-language support response successfully synthesized!',
                data: translationRecord
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Multi-Language Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to process multi-language request. Please try again later.' 
            },
            { status: 500 }
        );
    }
}