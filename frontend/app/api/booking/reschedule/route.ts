import { NextResponse } from 'next/server';
import { appointmentsDatabase } from '../book/route';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { appointmentId, phone, newDate, reason } = body;

        if ((!appointmentId && !phone) || !newDate) {
            return NextResponse.json({ success: false, error: 'Identifier and newDate required.' }, { status: 400 });
        }

        const appointment = appointmentsDatabase.find((apt: any) => 
            (appointmentId && apt.id === appointmentId) || (phone && apt.phone === phone.trim())
        );

        if (!appointment) {
            return NextResponse.json({ success: false, error: 'Appointment not found.' }, { status: 404 });
        }

        const previousDate = appointment.appointmentDate;
        appointment.appointmentDate = newDate;
        appointment.status = 'RESCHEDULED';
        appointment.rescheduleReason = reason || 'Client requested';
        appointment.previousDate = previousDate;
        appointment.updatedAt = new Date().toISOString();

        return NextResponse.json({ success: true, message: 'Rescheduled successfully!', appointment }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Server error during reschedule.' }, { status: 500 });
    }
}