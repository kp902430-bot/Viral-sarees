import React from 'react';
import { Truck, RotateCcw, Film, Sparkles, Smartphone, Crown } from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
  onTrackClick: () => void;
  onReturnPolicyClick: () => void;
  onSelectCategory: (category: string) => void;
  onOpenReels: () => void;
  onInstallAppClick?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreClick,
  onTrackClick,
  onReturnPolicyClick,
  onSelectCategory,
  onOpenReels,
  onInstallAppClick,
}) => {
  return (
    <div className="w-full mb-6">
      {/* Clean, Simple & Premium Store Header / Description */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4A0012] via-[#66001A] to-[#30000D] text-white shadow-xl border-2 border-amber-500/40 p-5 sm:p-6 md:p-7">
        
        {/* Subtle royal background glow */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Store Info & Description */}
          <div className="flex-1 text-center md:text-left space-y-3">
            
            {/* Top Royal Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400/20 via-amber-300/10 to-amber-400/20 border border-amber-300/40 text-amber-200 text-[11px] sm:text-xs font-semibold tracking-wider uppercase shadow-xs">
              <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Direct From Surat & Varanasi Weavers</span>
            </div>

            {/* Brand Title & Taglines (Well-proportioned & High Craftsmanship) */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center justify-center md:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl md:text-[2.1rem] lg:text-[2.35rem] font-black tracking-tight font-serif-brand leading-none">
                  <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">Viral</span>{' '}
                  <span className="bg-gradient-to-r from-[#FFF8D1] via-[#F5D36F] via-[#DEAA37] to-[#FCE28A] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(222,170,55,0.4)]">
                    Sarees
                  </span>
                </h1>
                <span className="text-amber-300 text-base sm:text-lg animate-pulse">✨</span>
              </div>

              {/* Tagline: "Trend humse shuru hota hai." with graceful ornamental lines & bold gold shimmer */}
              <div className="flex items-center justify-center md:justify-start gap-2.5 pt-0.5">
                <span className="hidden sm:inline-block w-7 sm:w-10 h-[1.5px] bg-gradient-to-r from-transparent to-amber-300" />
                <p
                  className="text-base sm:text-lg md:text-xl italic font-serif tracking-wide bg-gradient-to-r from-[#FFFDF0] via-[#FDE48F] via-[#E8B83D] to-[#FFF3BF] bg-clip-text text-transparent font-bold sm:font-extrabold drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  “Trend humse shuru hota hai.”
                </p>
                <span className="hidden sm:inline-block w-7 sm:w-10 h-[1.5px] bg-gradient-to-l from-transparent to-amber-300" />
              </div>
            </div>

            {/* Pill Tagline */}
            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FDE895] via-[#E9B838] to-[#C9911C] text-[#33020A] font-extrabold text-[11px] sm:text-xs tracking-wider uppercase shadow-md shadow-amber-950/20 border border-amber-200">
                <Sparkles className="w-3 h-3 text-[#33020A] fill-current" />
                <span>Price Kam, Quality Mein Dum</span>
              </span>
            </div>

            {/* Store Description (Directly precedes the catalogue) */}
            <p className="text-stone-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              India ki sabse viral aur trending sarees direct Surat aur Varanasi master weavers se. Har design me 100% premium fabric aur authentic craftsmanship — bina kisi middleman ke direct aapke ghar tak.
            </p>

            {/* Quick Helper Links */}
            <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs">
              <button
                onClick={onOpenReels}
                className="px-3 py-1.5 rounded-xl bg-rose-700/80 hover:bg-rose-700 text-white font-bold border border-rose-400/40 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Film className="w-3.5 h-3.5 text-amber-300" />
                <span>Video Reels</span>
              </button>

              <button
                onClick={onTrackClick}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5 text-amber-300" />
                <span>Track Order</span>
              </button>

              <button
                onClick={onReturnPolicyClick}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                <span>7-Day Return</span>
              </button>

              {onInstallAppClick && (
                <button
                  onClick={onInstallAppClick}
                  className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 hover:text-white font-bold border border-amber-400/40 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                  <span>Install App</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
