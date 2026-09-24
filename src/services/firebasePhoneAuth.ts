import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult, 
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { auth } from '../lib/firebase';

let globalRecaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Initializes or resets the reCAPTCHA verifier for Firebase Phone Auth
 */
export function initRecaptchaVerifier(containerId: string = 'firebase-recaptcha-container'): RecaptchaVerifier {
  // Clear any previous instance
  if (globalRecaptchaVerifier) {
    try {
      globalRecaptchaVerifier.clear();
    } catch {}
    globalRecaptchaVerifier = null;
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved automatically
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired, please request OTP again');
    }
  });

  globalRecaptchaVerifier = verifier;
  return verifier;
}

export interface SendOtpResult {
  success: boolean;
  confirmationResult?: ConfirmationResult;
  error?: string;
  isOperationNotAllowed?: boolean;
}

/**
 * Sends a real 100% FREE SMS OTP to Indian mobile number via Google Firebase Phone Auth
 * Free quota: 10,000 SMS per month directly via Google's official carrier network.
 */
export async function sendFirebasePhoneOtp(
  rawPhone: string, 
  containerId: string = 'firebase-recaptcha-container'
): Promise<SendOtpResult> {
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) {
    return {
      success: false,
      error: 'Please enter a valid 10-digit Indian mobile number.'
    };
  }

  const internationalPhone = `+91${cleanPhone}`;

  try {
    const verifier = initRecaptchaVerifier(containerId);
    // Render verifier
    await verifier.render();

    const confirmationResult = await signInWithPhoneNumber(auth, internationalPhone, verifier);
    return {
      success: true,
      confirmationResult
    };
  } catch (error: any) {
    console.warn('Firebase Phone Auth status:', error?.code || error?.message);
    let errorMsg = 'Failed to send SMS OTP via Google Firebase.';
    let isOpNotAllowed = false;

    if (error?.code === 'auth/operation-not-allowed' || error?.message?.includes('operation-not-allowed')) {
      isOpNotAllowed = true;
      errorMsg = 'Phone sign-in is not yet activated in Firebase Console. Please enable "Phone" under Firebase Console > Authentication > Sign-in method.';
    } else if (error?.code === 'auth/billing-not-enabled' || error?.message?.includes('BILLING_NOT_ENABLED')) {
      isOpNotAllowed = true;
      errorMsg = 'BILLING_NOT_ENABLED: Firebase SMS requires Blaze plan (Free tier includes 10,000 free verification SMS per month). Or add phone numbers under "Phone numbers for testing".';
    } else if (error?.code === 'auth/invalid-phone-number') {
      errorMsg = 'Invalid phone number format. Please enter a valid Indian number.';
    } else if (error?.code === 'auth/too-many-requests') {
      errorMsg = 'Too many attempts. Please wait a few minutes before requesting a new OTP.';
    } else if (error?.code === 'auth/captcha-check-failed') {
      errorMsg = 'Security verification failed. Please try again.';
    } else if (error?.code === 'auth/quota-exceeded') {
      errorMsg = 'Daily SMS quota exceeded. Please try again tomorrow.';
    } else if (error?.message) {
      errorMsg = error.message;
    }

    return {
      success: false,
      error: errorMsg,
      isOperationNotAllowed: isOpNotAllowed
    };
  }
}

/**
 * Confirms the 6-digit OTP entered by the customer
 */
export async function confirmFirebaseOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const cleanCode = otpCode.trim();
    if (cleanCode.length !== 6) {
      return {
        success: false,
        error: 'Please enter all 6 digits of the SMS verification code.'
      };
    }

    const credential: UserCredential = await confirmationResult.confirm(cleanCode);
    return {
      success: true,
      user: credential.user
    };
  } catch (error: any) {
    console.warn('Firebase OTP confirmation status:', error?.code || error?.message);
    let errorMsg = 'Invalid verification code. Please check the SMS and try again.';

    if (error?.code === 'auth/invalid-verification-code') {
      errorMsg = 'Invalid OTP code. Please enter the correct 6-digit code received via SMS.';
    } else if (error?.code === 'auth/code-expired') {
      errorMsg = 'This OTP has expired. Please click "Resend SMS" to get a fresh code.';
    }

    return {
      success: false,
      error: errorMsg
    };
  }
}

