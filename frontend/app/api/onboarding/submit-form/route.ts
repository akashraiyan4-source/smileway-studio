import { NextResponse } from 'next/server';

// গ্লোবাল ডাটাবেস মেমোরি নিরাপদ রাখার জন্য টাইপ সেফটিসহ
declare global {
    var globalOnboardingDatabase: any[] | undefined;
}

export const onboardingDatabase = global.globalOnboardingDatabase || [];
if (!global.globalOnboardingDatabase) {
    global.globalOnboardingDatabase = onboardingDatabase;
}

interface OnboardingRequestBody {
    fullName?: string;
    phone?: string;
    medicalHistory?: string;
    agreedToTerms?: boolean;
}

export async function POST(request: Request) {
    try {
        let body: OnboardingRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { fullName, phone, medicalHistory, agreedToTerms } = body;

        // ইনপুট ভ্যালিডেশন
        if (!fullName || typeof fullName !== 'string' || fullName.trim() === '' ||
            !phone || typeof phone !== 'string' || phone.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Full name and phone are required fields.' },
                { status: 400 }
            );
        }

        if (!agreedToTerms) {
            return NextResponse.json(
                { success: false, error: 'Digital consent agreement is required.' },
                { status: 400 }
            );
        }

        const onboardingRecord = {
            id: `onboard_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            fullName: fullName.trim(),
            phone: phone.trim(),
            medicalHistory: medicalHistory ? medicalHistory.trim() : 'None reported',
            agreedToTerms: true,
            status: 'Onboarding Completed & Verified',
            submittedAt: new Date().toISOString()
        };

        onboardingDatabase.push(onboardingRecord);

        console.log(`[Onboarding Engine] Digital consent & history received for ${onboardingRecord.fullName} (${onboardingRecord.phone})`);

        return NextResponse.json(
            {
                success: true,
                message: 'Digital onboarding and consent form successfully submitted!',
                data: onboardingRecord
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Onboarding Engine Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to process patient onboarding. Please try again later.' 
            },
            { status: 500 }
        );
    }
}