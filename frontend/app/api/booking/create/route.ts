import { NextResponse } from 'next/server';
import { appointmentsDatabase } from '../db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fullName, phone, appointmentDate, treatment } = body;

        if (!fullName || !phone || !appointmentDate) {
            return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
        }

        const newAppointment = {
            id: `apt_create_${Date.now()}`,
            fullName: fullName.trim(),
            phone: phone.trim(),
            appointmentDate,
            treatment: treatment || 'Consultation',
            status: 'CONFIRMED',
            createdAt: new Date().toISOString()
        };

        appointmentsDatabase.push(newAppointment);

        return NextResponse.json({ success: true, message: 'Created successfully.', appointment: newAppointment }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Server error.' }, { status: 500 });
    }
}