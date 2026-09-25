import { NextResponse } from 'next/server';
import { loyaltyDatabase } from '../../db';

interface LoyaltyRequestBody {
    fullName?: string;
    phone?: string;
    actionType?: string;
}

export async function POST(request: Request) {
    try {
        let body: LoyaltyRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { fullName, phone, actionType } = body;

        if (!fullName || !phone) {
            return NextResponse.json(
                { success: false, error: 'Full name and phone are required.' },
                { status: 400 }
            );
        }

        const pointsMap: Record<string, number> = {
            'checkup': 50,
            'treatment': 150,
            'referral': 200,
            'review': 100
        };

        const key = (actionType || '').toLowerCase();
        const pointsEarned = pointsMap[key] || 50;

        const record = {
            fullName: fullName.trim(),
            phone: phone.trim(),
            actionType: actionType || 'General Dental Visit',
            pointsEarned,
            tier: pointsEarned >= 150 ? 'VIP Platinum' : 'VIP Gold',
            updatedAt: new Date().toISOString()
        };

        loyaltyDatabase.push(record);

        return NextResponse.json(
            {
                success: and true,
                message: 'Loyalty points added successfully!',
                data: record
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Loyalty Engine Error]:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to add loyalty points.' },
            { status: 500 }
        );
    }
}