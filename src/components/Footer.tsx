import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Truck, RotateCcw, Heart, Video } from 'lucide-react';
import { STORE_CONFIG } from '../data/storeConfig';
import { ViralSareesLogo } from './ViralSareesLogo';

interface FooterProps {
  onOpenTracking: () => void;
  onOpenReturnPolicy: () => void;
  onOpenPrivacyPolicy: () => void;
  onSelectCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenTracking,
  onOpenReturnPolicy,
  onOpenPrivacyPolicy,
  onSelectCategory,
}) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-16">
      
      {/* Top Value Strip */}
      <div className="border-b border-stone-800 py-8 bg-stone-950/60">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white block">Silk Mark Certified</span>
              <span className="text-stone-400">100% authentic handloom pure silks</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white block">Cash on Delivery (COD)</span>
              <span className="text-stone-400">Available across 26,000+ pincodes</span>
            </div>
          </div>

          <div 
            onClick={onOpenReturnPolicy}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white group-hover:text-amber-300 transition block">
                7-Day Easy Returns
              </span>
              <span className="text-stone-400">Unboxing video mandatory for claims</span>
            </div>
          </div>

          <div 
            onClick={onOpenTracking}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white group-hover:text-emerald-300 transition block">
                Easy Live Tracking
              </span>
              <span className="text-stone-400">BlueDart & Delhivery updates</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Links */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
        
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <ViralSareesLogo 
            variant="horizontal" 
            size="lg" 
            dark={true} 
            showTagline={true} 
            showPill={true} 
          />
          <p className="text-stone-300 leading-relaxed max-w-sm pt-1 font-medium">
            Viral Sarees brings you India's most trending and viral sarees direct from Surat and Banaras master artisan looms at weaver-direct prices. Trend humse shuru hota hai. Price Kam, Quality Mein Dum.
          </p>
          <div className="text-stone-400 space-y-1.5 pt-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Artisan Textile Market, Ring Road, Surat, Gujarat - 395002</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Customer Helpline: <strong>{STORE_CONFIG.officialPhone}</strong> (10 AM - 8 PM)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Email: <a href={`mailto:${STORE_CONFIG.supportEmail}`} className="underline hover:text-white">{STORE_CONFIG.supportEmail}</a></span>
            </div>
          </div>
        </div>

        {/* Categories Column */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs font-serif-brand">
            Popular Collections
          </h4>
          <ul className="space-y-2 text-stone-400">
            {['Banarasi Silk', 'Kanjivaram Silk', 'Pure Organza', 'Paithani Silk', 'Georgette', 'Bandhani', 'Tissue Silk'].map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => onSelectCategory(cat)}
                  className="hover:text-amber-300 transition"
                >
                  {cat} Sarees
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Care & Orders */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs font-serif-brand">
            Orders & Tracking
          </h4>
          <ul className="space-y-2 text-stone-400">
            <li>
              <button onClick={onOpenTracking} className="hover:text-amber-300 transition text-amber-200 font-semibold">
                Track Your Saree Order →
              </button>
            </li>
            <li>
              <button onClick={onOpenReturnPolicy} className="hover:text-amber-300 transition text-rose-300 font-semibold">
                7-Day Return Policy (Video Req.)
              </button>
            </li>
            <li>
              <button onClick={onOpenPrivacyPolicy} className="hover:text-amber-300 transition">
                Privacy & Security Policy
              </button>
            </li>
            <li>
              <a href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`} target="_blank" rel="noreferrer" className="hover:text-emerald-300 transition">
                WhatsApp Live Help Desk (+91 {STORE_CONFIG.whatsappNumber.slice(2)})
              </a>
            </li>
          </ul>
        </div>

        {/* Policy & Guarantee Note */}
        <div className="space-y-3 bg-stone-950 p-4 rounded-2xl border border-stone-800">
          <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
            <Video className="w-4 h-4 text-amber-400" />
            <span>Return Policy Rule</span>
          </h4>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            As highlighted in our store policy: In case of missing items or damaged goods, an uncut <strong>360-degree unboxing video is strictly compulsory</strong> from the moment the sealed courier packet is opened.
          </p>
          <button
            onClick={onOpenReturnPolicy}
            className="text-[11px] text-amber-200 underline font-semibold hover:text-white"
          >
            Read Unboxing Video Instructions →
          </button>
        </div>

      </div>

      {/* Bottom Copyright & Payment Logos */}
      <div className="border-t border-stone-800 py-6 text-stone-500 text-[11px]">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Viral Sarees. All rights reserved. Handcrafted with pride in India.</p>
          <div className="flex items-center gap-3 text-stone-400 font-medium">
            <span>Secure Gateways:</span>
            <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono text-[10px]">UPI</span>
            <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono text-[10px]">RuPay</span>
            <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono text-[10px]">Visa</span>
            <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono text-[10px]">Mastercard</span>
            <span className="px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 font-mono text-[10px]">COD</span>
          </div>
        </div>
      </div>

    </footer>
  );
};
