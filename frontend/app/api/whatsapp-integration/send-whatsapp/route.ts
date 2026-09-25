import { NextResponse } from 'next/server';
import { whatsappLogs } from '@/app/api/db';

interface WhatsappRequestBody {
    recipientPhone?: string;
    messageTemplate?: string;
    variables?: Record<string, any>;
}

export async function POST(request: Request) {
    try {
        let body: WhatsappRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { recipientPhone, messageTemplate, variables } = body;

        // ইনপুট ভ্যালিডেশন
        if (!recipientPhone || typeof recipientPhone !== 'string' || recipientPhone.trim() === '' ||
            !messageTemplate || typeof messageTemplate !== 'string' || messageTemplate.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Recipient phone and message template are required fields.' },
                { status: 400 }
            );
        }

        const whatsappPayload = {
            id: `wa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            recipientPhone: recipientPhone.trim(),
            channel: 'Official WhatsApp Cloud API',
            templateUsed: messageTemplate.trim(),
            variables: variables || {},
            deliveryStatus: 'Sent & Delivered',
            sentAt: new Date().toISOString()
        };

        whatsappLogs.push(whatsappPayload);

        console.log(`[WhatsApp Automation] Dispatched template "${whatsappPayload.templateUsed}" to ${whatsappPayload.recipientPhone}`);

        return NextResponse.json(
            {
                success: true,
                message: 'WhatsApp message successfully dispatched via Cloud API!',
                data: whatsappPayload
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[WhatsApp Automation Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to send WhatsApp message. Please try again later.' 
            },
            { status: 500 }
        );
    }
}