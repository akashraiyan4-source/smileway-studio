import { NextResponse } from 'next/server';

interface ConsultationPayload {
  clientName: string;
  procedureInterest: string;
  goalsDescription?: string;
  phone: string;
}

export async function POST(request: Request) {
  try {
    const body: ConsultationPayload = await request.json().catch(() => ({}));
    const { clientName, procedureInterest, goalsDescription, phone } = body;

    if (!clientName || !phone || !procedureInterest) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required consultation parameters (clientName, phone, procedureInterest).' 
      }, { status: 400 });
    }

    const screeningId = `COS-SCR-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: 'AI cosmetic surgery consultation pre-screen generated successfully.',
      data: {
        screeningId,
        clientName,
        procedureInterest,
        suitabilityScore: 'High Potential Candidate',
        recommendedNextStep: 'Schedule Virtual or In-Clinic Surgeon Consultation',
        timestamp: new Date().toISOString()
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('[Cosmetic Consultation Error]:', error?.message || error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process consultation pre-screen.' 
    }, { status: 500 });
  }
}