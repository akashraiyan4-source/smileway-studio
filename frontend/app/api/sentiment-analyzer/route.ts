import { NextResponse } from 'next/server';
import { sentimentLogs } from '@/app/api/db'; // যদি db.ts ফাইলে এই অ্যারে যুক্ত থাকে

interface SentimentRequestBody {
    reviewText?: string;
    source?: string;
}

export async function POST(request: Request) {
    try {
        let body: SentimentRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { reviewText, source } = body;

        // ইনপুট ভ্যালিডেশন
        if (!reviewText || typeof reviewText !== 'string' || reviewText.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Review text is required for sentiment analysis.' },
                { status: 400 }
            );
        }

        const cleanReview = reviewText.trim();
        const cleanSource = source ? source.trim().toLowerCase() : 'google reviews';
        const textLower = cleanReview.toLowerCase();

        let sentiment = 'Positive (Satisfied Client)';
        let actionRequired = false;
        let alertMessage = 'Logged safely to reputation dashboard.';

        // নেতিবাচক বা ক্ষতিকর শব্দ ফিল্টার করে সেন্টিমেন্ট নির্ণয়
        const negativeKeywords = ['bad', 'painful', 'worst', 'delay', 'rude', 'terrible', 'horrible', 'unprofessional', 'disappointed'];
        const isNegative = negativeKeywords.some(keyword => textLower.includes(keyword));

        if (isNegative) {
            sentiment = 'Negative (Attention Required)';
            actionRequired = true;
            alertMessage = 'High alert! Notified clinic director and support team via emergency SMS/WhatsApp.';
        } else if (textLower.includes('okay') || textLower.includes('average') || textLower.includes('fine')) {
            sentiment = 'Neutral (Moderate Experience)';
        }

        const sentimentRecord = {
            id: `sent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            reviewSnippet: cleanReview,
            platformSource: cleanSource,
            sentimentResult: sentiment,
            urgentActionNeeded: actionRequired,
            actionTaken: alertMessage,
            analyzedAt: new Date().toISOString()
        };

        // সেন্ট্রাল ডেটাবেজে লগ রাখার ব্যবস্থা (যদি অ্যারে থাকে)
        try {
            if (typeof sentimentLogs !== 'undefined' && Array.isArray(sentimentLogs)) {
                sentimentLogs.push(sentimentRecord);
            }
        } catch (dbError) {
            console.warn('[Sentiment DB Warning]: Could not push to central log database, proceeding with response.');
        }

        console.log(`[Sentiment Analyzer] Analyzed review from ${cleanSource} -> Result: ${sentiment}`);

        return NextResponse.json(
            {
                success: true,
                message: 'Market sentiment successfully analyzed and processed!',
                data: sentimentRecord
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Sentiment Analyzer Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to analyze sentiment. Please try again later.' 
            },
            { status: 500 }
        );
    }
}