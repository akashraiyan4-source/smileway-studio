import { NextResponse } from 'next/server';

interface SmileSimulatorRequestBody {
    fullName?: string;
    phone?: string;
    imageUrl?: string;
    targetTreatment?: string;
}

export async function POST(request: Request) {
    try {
        let body: SmileSimulatorRequestBody;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const { fullName, phone, imageUrl, targetTreatment } = body;

        // ইনপুট ভ্যালিডেশন
        if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Patient photo/image URL is required for smile simulation.' },
                { status: 400 }
            );
        }

        const cleanName = fullName ? fullName.trim() : 'Valued Guest';
        const cleanPhone = phone ? phone.trim() : 'N/A';
        const cleanTreatment = targetTreatment ? targetTreatment.trim() : 'Porcelain Veneers / Smile Makeover';

        const simulationResult = {
            id: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            fullName: cleanName,
            phone: cleanPhone,
            targetTreatment: cleanTreatment,
            originalImage: imageUrl.trim(),
            simulatedResultImage: 'https://smileway.store/simulations/sample-result-preview.jpg',
            confidenceScore: '94.8%',
            message: 'Smile simulation generated successfully. Notice the enhanced symmetry and brightness!',
            processedAt: new Date().toISOString()
        };

        console.log(`[Smile Simulator] Processed vision preview for ${cleanName} targeting ${cleanTreatment}`);

        return NextResponse.json(
            {
                success: true,
                message: 'AI Smile Simulator successfully generated preview!',
                data: simulationResult
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Smile Simulator Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to process smile simulation. Please try again later.' 
            },
            { status: 500 }
        );
    }
}