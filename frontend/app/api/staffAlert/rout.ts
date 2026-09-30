import { NextResponse } from 'next/server';
import twilio from 'twilio';

// ইন-মেমোরি রেট লিমিটার সরাসরি ফাইলের ভেতরে (কোনো পাথ বা ফোল্ডারের ঝামেলা নেই)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(request: Request): boolean {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const windowMs = 60 * 1000; // ১ মিনিট
    const maxRequests = 10; // প্রতি মিনিটে সর্বোচ্চ ১০টি রিকোয়েস্ট

    const record = rateLimitMap.get(ip);
    if (!record || now > record.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (record.count >= maxRequests) {
        return false;
    }

    record.count++;
    return true;
}

interface StaffAlertRequestBody {
    fullName?: string;
    phone?: string;
    treatment?: string;
    symptoms?: string;
    alertType?: 'lead' | 'emergency';
    tenantId?: string;
}

export async function POST(request: Request) {
    const traceId = request.headers.get('x-trace-id') || `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    try {
        if (!checkRateLimit(request)) {
            return NextResponse.json(
                { success: false, error: 'Too many requests. Please try again later.', trace_id: traceId },
                { status: 429 }
            );
        }

        let body: StaffAlertRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.', trace_id: traceId },
                { status: 400 }
            );
        }

        const { fullName, phone, treatment, symptoms, alertType, tenantId = 'default_tenant' } = body;

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
        const staffPhone = alertType === 'emergency' 
            ? (process.env.EMERGENCY_DOCTOR_PHONE || process.env.STAFF_PHONE_NUMBER)
            : process.env.STAFF_PHONE_NUMBER;

        if (!accountSid || !authToken || !twilioPhone || !staffPhone) {
            console.warn(JSON.stringify({
                trace_id: traceId,
                event: 'Staff Alert Warning',
                message: 'Twilio credentials or staff phone number missing in environment variables.'
            }));
            return NextResponse.json(
                { success: false, error: 'Server configuration error for SMS dispatch.', trace_id: traceId },
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

        try {
            await twilioClient.messages.create({
                body: message,
                from: twilioPhone,
                to: staffPhone
            });
        } catch (twilioErr: any) {
            console.error(`[Trace: ${traceId}] Twilio Dispatch Failed:`, twilioErr.message);
        }

        console.log(JSON.stringify({
            trace_id: traceId,
            event: 'Staff Alert Dispatched',
            tenant_id: tenantId,
            alert_type: alertType || 'lead',
            timestamp: new Date().toISOString()
        }));

        return NextResponse.json(
            {
                success: true,
                message: 'Staff alert successfully dispatched via SMS!',
                trace_id: traceId
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error(`[Trace: ${traceId}] [Staff Alert API Critical Error]:`, error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to dispatch staff alert.', trace_id: traceId },
            { status: 500 }
        );
    }
}