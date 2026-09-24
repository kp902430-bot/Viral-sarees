/**
 * Client service to broadcast new saree catalogue arrivals to registered customers via email
 */

import { Saree, CustomerProfile } from '../types';

export interface BroadcastResult {
  success: boolean;
  message: string;
  sentCount: number;
}

export async function broadcastNewCatalogueEmail(
  saree: Saree,
  customers: CustomerProfile[],
  customTagline?: string
): Promise<BroadcastResult> {
  // Extract unique customer emails
  const targetEmails = customers
    .map((c) => (c.email || '').trim().toLowerCase())
    .filter((e) => e.includes('@') && !e.includes('example.com'));

  try {
    const res = await fetch('/api/broadcast-catalogue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        saree,
        customerEmails: targetEmails,
        customTagline
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        message: data.message || `Broadcast email sent to ${data.sentCount || targetEmails.length} customer(s)!`,
        sentCount: data.sentCount || targetEmails.length
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errData.message || 'Server was unable to deliver broadcast emails.',
        sentCount: 0
      };
    }
  } catch (error: any) {
    console.warn('Broadcast network request issue:', error?.message);
    return {
      success: false,
      message: error?.message || 'Network error triggering broadcast email.',
      sentCount: 0
    };
  }
}
