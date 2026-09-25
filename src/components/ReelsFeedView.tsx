import React, { useState } from 'react';
import { SareeReel, Saree } from '../types';
import { Play, Heart, MessageCircle, Sparkles, Film, ArrowRight, ShoppingBag, Layers, Eye } from 'lucide-react';

interface ReelsFeedViewProps {
  reels: SareeReel[];
  sarees: Saree[];
  onSelectReel: (reel: SareeReel) => void;
  onAddToCart: (saree: Saree) => void;
  onBuyNow: (saree: Saree) => void;
  onBackToCatalogue: () => void;
}

export const ReelsFeedView: React.FC<ReelsFeedViewProps> = ({
  reels,
  sarees,
  onSelectReel,
  onAddToCart,
  onBuyNow,
  onBackToCatalogue
}) => {
  const [filterTag, setFilterTag] = useState<string>('all');

  const tags = ['all', 'Bridal', 'Banarasi', 'Kanjivaram', 'Organza', 'DayWedding', 'Partywear'];

  const filteredReels = filterTag === 'all' 
    ? reels 
    : reels.filter(r => r.tags.some(t => t.toLowerCase() === filterTag.toLowerCase()));

  return (
    <div className="py-6 space-y-8 animate-fadeIn">
      
      {/* High-Contrast Hero Banner for Reels */}
      <div className="rounded-3xl bg-linear-to-r from-[#200408] via-[#350711] to-[#1F040A] text-white p-6 sm:p-10 border border-amber-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wider uppercase">
            <Film className="w-3.5 h-3.5" />
            <span>Interactive Video Drape Studio • Watch & Shop</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-serif-brand leading-tight">
            See the Real Weave, <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-300 via-yellow-200 to-amber-400">
              Shine & 360° Drape Movement
            </span>
          </h1>

          <p className="text-sm sm:text-base text-stone-200 leading-relaxed max-w-2xl font-medium">
            Watch master artisans and drape stylists show exact fabric pleating, zari luster in natural lighting, and blouse styling. Tap any reel to watch and order directly with 1-click checkout!
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {reels.length > 0 && (
              <button
                onClick={() => onSelectReel(reels[0])}
                className="px-6 py-3 rounded-xl bg-linear-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-extrabold text-sm shadow-xl shadow-amber-950/40 transition flex items-center gap-2 cursor-pointer transform hover:scale-105"
              >
                <Play className="w-4 h-4 fill-stone-950" />
                <span>Start Watching Reels</span>
              </button>
            )}

            <button
              onClick={onBackToCatalogue}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition cursor-pointer backdrop-blur-md"
            >
              ← Back to Catalogue
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      {reels.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-200">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider pl-1">
            Explore by Mood:
          </span>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                filterTag === tag
                  ? 'bg-[#800020] text-amber-100 shadow-md shadow-rose-950/20'
                  : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-500'
              }`}
            >
              {tag === 'all' ? '✨ All Saree Reels' : `#${tag}`}
            </button>
          ))}
        </div>
      )}

      {/* Reels Grid or Empty State */}
      {filteredReels.length === 0 ? (
        <div className="py-20 px-6 text-center bg-stone-900/60 rounded-3xl border border-stone-800 space-y-3 text-stone-300">
          <Film className="w-12 h-12 text-stone-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Video Reels Published Yet</h3>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            Authentic saree drape videos, 360° fabric luster, and styling reels will appear here once published.
          </p>
          <button
            onClick={onBackToCatalogue}
            className="px-5 py-2.5 bg-[#800020] hover:bg-[#9B111E] text-amber-100 font-bold rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer shadow-xs transition"
          >
            ← Back to Saree Catalogue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredReels.map((reel) => {
          const linkedSaree = sarees.find(s => s.id === reel.sareeId);
          return (
            <div
              key={reel.id}
              className="group relative bg-stone-900 rounded-3xl overflow-hidden border-2 border-stone-800 hover:border-amber-400/80 shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Thumbnail with overlay */}
              <div 
                onClick={() => onSelectReel(reel)}
                className="relative aspect-9/16 overflow-hidden cursor-pointer bg-stone-950"
              >
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition duration-500"
                  loading="lazy"
                />

                {/* Gradient shade */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

                {/* Play Button Glow */}
                <div className="absolute inset-0 flex items-center justify-center opacity-85 group-hover:opacity-100 transition">
                  <div className="w-12 h-12 rounded-full bg-stone-950/70 border border-amber-300/50 text-amber-300 flex items-center justify-center shadow-xl group-hover:scale-115 transition duration-300 backdrop-blur-xs">
                    <Play className="w-5 h-5 fill-amber-300 ml-0.5" />
                  </div>
                </div>

                {/* Top badges: Views & Drape */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between text-[11px] font-bold text-white z-10">
                  <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-xs">
                    <Eye className="w-3 h-3 text-amber-300" />
                    {reel.views}
                  </span>
                  <span className="flex items-center gap-1 bg-rose-600/85 px-2 py-0.5 rounded-full border border-rose-400/40 text-[10px] uppercase tracking-wider font-extrabold shadow-xs">
                    HD Reel
                  </span>
                </div>

                {/* Bottom Overlay: Title, Model, Likes */}
                <div className="absolute bottom-3 inset-x-3 text-white space-y-1 z-10">
                  <div className="flex items-center gap-1 text-[10px] text-amber-300 font-bold">
                    <Layers className="w-3 h-3" />
                    <span className="truncate">{reel.drapeStyle}</span>
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-2 leading-snug group-hover:text-amber-200 transition drop-shadow-md">
                    {reel.title}
                  </h3>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-stone-300 border-t border-white/10">
                    <span>{reel.modelOrCreator}</span>
                    <span className="flex items-center gap-1 text-rose-400 font-bold">
                      <Heart className="w-3.5 h-3.5 fill-rose-500" />
                      {reel.likes.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tagged Product Bottom Bar */}
              {linkedSaree && (
                <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] text-stone-400 truncate">Tagged Saree</p>
                    <p className="text-xs font-black text-amber-300">
                      ₹{linkedSaree.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectReel(reel)}
                    className="px-2.5 py-1.5 bg-amber-400/20 hover:bg-amber-400 text-amber-200 hover:text-stone-950 border border-amber-400/40 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Watch & Shop</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
