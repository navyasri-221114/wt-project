import dotenv from 'dotenv';
dotenv.config();

/**
 * Sends an email using Brevo's REST API.
 * Uses SMTP_PASS as the Brevo API v3 key and SMTP_USER as the sender.
 * Note: If 'to' is an array, it splits them into an array of objects for the API.
 */
export const sendEmail = async (to: string | string[], subject: string, html: string, text?: string) => {
  if (!process.env.SMTP_PASS || !process.env.SMTP_USER) {
    console.error("Missing SMTP_PASS or SMTP_USER in .env. Email sequence aborted.");
    return false;
  }

  const toList = Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }];

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.SMTP_PASS // Using the Brevo v3 key
      },
      body: JSON.stringify({
        sender: { name: "PlaceOn", email: process.env.SMTP_USER },
        to: toList,
        subject,
        htmlContent: html,
        textContent: text || html.replace(/<[^>]*>?/gm, '') // naive html to text fallback
      })
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(`Brevo API Error: ${res.status} - ${JSON.stringify(data)}`);
    }

    console.log(`✅ Mail sent successfully to ${Array.isArray(to) ? to.join(', ') : to}. ID: ${data.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to send mail:", error);
    return false;
  }
};
