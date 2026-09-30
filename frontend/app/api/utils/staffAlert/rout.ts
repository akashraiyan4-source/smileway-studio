import { NextResponse } from 'next/server';
import twilio from 'twilio';

interface StaffAlertRequestBody {
    fullName?: string;
    phone?: string;
    treatment?: string;
    symptoms?: string;
    alertType?: 'lead' | 'emergency';
}

export async function POST(request: Request) {
    try {
        let body: StaffAlertRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { fullName, phone, treatment, symptoms, alertType } = body;

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
        const staffPhone = alertType === 'emergency' 
            ? (process.env.EMERGENCY_DOCTOR_PHONE || process.env.STAFF_PHONE_NUMBER)
            : process.env.STAFF_PHONE_NUMBER;

        if (!accountSid || !authToken || !twilioPhone || !staffPhone) {
            console.warn('[Staff Alert Warning] Twilio credentials or staff phone number missing in environment variables.');
            return NextResponse.json(
                { success: false, error: 'Server configuration error for SMS dispatch.' },
                { status: 500 }
            );
        }

        const twilioClient = twilio(accountSid, authToken);
        let message = '';

        if (alertType === 'emergency') {
            const timeString = new Date().toLocaleTimeString('en-US');
            message = `🆘 CRITICAL EMERGENCY ALERT!\nCaller: ${fullName || 'Unknown'}\nPhone: ${phone || 'N/A'}\nIssue: ${symptoms || 'Severe Pain / Bleeding'}\nTime: ${timeString}\nAction: Immediate call-back required!`;
        } else {
            message = `🚨 NEW VIP DENTAL LEAD!\nName: ${fullName || 'Unknown'}\nPhone: ${phone || 'N/A'}\nTreatment: ${treatment || 'General Consultation'}\nStatus: Action Required.`;
        }

        await twilioClient.messages.create({
            body: message,
            from: twilioPhone,
            to: staffPhone
        });

        console.log(`[Staff Alert API Success] Dispatched ${alertType || 'lead'} alert to staff.`);

        return NextResponse.json(
            {
                success: true,
                message: 'Staff alert successfully dispatched via SMS!',
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Staff Alert API Critical Error]:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to dispatch staff alert.' },
            { status: 500 }
        );
    }
}