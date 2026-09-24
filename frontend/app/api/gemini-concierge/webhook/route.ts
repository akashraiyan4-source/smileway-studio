import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import twilio from 'twilio';

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
    try {
        // Twilio সাধারণত x-www-form-urlencoded ফরম্যাটে ডাটা পাঠায়
        const contentType = request.headers.get('content-type') || '';
        let fromPhone = '';
        let userMessage = '';

        if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await request.formData();
            fromPhone = (formData.get('From') as string) || '';
            userMessage = (formData.get('Body') as string) || '';
        } else {
            // যদি JSON আকারে আসে
            const body = await request.json().catch(() => ({}));
            fromPhone = body.From || '';
            userMessage = body.Body || '';
        }

        if (!fromPhone || !userMessage) {
            console.warn('[SMS Webhook Warning] Missing From or Body in incoming request.');
            return new NextResponse('<Response></Response>', {
                status: 200,
                headers: { 'Content-Type': 'text/xml' }
            });
        }

        console.log(`[SMS Received] From ${fromPhone}: "${userMessage}"`);

        const apiKey = (process.env.GEMINI_API_KEY || '').trim();
        if (!apiKey) {
            console.error('[SMS Webhook Error] GEMINI_API_KEY is missing.');
            return new NextResponse('<Response></Response>', {
                status: 200,
                headers: { 'Content-Type': 'text/xml' }
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const prompt = `${DENTAL_SYSTEM_PROMPT}\n\nPatient incoming SMS: "${userMessage}"\nGenerate the next SMS reply:`;

        // এন্টারপ্রাইজ লেভেল মডেল ফেইলওভার ক্যান্ডিডেটস
        const modelCandidates = ["gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-1.5-flash"];
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
                    console.log(`[Gemini Reply using ${modelName}] "${aiReply}"`);
                    break;
                }
            } catch (err) {
                console.warn(`[Failover Warning] Model ${modelName} failed. Trying next...`, err);
            }
        }

        // Twilio Client ইনিশিয়ালাইজেশন
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
            console.log(`[Twilio Success] Message dispatched to ${fromPhone}`);
        } else {
            console.warn('[Twilio Warning] Credentials missing, SMS could not be dispatched via API.');
        }

        // Twilio এর নিয়ম অনুযায়ী TwiXML রেসপন্স পাঠানো
        return new NextResponse('<Response></Response>', {
            status: 200,
            headers: { 'Content-Type': 'text/xml' }
        });

    } catch (error) {
        console.error('[Twilio Gemini Webhook Critical Error]:', error);
        // ক্র্যাশ রোধ করতে সবসময় খালি TwiXML রেসপন্স রিটার্ন করা হয়
        return new NextResponse('<Response></Response>', {
            status: 200,
            headers: { 'Content-Type': 'text/xml' }
        });
    }
}