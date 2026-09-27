import { NextResponse } from 'next/server';
import { invoiceDatabase } from '@/app/api/db'; // সেন্ট্রাল ডেটাবেজে লগ রাখার জন্য (যদি db.ts ফাইলে invoiceDatabase অ্যারে যুক্ত থাকে)

interface InvoiceRequestBody {
    fullName?: string;
    phone?: string;
    treatmentName?: string;
    amount?: number;
}

export async function POST(request: Request) {
    try {
        let body: InvoiceRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { fullName, phone, treatmentName, amount } = body;

        // ইনপুট ভ্যালিডেশন
        if (!fullName || typeof fullName !== 'string' || fullName.trim() === '' ||
            !phone || typeof phone !== 'string' || phone.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Full name and phone are required for generating an invoice.' },
                { status: 400 }
            );
        }

        const cleanName = fullName.trim();
        const cleanPhone = phone.trim();
        const cleanTreatment = treatmentName ? treatmentName.trim() : 'VIP Dental Consultation / Treatment';
        const cleanAmount = amount && typeof amount === 'number' ? amount : 150; // ডিফল্ট হাই-টিকেট ফি $150

        // ইউনিক ইনভয়েস আইডি এবং সিকিউর পেমেন্ট লিংক জেনারেট করা
        const invoiceId = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
        const securePaymentLink = `https://smileway.store/pay/${invoiceId}`;

        const invoiceRecord = {
            id: `inv_rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            invoiceId,
            fullName: cleanName,
            phone: cleanPhone,
            treatment: cleanTreatment,
            amountUSD: cleanAmount,
            paymentStatus: 'Pending Secure Payment',
            securePaymentLink,
            generatedAt: new Date().toISOString()
        };

        // সেন্ট্রাল ডেটাবেজে যুক্ত করা (যদি db.ts ফাইলে অ্যারে থাকে)
        try {
            if (typeof invoiceDatabase !== 'undefined' && Array.isArray(invoiceDatabase)) {
                invoiceDatabase.push(invoiceRecord);
            }
        } catch (dbError) {
            console.warn('[Invoice DB Warning]: Could not push to central invoice database, proceeding with response.');
        }

        console.log(`[Payment & Invoice Engine] Generated secure invoice ${invoiceId} for ${cleanName} amounting to $${cleanAmount}`);

        return NextResponse.json(
            {
                success: true,
                message: 'Invoice and secure payment link generated successfully!',
                data: invoiceRecord
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Payment & Invoice Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to generate payment invoice. Please try again later.' 
            },
            { status: 500 }
        );
    }
}