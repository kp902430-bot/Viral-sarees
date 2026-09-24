import React from 'react';
import { Home, Film, Search, Heart, ShoppingBag } from 'lucide-react';

interface MobileBottomNavProps {
  activeView: 'home' | 'reels' | 'tracking' | 'returns' | 'privacy';
  cartCount: number;
  wishlistCount: number;
  onGoHome: () => void;
  onOpenReels: () => void;
  onOpenSearch: () => void;
  onOpenWishlist: () => void;
  onOpenCart: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  cartCount,
  wishlistCount,
  onGoHome,
  onOpenReels,
  onOpenSearch,
  onOpenWishlist,
  onOpenCart,
}) => {
  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 bg-stone-950/95 backdrop-blur-lg border-t-2 border-amber-500/40 shadow-2xl z-40 px-2 py-1.5 flex items-center justify-around text-[10px] font-bold text-stone-300"
    >
      {/* Home Button */}
      <button
        onClick={onGoHome}
        className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${
          activeView === 'home'
            ? 'text-amber-300'
            : 'text-stone-400 hover:text-stone-200'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Shop</span>
      </button>

      {/* Saree Reels Button - Standout Pulsing Feature */}
      <button
        onClick={onOpenReels}
        className={`flex flex-col items-center gap-0.5 py-0.5 px-3 rounded-2xl transition relative group ${
          activeView === 'reels'
            ? 'text-amber-200 scale-105'
            : 'text-stone-300 hover:text-white'
        }`}
      >
        <div className="relative p-1 rounded-full bg-linear-to-tr from-rose-600 via-pink-500 to-amber-400 shadow-md shadow-rose-950/60">
          <div className="w-7 h-7 rounded-full bg-stone-950 flex items-center justify-center">
            <Film className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          {/* Animated red live dot */}
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-stone-950 animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-stone-950" />
        </div>
        <span className="font-extrabold text-transparent bg-clip-text bg-linear-to-r from-amber-300 to-rose-300">
          Reels
        </span>
      </button>

      {/* Search Button */}
      <button
        onClick={onOpenSearch}
        className="flex flex-col items-center gap-0.5 py-1 px-2 text-stone-400 hover:text-stone-200 transition"
      >
        <Search className="w-5 h-5" />
        <span>Search</span>
      </button>

      {/* Wishlist Button */}
      <button
        onClick={onOpenWishlist}
        className="relative flex flex-col items-center gap-0.5 py-1 px-2 text-stone-400 hover:text-stone-200 transition"
      >
        <Heart className="w-5 h-5" />
        {wishlistCount > 0 && (
          <span className="absolute top-0 right-2 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs">
            {wishlistCount}
          </span>
        )}
        <span>Wishlist</span>
      </button>

      {/* Bag / Cart Button */}
      <button
        onClick={onOpenCart}
        className="relative flex flex-col items-center gap-0.5 py-1 px-2 text-stone-400 hover:text-stone-200 transition"
      >
        <ShoppingBag className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute top-0 right-2 w-4 h-4 bg-amber-400 text-stone-950 rounded-full text-[9px] font-black flex items-center justify-center shadow-xs">
            {cartCount}
          </span>
        )}
        <span>Bag</span>
      </button>
    </nav>
  );
};
