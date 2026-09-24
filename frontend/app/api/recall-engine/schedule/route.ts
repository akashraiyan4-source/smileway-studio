import { NextResponse } from 'next/server';

// গ্লোবাল মেমোরি ডাটাবেস নিশ্চিত করার জন্য টাইপ সেফটিসহ
declare global {
    var globalRecallDatabase: any[] | undefined;
}

export const recallDatabase = global.globalRecallDatabase || [];
if (!global.globalRecallDatabase) {
    global.globalRecallDatabase = recallDatabase;
}

interface RecallRequestBody {
    action?: string;
    name?: string;
    phone?: string;
    niche?: string;
    appointmentDate?: string;
}

// নিশ-নির্দিষ্ট ফলোআপ মেসেজ টেমপ্লেট জেনারেটর
const getMessageContent = (lead: any) => {
    const bookingLink = `https://smileway.studio/book?lead=${lead.lead_id}`;
    switch (lead.niche) {
        case 'cosmetic':
            return `Hi ${lead.name}, it is time for your Botox/Glow maintenance session to keep your radiant look! Claim your priority slot: ${bookingLink}`;
        case 'roofing':
            return `Hi ${lead.name}, seasonal storms are approaching. Schedule your complimentary 12-point roof health inspection: ${bookingLink}`;
        case 'dental':
        default:
            return `Hi ${lead.name}, Dr. Vance recommends your routine 6-month cleaning & polishing checkup. Click here to pick your VIP slot: ${bookingLink}`;
    }
};

export async function POST(request: Request) {
    try {
        let body: RecallRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { action, name, phone, niche, appointmentDate } = body;

        // অ্যাকশন ১: নতুন অ্যাপয়েন্টমেন্ট শিডিউল ও রিকল ডেট নির্ধারণ
        if (action === 'schedule') {
            if (!name || !phone || !appointmentDate) {
                return NextResponse.json(
                    { success: false, error: 'Name, phone, and appointmentDate are required for scheduling.' },
                    { status: 400 }
                );
            }

            const serviceDate = new Date(appointmentDate);
            const recallDate = new Date(serviceDate);
            const cleanNiche = niche ? niche.toLowerCase().trim() : 'dental';

            // নিশ অনুযায়ী পরবর্তী রিকল সময় নির্ধারণ
            if (cleanNiche === 'cosmetic') {
                recallDate.setMonth(recallDate.getMonth() + 4); // ৪ মাস পর
            } else if (cleanNiche === 'roofing') {
                recallDate.setMonth(recallDate.getMonth() + 6); // সিজনাল ৬ মাস পর
            } else {
                recallDate.setMonth(recallDate.getMonth() + 6); // ডেন্টাল রুটিন চেকআপ ৬ মাস পর
            }

            const leadRecord = {
                lead_id: `LEAD-${Date.now()}`,
                name: name.trim(),
                phone: phone.trim(),
                niche: cleanNiche,
                service_completed_at: serviceDate.toISOString(),
                next_recall_due_at: recallDate.toISOString(),
                recall_status: 'pending'
            };

            recallDatabase.push(leadRecord);
            console.log(`[Database] Appointment Confirmed for ${leadRecord.name} (${leadRecord.phone}). Next Recall: ${leadRecord.next_recall_due_at}`);

            return NextResponse.json(
                {
                    success: true,
                    message: 'Appointment scheduled and recall tracking initialized!',
                    data: leadRecord
                },
                { status: 201 }
            );
        }

        // অ্যাকশন ২: দৈনিক রিকল চেকআপ বা ডিসপ্যাচ ট্রিগার করা
        if (action === 'run-recall-engine') {
            console.log('[Recall Engine] Running manual/cron checkup dispatch...');
            const now = new Date();
            let dispatchedCount = 0;

            recallDatabase.forEach((lead: any) => {
                if (lead.recall_status === 'pending' && new Date(lead.next_recall_due_at) <= now) {
                    const message = getMessageContent(lead);
                    console.log(`[Dispatch SMS/WhatsApp] To: ${lead.phone} | Content: "${message}"`);
                    lead.recall_status = 'sent';
                    dispatchedCount++;
                }
            });

            return NextResponse.json(
                {
                    success: true,
                    message: `Recall engine executed successfully. Dispatched ${dispatchedCount} reminders.`,
                    totalPending: recallDatabase.filter((l: any) => l.recall_status === 'pending').length
                },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Invalid action provided. Use "schedule" or "run-recall-engine".' },
            { status: 400 }
        );

    } catch (error) {
        console.error('[Recall Engine Critical Error]:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process recall engine operation.' },
            { status: 500 }
        );
    }
}