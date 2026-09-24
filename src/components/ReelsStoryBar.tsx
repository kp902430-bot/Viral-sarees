import React from 'react';
import { SareeReel } from '../types';
import { Play, Sparkles, Film } from 'lucide-react';

interface ReelsStoryBarProps {
  reels: SareeReel[];
  onSelectReel: (reel: SareeReel) => void;
  onOpenAllReels: () => void;
}

export const ReelsStoryBar: React.FC<ReelsStoryBarProps> = ({
  reels,
  onSelectReel,
  onOpenAllReels,
}) => {
  return (
    <div className="w-full bg-linear-to-r from-[#2A0800] via-[#1E0505] to-[#2D0A0E] rounded-3xl p-4 sm:p-5 border border-amber-500/30 shadow-xl shadow-stone-950/20 text-white overflow-hidden relative">
      {/* Background glow and subtle zari pattern */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-400/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-amber-500 via-rose-500 to-amber-300 p-0.5 shadow-lg shadow-rose-950/40">
            <div className="w-full h-full bg-[#1A0306] rounded-[14px] flex items-center justify-center">
              <Film className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white font-serif-brand">
                Viral Sarees Reels • Watch & Shop
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-linear-to-r from-rose-600 to-amber-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xs">
                Live
              </span>
            </div>
            <p className="text-xs text-amber-200/80 font-medium">
              Real Drape Videos, Zari Shine & Fabric Movement in 9:16 HD
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAllReels}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-amber-300/30 text-amber-200 hover:text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>View All Reels ({reels.length})</span>
        </button>
      </div>

      {/* Horizontal Scroll Story Circles */}
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-none pt-1">
        {reels.map((reel) => (
          <button
            key={reel.id}
            onClick={() => onSelectReel(reel)}
            className="flex flex-col items-center gap-2 group shrink-0 focus:outline-hidden text-center cursor-pointer"
          >
            {/* Pulsing Gradient Circle Frame */}
            <div className="relative p-[2.5px] rounded-full bg-linear-to-tr from-amber-400 via-rose-500 to-yellow-300 shadow-md group-hover:scale-108 transition-all duration-300">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-stone-950 relative bg-stone-900">
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  loading="lazy"
                />
                
                {/* Play Icon Badge */}
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white/90 text-stone-900 flex items-center justify-center shadow-md">
                    <Play className="w-3 h-3 fill-stone-900 ml-0.5" />
                  </div>
                </div>

                {/* Drape style pill */}
                <span className="absolute bottom-0 inset-x-0 bg-stone-950/85 text-amber-300 text-[9px] py-0.5 font-bold truncate px-1">
                  {reel.views}
                </span>
              </div>
            </div>

            {/* Title & Creator */}
            <div className="w-20 sm:w-22">
              <p className="text-[11px] font-bold text-stone-100 truncate group-hover:text-amber-300 transition">
                {reel.title.replace(/[^\w\s]/gi, '')}
              </p>
              <p className="text-[10px] text-amber-300/70 truncate font-medium">
                {reel.modelOrCreator.split(' ')[0]}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
