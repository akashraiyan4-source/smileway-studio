import { NextResponse } from 'next/server';
import { onboardingDatabase } from '@/app/api/db';

export async function POST(request: Request) {
    try {
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const record = {
            id: `onboard_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            ...body,
            submittedAt: new Date().toISOString()
        };

        onboardingDatabase.push(record);

        console.log(`[Onboarding API] New submission recorded.`);

        return NextResponse.json(
            {
                success: true,
                message: 'Onboarding data successfully submitted!',
                data: record
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Onboarding API Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to process onboarding. Please try again later.' 
            },
            { status: 500 }
        );
    }
}