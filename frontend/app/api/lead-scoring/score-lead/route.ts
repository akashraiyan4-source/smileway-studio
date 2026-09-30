import { NextResponse } from 'next/server';
import { scoredLeadsDatabase } from '../../db';

interface ScoreLeadRequestBody {
    fullName?: string;
    phone?: string;
    treatment?: string;
    budget?: string;
    tenantId?: string; // Multi-tenant support er jonno
}

export async function POST(request: Request) {
    // Phase 9: Structured Trace-ID generation for tracking every request
    const traceId = request.headers.get('x-trace-id') || `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    try {
        let body: ScoreLeadRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.', trace_id: traceId },
                { status: 400 }
            );
        }

        const { fullName, phone, treatment, budget, tenantId = 'default_tenant' } = body;

        // Input validation
        if (!fullName || typeof fullName !== 'string' || fullName.trim() === '' ||
            !phone || typeof phone !== 'string' || phone.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Full name and phone are required for scoring.', trace_id: traceId },
                { status: 400 }
            );
        }

        let score = 50; // Base score
        let tier = 'Standard Lead';

        const cleanTreatment = treatment ? treatment.trim() : 'General Consultation';
        const cleanBudget = budget ? budget.trim() : 'Standard';

        // Treatment ba budget er upor ভিত্তি kore VIP score calculation
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
            tenantId: tenantId, // Tenant isolation ensure korar jonno
            fullName: fullName.trim(),
            phone: phone.trim(),
            treatment: cleanTreatment,
            budget: cleanBudget,
            score,
            tier,
            scoredAt: new Date().toISOString()
        };

        scoredLeadsDatabase.push(scoredLead);

        // Phase 9: Structured Trace-ID Logging
        console.log(JSON.stringify({
            trace_id: traceId,
            event: 'Lead Scored and Segmented',
            tenant_id: tenantId,
            lead_id: scoredLead.id,
            score: score,
            tier: tier,
            timestamp: scoredLead.scoredAt
        }));

        return NextResponse.json(
            {
                success: true,
                message: 'Lead successfully scored and segmented!',
                leadData: scoredLead,
                trace_id: traceId
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error(`[Trace: ${traceId}] [Lead Scoring Critical Error]:`, error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Failed to score and segment lead. Please try again later.',
                trace_id: traceId
            },
            { status: 500 }
        );
    }
}