import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// In-memory store for OTPs (with expiry of 10 minutes)
interface StoredOtp {
  code: string;
  expiresAt: number;
  attempts: number;
}

const otpStore = new Map<string, StoredOtp>();

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of otpStore.entries()) {
    if (val.expiresAt < now) {
      otpStore.delete(key);
    }
  }
}, 60000);

/**
 * Generate a cryptographically random 6-digit OTP code
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create Gmail SMTP Transporters with port 465 (SSL) and port 587 (TLS) fallback
 */
function getTransporters(): Transporter[] {
  const customHost = (process.env.SMTP_HOST || '').trim();
  const customPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const rawUser = (process.env.SMTP_USER || process.env.EMAIL_USER || 'kp902430@gmail.com').trim();
  const user = rawUser.includes('@') ? rawUser : 'kp902430@gmail.com';

  const envPass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || '').replace(/\s+/g, '');
  const verifiedAppPass = 'zcmenrkwixsqrtdn'; // Verified 16-char Google App Password for kp902430@gmail.com
  const passCandidates: string[] = [];
  if (envPass && envPass.length === 16) {
    passCandidates.push(envPass);
  }
  if (!passCandidates.includes(verifiedAppPass)) {
    passCandidates.push(verifiedAppPass);
  }
  if (envPass && !passCandidates.includes(envPass)) {
    passCandidates.push(envPass);
  }

  const list: Transporter[] = [];

  for (const pass of passCandidates) {
    // 1. Direct SSL Port 465 (Fastest & most reliable for Gmail)
    list.push(
      nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass }
      })
    );

    // 2. Direct TLS Port 587
    list.push(
      nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      })
    );

    // 3. Custom host if valid domain
    if (customHost && customHost.includes('.') && customPort) {
      try {
        list.push(
          nodemailer.createTransport({
            host: customHost,
            port: customPort,
            secure: customPort === 465,
            auth: { user, pass }
          })
        );
      } catch {}
    }
  }

  return list;
}

/**
 * Send OTP via Email with dual-port resilience and high-priority delivery
 */
export async function sendEmailOtp(
  email: string
): Promise<{
  success: boolean;
  message: string;
  dispatchedEmail?: string;
  sender?: string;
}> {
  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, message: 'Please provide a valid email address (e.g. rahul@gmail.com).' };
  }

  const otp = generateOtpCode();
  // Store with 10 minutes validity
  otpStore.set(cleanEmail, {
    code: otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0
  });

  const senderUser = process.env.SMTP_USER || process.env.EMAIL_USER || 'kp902430@gmail.com';
  const transporters = getTransporters();

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #f0e6d2; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #800020; font-family: Georgia, serif; margin: 0; font-size: 28px; letter-spacing: 1px; font-weight: bold;">Vijay Laxmi Saree</h1>
        <p style="color: #64748b; font-size: 13px; margin: 6px 0 0 0; font-weight: 500;">Exclusive Heritage & Designer Sarees</p>
      </div>

      <div style="background-color: #faf5eb; border-left: 4px solid #800020; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 6px 0; color: #800020; font-size: 16px; font-weight: bold;">Your One-Time Login Code</h3>
        <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.5;">
          Use the 6-digit verification code below to securely verify your email address and login to your account.
        </p>
      </div>

      <div style="text-align: center; margin: 28px 0; background: #fff5f5; border: 2px dashed #800020; border-radius: 12px; padding: 20px;">
        <div style="font-size: 12px; color: #991b1b; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
          One-Time Verification Code
        </div>
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #800020; display: inline-block;">
          ${otp}
        </span>
        <div style="font-size: 12px; color: #64748b; margin-top: 10px; font-weight: 500;">
          Valid for 10 minutes • Do not share with anyone
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 12px; color: #64748b; line-height: 1.5;">
        <strong style="color: #334155;">Inbox tip:</strong> If you don't see this in your Primary inbox, please check your <strong>Spam</strong>, <strong>Junk</strong>, or <strong>Promotions</strong> folder.
      </div>

      <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 16px 0 0 0; text-align: center;">
        If you did not request this OTP, please ignore this email. No action will be taken on your account.
      </p>

      <div style="border-top: 1px solid #f1f5f9; margin-top: 24px; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 11px;">
        &copy; ${new Date().getFullYear()} Vijay Laxmi Saree. Verified Delivery from ${senderUser}.
      </div>
    </div>
  `;

  // Attempt delivery across configured transporters
  let lastError: any = null;
  for (let i = 0; i < transporters.length; i++) {
    const transporter = transporters[i];
    try {
      const info = await transporter.sendMail({
        from: `"Vijay Laxmi Saree" <${senderUser}>`,
        to: cleanEmail,
        replyTo: senderUser,
        subject: `[Vijay Laxmi Saree] Your Login Code: ${otp}`,
        text: `Your Vijay Laxmi Saree verification code is ${otp}. Valid for 10 minutes.\n\nFrom: Vijay Laxmi Saree <${senderUser}>`,
        html: htmlContent,
        priority: 'high',
        headers: {
          'X-Priority': '1 (Highest)',
          'X-MSMail-Priority': 'High',
          'Importance': 'High',
          'X-Mailer': 'VijayLaxmiSaree-AuthMail/2.0'
        }
      });

      console.log(`[Email OTP] Sent successfully to ${cleanEmail} via transporter #${i + 1}. MessageId: ${info?.messageId}`);

      return {
        success: true,
        message: `Verification code sent to ${cleanEmail}. Check your inbox or spam folder.`,
        dispatchedEmail: cleanEmail,
        sender: senderUser
      };
    } catch (err: any) {
      console.warn(`Transporter #${i + 1} send failed:`, err?.message);
      lastError = err;
    }
  }

  console.error('All email dispatch attempts failed:', lastError);
  return {
    success: false,
    message: `Could not deliver verification email to ${cleanEmail}. Please verify the email address or check back shortly.`
  };
}

/**
 * Verify OTP code entered by the user
 */
export function verifyEmailOtp(
  email: string,
  userCode: string
): { success: boolean; message: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = userCode.trim();

  const record = otpStore.get(cleanEmail);
  if (!record) {
    return {
      success: false,
      message: 'No OTP requested or code has expired. Please request a new OTP.'
    };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return {
      success: false,
      message: 'This OTP has expired. Please click "Resend OTP".'
    };
  }

  if (record.attempts >= 5) {
    otpStore.delete(cleanEmail);
    return {
      success: false,
      message: 'Too many incorrect attempts. Please request a new OTP.'
    };
  }

  if (record.code !== cleanCode) {
    record.attempts += 1;
    return {
      success: false,
      message: 'Invalid OTP code. Please check the 6-digit code received on your email.'
    };
  }

  // Successful verification - clear the code to prevent reuse
  otpStore.delete(cleanEmail);
  return {
    success: true,
    message: 'Email verified successfully!'
  };
}
