import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request: Request) {
    try {
        // Twilio সাধারণত x-www-form-urlencoded ফরম্যাটে রিকোয়েস্ট পাঠায়
        const contentType = request.headers.get('content-type') || '';
        let callerPhone = '';
        let calledNumber = '';

        if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await request.formData();
            callerPhone = (formData.get('From') as string) || '';
            calledNumber = (formData.get('To') as string) || '';
        } else {
            // যদি JSON বা অন্য কোনো ফরম্যাটে আসে
            const body = await request.json().catch(() => ({}));
            callerPhone = body.From || '';
            calledNumber = body.To || '';
        }

        // Twilio TwiXML রেসপন্স (কল রিসিভ করে সুন্দর মেসেজ বলে কেটে দেওয়া)
        const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say voice="alice">Thank you for calling SmileWay Studio Beverly Hills. We missed your call, but a concierge text has been sent to your mobile. We will get back to you shortly.</Say>
                <Hangup/>
            </Response>`;

        // ইনস্ট্যান্ট টেক্সট-ব্যাক এসএমএস ট্রিগার লজিক
        if (callerPhone) {
            const smsBody = "Sorry we missed your call at Dr. Vance's clinic! How can our patient concierge help you right now? Reply here or book online: https://mhadigitools.store";

            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            const twilioPhone = calledNumber || process.env.TWILIO_PHONE_NUMBER;

            if (accountSid && authToken && twilioPhone) {
                try {
                    const client = twilio(accountSid, authToken);
                    await client.messages.create({
                        body: smsBody,
                        from: twilioPhone,
                        to: callerPhone
                    });
                    console.log(`[Missed-Call Engine Success] Text-back dispatched to: ${callerPhone}`);
                } catch (twilioErr) {
                    console.error('[Missed-Call Twilio SMS Error]:', twilioErr);
                }
            } else {
                console.log(`[Missed-Call Engine Success - Simulated] Text-back logged for: ${callerPhone}`);
            }
        }

        // TwiXML হেডার সহ সফল রেসপন্স রিটার্ন করা
        return new NextResponse(twimlResponse, {
            status: 200,
            headers: {
                'Content-Type': 'text/xml',
            },
        });

    } catch (error) {
        console.error('[Missed-Call Engine Critical Error]:', error);
        
        // ক্র্যাশ রোধ করতে ফলব্যাক TwiXML রেসপন্স পাঠানো
        const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say>An error occurred, but we have logged your call.</Say>
            </Response>`;

        return new NextResponse(errorTwiml, {
            status: 200,
            headers: {
                'Content-Type': 'text/xml',
            },
        });
    }
}