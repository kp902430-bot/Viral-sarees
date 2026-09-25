import React from 'react';
import { X, ShieldCheck, Mail, ArrowRight, Lock, Check, CreditCard, Sparkles, AlertTriangle } from 'lucide-react';

interface OrderLoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginWithEmail: () => void;
  onContinueWithoutLogin: () => void;
  totalAmount?: number;
  itemsCount?: number;
}

export const OrderLoginPromptModal: React.FC<OrderLoginPromptModalProps> = ({
  isOpen,
  onClose,
  onLoginWithEmail,
  onContinueWithoutLogin,
  totalAmount,
  itemsCount = 1
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border-2 border-amber-500/40 max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#590417] via-[#800020] to-[#3a020e] text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-serif-brand tracking-tight">
                  Checkout Verification
                </h3>
              </div>
              <p className="text-xs text-amber-200/90 font-medium mt-0.5">
                Sign in with Email to enable Cash on Delivery (COD)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-amber-200 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Important Rule Banner */}
          <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-1 text-stone-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0" />
              <span className="font-bold text-amber-950 text-xs sm:text-sm">
                Ordering & Payment Policy
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-700 leading-relaxed">
              <strong>Cash on Delivery (COD)</strong> is exclusively available for verified customer accounts. Guest orders require <strong>advance online payment (UPI, Cards, NetBanking)</strong> to confirm shipment.
            </p>
          </div>

          {/* Option 1: Login With Email (Recommended) */}
          <div className="p-4 bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border-2 border-emerald-500 rounded-2xl space-y-3 relative shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <div>
                  <h4 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                    <span>Sign In with Email OTP</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                      Recommended
                    </span>
                  </h4>
                  <p className="text-[11px] text-emerald-900 font-medium">
                    Unlocks Cash on Delivery (COD) instantly
                  </p>
                </div>
              </div>
            </div>

            <ul className="space-y-1.5 text-[11px] text-stone-700 pl-8 list-none">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span><strong>Cash on Delivery Available:</strong> Pay upon delivery via cash or courier QR scan.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span><strong>Live Courier Tracking:</strong> Real-time BlueDart / Delhivery tracking updates.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span><strong>Digital GST Invoice:</strong> Official tax receipt sent directly to your account.</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={onLoginWithEmail}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-700 hover:opacity-95 text-white font-bold rounded-xl shadow-md transition text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Mail className="w-4 h-4 text-emerald-200" />
              <span>Sign In with Email & Unlock COD</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Option 2: Continue as Guest (Online Pay Compulsory) */}
          <div className="p-4 bg-stone-50 border border-stone-300 rounded-2xl space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-stone-400 text-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">
                    Continue as Guest
                  </h4>
                  <p className="text-[11px] text-rose-700 font-semibold">
                    Advance Online Payment Only (No COD)
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-rose-100 text-rose-900 font-bold px-2 py-0.5 rounded-full border border-rose-300">
                COD Disabled
              </span>
            </div>

            <p className="text-[11px] text-stone-600 pl-8 leading-snug">
              You can place an order as a guest with instant online payment via <strong>UPI, PhonePe, Google Pay, Cards, or NetBanking</strong>. Cash on Delivery is disabled for guest orders.
            </p>

            <button
              type="button"
              onClick={onContinueWithoutLogin}
              className="w-full py-2.5 px-4 bg-white hover:bg-stone-100 text-stone-800 border border-stone-400 font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-2xs"
            >
              <CreditCard className="w-4 h-4 text-stone-600" />
              <span>Continue with Advance Online Payment</span>
            </button>
          </div>

          {/* Assurance Note */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-stone-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted • Government Registered Merchant</span>
          </div>

        </div>

      </div>
    </div>
  );
};
