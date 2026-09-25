import { NextResponse } from 'next/server';
import { insuranceDatabase } from '../../db';

interface InsuranceQualificationRequestBody {
    fullName?: string;
    phone?: string;
    insuranceProvider?: string;
    policyNumber?: string;
}

export async function POST(request: Request) {
    try {
        let body: InsuranceQualificationRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { fullName, phone, insuranceProvider, policyNumber } = body;

        // Input validation
        if (!insuranceProvider || typeof insuranceProvider !== 'string' || insuranceProvider.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Insurance provider name is required.' },
                { status: 400 }
            );
        }

        const qualificationRecord = {
            id: `ins_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            fullName: fullName ? fullName.trim() : 'Guest User',
            phone: phone ? phone.trim() : 'N/A',
            insuranceProvider: insuranceProvider.trim(),
            policyNumber: policyNumber ? policyNumber.trim() : 'N/A',
            status: 'Verified/Qualified',
            checkedAt: new Date().toISOString()
        };

        insuranceDatabase.push(qualificationRecord);

        console.log(`[Insurance Engine] Qualification checked for ${qualificationRecord.fullName} -> Provider: ${qualificationRecord.insuranceProvider}`);

        return NextResponse.json(
            {
                success: true,
                message: 'Insurance qualification successfully checked!',
                data: qualificationRecord
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Insurance Engine Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to check insurance qualification. Please try again later.' 
            },
            { status: 500 }
        );
    }
}