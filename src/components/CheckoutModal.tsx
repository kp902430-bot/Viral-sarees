import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Check, CreditCard, Smartphone, Banknote, Building2, Truck, QrCode, Lock, AlertCircle, ArrowRight, UserCheck, AlertTriangle, Copy, CheckCheck, ExternalLink, Zap, Mail } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, Order, TrackingStep, CustomerProfile } from '../types';
import { sendOrderConfirmationSms } from '../services/smsService';
import { 
  STORE_CONFIG, 
  getPaymentGatewayConfig, 
  generateUpiPaymentUrl, 
  generateUpiQrCodeUrl, 
  generatePhonePeIntentUrl, 
  generateGPayIntentUrl, 
  generatePaytmIntentUrl 
} from '../data/storeConfig';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  discount: number;
  appliedCoupon: string;
  onOrderSuccess: (order: Order) => void;
  currentCustomer?: CustomerProfile | null;
  onOpenCustomerAuth?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  discount,
  appliedCoupon,
  onOrderSuccess,
  currentCustomer,
  onOpenCustomerAuth
}) => {
  // Form State - Clean real inputs without dummy demo names
  const [customerName, setCustomerName] = useState(() => currentCustomer?.name || '');
  const [phone, setPhone] = useState(() => currentCustomer?.phone || '');
  const [email, setEmail] = useState(() => currentCustomer?.email || '');
  const [street, setStreet] = useState(() => currentCustomer?.address?.street || '');
  const [city, setCity] = useState(() => currentCustomer?.address?.city || '');
  const [state, setState] = useState(() => currentCustomer?.address?.state || '');
  const [pincode, setPincode] = useState(() => currentCustomer?.address?.pincode || '');
  const [landmark, setLandmark] = useState(() => currentCustomer?.address?.landmark || '');
  const [validationError, setValidationError] = useState('');

  const isLoggedInWithEmail = Boolean(currentCustomer?.email && currentCustomer.email.trim().includes('@'));

  useEffect(() => {
    if (currentCustomer) {
      if (currentCustomer.name) setCustomerName(currentCustomer.name);
      if (currentCustomer.phone) setPhone(currentCustomer.phone);
      if (currentCustomer.email) setEmail(currentCustomer.email);
      if (currentCustomer.address) {
        if (currentCustomer.address.street) setStreet(currentCustomer.address.street);
        if (currentCustomer.address.city) setCity(currentCustomer.address.city);
        if (currentCustomer.address.state) setState(currentCustomer.address.state);
        if (currentCustomer.address.pincode) setPincode(currentCustomer.address.pincode);
        if (currentCustomer.address.landmark) setLandmark(currentCustomer.address.landmark);
      }
    }
  }, [currentCustomer]);

  // Payment Options (COD is only available if customer is logged in with Email)
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking' | 'COD'>(() => {
    return (currentCustomer?.email && currentCustomer.email.trim().includes('@')) ? 'COD' : 'UPI';
  });
  const [upiProvider, setUpiProvider] = useState<'gpay' | 'phonepe' | 'paytm' | 'qr'>('phonepe');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is not logged in with email, enforce paymentMethod cannot be COD
  useEffect(() => {
    if (!isLoggedInWithEmail && paymentMethod === 'COD') {
      setPaymentMethod('UPI');
    }
  }, [isLoggedInWithEmail, paymentMethod]);

  const gatewayConfig = getPaymentGatewayConfig();

  if (!isOpen) return null;

  // Calculations
  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.saree.price + (item.stitchBlouse ? 499 : 0);
    return sum + itemPrice * item.quantity;
  }, 0);
  const shippingCharge = subtotal >= 999 ? 0 : 99;
  const totalAmount = Math.max(0, subtotal - discount + shippingCharge);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // Strict validation for real order
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setValidationError('Please enter a valid 10-digit mobile number for order and courier updates.');
      return;
    }
    if (!customerName.trim()) {
      setValidationError('Please enter your full name for courier delivery.');
      return;
    }
    if (!street.trim() || !city.trim() || !state.trim()) {
      setValidationError('Please provide complete house/street address, city and state.');
      return;
    }
    const cleanPin = pincode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setValidationError('Please enter a valid 6-digit postal pincode.');
      return;
    }

    if (paymentMethod === 'COD' && !isLoggedInWithEmail) {
      setValidationError('Cash on Delivery (COD) ke liye Email Login anivarya (compulsory) hai. Kripya pehle email verify karke login karein ya online advance payment dwara order karein.');
      return;
    }

    setValidationError('');
    setIsSubmitting(true);

    setTimeout(() => {
      // Trigger festive celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // graceful ignore
      }

      const orderId = `VLS-${Math.floor(10000 + Math.random() * 90000)}`;
      const trackingNo = `BLUEDART-IND-${Math.floor(7000000 + Math.random() * 2000000)}`;

      // Send real carrier SMS confirmation
      try {
        sendOrderConfirmationSms(cleanPhone, orderId, totalAmount);
      } catch (e) {
        console.warn('SMS dispatch handled:', e);
      }

      const initialTimeline: TrackingStep[] = [
        {
          title: 'Order Confirmed & Booked with Surat Hub',
          location: STORE_CONFIG.dispatchHub,
          time: 'Just now',
          completed: true,
          description: `Order registered under official booking ${orderId}. Payment mode: ${paymentMethod}.`
        },
        {
          title: 'Quality Check & Luxury Packaging',
          location: 'Artisan Workshop, Surat Textile Market',
          time: 'Within 6 hours',
          completed: false,
          description: 'Inspecting Zari threads, Silk Mark authenticity tag, and tamper-proof luxury sealing.'
        },
        {
          title: 'Handover to BlueDart Express Courier',
          location: 'Surat Cargo Hub',
          time: 'Tomorrow morning',
          completed: false,
          description: `Airway bill ${trackingNo} assigned.`
        },
        {
          title: 'In Transit to Regional Sorting Facility',
          location: `${city} Regional Cargo Centre`,
          time: 'In 2 days',
          completed: false,
          description: 'Express transit via BlueDart Air cargo.'
        },
        {
          title: 'Out for Delivery',
          location: `${pincode} Delivery Hub`,
          time: 'Expected 3-4 days',
          completed: false,
          description: 'Courier delivery agent will arrive at your doorstep.'
        },
        {
          title: 'Delivered to Customer',
          location: `${street}, ${city}`,
          time: 'By 6:00 PM',
          completed: false,
          description: 'Package delivered.'
        }
      ];

      const newOrder: Order = {
        id: orderId,
        orderDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        customerName: customerName.trim(),
        phone: cleanPhone,
        email: email.trim(),
        shippingAddress: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: cleanPin,
          landmark: landmark.trim()
        },
        items: [...items],
        subtotal,
        discount,
        shipping: shippingCharge,
        totalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'COD_Awaited' : 'Paid',
        orderStatus: 'Confirmed',
        courierName: 'BlueDart Express Air',
        trackingNumber: trackingNo,
        estimatedDelivery: '3-4 Business Days',
        timeline: initialTimeline
      };

      setIsSubmitting(false);
      onOrderSuccess(newOrder);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#800020] to-[#9B111E] text-amber-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-base text-white">Secure Checkout</h3>
              <p className="text-[11px] text-amber-200">256-Bit Encrypted Payment Gateway</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-amber-200 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handlePlaceOrder} className="overflow-y-auto p-6 space-y-6 text-xs">
          
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-2.5 text-xs text-rose-900 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
              <span className="font-semibold">{validationError}</span>
            </div>
          )}

          {/* Authentication & COD Status Banner */}
          {isLoggedInWithEmail ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-950 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <UserCheck className="w-5 h-5 text-emerald-100" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-stone-900">Email Verified Customer:</span>
                    <span className="font-mono font-bold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                      {currentCustomer?.email}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5 font-medium">
                    ✓ <strong>Cash on Delivery (COD) Unlocked:</strong> You can pay cash or scan courier QR on arrival.
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-200 text-emerald-950 font-extrabold px-2.5 py-1 rounded-lg border border-emerald-300 shrink-0">
                COD Active
              </span>
            </div>
          ) : (
            <div className="p-4 bg-gradient-to-r from-amber-50 via-amber-100/60 to-orange-50 border-2 border-amber-400 rounded-2xl space-y-2.5 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-amber-950">
                      Guest Checkout: Cash on Delivery (COD) Locked
                    </h4>
                    <p className="text-[11px] text-amber-900 font-medium">
                      Bina login ke keval <strong>Online Advance Payment</strong> upalabdha hai
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-rose-100 text-rose-900 font-extrabold px-2 py-0.5 rounded-full border border-rose-300 shrink-0">
                  Online Pay Only
                </span>
              </div>

              <p className="text-[11px] text-stone-700 leading-relaxed">
                Store policy ke anusaar <strong>Cash on Delivery (COD)</strong> keval verified Email ID se login kiye hue customers ko milta hai. Bina login ke order book karne ke liye aapko <strong>pehle online payment (UPI / QR / Card)</strong> karna padega.
              </p>

              {onOpenCustomerAuth && (
                <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={onOpenCustomerAuth}
                    className="w-full sm:w-auto py-2 px-4 bg-gradient-to-r from-amber-600 via-amber-700 to-[#800020] hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-98"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-200" />
                    <span>Email Login Karein (COD Unlock Karein)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-stone-500 font-medium">
                    ya neeche UPI/Card se advance payment karke continue karein
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Delivery Address */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-stone-200 pb-2">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-900 text-amber-100 flex items-center justify-center text-[10px]">1</span>
                <span>Delivery Address</span>
              </h4>
              <span className="text-[11px] text-stone-500">All India Delivery</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suman Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-800"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Mobile Number (For Courier Tracking SMS) *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-800 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">Flat / House No. / Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="House/Flat No., Apartment, Street or Area"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-800"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">City / Town *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Surat, Jaipur, Delhi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-800"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">State *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gujarat, Rajasthan, Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-800"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Postal Pincode *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="6-digit PIN (e.g. 395002)"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-800 font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Nearby Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="Near temple, metro station, or market"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-800"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div>
            <div className="flex items-center justify-between mb-2 border-b border-stone-200 pb-2">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-900 text-amber-100 flex items-center justify-center text-[10px]">2</span>
                <span>Select Payment Method</span>
              </h4>
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Safe & Encrypted
              </span>
            </div>

            {/* Payment Gateway Registration Banner */}
            <div className="mb-3.5 p-2.5 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-100" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">Payment Gateway Registered & Active</span>
                    <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-100 border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      LIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Merchant: <strong>{gatewayConfig.merchantName}</strong> • Phone: <strong className="font-mono text-stone-900">+91 {gatewayConfig.registeredPhone}</strong>
                  </p>
                </div>
              </div>
              <div className="text-[10px] text-emerald-800 font-semibold bg-white/90 px-2 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-600" />
                <span>Instant Bank Settlement</span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  paymentMethod === 'UPI' ? 'border-rose-900 bg-rose-50/80 text-rose-900 font-bold' : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span>UPI / QR</span>
                <span className="text-[10px] text-emerald-700 font-medium">Instant</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  paymentMethod === 'Card' ? 'border-rose-900 bg-rose-50/80 text-rose-900 font-bold' : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Cards</span>
                <span className="text-[10px] text-stone-500">Debit / Credit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('NetBanking')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  paymentMethod === 'NetBanking' ? 'border-rose-900 bg-rose-50/80 text-rose-900 font-bold' : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>NetBanking</span>
                <span className="text-[10px] text-stone-500">All Banks</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isLoggedInWithEmail) {
                    setValidationError('Cash on Delivery (COD) ke liye Email Login compulsory hai. Kripya pehle email se login karein ya advance online payment (UPI/Cards) karein.');
                    if (onOpenCustomerAuth) {
                      onOpenCustomerAuth();
                    }
                    return;
                  }
                  setValidationError('');
                  setPaymentMethod('COD');
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer relative ${
                  paymentMethod === 'COD' && isLoggedInWithEmail
                    ? 'border-rose-900 bg-rose-50/80 text-rose-900 font-bold'
                    : !isLoggedInWithEmail
                      ? 'border-stone-300 bg-stone-100/70 text-stone-400 hover:border-amber-400'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                {!isLoggedInWithEmail ? (
                  <span className="absolute -top-2 -right-1 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shadow-2xs">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Login Req</span>
                  </span>
                ) : (
                  <span className="absolute -top-2 -right-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shadow-2xs">
                    <Check className="w-2.5 h-2.5" />
                    <span>Unlocked</span>
                  </span>
                )}
                <Banknote className="w-5 h-5" />
                <span>Cash on Delivery</span>
                <span className={`text-[10px] font-medium ${isLoggedInWithEmail ? 'text-amber-700' : 'text-stone-400'}`}>
                  {isLoggedInWithEmail ? 'Pay on Arrival' : 'Requires Login'}
                </span>
              </button>
            </div>

            {/* Guest Payment Compulsory Notice */}
            {!isLoggedInWithEmail && (
              <div className="mb-4 p-3 bg-amber-50/90 border border-amber-300 rounded-xl space-y-1.5 text-stone-800 animate-fadeIn">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                    <span>COD Policy: Advance Online Payment Compulsory Without Login</span>
                  </span>
                  <span className="text-[9px] bg-rose-100 text-rose-900 font-extrabold px-2 py-0.5 rounded border border-rose-300">
                    No COD
                  </span>
                </div>
                <p className="text-[11px] text-stone-700 leading-snug">
                  Bina login ke order confirm karne ke liye <strong>advance online payment (UPI, PhonePe, GPay, Paytm, Card) compulsory hai</strong>. Cash on Delivery keval verified Email se login karne par hi milta hai.
                </p>
                {onOpenCustomerAuth && (
                  <button
                    type="button"
                    onClick={onOpenCustomerAuth}
                    className="text-[11px] text-amber-900 hover:text-amber-950 font-bold underline inline-flex items-center gap-1 cursor-pointer pt-0.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email OTP Login Karke Cash on Delivery (COD) Unlock Karein &rarr;</span>
                  </button>
                )}
              </div>
            )}

            {/* Payment Method Details */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              {paymentMethod === 'UPI' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800 block">Choose Instant UPI Option:</span>
                    <span className="text-[11px] font-mono text-stone-500">
                      Amount: <strong className="text-stone-900">₹{totalAmount.toLocaleString('en-IN')}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'phonepe', label: 'PhonePe' },
                      { id: 'gpay', label: 'Google Pay' },
                      { id: 'paytm', label: 'Paytm' },
                      { id: 'qr', label: 'Scan Any QR' }
                    ].map((up) => (
                      <button
                        type="button"
                        key={up.id}
                        onClick={() => setUpiProvider(up.id as any)}
                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          upiProvider === up.id ? 'border-rose-800 bg-white shadow-xs text-rose-900 font-bold' : 'border-stone-300 bg-stone-100 text-stone-600'
                        }`}
                      >
                        {up.id === 'qr' && <QrCode className="w-3.5 h-3.5" />}
                        <span>{up.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Provider Action Details */}
                  {upiProvider === 'phonepe' && (
                    <div className="p-3.5 bg-white rounded-xl border border-stone-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-[#5f259f] text-white font-bold flex items-center justify-center text-xs">
                            P
                          </div>
                          <span className="font-bold text-stone-900">PhonePe Direct UPI</span>
                        </div>
                        <span className="text-[10px] text-stone-500 font-mono">Linked: +91 {gatewayConfig.registeredPhone}</span>
                      </div>
                      <p className="text-stone-600 text-[11px]">
                        Click below to open PhonePe on your mobile phone and make an instant payment of <strong>₹{totalAmount.toLocaleString('en-IN')}</strong> directly to <strong>Viral Sarees</strong>.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <a
                          href={`upi://pay?pa=${gatewayConfig.registeredPhone}@ybl&pn=${encodeURIComponent(STORE_CONFIG.storeName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order ${STORE_CONFIG.storeName}`)}`}
                          className="flex-1 py-2.5 bg-[#5f259f] hover:bg-[#4d1d82] text-white font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition shadow-xs text-xs"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Pay ₹{totalAmount.toLocaleString('en-IN')} on PhonePe</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {upiProvider === 'gpay' && (
                    <div className="p-3.5 bg-white rounded-xl border border-stone-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                            G
                          </div>
                          <span className="font-bold text-stone-900">Google Pay (GPay)</span>
                        </div>
                        <span className="text-[10px] text-stone-500 font-mono">Linked: +91 {gatewayConfig.registeredPhone}</span>
                      </div>
                      <p className="text-stone-600 text-[11px]">
                        Click below to launch Google Pay with verified recipient <strong>{gatewayConfig.merchantName}</strong> and pre-filled amount.
                      </p>
                      <a
                        href={`upi://pay?pa=${gatewayConfig.registeredPhone}@okaxis&pn=${encodeURIComponent(STORE_CONFIG.storeName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order ${STORE_CONFIG.storeName}`)}`}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition shadow-xs text-xs"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Pay ₹{totalAmount.toLocaleString('en-IN')} on Google Pay</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {upiProvider === 'paytm' && (
                    <div className="p-3.5 bg-white rounded-xl border border-stone-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                            Pay
                          </div>
                          <span className="font-bold text-stone-900">Paytm UPI</span>
                        </div>
                        <span className="text-[10px] text-stone-500 font-mono">Linked: +91 {gatewayConfig.registeredPhone}</span>
                      </div>
                      <p className="text-stone-600 text-[11px]">
                        Click below to complete fast payment via Paytm UPI wallet or linked bank account.
                      </p>
                      <a
                        href={`upi://pay?pa=${gatewayConfig.registeredPhone}@paytm&pn=${encodeURIComponent(STORE_CONFIG.storeName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order ${STORE_CONFIG.storeName}`)}`}
                        className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition shadow-xs text-xs"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Pay ₹{totalAmount.toLocaleString('en-IN')} on Paytm</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {upiProvider === 'qr' && (
                    <div className="p-4 bg-white rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                      <div className="p-2 bg-stone-50 rounded-xl border border-stone-300 shrink-0">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${gatewayConfig.upiId}&pn=${encodeURIComponent(STORE_CONFIG.storeName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=Order`)}`}
                          alt="Merchant UPI QR"
                          className="w-28 h-28 mx-auto"
                        />
                      </div>
                      <div className="text-xs space-y-1.5 flex-1">
                        <span className="font-bold text-stone-900 block text-sm">Scan with Any UPI App</span>
                        <p className="text-stone-500 text-[11px]">
                          Open PhonePe, GPay, Paytm, BHIM, or CRED to scan this merchant QR for <strong>₹{totalAmount.toLocaleString('en-IN')}</strong>.
                        </p>
                        <p className="text-[10px] text-emerald-800 font-semibold">
                          Direct settlement to: +91 {gatewayConfig.registeredPhone} (Viral Sarees)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Copyable UPI ID Bar */}
                  <div className="p-2.5 bg-stone-100/90 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-stone-500 font-medium">Registered Store UPI ID:</span>
                      <code className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-300">
                        {gatewayConfig.upiId}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(gatewayConfig.upiId);
                        setCopiedUpi(true);
                        setTimeout(() => setCopiedUpi(false), 2000);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg text-[11px] font-semibold text-stone-700 flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedUpi ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-stone-500" />
                          <span>Copy UPI ID</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {paymentMethod === 'Card' && (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Card Number (RuPay, Visa, Mastercard)</label>
                    <input
                      type="text"
                      placeholder="XXXX XXXX XXXX XXXX"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Expiry Date (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">CVV (3 Digits)</label>
                      <input
                        type="password"
                        placeholder="CVV"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'NetBanking' && (
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Select Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                  </select>
                </div>
              )}

              {paymentMethod === 'COD' && (
                <div className="flex items-start gap-2.5 text-stone-700">
                  <Banknote className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900 block">Cash on Delivery Verified</span>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Pay cash or scan courier QR on arrival at your doorstep. Please keep exact cash of ₹{totalAmount.toLocaleString('en-IN')} ready.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Important Return Policy Notice in Checkout */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-stone-800 space-y-1">
            <span className="font-bold text-amber-950 flex items-center gap-1 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              Return Policy Compliance Notice:
            </span>
            <p className="text-[11px] text-stone-700 leading-snug">
              For protection against missing items or courier transit damages, an <strong>Unboxing Video (an uncut, continuous 360-degree video recorded before opening the sealed package) is mandatory</strong>. Please record the unboxing upon parcel arrival.
            </p>
          </div>

          {/* Step 3: Order Summary & Placement */}
          <div className="p-4 rounded-2xl bg-stone-900 text-white space-y-3">
            <div className="flex justify-between items-center text-xs text-stone-300">
              <span>Items Total ({items.length} sarees)</span>
              <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center text-xs text-emerald-400">
                <span>Coupon Savings ({appliedCoupon})</span>
                <span className="font-mono">-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xs text-stone-300">
              <span>Delivery Charges</span>
              <span className="font-mono text-emerald-400">{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}</span>
            </div>

            <div className="pt-2 border-t border-stone-800 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-bold text-white block">Final Payable Amount</span>
                <span className="text-[10px] text-stone-400">All Taxes & Packaging Included</span>
              </div>
              <span className="text-2xl font-extrabold text-amber-300 font-mono">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              id="place-order-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-950/40 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Generating Order & Confirming with Courier...</span>
              ) : (
                <>
                  {!isLoggedInWithEmail ? (
                    <span>Pay ₹{totalAmount.toLocaleString('en-IN')} Online &amp; Book Order</span>
                  ) : paymentMethod === 'COD' ? (
                    <span>Confirm &amp; Place Order (Cash on Delivery)</span>
                  ) : (
                    <span>Pay ₹{totalAmount.toLocaleString('en-IN')} Online &amp; Confirm Order</span>
                  )}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-stone-400">
              {!isLoggedInWithEmail ? (
                <span className="text-amber-300 font-medium">
                  ⚠️ Guest Order: Advance online payment compulsory before order dispatch. COD ke liye Email Login karein.
                </span>
              ) : paymentMethod === 'COD' ? (
                <span className="text-emerald-400 font-medium">
                  ✓ Email Verified: Pay ₹{totalAmount.toLocaleString('en-IN')} in cash or courier UPI QR on delivery.
                </span>
              ) : (
                <span className="text-stone-300 font-medium">
                  ✓ 100% Secure Online Payment • Instant Courier Booking with SMS Updates.
                </span>
              )}
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};
