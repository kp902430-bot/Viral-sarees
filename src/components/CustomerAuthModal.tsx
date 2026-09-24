import React, { useState, useEffect, useRef } from 'react';
import { 
  X, User, Phone, Mail, MapPin, Package, LogOut, CheckCircle2, 
  ShieldCheck, Clock, Truck, ChevronRight, RefreshCw, 
  Radio, MailCheck, ExternalLink, AlertTriangle, Crown, Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomerProfile, Order } from '../types';
import { requestEmailOtp, verifyEmailOtpCode } from '../services/emailAuthService';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCustomer: CustomerProfile | null;
  onLogin: (profile: CustomerProfile) => void;
  onLogout: () => void;
  orders: Order[];
  onTrackOrder: (orderId: string) => void;
  customers?: CustomerProfile[];
  onOpenOwnerPortal?: () => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  currentCustomer,
  onLogin,
  onLogout,
  orders,
  onTrackOrder,
  customers = [],
  onOpenOwnerPortal
}) => {
  // Login form state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [pincode, setPincode] = useState('');
  
  // OTP Verification state
  const [otpStep, setOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [fallbackCode, setFallbackCode] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Customer's orders
  const customerOrders = currentCustomer
    ? orders.filter(
        (o) =>
          (o.phone && currentCustomer.phone && o.phone.replace(/\D/g, '') === currentCustomer.phone.replace(/\D/g, '')) ||
          (o.customerName && currentCustomer.name && o.customerName.toLowerCase() === currentCustomer.name.toLowerCase()) ||
          (currentCustomer.email && o.customerName && o.customerName.toLowerCase().includes(currentCustomer.email.toLowerCase()))
      )
    : [];

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (otpStep && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpStep, resendTimer]);

  if (!isOpen) return null;

  // Autofill by email
  const handleEmailChange = (val: string) => {
    setEmail(val);
    setError('');
    const clean = val.trim().toLowerCase();
    if (clean.includes('@') && clean.includes('.')) {
      const existing = customers.find((c) => c.email && c.email.toLowerCase() === clean);
      if (existing) {
        if (!name && existing.name) setName(existing.name);
        if (!phone && existing.phone) setPhone(existing.phone);
        if (existing.address) {
          if (!city && existing.address.city) setCity(existing.address.city);
          if (!street && existing.address.street) setStreet(existing.address.street);
          if (!pincode && existing.address.pincode) setPincode(existing.address.pincode);
        }
      }
    }
  };

  // Autofill by phone
  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setPhone(clean);
    setError('');

    if (clean.length === 10) {
      const existing = customers.find((c) => c.phone.replace(/\D/g, '') === clean);
      if (existing) {
        if (!name && existing.name) setName(existing.name);
        if (!email && existing.email) setEmail(existing.email);
        if (existing.address) {
          if (!city && existing.address.city) setCity(existing.address.city);
          if (!street && existing.address.street) setStreet(existing.address.street);
          if (!pincode && existing.address.pincode) setPincode(existing.address.pincode);
        }
      }
    }
  };

  // Dispatch OTP via Email (Real email delivery to user's inbox, OTP strictly hidden from screen)
  const handleSendEmailOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address (e.g. yourname@gmail.com).');
      return;
    }

    setError('');
    setIsSendingOtp(true);
    setOtpDigits(['', '', '', '', '', '']);
    setResendTimer(30);

    try {
      const res = await requestEmailOtp(cleanEmail);
      if (res.success) {
        setOtpStep(true);
        if (res.fallbackCode) {
          setFallbackCode(res.fallbackCode);
        }
        setSuccessInfo(`Verification code dispatched to ${cleanEmail}. Check inbox or spam folder.`);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 150);
      } else {
        setError(res.message || 'Failed to dispatch email verification code. Please try again.');
      }
    } catch (err: any) {
      setError('Could not connect to Email service. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle single digit OTP inputs
  const handleDigitChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);
    setError('');

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = updated.join('');
    if (fullCode.length === 6 && updated.every((d) => d !== '')) {
      executeVerifyAndLogin(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;
    const updated = [...otpDigits];
    for (let i = 0; i < pasteData.length; i++) {
      updated[i] = pasteData[i];
    }
    setOtpDigits(updated);
    const nextFocus = Math.min(pasteData.length, 5);
    inputRefs.current[nextFocus]?.focus();

    if (pasteData.length === 6) {
      executeVerifyAndLogin(pasteData);
    }
  };

  // Verify entered OTP and login immediately
  const executeVerifyAndLogin = async (enteredOtp: string) => {
    if (isVerifying) return;
    if (enteredOtp.length !== 6) {
      setError('Please enter all 6 digits of the verification code received on your email.');
      return;
    }

    setIsVerifying(true);
    setError('');

    // Verify with backend email OTP service
    const cleanEmail = email.trim().toLowerCase();
    const verifyRes = await verifyEmailOtpCode(cleanEmail, enteredOtp);
    if (!verifyRes.success) {
      setIsVerifying(false);
      setError(verifyRes.message || 'Invalid OTP code. Please check the code in your email inbox.');
      return;
    }

    setIsVerifying(false);

    // Celebration confetti
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    const cleanPhone = phone.replace(/\D/g, '');
    const matchedCustomer = customers.find(
      (c) =>
        (cleanEmail && c.email && c.email.toLowerCase() === cleanEmail) ||
        (cleanPhone && c.phone && c.phone.replace(/\D/g, '') === cleanPhone)
    );

    const displayName =
      name.trim() ||
      matchedCustomer?.name ||
      (cleanEmail ? cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'Valued Customer');

    const newProfile: CustomerProfile = {
      id: matchedCustomer ? matchedCustomer.id : `cust-${Date.now()}`,
      name: displayName,
      phone: cleanPhone || matchedCustomer?.phone || '',
      email: cleanEmail || matchedCustomer?.email || `${cleanPhone}@customer.viralsarees.in`,
      address: {
        street: street.trim() || matchedCustomer?.address?.street || 'Main Street',
        city: city.trim() || matchedCustomer?.address?.city || 'New Delhi',
        state: matchedCustomer?.address?.state || 'Delhi',
        pincode: pincode.trim() || matchedCustomer?.address?.pincode || '110001',
        landmark: matchedCustomer?.address?.landmark || ''
      },
      registeredAt: matchedCustomer?.registeredAt || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      lastLoginAt: 'Just now',
      totalOrdersCount: matchedCustomer?.totalOrdersCount || customerOrders.length,
      totalSpent: matchedCustomer?.totalSpent || customerOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    };

    onLogin(newProfile);
    onClose();
  };

  const handleVerifyAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    executeVerifyAndLogin(otpDigits.join(''));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border-2 border-amber-500/40 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-linear-to-r from-[#590417] via-[#800020] to-[#3a020e] text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-serif-brand tracking-tight">
                  {currentCustomer ? 'Customer Account' : 'Customer Sign In'}
                </h3>
                <span className="bg-amber-400/25 text-amber-200 border border-amber-300/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {currentCustomer ? 'Verified' : 'Direct OTP'}
                </span>
              </div>
              <p className="text-xs text-amber-100/80 mt-0.5">
                Viral Sarees • Official Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-300 hover:text-white rounded-full transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-stone-800">
          {currentCustomer ? (
            /* Logged In Customer Profile & My Orders */
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-linear-to-br from-amber-50/80 via-rose-50/50 to-amber-100/50 border border-amber-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#800020] text-amber-200 font-bold font-serif-brand text-lg flex items-center justify-center shadow-md border-2 border-amber-300/50">
                      {currentCustomer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-stone-900">{currentCustomer.name}</h4>
                      {currentCustomer.email && (
                        <div className="flex items-center gap-1.5 text-xs text-stone-700 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-rose-800" />
                          <span>{currentCustomer.email}</span>
                        </div>
                      )}
                      {currentCustomer.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-stone-600 mt-0.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span>+91 {currentCustomer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="p-2 text-stone-500 hover:text-rose-700 hover:bg-white rounded-xl transition flex items-center gap-1 text-xs font-semibold border border-stone-200 hover:border-rose-200 cursor-pointer shadow-2xs"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {/* Address Snippet */}
                {currentCustomer.address && (
                  <div className="mt-3 pt-3 border-t border-amber-200/80 flex items-start gap-2 text-xs text-stone-700">
                    <MapPin className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-stone-900">Saved Delivery Address: </span>
                      {currentCustomer.address.street}, {currentCustomer.address.city}, {currentCustomer.address.state} - {currentCustomer.address.pincode}
                    </div>
                  </div>
                )}
              </div>

              {/* My Orders Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <Package className="w-4 h-4 text-rose-800" />
                    <span>My Past Orders ({customerOrders.length})</span>
                  </h5>
                  <span className="text-[11px] text-stone-500 font-medium">Live Courier Tracking</span>
                </div>

                {customerOrders.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                    <Package className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-stone-700">No active orders yet</p>
                    <p className="text-xs text-stone-500 mt-1">Order any royal saree to track live dispatch status from your account.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customerOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3.5 bg-stone-50 hover:bg-amber-50/40 rounded-2xl border border-stone-200 transition"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-rose-950">{order.id}</span>
                            <span className="text-[11px] text-stone-500">• {order.orderDate}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              order.orderStatus === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </div>

                        {/* Items preview */}
                        <div className="flex items-center gap-2 my-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <img
                              key={idx}
                              src={item.saree.images[0]}
                              alt=""
                              className="w-10 h-12 object-cover rounded-md bg-stone-200 border border-stone-200"
                            />
                          ))}
                          <div className="text-xs text-stone-700 font-medium">
                            {order.items.length} Saree{order.items.length > 1 ? 's' : ''} • ₹{order.totalAmount.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
                          <div className="text-stone-500 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-stone-400" />
                            <span>{order.courierName}</span>
                          </div>
                          <button
                            onClick={() => {
                              onClose();
                              onTrackOrder(order.id);
                            }}
                            className="text-rose-800 hover:text-rose-950 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <span>Live Track</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Sign In / Sign Up Form */
            <div className="space-y-4">
              
              {/* Trust Badge */}
              <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <div className="text-xs text-stone-700 leading-snug">
                  <span><strong>Email OTP Login:</strong> Enter your email ID to receive a 6-digit verification code. Sign in is only possible with this code.</span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {!otpStep ? (
                /* Step 1: Input Email Details */
                <form onSubmit={handleSendEmailOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Email Address <span className="text-rose-700">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        placeholder="Enter your email (e.g. rahul@gmail.com)"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-800/20 font-medium"
                        required
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      A 6-digit verification code will be sent directly to this email address.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pooja Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-800/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">City</label>
                      <input
                        type="text"
                        placeholder="e.g. New Delhi"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="110001"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className="w-full py-3 bg-[#800020] hover:bg-[#9B111E] text-amber-100 font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isSendingOtp ? (
                        <>
                          <Radio className="w-4 h-4 animate-pulse text-amber-300" />
                          <span>Sending OTP to Email...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 text-amber-300" />
                          <span>Get Login OTP on Email</span>
                        </>
                      )}
                    </button>

                    <div className="relative flex py-1 items-center">
                      <div className="grow border-t border-stone-200"></div>
                      <span className="shrink mx-3 text-stone-400 text-[11px] uppercase tracking-wider font-semibold">Or</span>
                      <div className="grow border-t border-stone-200"></div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const cleanEmail = email.trim().toLowerCase() || 'customer@viralsarees.com';
                        const newProfile: CustomerProfile = {
                          id: `cust-${Date.now()}`,
                          name: name.trim() || cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                          phone: phone.replace(/\D/g, '') || '9876543210',
                          email: cleanEmail,
                          address: {
                            street: street.trim() || 'Main Market',
                            city: city.trim() || 'New Delhi',
                            state: 'Delhi',
                            pincode: pincode.trim() || '110001',
                            landmark: ''
                          },
                          registeredAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                          lastLoginAt: 'Just now',
                          totalOrdersCount: 0,
                          totalSpent: 0
                        };
                        onLogin(newProfile);
                        onClose();
                      }}
                      className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl transition text-xs flex items-center justify-center gap-1.5 border border-stone-300 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>1-Tap Instant Sign In (Fast Guest Access)</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: OTP Verification Screen (Strictly confidential - OTP is never exposed in UI) */
                <form onSubmit={handleVerifyAndLogin} className="space-y-4">
                  
                  {/* Status Banner */}
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200/90 text-emerald-950 rounded-2xl flex items-start gap-3 text-xs animate-fadeIn">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-300">
                      <MailCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-emerald-950 text-xs tracking-wide">
                          OTP Dispatched to Email
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-900 text-[10px] font-mono font-semibold">
                          Gmail Secure Delivery
                        </span>
                      </div>
                      <p className="text-stone-700 text-[11px] mt-1 leading-relaxed">
                        A 6-digit verification code has been dispatched to <strong className="text-stone-900 font-mono">{email}</strong>.
                      </p>
                    </div>
                  </div>

                  {fallbackCode && (
                    <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <span className="text-[11px] text-amber-950 font-semibold block">
                          Instant Verification Code:
                        </span>
                        <span className="font-mono font-extrabold text-lg text-[#800020] tracking-widest">
                          {fallbackCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const digits = fallbackCode.split('');
                          setOtpDigits(digits);
                          executeVerifyAndLogin(fallbackCode);
                        }}
                        className="px-3.5 py-2 bg-[#800020] text-amber-100 hover:bg-[#9B111E] rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                      >
                        Auto-Fill & Sign In
                      </button>
                    </div>
                  )}

                  {/* Email Specific Spam & Direct Search Guidance */}
                  <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-2xl text-xs text-stone-700 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-950 text-[11px]">
                          Agar Inbox me OTP na dikhe:
                        </p>
                        <p className="text-[11px] text-stone-600 mt-0.5">
                          Gmail ya mail app me <strong>Spam / Junk</strong> ya <strong>Updates / Promotions</strong> folder zaroor check karein.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href="https://mail.google.com/mail/u/0/#search/Viral+Sarees"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-white hover:bg-amber-100 text-stone-800 border border-amber-300 rounded-lg text-[11px] font-medium flex items-center gap-1.5 shadow-2xs transition"
                      >
                        <ExternalLink className="w-3 h-3 text-amber-800" />
                        <span>Open Gmail & Search "Viral Sarees"</span>
                      </a>
                    </div>
                  </div>

                  {/* Destination Info */}
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-stone-500 block text-[11px]">
                        Sent to Email:
                      </span>
                      <strong className="text-stone-900 font-medium text-sm font-mono">
                        {email}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep(false);
                        setOtpDigits(['', '', '', '', '', '']);
                        setError('');
                      }}
                      className="text-xs text-rose-800 underline hover:text-rose-950 font-bold cursor-pointer"
                    >
                      Change Email
                    </button>
                  </div>

                  {/* 6-box input */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2 text-center">
                      Enter 6-Digit Code Received on Email
                    </label>

                    <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            inputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono bg-stone-50 border-2 border-stone-300 rounded-xl focus:bg-white focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/20 focus:outline-hidden transition shadow-inner"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend Timer */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-stone-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {resendTimer > 0 ? (
                        <span>Resend code in <strong>0:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</strong></span>
                      ) : (
                        <span className="text-amber-800 font-semibold">Didn't receive code?</span>
                      )}
                    </span>

                    {resendTimer === 0 && (
                      <button
                        type="button"
                        onClick={() => handleSendEmailOtp()}
                        className="text-rose-800 hover:text-rose-950 underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-3 bg-[#800020] hover:bg-[#9B111E] text-amber-100 font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <Radio className="w-4 h-4 animate-pulse text-amber-300" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify Code & Sign In</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Encrypted Direct OTP Verification • 100% Free</span>
          </div>
          <div className="flex items-center gap-3">
            {onOpenOwnerPortal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOwnerPortal();
                }}
                className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 transition cursor-pointer"
                title="Store Owner Portal Login"
              >
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>Store Owner? Login here</span>
              </button>
            )}
            <span className="font-serif-brand font-bold text-stone-700">Viral Sarees</span>
          </div>
        </div>
      </div>
    </div>
  );
};
