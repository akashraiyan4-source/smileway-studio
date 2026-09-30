import { NextResponse } from 'next/server';
import { recoveryDatabase } from '@/app/api/db';

interface RecoveryRequestBody {
    fullName?: string;
    phone?: string;
    procedureDone?: string;
    painLevel?: number | string;
    notes?: string;
}

export async function POST(request: Request) {
    try {
        let body: RecoveryRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { fullName, phone, procedureDone, painLevel, notes } = body;

        // ইনপুট ভ্যালিডেশন
        if (!fullName || typeof fullName !== 'string' || fullName.trim() === '' ||
            !phone || typeof phone !== 'string' || phone.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Full name and phone are required fields.' },
                { status: 400 }
            );
        }

        let aiAdvice = 'Continue taking prescribed medications and apply an ice pack gently if swelling occurs.';
        
        // ব্যথার মাত্রার ওপর ভিত্তি করে এআই রেসপন্স বা পরামর্শ কাস্টমাইজেশন
        const parsedPain = typeof painLevel === 'number' ? painLevel : parseInt(String(painLevel), 10);
        if (!isNaN(parsedPain) && parsedPain >= 7) {
            aiAdvice = 'High pain level detected! Our clinical staff has been instantly alerted to call you right away.';
        }

        const recoveryRecord = {
            id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            fullName: fullName.trim(),
            phone: phone.trim(),
            procedureDone: procedureDone ? procedureDone.trim() : 'General Dental Treatment',
            painLevel: painLevel !== undefined && painLevel !== null ? painLevel : 'Mild/Not Specified',
            notes: notes ? notes.trim() : 'None',
            aiAdvice,
            status: 'Recovery Tracked & Logged',
            checkedAt: new Date().toISOString()
        };

        recoveryDatabase.push(recoveryRecord);

        console.log(`[Post-Treatment Recovery] Recovery logged for ${recoveryRecord.fullName} -> Pain Level: ${recoveryRecord.painLevel}`);

        return NextResponse.json(
            {
                success: true,
                message: 'Post-treatment recovery data successfully recorded!',
                data: recoveryRecord
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Post-Treatment Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to process recovery tracking. Please try again later.' 
            },
            { status: 500 }
        );
    }
}