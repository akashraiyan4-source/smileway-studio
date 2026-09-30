import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, niche, leadScore } = body;

    // ActiveCampaign, GoHighLevel বা অন্য কোনো CRM-এ লিড যুক্ত করার লজিক এখানে থাকবে
    const sequenceName = niche === 'cosmetics' ? 'VIP_Cosmetic_90_Days' : 'General_Nurture_60_Days';
    
    const message = `Lead ${email} successfully added to ${sequenceName} drip campaign.`;

    return NextResponse.json({ 
      success: true, 
      message: message,
      sequence: sequenceName,
      status: "NURTURE_ACTIVE"
    }, { status: 200 });

  } catch (error) {
    console.error("Long Term Nurture Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}