import { NextResponse } from 'next/server';
import { prepReminderDatabase } from '@/app/api/db';

interface PrepReminderRequestBody {
    fullName?: string;
    phone?: string;
    appointmentTime?: string;
    treatmentType?: string;
}

export async function POST(request: Request) {
    try {
        let body: PrepReminderRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { fullName, phone, appointmentTime, treatmentType } = body;

        // ইনপুট ভ্যালিডেশন
        if (!fullName || typeof fullName !== 'string' || fullName.trim() === '' ||
            !phone || typeof phone !== 'string' || phone.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Full name and phone are required fields.' },
                { status: 400 }
            );
        }

        let prepInstructions = 'Please arrive 10 minutes prior to your scheduled time. Bring a valid ID.';
        
        const cleanTreatment = treatmentType ? treatmentType.trim() : 'Dental Checkup';
        if (cleanTreatment.toLowerCase().includes('implant')) {
            prepInstructions = 'Avoid eating heavy meals 2 hours prior to your implant surgery. Take prescribed antibiotics if advised.';
        }

        const reminderTask = {
            id: `prep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            fullName: fullName.trim(),
            phone: phone.trim(),
            appointmentTime: appointmentTime ? appointmentTime.trim() : 'Tomorrow',
            treatmentType: cleanTreatment,
            prepInstructions,
            status: 'Prep Reminder Dispatched',
            sentAt: new Date().toISOString()
        };

        prepReminderDatabase.push(reminderTask);

        console.log(`[Prep Reminder Engine] Reminder & instructions sent to ${reminderTask.fullName} (${reminderTask.phone})`);

        return NextResponse.json(
            {
                success: true,
                message: 'Pre-appointment preparation guidelines successfully sent!',
                data: reminderTask
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Prep Reminder Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to send prep reminder. Please try again later.' 
            },
            { status: 500 }
        );
    }
}