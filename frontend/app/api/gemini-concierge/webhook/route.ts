import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import twilio from 'twilio';
import { checkRateLimit } from '../../utils/rate-limit'; // সরাসরি রিলেটিভ পাথ

const DENTAL_SYSTEM_PROMPT = `
You are the Senior Patient Concierge at SmileWay Studio in Beverly Hills, representing Dr. Julian Vance, DDS.
You are chatting with a high-net-worth patient over SMS.
Strict rules:
1. Tone: Ultra-polite, reassuring, highly prestigious, concise (under 40 words per SMS).
2. Never give explicit price tags. Instead, say: "Our bespoke porcelain veneers and bio-enamel treatments are completely customized to your facial aesthetics. We will provide a 3D preview and precise plan during your consultation."
3. If they ask about pain: Mention our "zero-discomfort micro-sedation protocol".
4. Privacy: Assure 100% private VIP suites and NDA compliance.
5. Primary Goal: Gently guide them to lock a consultation slot by replying 'YES' or asking for their preferred day.
`;

export async function POST(request: Request) {
    const traceId = request.headers.get('x-trace-id') || `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    try {
        if (!checkRateLimit(request)) {
            console.warn(JSON.stringify({ trace_id: traceId, event: 'Rate limit exceeded on Gemini Concierge' }));
            return new NextResponse('<Response><Message>Too many requests. Please try again shortly.</Message></Response>', {
                status: 200,
                headers: { 'Content-Type': 'text/xml' }
            });
        }

        const contentType = request.headers.get('content-type') || '';
        let fromPhone = '';
        let userMessage = '';

        if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await request.formData();
            fromPhone = (formData.get('From') as string) || '';
            userMessage = (formData.get('Body') as string) || '';
        } else {
            const body = await request.json().catch(() => ({}));
            fromPhone = body.From || '';
            userMessage = body.Body || '';
        }

        if (!fromPhone || !userMessage) {
            console.warn(`[Trace: ${traceId}] [SMS Webhook Warning] Missing From or Body in incoming request.`);
            return new NextResponse('<Response></Response>', {
                status: 200,
                headers: { 'Content-Type': 'text/xml' }
            });
        }

        console.log(JSON.stringify({
            trace_id: traceId,
            event: 'SMS Received',
            from: fromPhone,
            message: userMessage
        }));

        const apiKey = (process.env.GEMINI_API_KEY || '').trim();
        if (!apiKey) {
            console.error(`[Trace: ${traceId}] [SMS Webhook Error] GEMINI_API_KEY is missing.`);
            return new NextResponse('<Response></Response>', {
                status: 200,
                headers: { 'Content-Type': 'text/xml' }
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const prompt = `${DENTAL_SYSTEM_PROMPT}\n\nPatient incoming SMS: "${userMessage}"\nGenerate the next SMS reply:`;

        const modelCandidates = ["gemini-1.5-pro", "gemini-pro"];
        let aiReply = "Thank you. Dr. Vance's team is reserving your private triage slot now.";

        for (const modelName of modelCandidates) {
            try {
                const model = genAI.getGenerativeModel({ 
                    model: modelName,
                    generationConfig: {
                        maxOutputTokens: 100,
                        temperature: 0.6
                    }
                });
                
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text()?.trim();

                if (text) {
                    aiReply = text;
                    console.log(JSON.stringify({
                        trace_id: traceId,
                        event: 'AI Response Generated',
                        model: modelName,
                        reply: aiReply
                    }));
                    break;
                }
            } catch (err: any) {
                console.warn(`[Trace: ${traceId}] [Failover Warning] Model ${modelName} failed. Trying next...`, err.message);
            }
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

        if (accountSid && authToken && twilioPhone) {
            const twilioClient = twilio(accountSid, authToken);
            await twilioClient.messages.create({
                body: aiReply,
                from: twilioPhone,
                to: fromPhone
            });
            console.log(JSON.stringify({
                trace_id: traceId,
                event: 'Twilio SMS Dispatched',
                to: fromPhone
            }));
        } else {
            console.warn(`[Trace: ${traceId}] [Twilio Warning] Credentials missing, SMS could not be dispatched.`);
        }

        return new NextResponse('<Response></Response>', {
            status: 200,
            headers: { 'Content-Type': 'text/xml' }
        });

    } catch (error: any) {
        console.error(`[Trace: ${traceId}] [Twilio Gemini Webhook Critical Error]:`, error);
        return new NextResponse('<Response></Response>', {
            status: 200,
            headers: { 'Content-Type': 'text/xml' }
        });
    }
}