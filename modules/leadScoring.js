import { NextResponse } from 'next/server';

// গ্লোবাল ডাটাবেস মেমোরি নিরাপদ রাখার জন্য টাইপ সেফটিসহ
declare global {
    var globalScoredLeadsDatabase: any[] | undefined;
}

export const scoredLeadsDatabase = global.globalScoredLeadsDatabase || [];
if (!global.globalScoredLeadsDatabase) {
    global.globalScoredLeadsDatabase = scoredLeadsDatabase;
}

interface ScoreLeadRequestBody {
    fullName?: string;
    phone?: string;
    treatment?: string;
    budget?: string;
}

export async function POST(request: Request) {
    try {
        let body: ScoreLeadRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { fullName, phone, treatment, budget } = body;

        // ইনপুট ভ্যালিডেশন
        if (!fullName || typeof fullName !== 'string' || fullName.trim() === '' ||
            !phone || typeof phone !== 'string' || phone.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Full name and phone are required for scoring.' },
                { status: 400 }
            );
        }

        let score = 50; // বেস বা প্রাথমিক স্কোর
        let tier = 'Standard Lead';

        const cleanTreatment = treatment ? treatment.trim() : 'General Consultation';
        const cleanBudget = budget ? budget.trim() : 'Standard';

        // ট্রিটমেন্ট বা বাজেটের ওপর ভিত্তি করে ভিআইপি স্কোর ক্যালকুলেশন
        const highValueTreatments = ['Porcelain Veneers', 'Dental Implants', 'Full Smile Makeover'];
        if (highValueTreatments.some(t => t.toLowerCase() === cleanTreatment.toLowerCase())) {
            score += 30;
        }

        if (cleanBudget.toLowerCase() === 'high' || cleanBudget.toLowerCase() === 'vip') {
            score += 20;
        }

        if (score >= 80) {
            tier = '🔥 Tier 1: VIP High-Intent Lead';
        } else if (score >= 60) {
            tier = '⭐ Tier 2: Warm Lead';
        }

        const scoredLead = {
            id: `score_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            fullName: fullName.trim(),
            phone: phone.trim(),
            treatment: cleanTreatment,
            budget: cleanBudget,
            score,
            tier,
            scoredAt: new Date().toISOString()
        };

        scoredLeadsDatabase.push(scoredLead);

        console.log(`[Lead Scoring Engine] ${scoredLead.fullName} scored ${score} -> Classified as: ${tier}`);

        return NextResponse.json(
            {
                success: true,
                message: 'Lead successfully scored and segmented!',
                leadData: scoredLead
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Lead Scoring Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to score and segment lead. Please try again later.' 
            },
            { status: 500 }
        );
    }
}