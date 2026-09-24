import { NextResponse } from 'next/server';

// গ্লোবাল ডাটাবেস মেমোরি নিশ্চিত করার জন্য টাইপ সেফটিসহ
declare global {
    var globalEstimateDatabase: any[] | undefined;
}

export const estimateDatabase = global.globalEstimateDatabase || [];
if (!global.globalEstimateDatabase) {
    global.globalEstimateDatabase = estimateDatabase;
}

interface CostEstimateRequestBody {
    fullName?: string;
    phone?: string;
    symptom?: string;
    treatmentType?: string;
}

export async function POST(request: Request) {
    try {
        let body: CostEstimateRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { fullName, phone, symptom, treatmentType } = body;

        // ইনপুট ভ্যালিডেশন
        if (!treatmentType || typeof treatmentType !== 'string' || treatmentType.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Treatment type is required for cost estimation.' },
                { status: 400 }
            );
        }

        const cleanTreatment = treatmentType.trim().toLowerCase();
        let estimatedCost = '$100 - $300';
        let description = 'General consultation and basic procedure.';

        // চিকিৎসার ধরন অনুযায়ী ডায়নামিক খরচ নির্ধারণ
        switch (cleanTreatment) {
            case 'dental implants':
                estimatedCost = '$1,500 - $3,000 per tooth';
                description = 'Permanent titanium root replacement with crown.';
                break;
            case 'porcelain veneers':
                estimatedCost = '$800 - $1,500 per tooth';
                description = 'Custom-made shell to improve smile aesthetics.';
                break;
            case 'teeth whitening':
                estimatedCost = '$300 - $600';
                description = 'In-office professional laser whitening session.';
                break;
            default:
                estimatedCost = '$150 - $400';
                description = 'Standard dental examination and care.';
        }

        const estimateRecord = {
            id: `est_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            fullName: fullName ? fullName.trim() : 'Guest User',
            phone: phone ? phone.trim() : 'N/A',
            symptom: symptom ? symptom.trim() : 'General Checkup',
            treatmentType: treatmentType.trim(),
            estimatedCost,
            description,
            calculatedAt: new Date().toISOString()
        };

        estimateDatabase.push(estimateRecord);

        console.log(`[Cost Estimator] Estimate calculated for ${treatmentType} -> ${estimatedCost}`);

        return NextResponse.json(
            {
                success: true,
                message: 'Cost estimate successfully generated!',
                data: estimateRecord
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Cost Estimator Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to generate cost estimate. Please try again later.' 
            },
            { status: 500 }
        );
    }
}