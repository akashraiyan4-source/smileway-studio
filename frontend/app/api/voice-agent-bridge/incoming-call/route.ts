import { NextResponse } from 'next/server';
import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(request: Request) {
    try {
        const formData = await request.formData().catch(() => null);
        const callerPhone = formData?.get('From') || 'Unknown Caller';
        const callSid = formData?.get('CallSid') || 'Unknown SID';

        console.log(`[Voice Agent Bridge] Live inbound call received from ${callerPhone} (SID: ${callSid})`);

        const twiml = new VoiceResponse();

        const gather = twiml.gather({
            input: ['speech'] as any,
            action: '/api/voice-agent-bridge/process-speech',
            method: 'POST',
            timeout: 4,
            speechTimeout: 'auto',
            language: 'en-US'
        });

        gather.say({
            voice: 'Polly.Stephen-Neural' as any,
            language: 'en-US'
        }, 'Thank you for calling our VIP Dental Practice. I am Alex, your AI concierge. How can I help you with your dental needs today?');

        twiml.redirect('/api/voice-agent-bridge/incoming-call');

        return new NextResponse(twiml.toString(), {
            status: 200,
            headers: { 'Content-Type': 'text/xml' }
        });

    } catch (error) {
        console.error('[Inbound Voice Error]:', error);
        const twiml = new VoiceResponse();
        twiml.say('We are experiencing technical difficulties. Please call back shortly.');
        
        return new NextResponse(twiml.toString(), {
            status: 200,
            headers: { 'Content-Type': 'text/xml' }
        });
    }
}