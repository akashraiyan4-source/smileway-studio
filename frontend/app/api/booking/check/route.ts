import { NextResponse } from 'next/server';
import { appointmentsDatabase } from '../db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get('phone');

        if (!phone) {
            return NextResponse.json({ success: false, error: 'Phone query parameter is required.' }, { status: 400 });
        }

        const activeAppointment = appointmentsDatabase.find(
            (apt: any) => apt.phone === phone.trim() && apt.status !== 'CANCELLED'
        );

        if (!activeAppointment) {
            return NextResponse.json({ success: false, message: 'No active appointment found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, appointment: activeAppointment }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Server error checking appointment.' }, { status: 500 });
    }
}