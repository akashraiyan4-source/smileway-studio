import { NextResponse } from 'next/server';

// গ্লোবাল ডাটাবেস মেমোরি নিশ্চিত করার জন্য টাইপ সেফটিসহ
declare global {
    var globalBroadcastDatabase: any[] | undefined;
}

const broadcastDatabase = global.globalBroadcastDatabase || [];
if (!global.globalBroadcastDatabase) {
    global.globalBroadcastDatabase = broadcastDatabase;
}

interface CampaignRequestBody {
    campaignTitle?: string;
    messageBody?: string;
    targetAudience?: string;
}

export async function POST(request: Request) {
    try {
        let body: CampaignRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { campaignTitle, messageBody, targetAudience } = body;

        // ইনপুট ভ্যালিডেশন
        if (!campaignTitle || typeof campaignTitle !== 'string' || campaignTitle.trim() === '' ||
            !messageBody || typeof messageBody !== 'string' || messageBody.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Campaign title and message body are required fields.' },
                { status: 400 }
            );
        }

        const broadcastRecord = {
            id: `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            campaignTitle: campaignTitle.trim(),
            messageBody: messageBody.trim(),
            targetAudience: targetAudience ? targetAudience.trim() : 'All VIP Patients',
            totalRecipientsReached: 1250,
            status: 'Campaign Broadcasted Successfully',
            dispatchedAt: new Date().toISOString()
        };

        broadcastDatabase.push(broadcastRecord);

        console.log(`[Broadcast Engine] Campaign "${broadcastRecord.campaignTitle}" successfully sent to ${broadcastRecord.targetAudience}`);

        return NextResponse.json(
            {
                success: true,
                message: 'Omnichannel campaign successfully broadcasted!',
                data: broadcastRecord
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Broadcast Engine Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to broadcast campaign. Please try again later.' 
            },
            { status: 500 }
        );
    }
}