import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, ShieldCheck, Truck, RotateCcw, Check, Sparkles, AlertTriangle, Video, Scissors, Share2, Film, MessageCircle } from 'lucide-react';
import { Saree, Review, CustomerProfile, Order } from '../types';
import { CustomerReviewSection } from './CustomerReviewSection';
import { getPublicSareeShareUrl, getSareeWhatsAppShareText } from '../utils/shareUrl';

interface SareeDetailModalProps {
  saree: Saree | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (saree: Saree, stitchBlouse: boolean) => void;
  onBuyNow: (saree: Saree, stitchBlouse: boolean) => void;
  isWishlisted: boolean;
  onToggleWishlist: (saree: Saree) => void;
  onOpenReturnPolicy: () => void;
  hasReel?: boolean;
  onWatchReel?: () => void;
  onAddReview?: (sareeId: string, review: Review) => void;
  onShowToast?: (message: string) => void;
  currentCustomer?: CustomerProfile | null;
  orders?: Order[];
}

export const SareeDetailModal: React.FC<SareeDetailModalProps> = ({
  saree,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
  onOpenReturnPolicy,
  hasReel,
  onWatchReel,
  onAddReview,
  onShowToast,
  currentCustomer,
  orders
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [stitchBlouse, setStitchBlouse] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  if (!isOpen || !saree) return null;

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.trim().length === 6 && /^\d+$/.test(pincode)) {
      setPincodeResult(`Delivery available in 3-4 days to ${pincode} via BlueDart / Delhivery Express. COD Available.`);
    } else {
      setPincodeResult('Please enter a valid 6-digit Indian pincode.');
    }
  };

  const handleShare = () => {
    const publicUrl = getPublicSareeShareUrl(saree.id);
    const shareText = `🥻 ${saree.title} - ₹${saree.price.toLocaleString('en-IN')}\nExplore this authentic trending saree on Viral Sarees: ${publicUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: saree.title,
        text: shareText,
        url: publicUrl,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(publicUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      onShowToast?.('Saree product link copied to clipboard!');
    }
  };

  const handleWhatsAppShare = () => {
    const shareText = getSareeWhatsAppShareText(saree, saree.id);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    onShowToast?.('Opening WhatsApp to share saree...');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        
        {/* Top Header Close Bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-3.5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-900 bg-rose-50 px-2.5 py-1 rounded-md">
              SKU: {saree.sku}
            </span>
            <span className="text-xs text-stone-500 font-mono">
              In Stock & Ready to Dispatch
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Share on WhatsApp Button (Header) */}
            <button
              id="header-whatsapp-share-btn"
              onClick={handleWhatsAppShare}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white rounded-xl transition text-xs font-bold flex items-center gap-1.5 border border-emerald-600/30 cursor-pointer shadow-xs"
              title="Share on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Copy Saree Deep Link Button */}
            <button
              id="header-copy-share-btn"
              onClick={handleShare}
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition text-xs flex items-center gap-1 cursor-pointer"
              title="Copy Saree Link"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              {isCopied && <span className="text-[11px] text-emerald-600 font-medium">Copied!</span>}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Image Gallery */}
            <div className="space-y-4">
            <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner">
              <img
                src={(Array.isArray(saree?.images) && saree.images.length > 0) ? (saree.images[activeImageIndex] || saree.images[0]) : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'}
                alt={saree?.title || 'Saree Detail'}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800';
                }}
              />
              <div className="absolute top-3 left-3 bg-[#800020] text-amber-200 text-xs font-bold px-2.5 py-1 rounded-md shadow-md uppercase">
                {saree.discountPercent}% OFF
              </div>
              <button
                onClick={() => onToggleWishlist(saree)}
                className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition shadow-lg ${
                  isWishlisted ? 'bg-rose-600 text-white' : 'bg-white/90 text-stone-700 hover:text-rose-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnails */}
            {saree.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {saree.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                      activeImageIndex === idx ? 'border-rose-800 scale-105 shadow-md' : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>
            )}

            {/* Watch Reel Button if Available */}
            {hasReel && onWatchReel && (
              <button
                type="button"
                onClick={onWatchReel}
                className="w-full py-2.5 px-4 rounded-xl bg-linear-to-r from-rose-950 via-rose-900 to-amber-950 hover:from-rose-900 hover:to-amber-900 text-amber-200 border-2 border-amber-400/60 shadow-md font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition transform hover:scale-[1.01]"
              >
                <Film className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Watch Saree Drape Reel & Video Showcase</span>
                <span className="bg-amber-400 text-stone-950 text-[9px] px-1.5 py-0.2 rounded font-black uppercase">
                  Reel
                </span>
              </button>
            )}

            {/* Authenticity Guarantee Card */}
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950">
                <span className="font-bold block">100% Genuine Handcrafted Saree</span>
                Direct from master weavers of Banaras & Surat. Pure yarn with authentic weaving guarantee.
              </div>
            </div>
          </div>

          {/* Right: Saree Details & Action */}
          <div className="space-y-5">
            
            {/* Title & Ratings */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md">
                  {saree.category || saree.fabric}
                </span>
                <span className="text-xs font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                  {saree.occasion}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug font-serif-brand">
                {saree.title}
              </h2>

              {/* Rating stars - Click to jump to reviews */}
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('customer-reviews-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 hover:opacity-85 transition cursor-pointer text-left"
                  title="View customer reviews"
                >
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{(typeof saree.rating === 'number' ? saree.rating : 5).toFixed(1)} / 5.0</span>
                  </div>
                  <span className="text-stone-500 underline decoration-stone-300">
                    Based on <strong>{(saree.reviews?.length || saree.reviewsCount)} verified customer reviews</strong>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsReviewFormOpen(true);
                    const el = document.getElementById('customer-reviews-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[11px] border border-amber-300 shadow-xs transition cursor-pointer"
                >
                  <span>★ Write Review</span>
                </button>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-stone-950 font-mono">
                  ₹{saree.price.toLocaleString('en-IN')}
                </span>
                <span className="text-base text-stone-400 line-through font-mono">
                  ₹{saree.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                  Save ₹{(saree.originalPrice - saree.price).toLocaleString('en-IN')} ({saree.discountPercent}% Off)
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Inclusive of all taxes & GST. Free shipping available above ₹999.
              </p>
            </div>

            {/* Blouse Stitching Addon Option */}
            <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Scissors className="w-5 h-5 text-rose-800 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                      <span>Custom Blouse Tailoring / Stitching</span>
                      <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded font-semibold">+₹499</span>
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Expert tailoring with padded cups, cotton lining, and customized neckline. (Our team WhatsApps you for measurements).
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="stitch-blouse-checkbox"
                  checked={stitchBlouse}
                  onChange={(e) => setStitchBlouse(e.target.checked)}
                  className="w-5 h-5 text-rose-800 rounded focus:ring-rose-700 mt-1 cursor-pointer"
                />
              </div>
            </div>

            {/* Delivery Pincode Checker */}
            <div className="border-t border-stone-200 pt-4">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5 mb-1.5">
                <Truck className="w-4 h-4 text-stone-600" />
                <span>Check Delivery Speed & COD to Your Pincode</span>
              </label>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode (e.g. 110001, 400001)"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-rose-800"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-lg hover:bg-stone-800 transition"
                >
                  Check
                </button>
              </form>
              {pincodeResult && (
                <p className={`text-xs mt-1.5 font-medium ${pincodeResult.includes('available') ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {pincodeResult}
                </p>
              )}
            </div>

            {/* Return Policy Notice Required by User */}
            <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-300 text-stone-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Important Return Notice & Video Policy:</span>
              </div>
              <p className="text-stone-700 leading-relaxed text-[11px]">
                As per Viral Sarees policy: For any claim regarding <strong>"Product Not Received"</strong>, <strong>"Missing Items"</strong>, or <strong>"Damaged Saree"</strong>, an <strong>Unboxing Video is strictly COMPULSORY</strong> showing the sealed courier packet being opened from the start without cuts or pauses.
              </p>
              <button
                onClick={onOpenReturnPolicy}
                className="text-[11px] font-bold text-rose-900 underline hover:text-rose-700"
              >
                Read Full 7-Day Return Policy & Video Guidelines →
              </button>
            </div>

            {/* Specifications Table */}
            <div className="border-t border-stone-200 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5">
                Saree Details & Fabric Specifications
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-stone-50 border border-stone-100">
                  <span className="text-stone-500 block text-[10px]">Category / Fabric</span>
                  <span className="font-semibold text-stone-900">{saree.category || saree.fabric}</span>
                </div>
                <div className="p-2 rounded bg-stone-50 border border-stone-100">
                  <span className="text-stone-500 block text-[10px]">Length</span>
                  <span className="font-semibold text-stone-900">{saree.length}</span>
                </div>
                <div className="p-2 rounded bg-stone-50 border border-stone-100">
                  <span className="text-stone-500 block text-[10px]">Blouse Piece</span>
                  <span className="font-semibold text-stone-900">{saree.blousePiece}</span>
                </div>
                <div className="p-2 rounded bg-stone-50 border border-stone-100">
                  <span className="text-stone-500 block text-[10px]">Border</span>
                  <span className="font-semibold text-stone-900">{saree.border}</span>
                </div>
                <div className="p-2 rounded bg-stone-50 border border-stone-100 col-span-2">
                  <span className="text-stone-500 block text-[10px]">Zari / Craft Work</span>
                  <span className="font-semibold text-stone-900">{saree.zariType}</span>
                </div>
                <div className="p-2 rounded bg-stone-50 border border-stone-100 col-span-2">
                  <span className="text-stone-500 block text-[10px]">Care Instructions</span>
                  <span className="font-medium text-stone-700">{saree.careInstructions}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="text-xs text-stone-600 leading-relaxed">
              <span className="font-bold text-stone-900 block mb-1">About This Saree:</span>
              <p>{saree.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-3 pb-1 border-t border-stone-200 flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="modal-add-to-bag-btn"
                  onClick={() => {
                    onAddToCart(saree, stitchBlouse);
                    onClose();
                  }}
                  className="py-3 px-4 rounded-xl border-2 border-[#800020] text-[#800020] hover:bg-rose-50 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                <button
                  id="modal-buy-now-btn"
                  onClick={() => {
                    onBuyNow(saree, stitchBlouse);
                    onClose();
                  }}
                  className="py-3 px-4 rounded-xl bg-[#800020] hover:bg-[#9B111E] text-amber-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-rose-900/20 cursor-pointer"
                >
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Share on WhatsApp Button (Generates pre-filled message with title, price, and product link) */}
              <button
                id="modal-whatsapp-share-btn"
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md shadow-emerald-900/15 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white text-white" />
                <span>Share on WhatsApp (Title, Price & Link)</span>
              </button>
            </div>

          </div>
        </div>

        {/* Customer Reviews & Ratings Section */}
        <div className="border-t border-stone-200 pt-2">
          <CustomerReviewSection
            saree={saree}
            onAddReview={onAddReview || (() => {})}
            onShowToast={onShowToast}
            currentCustomer={currentCustomer}
            orders={orders}
            isReviewFormOpen={isReviewFormOpen}
            onToggleReviewForm={setIsReviewFormOpen}
          />
        </div>
      </div>

      </div>
    </div>
  );
};
