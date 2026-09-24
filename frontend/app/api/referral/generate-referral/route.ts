import { NextResponse } from 'next/server';

// গ্লোবাল ডাটাবেস মেমোরি নিরাপদ রাখার জন্য টাইপ সেফটিসহ
declare global {
    var globalReferralDatabase: any[] | undefined;
}

export const referralDatabase = global.globalReferralDatabase || [];
if (!global.globalReferralDatabase) {
    global.globalReferralDatabase = referralDatabase;
}

interface ReferralRequestBody {
    fullName?: string;
    phone?: string;
}

export async function POST(request: Request) {
    try {
        let body: ReferralRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { fullName, phone } = body;

        // ইনপুট ভ্যালিডেশন
        if (!fullName || typeof fullName !== 'string' || fullName.trim() === '' ||
            !phone || typeof phone !== 'string' || phone.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Full name and phone are required fields.' },
                { status: 400 }
            );
        }

        const cleanName = fullName.trim();
        // ইউনিক রেফারেল কোড জেনারেট করা
        const prefix = cleanName.substring(0, 3).toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const referralCode = `VIP-${prefix}-${randomNum}`;
        const referralLink = `https://smileway.store/referral?code=${referralCode}`;

        const referralRecord = {
            id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            fullName: cleanName,
            phone: phone.trim(),
            referralCode,
            referralLink,
            rewardsEarned: 'Pending First Successful Referral',
            generatedAt: new Date().toISOString()
        };

        referralDatabase.push(referralRecord);

        console.log(`[Referral Engine] Generated referral link for ${cleanName} -> Code: ${referralCode}`);

        return NextResponse.json(
            {
                success: true,
                message: 'Referral link and code successfully generated!',
                data: referralRecord
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Referral Engine Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to generate referral details. Please try again later.' 
            },
            { status: 500 }
        );
    }
}