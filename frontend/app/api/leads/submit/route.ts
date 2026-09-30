import { NextResponse } from 'next/server';
import { leadsDatabase } from '../../db';

interface LeadRequestBody {
    fullName?: string;
    phone?: string;
    treatment?: string;
    tenantId?: string; // মাল্টি-টেন্যান্ট সাপোর্ট নিশ্চিত করার জন্য
}

export async function POST(request: Request) {
    // Phase 9: Structured Trace-ID generation for tracking every request
    const traceId = request.headers.get('x-trace-id') || `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    try {
        let body: LeadRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.', trace_id: traceId },
                { status: 400 }
            );
        }

        const { fullName, phone, treatment, tenantId = 'default_tenant' } = body;

        // ইনপুট ভ্যালিডেশন
        if (!fullName || typeof fullName !== 'string' || fullName.trim() === '' ||
            !phone || typeof phone !== 'string' || phone.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Full name and phone are required fields.', trace_id: traceId },
                { status: 400 }
            );
        }

        const cleanPhone = phone.trim();

        // Phase 1: Distributed Idempotency / Duplicate Prevention 
        // একই টেন্যান্টের মধ্যে একই ফোন নম্বর যেন বারবার ডুপ্লিকেট এন্ট্রি না হয়
        const existingLead = leadsDatabase.find(
            (lead: any) => lead.phone === cleanPhone && lead.tenantId === tenantId
        );

        if (existingLead) {
            return NextResponse.json(
                { 
                    success: true, 
                    message: 'Lead already exists (Idempotent response).', 
                    data: existingLead,
                    trace_id: traceId
                },
                { status: 200 } // আগের ডেটাই সফলভাবে রিটার্ন করবে
            );
        }

        // নিরাপদ এবং টেন্যান্ট-সচেতন লিড অবজেক্ট তৈরি (Phase 3 & 7)
        const newLead = {
            id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            tenantId: tenantId,
            fullName: fullName.trim(),
            phone: cleanPhone,
            treatment: treatment ? treatment.trim() : 'General Consultation',
            date: new Date().toISOString()
        };

        leadsDatabase.push(newLead);

        // Phase 9: Structured Trace-ID Logging
        console.log(JSON.stringify({
            trace_id: traceId,
            event: 'Lead Ingested',
            tenant_id: tenantId,
            lead_id: newLead.id,
            phone: newLead.phone,
            timestamp: newLead.date
        }));

        return NextResponse.json(
            { 
                success: true, 
                message: 'VIP Consultation request received successfully!',
                data: newLead,
                trace_id: traceId
            },
            { status: 201 }
        );

    } catch (err: any) {
        console.error(`[Trace: ${traceId}] Error processing lead:`, err);
        return NextResponse.json(
            { success: false, error: err.message || 'Failed to process lead.', trace_id: traceId },
            { status: 500 }
        );
    }
}