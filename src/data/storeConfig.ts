import { Order } from '../types';

export interface PaymentGatewaySettings {
  isEnabled: boolean;
  registeredPhone: string;
  registeredEmail: string;
  merchantName: string;
  merchantId: string;
  upiId: string;
  provider: 'phonepe_razorpay' | 'phonepe' | 'razorpay' | 'paytm';
  settlementAccount: string;
  settlementSpeed: 'Instant (T+0)' | 'Next Day (T+1)';
}

export interface StoreConfiguration {
  storeName: string;
  tagline: string;
  shopAddress: string;
  gstin: string;
  hsnCode: string;
  officialPhone: string;
  whatsappNumber: string; // International format without +
  supportEmail: string;
  upiId: string;
  dispatchHub: string;
  paymentGateway: PaymentGatewaySettings;
}

export const DEFAULT_PAYMENT_GATEWAY: PaymentGatewaySettings = {
  isEnabled: true,
  registeredPhone: '7990651540',
  registeredEmail: 'Kamal799065@gmail.com',
  merchantName: 'Viral Sarees',
  merchantId: 'VIRAL_SAREES_7990651540',
  upiId: '7990651540@upi',
  provider: 'phonepe_razorpay',
  settlementAccount: 'HDFC Bank (A/C ending in 5154 linked to +91 79906 51540)',
  settlementSpeed: 'Instant (T+0)'
};

export function getPaymentGatewayConfig(): PaymentGatewaySettings {
  try {
    const saved = localStorage.getItem('vls_payment_gateway_config');
    if (saved) {
      return { ...DEFAULT_PAYMENT_GATEWAY, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to parse gateway config', e);
  }
  return DEFAULT_PAYMENT_GATEWAY;
}

export function savePaymentGatewayConfig(config: Partial<PaymentGatewaySettings>): PaymentGatewaySettings {
  const current = getPaymentGatewayConfig();
  const updated: PaymentGatewaySettings = { ...current, ...config };
  try {
    localStorage.setItem('vls_payment_gateway_config', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save gateway config', e);
  }
  return updated;
}

export const STORE_CONFIG: StoreConfiguration = {
  storeName: 'Viral Sarees',
  tagline: 'Trend humse shuru hota hai. Price Kam, Quality Mein Dum.',
  shopAddress: 'Shop No. 104-106, Upper Ground Floor, Surat Textile Market (STM), Ring Road, Surat, Gujarat - 395002',
  gstin: '24AAACV9842F1Z6',
  hsnCode: '5007 / 5208 (Silk & Cotton Fabrics)',
  officialPhone: '+91 79906 51540',
  whatsappNumber: '917990651540',
  supportEmail: 'Kamal799065@gmail.com',
  upiId: '7990651540@upi',
  dispatchHub: 'Viral Sarees Central Logistics Hub, Surat, Gujarat',
  paymentGateway: DEFAULT_PAYMENT_GATEWAY
};

/**
 * Format a comprehensive, official WhatsApp order booking docket for store & customer
 */
export function formatOrderDocket(order: Order): string {
  const itemsText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.saree.title}*\n   • SKU: ${item.saree.sku} | Qty: ${item.quantity}\n   • Fabric: ${item.saree.fabric}\n   • Price: ₹${item.saree.price.toLocaleString('en-IN')}${item.stitchBlouse ? ' (+₹499 Blouse Stitching)' : ''}`
    )
    .join('\n\n');

  const addressText = `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}${order.shippingAddress.landmark ? ` (Landmark: ${order.shippingAddress.landmark})` : ''}`;

  return `🛍️ *NEW ORDER - ${STORE_CONFIG.storeName.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━━━━━━━
🆔 *Order ID:* ${order.id}
📅 *Date:* ${order.orderDate}
👤 *Customer Name:* ${order.customerName}
📞 *Contact Phone:* +91 ${order.phone}
${order.email ? `✉️ *Email:* ${order.email}\n` : ''}
📍 *Shipping Address:*
${addressText}

📦 *Sarees Ordered:*
${itemsText}

💰 *Payment Breakdown:*
• Subtotal: ₹${order.subtotal.toLocaleString('en-IN')}
${order.discount > 0 ? `• Discount Saved: -₹${order.discount.toLocaleString('en-IN')}\n` : ''}• Delivery: ${order.shipping === 0 ? 'FREE Express Courier' : `₹${order.shipping}`}
• *Final Amount:* ₹${order.totalAmount.toLocaleString('en-IN')}
• *Payment Mode:* ${order.paymentMethod} (${order.paymentStatus})

🚚 *Logistics Courier:* ${order.courierName}
🔖 *Initial AWB/Tracking:* ${order.trackingNumber}
━━━━━━━━━━━━━━━━━━━━━━━━━━
*Status:* ${order.orderStatus} (Authentic Silk Mark Verified)
_Please confirm dispatch docket and send tracking link to customer._`;
}

/**
 * Generate official WhatsApp direct link to message store
 */
export function getStoreWhatsAppUrl(order: Order, customNumber?: string): string {
  const targetNumber = customNumber || STORE_CONFIG.whatsappNumber;
  const message = formatOrderDocket(order);
  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate standard UPI deep link for mobile apps (GPay, PhonePe, Paytm, BHIM)
 */
export function generateUpiPaymentUrl(order: Order, customUpiId?: string): string {
  const gw = getPaymentGatewayConfig();
  const payeeAddress = customUpiId || gw.upiId || STORE_CONFIG.upiId;
  const payeeName = encodeURIComponent(STORE_CONFIG.storeName);
  const amount = order.totalAmount.toFixed(2);
  const note = encodeURIComponent(`Order ${order.id} - ${STORE_CONFIG.storeName}`);
  return `upi://pay?pa=${payeeAddress}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}`;
}

/**
 * Direct PhonePe Intent Link
 */
export function generatePhonePeIntentUrl(order: Order, phone?: string): string {
  const phoneNo = phone || getPaymentGatewayConfig().registeredPhone;
  const amount = order.totalAmount.toFixed(2);
  const note = encodeURIComponent(`Order ${order.id}`);
  return `upi://pay?pa=${phoneNo}@ybl&pn=${encodeURIComponent(STORE_CONFIG.storeName)}&am=${amount}&cu=INR&tn=${note}`;
}

/**
 * Direct Google Pay Intent Link
 */
export function generateGPayIntentUrl(order: Order, phone?: string): string {
  const phoneNo = phone || getPaymentGatewayConfig().registeredPhone;
  const amount = order.totalAmount.toFixed(2);
  const note = encodeURIComponent(`Order ${order.id}`);
  return `upi://pay?pa=${phoneNo}@okaxis&pn=${encodeURIComponent(STORE_CONFIG.storeName)}&am=${amount}&cu=INR&tn=${note}`;
}

/**
 * Direct Paytm Intent Link
 */
export function generatePaytmIntentUrl(order: Order, phone?: string): string {
  const phoneNo = phone || getPaymentGatewayConfig().registeredPhone;
  const amount = order.totalAmount.toFixed(2);
  const note = encodeURIComponent(`Order ${order.id}`);
  return `upi://pay?pa=${phoneNo}@paytm&pn=${encodeURIComponent(STORE_CONFIG.storeName)}&am=${amount}&cu=INR&tn=${note}`;
}

/**
 * Dynamic UPI QR Code URL
 */
export function generateUpiQrCodeUrl(order: Order, customUpiId?: string): string {
  const upiUrl = generateUpiPaymentUrl(order, customUpiId);
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;
}
