import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// SaaS-grade type safety
interface ChatRequestBody {
    message?: string;
    userPhone?: string;
}

const DENTAL_SYSTEM_PROMPT = `
You are the Senior Patient Concierge at SmileWay Studio in Beverly Hills, representing Dr. Julian Vance, DDS.
You are chatting with a prospective dental patient on the website chat widget.
Strict rules:
1. Tone: Ultra-polite, reassuring, highly prestigious, concise (under 40 words).
2. Never give explicit price tags. Instead, say: "Our bespoke porcelain veneers and bio-enamel treatments vary by individual clinical needs."
3. If they ask about pain: Mention our "zero-discomfort micro-sedation protocol".
4. Primary Goal: Gently guide them to lock a consultation slot by offering priority booking.
`;

export async function POST(request: Request) {
    try {
        // Safe body parsing to prevent server crash on malformed JSON
        let body: ChatRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { message, userPhone } = body;

        // Input validation
        if (!message || typeof message !== 'string' || message.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Message field is required and must be a valid text.' },
                { status: 400 }
            );
        }

        const sanitizedMessage = message.trim();
        console.log(`[AI Concierge] Received query from ${userPhone || 'WebVisitor'}: "${sanitizedMessage}"`);

        const apiKey = (process.env.GEMINI_API_KEY || '').trim();
        if (!apiKey) {
            console.error('[AI Concierge Error] GEMINI_API_KEY is missing in environment variables.');
            return NextResponse.json(
                { success: false, error: 'Internal server configuration error.' },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const prompt = `${DENTAL_SYSTEM_PROMPT}\n\nPatient Query: ${sanitizedMessage}`;

        // Enterprise-level failover model candidates for high availability and speed
        const modelCandidates = ["gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-flash-lite-latest"];

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
                const aiResponse = response.text()?.trim();

                if (!aiResponse) {
                    continue; // Try next model if response is empty
                }

                console.log(`[AI Concierge Reply using ${modelName}] "${aiResponse}"`);

                return NextResponse.json({
                    success: true,
                    reply: aiResponse
                }, { status: 200 });

            } catch (err) {
                console.warn(`[Failover Warning] Model ${modelName} failed or busy. Attempting next...`, err);
            }
        }

        // Graceful degradation response if all AI models fail
        return NextResponse.json(
            { 
                success: true, 
                reply: "Our bespoke porcelain veneers and bio-enamel treatments vary by individual clinical needs. Would you like to secure a priority consultation with Dr. Julian Vance?" 
            }, 
            { status: 200 }
        );

    } catch (error) {
        console.error('[AI Concierge Critical Error]', error);
        // Guaranteed safe fallback response preventing server crash
        return NextResponse.json(
            { success: false, error: 'AI Concierge is temporarily unavailable. Please try again shortly.' },
            { status: 500 }
        );
    }
}