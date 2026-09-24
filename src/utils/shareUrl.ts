/**
 * Share URL Utility for Viral Sarees
 * 
 * In Google AI Studio:
 * - Development URL (`https://ais-dev-...`): Restricted to the project developer Google account.
 *   If an external customer opens this, Cloud Run returns HTTP 403 Forbidden.
 * - Public Shared URL (`https://ais-pre-...`): Publicly accessible to any customer without login or 403 error.
 */

export const OFFICIAL_PUBLIC_STORE_URL = 'https://ais-pre-uiife53v2b7pur63sx64wd-948199954779.asia-southeast1.run.app';

/**
 * Returns the customer-safe public store URL.
 * Automatically transforms `ais-dev-` into `ais-pre-` so customers never receive 403 Forbidden.
 */
export function getPublicStoreUrl(): string {
  if (typeof window === 'undefined') {
    return OFFICIAL_PUBLIC_STORE_URL;
  }

  try {
    const origin = window.location.origin;
    if (!origin || origin === 'null' || origin.startsWith('file:') || origin.includes('about:blank')) {
      return OFFICIAL_PUBLIC_STORE_URL;
    }

    // Convert private developer container URL into public shared URL
    if (origin.includes('ais-dev-')) {
      return origin.replace('ais-dev-', 'ais-pre-');
    }

    // Localhost fallback
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return OFFICIAL_PUBLIC_STORE_URL;
    }

    return origin;
  } catch (e) {
    console.error('Error resolving public store URL:', e);
    return OFFICIAL_PUBLIC_STORE_URL;
  }
}

/**
 * Generates customer-safe share link for specific sarees or paths.
 */
export function getPublicShareUrlForPath(path: string = ''): string {
  const base = getPublicStoreUrl().replace(/\/$/, '');
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${base}${cleanPath}`;
}

/**
 * Pre-formatted WhatsApp share text with the verified public customer link.
 */
export function getCustomerWhatsAppShareMessage(storeName: string, phone: string): string {
  const publicUrl = getPublicStoreUrl();
  return (
    `🥻 *${storeName} - Exclusive Saree Collections*\n\n` +
    `Namaste! Visit our online store to explore authentic Banarasi, Kanjivaram, and Designer Sarees with 360° Video Reels, Live Tracking & Easy Delivery.\n\n` +
    `👉 *Open Store Link:* ${publicUrl}\n\n` +
    `✅ *Customer Safe Link (No Login / No 403 Error Required)*\n` +
    `📞 *Customer Care / WhatsApp:* +91 ${phone}`
  );
}

/**
 * Generates customer-safe share link directly to a specific saree product.
 */
export function getPublicSareeShareUrl(sareeId: string): string {
  const base = getPublicStoreUrl().replace(/\/$/, '');
  return `${base}?saree=${encodeURIComponent(sareeId)}`;
}

/**
 * Pre-filled WhatsApp message for a specific saree with title, price, and direct product link.
 */
export function getSareeWhatsAppShareText(saree: { title: string; price: number; originalPrice?: number; discountPercent?: number }, sareeId: string): string {
  const productUrl = getPublicSareeShareUrl(sareeId);
  const discountInfo = saree.discountPercent ? ` (${saree.discountPercent}% OFF)` : '';
  const mrpInfo = saree.originalPrice && saree.originalPrice > saree.price 
    ? `\n🏷️ *Original MRP:* ₹${saree.originalPrice.toLocaleString('en-IN')}` 
    : '';

  return (
    `🥻 *Check out this saree on Viral Sarees!*\n\n` +
    `✨ *${saree.title}*\n` +
    `💰 *Price:* ₹${saree.price.toLocaleString('en-IN')}${discountInfo}` +
    mrpInfo + `\n\n` +
    `👉 *View Saree Details & Order Online:*\n${productUrl}`
  );
}
