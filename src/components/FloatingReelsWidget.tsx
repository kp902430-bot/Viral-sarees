import React from 'react';
import { Film, Play } from 'lucide-react';

interface FloatingReelsWidgetProps {
  onOpenReels: () => void;
  reelsCount: number;
}

export const FloatingReelsWidget: React.FC<FloatingReelsWidgetProps> = ({
  onOpenReels,
  reelsCount
}) => {
  if (reelsCount === 0) return null;

  return (
    <aside aria-label="Floating Saree Reels" className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-30">
      <button
        onClick={onOpenReels}
        className="group flex items-center gap-2.5 p-2 md:pr-4 rounded-full bg-linear-to-r from-[#4A0012] via-[#800020] to-[#590417] text-white shadow-2xl border-2 border-amber-400 hover:border-yellow-300 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-rose-950/60"
        title="Watch Live Saree Reels & Drape Videos"
      >
        {/* Pulsing ring icon */}
        <div className="relative w-9 h-9 rounded-full bg-linear-to-tr from-amber-400 via-rose-500 to-yellow-300 p-0.5 shadow-md">
          <div className="w-full h-full rounded-full bg-stone-950 flex items-center justify-center">
            <Film className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          {/* Pulsing recording red beacon */}
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-stone-950 animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-stone-950" />
        </div>

        {/* Text for desktop & tablet */}
        <div className="hidden sm:flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-xs font-black tracking-wider uppercase text-amber-300 font-serif-brand">
              Saree Reels
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-black uppercase">
              Live
            </span>
          </div>
          <span className="text-[10px] text-stone-200 font-semibold mt-0.5">
            Watch & Shop ({reelsCount})
          </span>
        </div>
      </button>
    </aside>
  );
};
