import { NextResponse } from 'next/server';

declare global {
    var globalAppointments: any[] | undefined;
}

const appointmentsDatabase = global.globalAppointments || [];
if (!global.globalAppointments) {
    global.globalAppointments = appointmentsDatabase;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fullName, phone, appointmentDate, treatment } = body;

        if (!fullName || !phone || !appointmentDate) {
            return NextResponse.json({ success: false, error: 'Missing required booking fields.' }, { status: 400 });
        }

        const newAppointment = {
            id: `apt_${Date.now()}`,
            fullName: fullName.trim(),
            phone: phone.trim(),
            appointmentDate,
            treatment: treatment || 'General Consultation',
            status: 'CONFIRMED',
            createdAt: new Date().toISOString()
        };

        appointmentsDatabase.push(newAppointment);

        return NextResponse.json({ success: true, message: 'Appointment booked successfully!', appointment: newAppointment }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Server error during booking.' }, { status: 500 });
    }
}