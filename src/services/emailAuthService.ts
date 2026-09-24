/**
 * Client service to request and verify email OTP codes
 * The OTP is strictly delivered to the user's email inbox and is NEVER revealed in the frontend response.
 */

export interface EmailOtpResponse {
  success: boolean;
  message: string;
  previewUrl?: string;
  dispatchedEmail?: string;
  sender?: string;
}

export async function requestEmailOtp(email: string): Promise<EmailOtpResponse> {
  try {
    const res = await fetch('/api/send-email-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Network error while requesting email OTP.'
    };
  }
}

export async function verifyEmailOtpCode(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/verify-email-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp })
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Network error while verifying OTP code.'
    };
  }
}
