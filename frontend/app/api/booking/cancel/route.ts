import { NextResponse } from 'next/server';
import { appointmentsDatabase } from '../book/route';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phone, appointmentId, cancellationReason } = body;

        if (!phone && !appointmentId) {
            return NextResponse.json({ success: false, error: 'Identifier is required for cancellation.' }, { status: 400 });
        }

        const appointment = appointmentsDatabase.find((apt: any) => 
            (appointmentId && apt.id === appointmentId) || (phone && apt.phone === phone.trim())
        );

        if (!appointment) {
            return NextResponse.json({ success: false, error: 'Active appointment not found.' }, { status: 404 });
        }

        appointment.status = 'CANCELLED';
        appointment.cancellationReason = cancellationReason || 'Not specified';
        appointment.cancelledAt = new Date().toISOString();

        return NextResponse.json({ success: true, message: 'Appointment cancelled successfully.', appointment }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Server error during cancellation.' }, { status: 500 });
    }
}