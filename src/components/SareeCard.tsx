import React, { useState } from 'react';
import { Heart, Star, ShoppingBag, Eye, ShieldCheck, Film, Share2, Check } from 'lucide-react';
import { Saree } from '../types';
import { getPublicSareeShareUrl } from '../utils/shareUrl';

interface SareeCardProps {
  saree: Saree;
  isWishlisted: boolean;
  onToggleWishlist: (saree: Saree) => void;
  onSelectSaree: (saree: Saree) => void;
  onAddToCart: (saree: Saree) => void;
  hasReel?: boolean;
  onWatchReel?: (sareeId: string) => void;
  onShare?: (saree: Saree) => void;
}

export const SareeCard: React.FC<SareeCardProps> = ({
  saree,
  isWishlisted,
  onToggleWishlist,
  onSelectSaree,
  onAddToCart,
  hasReel,
  onWatchReel,
  onShare
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const fallbackImg = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800';
  const displayImg = (Array.isArray(saree?.images) && saree.images.length > 0 && saree.images[0])
    ? saree.images[0]
    : fallbackImg;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const productUrl = getPublicSareeShareUrl(saree.id);

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(productUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2200);
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }

    if (onShare) {
      onShare(saree);
    }

    if (navigator.share) {
      navigator.share({
        title: saree.title,
        text: `Check out ${saree.title} at ₹${saree.price.toLocaleString('en-IN')} on Viral Sarees:`,
        url: productUrl,
      }).catch(() => {});
    }
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border-2 border-stone-200/90 hover:border-amber-400/70 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative">
      
      {/* Top Image Container */}
      <div className="relative aspect-3/4 overflow-hidden bg-stone-900 cursor-pointer" onClick={() => onSelectSaree(saree)}>
        <img
          src={displayImg}
          alt={saree?.title || 'Viral Sarees'}
          className="w-full h-full object-cover object-top group-hover:scale-106 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = fallbackImg;
          }}
        />

        {/* Badges / Discount */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start z-10">
          <span className="bg-gradient-to-r from-[#800020] to-[#550212] text-amber-200 text-[11px] font-black px-2.5 py-0.5 rounded-lg shadow-md border border-amber-400/30 tracking-wider uppercase">
            {saree.discountPercent}% OFF
          </span>
          {saree.isBestseller && (
            <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md uppercase tracking-wider">
              ★ Bestseller
            </span>
          )}
          {saree.tags?.includes('Silk Mark Certified') && (
            <span className="bg-white text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Silk Mark
            </span>
          )}
        </div>

        {/* Watch Reel Quick Pill */}
        {hasReel && onWatchReel && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWatchReel(saree.id);
            }}
            className="absolute bottom-2.5 left-2.5 z-10 px-2.5 py-1 rounded-full bg-black/75 hover:bg-[#800020] text-amber-200 text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 border border-amber-400/50 shadow-lg backdrop-blur-xs transition cursor-pointer"
          >
            <Film className="w-3 h-3 text-rose-400 animate-pulse" />
            <span>Watch Reel</span>
          </button>
        )}

        {/* Top-Right Action Buttons: Wishlist & Quick Share */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(saree);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-lg cursor-pointer ${
              isWishlisted
                ? 'bg-rose-600 text-white scale-105'
                : 'bg-white/95 text-stone-800 hover:text-rose-600 hover:bg-white'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-lg cursor-pointer ${
              isCopied
                ? 'bg-emerald-600 text-white scale-105'
                : 'bg-white/95 text-stone-800 hover:text-rose-900 hover:bg-white'
            }`}
            title={isCopied ? 'Link Copied to Clipboard!' : 'Share Saree Direct Link'}
            aria-label="Share"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Quick View overlay on hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectSaree(saree);
            }}
            className="w-full py-2 bg-white text-stone-950 hover:bg-amber-100 text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-rose-800" />
            <span>View Full Details & Drape</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Fabric & Rating */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-black tracking-wider uppercase text-rose-950 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md">
              {saree.category || saree.fabric}
            </span>
            <div 
              className="flex items-center gap-1 text-xs font-black text-amber-700 bg-amber-50/80 px-1.5 py-0.5 rounded-md border border-amber-200/60"
              title={`${(saree.reviews?.length || saree.reviewsCount)} customer reviews`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{Number(saree.rating || 5).toFixed(1)}</span>
              <span className="text-stone-400 font-semibold">({saree.reviews?.length || saree.reviewsCount || 0})</span>
            </div>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelectSaree(saree)}
            className="font-bold text-stone-950 text-sm line-clamp-2 hover:text-rose-900 transition cursor-pointer mb-1.5 leading-snug font-serif-brand"
          >
            {saree.title}
          </h3>

          {/* Zari / Work Tag */}
          <p className="text-xs text-stone-600 line-clamp-1 mb-3">
            <span className="font-semibold text-stone-800">Work:</span> {saree.work}
          </p>
        </div>

        <div>
          {/* Price Section */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-black text-stone-950">
              ₹{saree.price.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-stone-400 line-through">
              ₹{saree.originalPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-emerald-800 font-extrabold">
              Save ₹{(saree.originalPrice - saree.price).toLocaleString('en-IN')}
            </span>
          </div>

          {/* Add to Bag Button */}
          <button
            onClick={() => onAddToCart(saree)}
            className="w-full py-2.5 px-3 bg-[#800020] hover:bg-[#600018] text-amber-100 hover:text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg shadow-rose-950/20 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-amber-300" />
            <span>Add to Bag</span>
          </button>
        </div>

      </div>

    </div>
  );
};
