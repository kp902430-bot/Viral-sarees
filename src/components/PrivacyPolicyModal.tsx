import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, Server, FileCheck, Phone } from 'lucide-react';
import { STORE_CONFIG } from '../data/storeConfig';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#800020] to-[#9B111E] text-amber-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Privacy & Security Policy</h3>
              <p className="text-[11px] text-amber-200">Viral Sarees Customer Data Protection Standards</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-amber-200 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 text-xs text-stone-700 space-y-6 leading-relaxed">
          
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-950 text-sm mb-1">Our Privacy Pledge to You</h4>
              <p className="text-emerald-900">
                At Viral Sarees, your trust is our most treasured asset. We adhere to stringent Indian Information Technology Act rules and global digital commerce privacy standards. We never sell, rent, or trade your personal information.
              </p>
            </div>
          </div>

          {/* Section 1: Information We Collect */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-rose-900" />
              <span>1. Information We Collect</span>
            </h4>
            <p>
              When you browse our catalogues, place orders, or request tracking for sarees, we collect only necessary data:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li><strong>Contact Information:</strong> Full name, shipping delivery address, pincode, mobile number, and email.</li>
              <li><strong>Order History:</strong> Saree SKUs purchased, tailoring specifications, and transaction logs.</li>
              <li><strong>Courier Tracking Data:</strong> Delivery status, courier dispatch milestones, and OTP verification logs.</li>
            </ul>
          </div>

          {/* Section 2: Payment Security */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-800" />
              <span>2. 100% Secure Payment Gateways</span>
            </h4>
            <p>
              All online payments (UPI, Debit/Credit cards, NetBanking) are processed through Reserve Bank of India (RBI) approved, PCI-DSS Level 1 compliant payment gateways:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li>Viral Sarees <strong>NEVER</strong> stores your credit/debit card numbers, CVV, or banking passwords on our servers.</li>
              <li>Transactions are secured with <strong>256-Bit SSL Encryption</strong> end-to-end.</li>
              <li>Cash on Delivery (COD) requires phone/OTP verification to safeguard customer delivery accuracy.</li>
            </ul>
          </div>

          {/* Section 3: Communications & SMS */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-700" />
              <span>3. Order Updates via SMS & WhatsApp</span>
            </h4>
            <p>
              We send informational notifications regarding your order dispatch, BlueDart / Delhivery tracking link, and delivery updates. You may opt out of promotional communications at any time.
            </p>
          </div>

          {/* Section 4: Return Policy Verification Data */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-800" />
              <span>4. Unboxing Video Proof Data</span>
            </h4>
            <p>
              Unboxing video proofs submitted during return claims for missing or damaged products are securely audited solely by our fraud prevention and courier claims desk. Videos are discarded after claim resolution and refund settlement.
            </p>
          </div>

          {/* Section 5: Grievance Officer */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <h5 className="font-bold text-stone-900 text-sm mb-1">Grievance Officer Contact Details</h5>
            <p className="text-stone-600">
              For any privacy concerns or data access requests:
            </p>
            <p className="font-medium text-stone-800 mt-1">
              Viral Sarees Private Limited<br />
              {STORE_CONFIG.shopAddress}<br />
              Email: <a href={`mailto:${STORE_CONFIG.supportEmail}`} className="text-rose-900 underline font-semibold">{STORE_CONFIG.supportEmail}</a> | Helpline: <a href={`tel:${STORE_CONFIG.officialPhone.replace(/\s+/g, '')}`} className="font-semibold text-stone-900">{STORE_CONFIG.officialPhone}</a>
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-stone-900 text-white font-bold rounded-xl text-xs hover:bg-stone-800 transition"
          >
            I Understand & Accept
          </button>
        </div>

      </div>
    </div>
  );
};
