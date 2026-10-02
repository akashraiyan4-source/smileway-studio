import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { squareFeet, materialType, damageSeverity } = await request.json().catch(() => ({}));

    if (!squareFeet) {
      return NextResponse.json({ success: false, error: 'Square footage is required for quote estimation.' }, { status: 400 });
    }

    // Enterprise pricing algorithm
    const baseRatePerSqFt = materialType === 'metal' ? 8.5 : 4.5;
    const multiplier = damageSeverity === 'High' ? 1.3 : 1.0;
    const estimatedCost = Math.round(squareFeet * baseRatePerSqFt * multiplier);

    return NextResponse.json({
      success: true,
      message: 'Roofing enterprise estimate generated successfully.',
      data: {
        squareFeet,
        materialType: materialType || 'asphalt',
        estimatedCostUSD: estimatedCost,
        validityDays: 30
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('[Quote Calculator Error]:', error?.message || error);
    return NextResponse.json({ success: false, error: 'Failed to generate quote estimation.' }, { status: 500 });
  }
}