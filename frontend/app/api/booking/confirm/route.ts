import { NextResponse } from 'next/server';
import { appointmentsDatabase } from '../book/route';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { appointmentId, phone } = body;

        const appointment = appointmentsDatabase.find((apt: any) => 
            (appointmentId && apt.id === appointmentId) || (phone && apt.phone === phone.trim())
        );

        if (!appointment) {
            return NextResponse.json({ success: false, error: 'Appointment not found.' }, { status: 404 });
        }

        appointment.status = 'CONFIRMED';
        appointment.updatedAt = new Date().toISOString();

        return NextResponse.json({ success: true, message: 'Appointment confirmed!', appointment }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Server error.' }, { status: 500 });
    }
}