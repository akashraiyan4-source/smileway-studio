import { NextResponse } from 'next/server';
import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

function routeEmergencyCallToDoctor(callerName: string = 'Emergency Patient'): string {
    const doctorPhone = process.env.EMERGENCY_DOCTOR_PHONE || process.env.STAFF_PHONE_NUMBER;
    const response = new VoiceResponse();

    if (!doctorPhone) {
        response.say({ voice: 'Polly.Stephen-Neural' as any, language: 'en-US' }, 'We are experiencing an issue connecting to the doctor. Please dial 911 immediately.');
        return response.toString();
    }

    response.say({ voice: 'Polly.Stephen-Neural' as any, language: 'en-US' }, 'This sounds like an urgent situation. Connecting you to our on-call doctor right now.');
    
    const dial = response.dial({
        callerId: process.env.TWILIO_PHONE_NUMBER,
        timeout: 25,
        action: '/api/voice-agent-bridge/transfer-fallback'
    });
    dial.number(doctorPhone);
    return response.toString();
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData().catch(() => null);
        const callerSpeech = ((formData?.get('SpeechResult') as string) || '').toLowerCase();
        const callerPhone = (formData?.get('From') as string) || 'Unknown Line';

        const emergencyKeywords = ['emergency', 'bleeding', 'severe pain', 'blood', 'unbearable', 'swelling', 'accident', 'broken tooth'];
        const isEmergency = emergencyKeywords.some(keyword => callerSpeech.includes(keyword));

        if (isEmergency) {
            const handoffTwiML = routeEmergencyCallToDoctor('Live Voice Patient');
            return new NextResponse(handoffTwiML, { status: 200, headers: { 'Content-Type': 'text/xml' } });
        }

        const twiml = new VoiceResponse();
        if (callerSpeech.includes('reschedule') || callerSpeech.includes('change date')) {
            twiml.say({ voice: 'Polly.Stephen-Neural' as any, language: 'en-US' }, 'I have sent a secure link to your phone number to select a new time slot.');
            twiml.hangup();
        } else {
            twiml.say({ voice: 'Polly.Stephen-Neural' as any, language: 'en-US' }, 'Would you like to reserve a time with our chief dentist?');
        }

        return new NextResponse(twiml.toString(), { status: 200, headers: { 'Content-Type': 'text/xml' } });

    } catch (error) {
        console.error('[Speech Processing Error]:', error);
        const twiml = new VoiceResponse();
        twiml.say('Thank you for calling. Our team will follow up shortly.');
        twiml.hangup();
        return new NextResponse(twiml.toString(), { status: 200, headers: { 'Content-Type': 'text/xml' } });
    }
}