export interface GoogleSignInResult {
  success: boolean;
  user?: any;
  redirected?: boolean;
  error?: string;
  isOperationNotAllowed?: boolean;
  isUnauthorizedDomain?: boolean;
  domain?: string;
}

/**
 * Sign in with Google with phone-native redirection and popup fallback
 * On phone devices, redirects to accounts.google.com where customer chooses their logged-in Google ID
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    // Check if running inside an iframe (like AI Studio preview)
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
    
    // Check if on mobile phone
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile && !isInIframe) {
      // Direct redirect on mobile when top window
      await signInWithRedirect(auth, provider);
      return {
        success: true,
        redirected: true,
        domain: currentDomain
      };
    } else {
      // Desktop or inside iframe: attempt popup first
      try {
        const result = await signInWithPopup(auth, provider);
        return {
          success: true,
          user: result.user,
          domain: currentDomain
        };
      } catch (popupErr: any) {
        if (!isInIframe && (popupErr?.code === 'auth/popup-blocked' || popupErr?.code === 'auth/cancelled-popup-request')) {
          await signInWithRedirect(auth, provider);
          return {
            success: true,
            redirected: true,
            domain: currentDomain
          };
        }
        throw popupErr;
      }
    }
  } catch (error: any) {
    console.warn('Google sign-in status:', error?.code, error?.message);

    const isUnauthorized = 
      error?.code === 'auth/unauthorized-domain' ||
      error?.message?.includes('unauthorized-domain') ||
      error?.message?.includes('auth/unauthorized-domain') ||
      (error?.message && error.message.toLowerCase().includes('authorized domain'));

    const isOpNotAllowed = 
      error?.code === 'auth/operation-not-allowed' || 
      error?.message?.includes('operation-not-allowed') || 
      error?.message?.includes('OPERATION_NOT_ALLOWED');

    if (isUnauthorized) {
      return {
        success: false,
        isUnauthorizedDomain: true,
        domain: currentDomain,
        error: `Firebase Domain Unauthorized: '${currentDomain}' is not in Firebase Authorized Domains.`
      };
    }

    if (isOpNotAllowed) {
      return {
        success: false,
        isOperationNotAllowed: true,
        domain: currentDomain,
        error: 'Google Sign-in is not yet enabled in Firebase Console. Please enable "Google" provider under Firebase Authentication > Sign-in method.'
      };
    }

    if (error?.code === 'auth/popup-closed-by-user') {
      return {
        success: false,
        error: 'Google sign-in window was closed.'
      };
    }

    return {
      success: false,
      domain: currentDomain,
      error: error?.message || 'Google sign-in could not be completed.'
    };
  }
}

/**
 * Check if the user has returned from a Google account redirect on their phone/browser
 */
export async function checkGoogleRedirectResult(): Promise<GoogleSignInResult> {
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return {
        success: true,
        user: result.user,
        domain: currentDomain
      };
    }
    return { success: false, domain: currentDomain };
  } catch (error: any) {
    console.warn('Google redirect check error:', error?.code, error?.message);

    const isUnauthorized = 
      error?.code === 'auth/unauthorized-domain' ||
      error?.message?.includes('unauthorized-domain') ||
      error?.message?.includes('auth/unauthorized-domain') ||
      (error?.message && error.message.toLowerCase().includes('authorized domain'));

    const isOpNotAllowed = 
      error?.code === 'auth/operation-not-allowed' || 
      error?.message?.includes('operation-not-allowed') || 
      error?.message?.includes('OPERATION_NOT_ALLOWED');

    return {
      success: false,
      isUnauthorizedDomain: isUnauthorized,
      isOperationNotAllowed: isOpNotAllowed,
      domain: currentDomain,
      error: error?.message
    };
  }
}
