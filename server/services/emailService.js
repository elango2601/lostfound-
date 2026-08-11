const nodemailer = require('nodemailer');

let transporter;

// Automatically create an Ethereal test account when the service loads
const setupTransporter = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Email Service] Ethereal SMTP Ready: ${testAccount.user}`);
  } catch (err) {
    console.error("[Email Service] Failed to create test account", err);
  }
};

setupTransporter();

exports.sendMatchNotification = async (userEmail, userName, lostItemTitle, foundItemTitle, matchScore, matchReasons = []) => {
  if (!transporter) {
    console.warn("[Email Service] Transporter not ready yet.");
    return;
  }
  
  const reasonsHtml = matchReasons.length > 0 
    ? `<ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px; color: #4b5563;">
        ${matchReasons.map(r => `<li>${r}</li>`).join('')}
       </ul>` 
    : '';

  try {
    const info = await transporter.sendMail({
      from: '"LostFound+ AI Engine" <ai@lostfoundplus.com>',
      to: userEmail,
      subject: `🚨 Strong Match Found for: ${lostItemTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #4f46e5; margin-top: 0;">Great News, ${userName}!</h2>
          <p style="font-size: 16px; line-height: 1.5;">Our AI Matching Engine has found a strong match for your lost item.</p>
          
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #f3f4f6;">
            <p style="margin: 0 0 10px 0;"><strong>Your Lost Item:</strong> ${lostItemTitle}</p>
            <p style="margin: 0 0 10px 0;"><strong>Matched With:</strong> ${foundItemTitle}</p>
            <p style="margin: 0 0 10px 0; color: #10b981; font-weight: bold;">AI Confidence Score: ${matchScore}%</p>
            <p style="margin: 0; font-weight: 600; font-size: 14px; color: #374151;">Why did the AI flag this?</p>
            ${reasonsHtml}
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">Please log in to your LostFound+ dashboard to view the details and contact the finder.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">This is an automated message from LostFound+.</p>
        </div>
      `,
    });
    console.log(`[Email Service] Notification sent to ${userEmail}`);
    console.log(`[Email Service] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (err) {
    console.error("[Email Service] Error sending email", err);
  }
};
