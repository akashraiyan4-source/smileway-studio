import { NextResponse } from 'next/server';
import { reviewRequestsDatabase } from '../../../db';

interface ReviewRequestBody {
    fullName?: string;
    phone?: string;
    treatment?: string;
}

export async function POST(request: Request) {
    try {
        let body: ReviewRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { fullName, phone, treatment } = body;

        // ইনপুট ভ্যালিডেশন
        if (!fullName || typeof fullName !== 'string' || fullName.trim() === '' ||
            !phone || typeof phone !== 'string' || phone.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Full name and phone are required fields.' },
                { status: 400 }
            );
        }

        const cleanName = fullName.trim();
        const cleanTreatment = treatment ? treatment.trim() : 'Dental Consultation';

        const reviewTask = {
            id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            fullName: cleanName,
            phone: phone.trim(),
            treatment: cleanTreatment,
            reviewLink: 'https://g.page/r/your-clinic-google-review-link',
            status: 'Review Request Dispatched',
            sentAt: new Date().toISOString()
        };

        reviewRequestsDatabase.push(reviewTask);

        console.log(`[Reputation Engine] Review request sent to ${cleanName} (${phone}) for ${cleanTreatment}`);

        return NextResponse.json(
            {
                success: true,
                message: 'Automated review request successfully sent!',
                data: reviewTask
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Reputation Engine Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to send review request. Please try again later.' 
            },
            { status: 500 }
        );
    }
}