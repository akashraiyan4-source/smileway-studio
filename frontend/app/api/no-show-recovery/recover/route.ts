import { NextResponse } from 'next/server';

// গ্লোবাল ডাটাবেস মেমোরি নিরাপদ রাখার জন্য টাইপ সেফটিসহ
declare global {
    var globalNoShowDatabase: any[] | undefined;
}

export const noShowDatabase = global.globalNoShowDatabase || [];
if (!global.globalNoShowDatabase) {
    global.globalNoShowDatabase = noShowDatabase;
}

interface NoShowRequestBody {
    fullName?: string;
    phone?: string;
    missedAppointmentDate?: string;
}

export async function POST(request: Request) {
    try {
        let body: NoShowRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { fullName, phone, missedAppointmentDate } = body;

        // ইনপুট ভ্যালিডেশন
        if (!fullName || typeof fullName !== 'string' || fullName.trim() === '' ||
            !phone || typeof phone !== 'string' || phone.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Full name and phone are required fields.' },
                { status: 400 }
            );
        }

        const recoveryTask = {
            id: `noshow_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            fullName: fullName.trim(),
            phone: phone.trim(),
            missedDate: missedAppointmentDate ? missedAppointmentDate.trim() : 'Recent',
            recoveryActionSent: 'SMS: We missed you! Reschedule your VIP visit here.',
            status: 'Recovery Sequence Active',
            triggeredAt: new Date().toISOString()
        };

        noShowDatabase.push(recoveryTask);

        console.log(`[No-Show Recovery] Recovery workflow initiated for ${recoveryTask.fullName} (${recoveryTask.phone})`);

        return NextResponse.json(
            {
                success: true,
                message: 'No-show recovery sequence successfully triggered!',
                data: recoveryTask
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[No-Show Recovery Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to process no-show recovery. Please try again later.' 
            },
            { status: 500 }
        );
    }
}