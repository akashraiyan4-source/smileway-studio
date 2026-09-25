import { NextResponse } from 'next/server';
import { followUpDatabase } from '../../../db';

interface FollowUpRequestBody {
    fullName?: string;
    phone?: string;
    email?: string;
    sequenceStep?: string;
}

export async function POST(request: Request) {
    try {
        let body: FollowUpRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { fullName, phone, email, sequenceStep } = body;

        // Input validation
        if (!fullName || typeof fullName !== 'string' || fullName.trim() === '' || (!phone && !email)) {
            return NextResponse.json(
                { success: false, error: 'Full name and at least one contact method (phone or email) are required.' },
                { status: 400 }
            );
        }

        const followUpTask = {
            id: `fol_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            fullName: fullName.trim(),
            phone: phone ? phone.trim() : 'N/A',
            email: email ? email.trim() : 'N/A',
            step: sequenceStep ? sequenceStep.trim() : 'Step 1 (24h Reminder)',
            status: 'Scheduled/Dispatched',
            timestamp: new Date().toISOString()
        };

        followUpDatabase.push(followUpTask);

        console.log(`[Follow-Up Engine] Sequence triggered for ${followUpTask.fullName} -> Step: ${followUpTask.step}`);

        return NextResponse.json(
            {
                success: true,
                message: 'Automated follow-up sequence successfully initiated!',
                task: followUpTask
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Follow-Up Engine Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to trigger follow-up sequence. Please try again later.' 
            },
            { status: 500 }
        );
    }
}