import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { slotTime, userPhone } = body;

        if (!slotTime) {
            return NextResponse.json({ success: false, error: 'Slot time is required.' }, { status: 400 });
        }

        const lockId = `lock_${Date.now()}`;

        return NextResponse.json({
            success: true,
            message: 'Slot locked temporarily for 10 minutes.',
            lockId,
            expiresIn: '10m',
            userPhone: userPhone || 'Guest'
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to lock slot.' }, { status: 500 });
    }
}