import React from 'react';
import { SareeReel, Saree } from '../types';
import { Film, Play, Heart, Eye, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';

interface FeaturedReelsSectionProps {
  reels: SareeReel[];
  sarees: Saree[];
  onSelectReel: (reel: SareeReel) => void;
  onOpenAllReels: () => void;
  onAddToCart: (saree: Saree) => void;
}

export const FeaturedReelsSection: React.FC<FeaturedReelsSectionProps> = ({
  reels,
  sarees,
  onSelectReel,
  onOpenAllReels,
  onAddToCart,
}) => {
  if (!reels || reels.length === 0) return null;

  // Take top 4 trending reels
  const featured = reels.slice(0, 4);

  return (
    <section className="my-6 relative">
      {/* Sleek Royal Gold & Crimson Banner Container */}
      <div className="bg-linear-to-r from-[#38010E] via-[#520216] to-[#2E010B] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 text-white border border-amber-500/35 shadow-xl overflow-hidden relative">
        
        {/* Subtle background golden ambient lighting */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffd700_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Compact & Attractive Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-400/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-200 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase">
                <Film className="w-3 h-3 text-rose-400 animate-pulse" />
                <span>Video Drapes</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              </span>
              <span className="text-[11px] text-amber-300/75 hidden sm:inline-block">• 9:16 HD Motion</span>
            </div>
            
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight font-serif-brand">
                <span className="text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">Trending Saree</span>{' '}
                <span className="bg-gradient-to-r from-[#FFF8D1] via-[#F8D879] to-[#E3AF3A] bg-clip-text text-transparent">
                  Reels & Drapes
                </span>
              </h2>
              <span className="text-xs text-amber-200/80 font-normal italic">
                (Experience 360° Drape & Zari Fall in Motion)
              </span>
            </div>
          </div>

          <button
            onClick={onOpenAllReels}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-stone-950 font-bold text-xs transition shadow-md shadow-amber-950/20 cursor-pointer hover:scale-103 shrink-0 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-950" />
            <span>All Reels ({reels.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Compact & Refined Video Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {featured.map((reel) => {
            const linkedSaree = sarees.find((s) => s.id === reel.sareeId);
            return (
              <div
                key={reel.id}
                className="group relative bg-stone-950 rounded-xl overflow-hidden border border-amber-500/25 hover:border-amber-400 shadow-lg hover:shadow-amber-500/15 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Compact Thumbnail Container (Aspect 9/12 for sleek, proportional height) */}
                <div
                  onClick={() => onSelectReel(reel)}
                  className="relative aspect-[9/12] overflow-hidden cursor-pointer bg-stone-900"
                >
                  <img
                    src={reel.thumbnailUrl}
                    alt={reel.title}
                    className="w-full h-full object-cover group-hover:scale-106 transition duration-500"
                    loading="lazy"
                  />

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/25 to-transparent" />

                  {/* Sleek Play badge */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-950/80 border border-amber-400/80 text-amber-300 flex items-center justify-center shadow-xl group-hover:scale-110 transition duration-300 backdrop-blur-xs">
                      <Play className="w-4 h-4 fill-amber-300 ml-0.5" />
                    </div>
                  </div>

                  {/* Live / Duration badges */}
                  <div className="absolute top-2 inset-x-2 flex items-center justify-between z-10 text-[9px] sm:text-[10px] font-bold">
                    <span className="bg-black/75 text-stone-100 px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-white/15 backdrop-blur-xs">
                      <Eye className="w-2.5 h-2.5 text-amber-300" />
                      {reel.views}
                    </span>
                    <span className="bg-rose-600/90 text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider font-extrabold shadow-xs">
                      {reel.duration}
                    </span>
                  </div>

                  {/* Bottom title info */}
                  <div className="absolute bottom-2 inset-x-2 z-10 text-white space-y-0.5">
                    <span className="text-[9px] sm:text-[10px] text-amber-300 font-bold block truncate">
                      {reel.drapeStyle}
                    </span>
                    <h3 className="font-bold text-[11px] sm:text-xs text-white line-clamp-1 leading-snug drop-shadow-md group-hover:text-amber-200 transition">
                      {reel.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-stone-300 pt-0.5 border-t border-white/15">
                      <span className="truncate max-w-[65%]">{reel.modelOrCreator}</span>
                      <span className="flex items-center gap-0.5 text-rose-400 font-bold shrink-0">
                        <Heart className="w-2.5 h-2.5 fill-rose-500" />
                        {reel.likes.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Saree Buy Footer - Compact & Neat */}
                {linkedSaree && (
                  <div className="py-2 px-2.5 bg-stone-900/95 border-t border-amber-500/20 flex items-center justify-between gap-1.5">
                    <div className="min-w-0">
                      <p className="text-[9px] text-stone-400 leading-tight">Weaver Direct</p>
                      <p className="text-xs sm:text-sm font-extrabold text-amber-300 leading-tight">
                        ₹{linkedSaree.price.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onSelectReel(reel)}
                        className="px-2 py-1 rounded-md bg-amber-400/20 hover:bg-amber-400 text-amber-200 hover:text-stone-950 text-[10px] font-bold border border-amber-400/35 transition cursor-pointer"
                        title="Watch full video"
                      >
                        Watch
                      </button>
                      <button
                        onClick={() => onAddToCart(linkedSaree)}
                        className="p-1 rounded-md bg-[#800020] hover:bg-[#9B111E] text-amber-100 transition shadow-xs cursor-pointer"
                        title="Add saree to bag"
                      >
                        <ShoppingBag className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
