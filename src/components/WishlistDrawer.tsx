import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Saree } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Saree[];
  onRemoveFromWishlist: (sareeId: string) => void;
  onMoveToCart: (saree: Saree) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlist,
  onRemoveFromWishlist,
  onMoveToCart
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
            <h3 className="font-bold text-base text-stone-900 font-serif-brand">
              My Wishlist ({wishlist.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-200 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {wishlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-300">
                <Heart className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-stone-800 text-base">Your Wishlist is Empty</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Save your favorite sarees to purchase later or share with family!
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#800020] text-amber-100 font-bold text-xs"
              >
                Explore Saree Catalogue
              </button>
            </div>
          ) : (
            wishlist.map((saree) => (
              <div
                key={saree.id}
                className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex gap-3 items-center justify-between"
              >
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-300">
                  <img src={saree.images[0]} alt={saree.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0 px-1">
                  <h4 className="font-bold text-xs text-stone-900 truncate">{saree.title}</h4>
                  <span className="text-[11px] text-stone-500 block">{saree.fabric}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm font-extrabold text-stone-950 font-mono">
                      ₹{saree.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-stone-400 line-through font-mono">
                      ₹{saree.originalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onMoveToCart(saree);
                      onRemoveFromWishlist(saree.id);
                    }}
                    className="p-2 bg-[#800020] hover:bg-[#9B111E] text-amber-100 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    title="Move to Bag"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move</span>
                  </button>
                  <button
                    onClick={() => onRemoveFromWishlist(saree.id)}
                    className="p-2 text-stone-400 hover:text-rose-700 rounded-lg transition self-center"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {wishlist.length > 0 && (
          <div className="p-4 border-t border-stone-200 bg-white">
            <button
              onClick={() => {
                wishlist.forEach((s) => onMoveToCart(s));
                onClose();
              }}
              className="w-full py-3 bg-[#800020] text-amber-100 font-bold rounded-xl text-xs hover:bg-[#9B111E] transition shadow-md"
            >
              Move All Sarees to Bag ({wishlist.length})
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
