import { NextResponse } from 'next/server';
import { leadsDatabase } from '../../db';

interface LeadRequestBody {
    fullName?: string;
    phone?: string;
    treatment?: string;
}

export async function POST(request: Request) {
    try {
        let body: LeadRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { fullName, phone, treatment } = body;

        // ইনপুট ভ্যালিডেশন
        if (!fullName || typeof fullName !== 'string' || fullName.trim() === '' ||
            !phone || typeof phone !== 'string' || phone.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Full name and phone are required fields.' },
                { status: 400 }
            );
        }

        // নিরাপদ লিড অবজেক্ট তৈরি
        const newLead = {
            id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            fullName: fullName.trim(),
            phone: phone.trim(),
            treatment: treatment ? treatment.trim() : 'General Consultation',
            date: new Date().toISOString()
        };

        leadsDatabase.push(newLead);

        console.log(`\n[Lead Ingested] ${newLead.fullName} (${newLead.phone}) -> ${newLead.treatment}`);

        return NextResponse.json(
            { 
                success: true, 
                message: 'VIP Consultation request received successfully!',
                data: newLead
            },
            { status: 201 }
        );

    } catch (err: any) {
        console.error('Error processing lead:', err);
        return NextResponse.json(
            { success: false, error: err.message || 'Failed to process lead.' },
            { status: 500 }
        );
    }
}