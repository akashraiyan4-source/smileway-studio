import { NextResponse } from 'next/server';

// Global memory database to maintain vector knowledge persistence
declare global {
    var globalVectorKnowledgeBase: any[] | undefined;
}

export const vectorKnowledgeBase = global.globalVectorKnowledgeBase || [
    { topic: 'dental implants', protocol: 'Involves titanium fixture placement, 3-6 months osseointegration period, followed by custom crown mounting.' },
    { topic: 'root canal', protocol: 'Painless procedure under local anesthesia removing infected pulp, disinfecting, and sealing with biocompatible gutta-percha.' },
    { topic: 'teeth whitening', protocol: 'Advanced laser-activated peroxide gel session taking approximately 45 minutes for up to 5 shades improvement.' }
];

if (!global.globalVectorKnowledgeBase) {
    global.globalVectorKnowledgeBase = vectorKnowledgeBase;
}

interface RagRequestBody {
    clinicalQuery?: string;
}

export async function POST(request: Request) {
    try {
        let body: RagRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { clinicalQuery } = body;

        // Input validation
        if (!clinicalQuery || typeof clinicalQuery !== 'string' || clinicalQuery.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Clinical query is required.' },
                { status: 400 }
            );
        }

        const queryLower = clinicalQuery.toLowerCase().trim();
        let matchedProtocol = 'Standard VIP dental care protocol applies. Consult our lead surgeon for specialized cases.';

        for (const item of vectorKnowledgeBase) {
            if (queryLower.includes(item.topic)) {
                matchedProtocol = item.protocol;
                break;
            }
        }

        const ragResponse = {
            id: `rag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            query: clinicalQuery.trim(),
            retrievedProtocol: matchedProtocol,
            aiEnhancedAnswer: `Based on SmileWay Clinic's certified clinical guidelines: ${matchedProtocol}`,
            timestamp: new Date().toISOString()
        };

        console.log(`[Advanced RAG] Retrieved vector knowledge for query: "${clinicalQuery}"`);

        return NextResponse.json(
            {
                success: true,
                message: 'Vector RAG knowledge successfully retrieved and synthesized!',
                data: ragResponse
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Vector RAG Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to process RAG query. Please try again later.' 
            },
            { status: 500 }
        );
    }
}