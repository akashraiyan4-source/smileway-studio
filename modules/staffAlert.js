import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendStaffAlert(leadData) {
  try {
    const staffPhone = process.env.STAFF_PHONE_NUMBER;
    if (!staffPhone) {
      console.log('[Staff Alert] STAFF_PHONE_NUMBER not set in .env, skipping alert.');
      return;
    }

    const message = `🚨 NEW VIP DENTAL LEAD!\nName: ${leadData.fullName}\nPhone: ${leadData.phone}\nTreatment: ${leadData.treatment}\nStatus: Action Required.`;

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: staffPhone
    });

    console.log(`[Staff Alert Sent] Notified staff about lead ${leadData.fullName}`);
  } catch (error) {
    console.error('Error sending staff alert:', error);
  }
}