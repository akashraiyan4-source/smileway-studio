import { NextResponse } from 'next/server';
import { appointmentsDatabase } from '../../db';

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        
        // Flexible fallback if frontend doesn't send name or phone yet
        const fullName = body?.fullName || body?.name || 'Valued Patient';
        const phone = body?.phone || 'Not Provided';
        const appointmentDate = body?.appointmentDate || body?.date || new Date().toISOString();
        const treatment = body?.treatment || 'Consultation';

        const newAppointment = {
            id: `apt_create_${Date.now()}`,
            fullName: fullName.trim(),
            phone: phone.trim(),
            appointmentDate,
            treatment,
            status: 'CONFIRMED',
            createdAt: new Date().toISOString()
        };

        // Ensure database array exists
        if (Array.isArray(appointmentsDatabase)) {
            appointmentsDatabase.push(newAppointment);
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Slot reserved successfully.', 
            appointment: newAppointment 
        }, { status: 201 });

    } catch (error: any) {
        console.error("Booking Create Error:", error?.message || error);
        return NextResponse.json({ success: false, error: 'Server error during slot reservation.' }, { status: 500 });
    }
}