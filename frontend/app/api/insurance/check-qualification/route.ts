import { NextResponse } from 'next/server';

// গ্লোবাল ডাটাবেস মেমোরি নিশ্চিত করার জন্য টাইপ সেফটিসহ
declare global {
    var globalInsuranceDatabase: any[] | undefined;
}

export const insuranceDatabase = global.globalInsuranceDatabase || [];
if (!global.globalInsuranceDatabase) {
    global.globalInsuranceDatabase = insuranceDatabase;
}

interface InsuranceRequestBody {
    fullName?: string;
    phone?: string;
    insuranceProvider?: string;
    preferredPaymentPlan?: string;
}

export async function POST(request: Request) {
    try {
        let body: InsuranceRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { fullName, phone, insuranceProvider, preferredPaymentPlan } = body;

        // ইনপুট ভ্যালিডেশন
        if (!fullName || typeof fullName !== 'string' || fullName.trim() === '' || 
            !phone || typeof phone !== 'string' || phone.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Full name and phone are required fields.' },
                { status: 400 }
            );
        }

        let isQualified = true;
        let qualificationMessage = 'Congratulations! Your insurance provider is accepted, and you qualify for our 0% interest flexible payment plans.';

        // গ্রহণযোগ্য ইন্স্যুরেন্স প্রোভাইডারসমূহের তালিকা
        const acceptedProviders = ['delta dental', 'metlife', 'cigna', 'guardian', 'aetna'];
        
        if (insuranceProvider && !acceptedProviders.includes(insuranceProvider.toLowerCase().trim())) {
            isQualified = false;
            qualificationMessage = 'We are an out-of-network provider for this insurance, but we offer custom in-house monthly payment plans!';
        }

        const record = {
            id: `ins_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            fullName: fullName.trim(),
            phone: phone.trim(),
            insuranceProvider: insuranceProvider ? insuranceProvider.trim() : 'None/Cash',
            preferredPaymentPlan: preferredPaymentPlan ? preferredPaymentPlan.trim() : 'Standard',
            isQualified,
            qualificationMessage,
            checkedAt: new Date().toISOString()
        };

        insuranceDatabase.push(record);

        console.log(`[Insurance Engine] Pre-qualification checked for ${fullName} -> Qualified: ${isQualified}`);

        return NextResponse.json(
            {
                success: true,
                message: 'Payment and insurance pre-qualification completed!',
                data: record
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Insurance Engine Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to process insurance pre-qualification. Please try again later.' 
            },
            { status: 500 }
        );
    }
}