import React, { useState, useEffect, useRef } from 'react';
import { SareeReel, Saree } from '../types';
import { getPublicStoreUrl } from '../utils/shareUrl';
import { 
  X, Heart, MessageCircle, Share2, Volume2, VolumeX, Play, Pause, 
  ShoppingBag, ChevronUp, ChevronDown, Sparkles, Check, Send, 
  Layers, Music, ArrowRight, ShieldCheck 
} from 'lucide-react';

interface ReelPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reels: SareeReel[];
  initialReelId?: string;
  sarees: Saree[];
  onAddToCart: (saree: Saree) => void;
  onBuyNow: (saree: Saree) => void;
  onSelectSaree: (saree: Saree) => void;
  onShowToast: (msg: string) => void;
}

export const ReelPlayerModal: React.FC<ReelPlayerModalProps> = ({
  isOpen,
  onClose,
  reels,
  initialReelId,
  sarees,
  onAddToCart,
  onBuyNow,
  onSelectSaree,
  onShowToast
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Record<string, Array<{ author: string; text: string; time: string }>>>({
    'reel-01': [
      { author: 'Meenakshi Rao', text: 'The gold kadwa zari weaving looks absolutely authentic! Is blouse piece unstitched?', time: '2h ago' },
      { author: 'Sunita Bansal', text: 'Drape fall is so neat, ordering for my daughter’s sangeet function!', time: '5h ago' }
    ],
    'reel-02': [
      { author: 'Deepa Narayanan', text: 'Peacock blue with temple border is breathtaking. Can I get COD to Bangalore?', time: '1d ago' },
      { author: 'Ananya S.', text: 'Pure Kanchipuram silk mark tag included?', time: '2d ago' }
    ]
  });
  const [newComment, setNewComment] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartY = useRef<number>(0);
  const isWheelLockedRef = useRef<boolean>(false);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);

  // Lock body scroll and touch-action while Reels player is open to prevent background app bounce
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

  // Sync initial reel index
  useEffect(() => {
    if (initialReelId) {
      const idx = reels.findIndex((r) => r.id === initialReelId);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [initialReelId, reels]);

  const currentReel = reels[currentIndex] || reels[0];
  const linkedSaree = sarees.find((s) => s.id === currentReel?.sareeId);

  // Auto-play / pause handling
  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  }, [currentIndex, isOpen]);

  // Keyboard navigation (Arrow keys, Esc, Spacebar)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        goToNext();
      } else if (e.key === 'ArrowUp') {
        goToPrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key.toLowerCase() === 'm') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, reels.length]);

  if (!isOpen || !currentReel) return null;

  const goToNext = () => {
    setSlideDirection('next');
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // loop
    }
  };

  const goToPrev = () => {
    setSlideDirection('prev');
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(reels.length - 1);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWheelLockedRef.current) return;
    if (Math.abs(e.deltaY) < 20) return;

    isWheelLockedRef.current = true;
    if (e.deltaY > 0) {
      goToNext();
    } else {
      goToPrev();
    }
    setTimeout(() => {
      isWheelLockedRef.current = false;
    }, 450);
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleToggleLike = () => {
    const isLiked = likedReels[currentReel.id];
    setLikedReels((prev) => ({ ...prev, [currentReel.id]: !isLiked }));
    setLikesCount((prev) => ({
      ...prev,
      [currentReel.id]: (prev[currentReel.id] ?? currentReel.likes) + (isLiked ? -1 : 1)
    }));

    if (!isLiked) {
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 900);
    }
  };

  const handleShare = () => {
    const publicUrl = getPublicStoreUrl();
    if (navigator.share) {
      navigator.share({
        title: `Viral Sarees Reel: ${currentReel.title}`,
        text: currentReel.caption,
        url: publicUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(publicUrl);
      onShowToast('Reel customer link copied to clipboard!');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setComments((prev) => ({
      ...prev,
      [currentReel.id]: [
        ...(prev[currentReel.id] || []),
        { author: 'You', text: newComment.trim(), time: 'Just now' }
      ]
    }));
    setNewComment('');
    onShowToast('Your comment was posted!');
  };

  const currentLikes = likesCount[currentReel.id] ?? currentReel.likes;
  const isCurrentLiked = likedReels[currentReel.id] ?? false;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 overflow-hidden animate-fadeIn">
      
      {/* Close Button Top Right */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white border border-stone-700 transition cursor-pointer shadow-lg"
        aria-label="Close Reels Player"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Container - 9:16 Vertical Phone Aspect Ratio */}
      <div 
        className="relative w-full h-full sm:h-[90vh] sm:max-w-[420px] sm:rounded-3xl overflow-hidden bg-stone-950 flex flex-col justify-between shadow-2xl border border-amber-500/30 select-none"
        style={{ touchAction: 'none', overscrollBehavior: 'none' }}
        onWheel={handleWheel}
        onTouchStart={(e) => { 
          touchStartY.current = e.touches[0].clientY; 
        }}
        onTouchMove={(e) => {
          // Strictly prevent background app from scrolling up and down
          if (e.cancelable) e.preventDefault();
        }}
        onTouchEnd={(e) => {
          const diff = touchStartY.current - e.changedTouches[0].clientY;
          if (diff > 40) goToNext();
          if (diff < -40) goToPrev();
        }}
      >
        {/* Video Player & Background Fallback */}
        <div 
          onClick={togglePlayPause}
          onDoubleClick={handleToggleLike}
          className="absolute inset-0 cursor-pointer overflow-hidden bg-stone-950"
        >
          <video
            ref={videoRef}
            src={currentReel.videoUrl}
            poster={currentReel.thumbnailUrl}
            playsInline
            loop
            muted={isMuted}
            className="w-full h-full object-cover"
          />

          {/* Pause overlay icon */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/60 text-white flex items-center justify-center shadow-xl backdrop-blur-xs">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
            </div>
          )}

          {/* Double tap heart pop effect */}
          {showHeartPop && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <div className="animate-ping scale-150 text-rose-500 drop-shadow-2xl">
                <Heart className="w-24 h-24 fill-rose-600 stroke-white stroke-2" />
              </div>
            </div>
          )}

          {/* Vignette Gradients for clear text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />
        </div>

        {/* Top Header Bar inside Reel */}
        <div className="relative z-20 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-200 bg-black/40 px-2.5 py-1 rounded-full border border-amber-400/30 backdrop-blur-md">
              Viral Sarees Reel
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition backdrop-blur-md"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-amber-300" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <span className="text-[11px] font-bold bg-black/50 px-2 py-1 rounded-full text-stone-300 border border-white/10">
              {currentIndex + 1} / {reels.length}
            </span>
          </div>
        </div>

        {/* Instagram-Style Vertical Position Indicator (Right Edge) */}
        <div className="absolute right-1.5 top-1/3 -translate-y-1/2 flex flex-col gap-1.5 z-30 pointer-events-auto">
          {reels.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setCurrentIndex(i)}
              className={`w-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                i === currentIndex
                  ? 'h-6 bg-amber-400 shadow-md shadow-amber-400/50'
                  : 'h-1.5 bg-white/40 hover:bg-white/70'
              }`}
              title={`Jump to Reel ${i + 1}`}
            />
          ))}
        </div>

        {/* Desktop Up/Down Navigation Chevrons */}
        <div className="hidden lg:flex absolute right-[-64px] top-1/2 -translate-y-1/2 flex-col gap-3 z-40">
          <button
            onClick={goToPrev}
            className="p-3 rounded-full bg-stone-900/90 hover:bg-[#800020] text-white border border-amber-400/40 shadow-xl transition cursor-pointer hover:scale-110"
            title="Previous Reel (Up Arrow or Scroll Up)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="p-3 rounded-full bg-stone-900/90 hover:bg-[#800020] text-white border border-amber-400/40 shadow-xl transition cursor-pointer hover:scale-110"
            title="Next Reel (Down Arrow or Scroll Down)"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Right Action Icons Bar */}
        <div className="absolute right-3 bottom-44 sm:bottom-40 flex flex-col items-center gap-4 z-20">
          
          {/* Like Button */}
          <button
            onClick={handleToggleLike}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className={`p-3 rounded-full backdrop-blur-md transition shadow-lg ${
              isCurrentLiked 
                ? 'bg-rose-600 text-white scale-110' 
                : 'bg-black/40 text-white hover:bg-black/60 border border-white/20'
            }`}>
              <Heart className={`w-6 h-6 ${isCurrentLiked ? 'fill-white' : ''}`} />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow-md">
              {currentLikes.toLocaleString()}
            </span>
          </button>

          {/* Comments Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md transition shadow-lg">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow-md">
              {(comments[currentReel.id] || []).length + currentReel.commentsCount}
            </span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md transition shadow-lg">
              <Share2 className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow-md">
              Share
            </span>
          </button>

          {/* Drape Style Info */}
          {currentReel.drapeStyle && (
            <div className="flex flex-col items-center gap-1">
              <div 
                className="p-3 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 backdrop-blur-md shadow-lg"
                title={currentReel.drapeStyle}
              >
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-extrabold text-amber-200 drop-shadow-md text-center max-w-[50px] leading-tight">
                Drape
              </span>
            </div>
          )}
        </div>

        {/* Bottom Content & Linked Product Card */}
        <div className="relative z-20 p-4 space-y-3">
          
          {/* Creator Profile & Caption */}
          <div className="space-y-1.5 text-white pr-14">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-linear-to-tr from-amber-400 to-rose-600 p-0.5">
                <div className="w-full h-full bg-stone-900 rounded-full flex items-center justify-center font-bold text-[11px] text-amber-300">
                  {currentReel.modelOrCreator[0]}
                </div>
              </div>
              <div>
                <span className="font-bold text-xs text-white drop-shadow-md flex items-center gap-1">
                  {currentReel.modelOrCreator}
                  <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                </span>
                <span className="text-[10px] text-stone-300">
                  {currentReel.creatorHandle}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-100 font-medium leading-relaxed drop-shadow-md line-clamp-2">
              {currentReel.caption}
            </p>

            {/* Audio Track marquee style */}
            <div className="flex items-center gap-1.5 text-[11px] text-amber-200/90 font-medium bg-black/30 px-2 py-0.5 rounded-full w-fit backdrop-blur-xs">
              <Music className="w-3 h-3 animate-spin text-amber-300" />
              <span className="truncate max-w-[200px]">{currentReel.musicTitle}</span>
            </div>
          </div>

          {/* Interactive Tagged Saree Card - Instant Shop from Reel! */}
          {linkedSaree && (
            <div className="bg-stone-900/95 border-2 border-amber-400/60 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md text-white animate-slideUp">
              <div className="flex items-center justify-between gap-3">
                
                {/* Product thumbnail & Info */}
                <div 
                  onClick={() => {
                    onClose();
                    onSelectSaree(linkedSaree);
                  }}
                  className="flex items-center gap-2.5 cursor-pointer group flex-1 min-w-0"
                >
                  <img
                    src={linkedSaree.images[0]}
                    alt={linkedSaree.title}
                    className="w-12 h-14 rounded-xl object-cover border border-amber-300/40 shrink-0 group-hover:scale-105 transition"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] uppercase px-1.5 py-0.2 bg-amber-400/20 text-amber-300 font-extrabold rounded border border-amber-400/30">
                        {linkedSaree.fabric}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">
                        {linkedSaree.discountPercent}% OFF
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-stone-100 truncate group-hover:text-amber-300 transition">
                      {linkedSaree.title}
                    </h4>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="font-black text-sm text-amber-300">
                        ₹{linkedSaree.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-stone-400 line-through">
                        ₹{linkedSaree.originalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onBuyNow(linkedSaree);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs transition shadow-md flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Instant Buy</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      onAddToCart(linkedSaree);
                      onShowToast(`Added "${linkedSaree.title}" to Bag!`);
                    }}
                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>+ Bag</span>
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Comments Overlay Drawer */}
        {showComments && (
          <div className="absolute inset-x-0 bottom-0 top-1/3 bg-stone-900/98 rounded-t-3xl border-t-2 border-amber-500/40 z-50 p-4 flex flex-col justify-between shadow-2xl backdrop-blur-xl animate-slideUp">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-amber-400" />
                <span>Comments & Drape Queries</span>
              </h3>
              <button
                onClick={() => setShowComments(false)}
                className="p-1 text-stone-400 hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
              {(comments[currentReel.id] || []).length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  Be the first to ask about this saree drape!
                </div>
              ) : (
                (comments[currentReel.id] || []).map((c, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <div className="w-6 h-6 rounded-full bg-rose-900 text-amber-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {c.author[0]}
                    </div>
                    <div className="flex-1 bg-stone-800/70 p-2 rounded-xl border border-stone-700/60">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-200">{c.author}</span>
                        <span className="text-[10px] text-stone-500">{c.time}</span>
                      </div>
                      <p className="text-stone-300 mt-1">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input bar */}
            <form onSubmit={handleAddComment} className="pt-2 flex items-center gap-2 border-t border-stone-800">
              <input
                type="text"
                placeholder="Ask about drape, fabric, zari or delivery..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-400 focus:outline-hidden focus:border-amber-400"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-amber-500 text-stone-950 font-bold hover:bg-amber-400 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
};
