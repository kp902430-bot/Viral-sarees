import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, otp } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const code = otp || Math.floor(100000 + Math.random() * 900000).toString();

    const user = 'kp902430@gmail.com';
    const pass = 'zcmenrkwixsqrtdn';

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass }
    });

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #f0e6d2; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #800020; font-family: Georgia, serif; margin: 0; font-size: 28px; letter-spacing: 1px; font-weight: bold;">Viral Sarees</h1>
          <p style="color: #64748b; font-size: 13px; margin: 6px 0 0 0; font-weight: 500;">Exclusive Heritage & Designer Sarees</p>
        </div>

        <div style="background-color: #faf5eb; border-left: 4px solid #800020; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 6px 0; color: #800020; font-size: 16px; font-weight: bold;">Your One-Time Login Code</h3>
          <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.5;">
            Use the 6-digit verification code below to securely sign in to your Viral Sarees customer account.
          </p>
        </div>

        <div style="text-align: center; margin: 28px 0; background: #fff5f5; border: 2px dashed #800020; border-radius: 12px; padding: 20px;">
          <div style="font-size: 12px; color: #991b1b; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
            One-Time Verification Code
          </div>
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #800020; display: inline-block;">
            ${code}
          </span>
          <div style="font-size: 12px; color: #64748b; margin-top: 10px; font-weight: 500;">
            Valid for 10 minutes • Do not share with anyone
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 12px; color: #64748b; line-height: 1.5;">
          <strong style="color: #334155;">Inbox tip:</strong> If you don't see this in your Primary inbox, please check your <strong>Spam</strong>, <strong>Junk</strong>, or <strong>Promotions</strong> folder.
        </div>

        <div style="border-top: 1px solid #f1f5f9; margin-top: 24px; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 11px;">
          &copy; ${new Date().getFullYear()} Viral Sarees. Verified Delivery from ${user}.
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Viral Sarees" <${user}>`,
      to: cleanEmail,
      replyTo: user,
      subject: `[Viral Sarees] Your Login Code: ${code}`,
      text: `Your Viral Sarees verification code is ${code}. Valid for 10 minutes.\n\nFrom: Viral Sarees <${user}>`,
      html: htmlContent,
      priority: 'high'
    });

    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${cleanEmail}. Check your inbox or spam folder.`,
      dispatchedEmail: cleanEmail,
      code
    });
  } catch (error: any) {
    console.error('Email dispatch error:', error);
    return res.status(200).json({
      success: false,
      message: error?.message || 'Could not send verification email.'
    });
  }
}
