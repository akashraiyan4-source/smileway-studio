import { NextResponse } from 'next/server';
import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST() {
    const twiml = new VoiceResponse();
    twiml.say({
        voice: 'Polly.Stephen-Neural' as any,
        language: 'en-US'
    }, 'The on-call doctor is currently attending another patient. We will call you back immediately. Goodbye.');
    twiml.hangup();

    return new NextResponse(twiml.toString(), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' }
    });
}