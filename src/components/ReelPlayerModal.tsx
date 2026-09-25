import React, { useState, useEffect, useRef } from 'react';
import { SareeReel, Saree } from '../types';
import { getPublicStoreUrl } from '../utils/shareUrl';
import { 
  X, Heart, Share2, Volume2, VolumeX, Play, Pause, 
  ShoppingBag, Sparkles, Layers, Music, ArrowRight, ChevronUp, ChevronDown 
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Prevent background scroll when Reels modal is open
  useEffect(() => {
    if (!isOpen) return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, [isOpen]);

  // Jump to selected reel when modal opens
  useEffect(() => {
    if (!isOpen || !reels.length) return;
    const initialIndex = initialReelId ? reels.findIndex((r) => r.id === initialReelId) : 0;
    const targetIdx = initialIndex >= 0 ? initialIndex : 0;
    setActiveIndex(targetIdx);

    // Scroll container to target reel after mounting
    setTimeout(() => {
      if (containerRef.current) {
        const slideHeight = containerRef.current.clientHeight;
        containerRef.current.scrollTo({
          top: targetIdx * slideHeight,
          behavior: 'auto'
        });
      }
    }, 50);
  }, [isOpen, initialReelId, reels]);

  // Play visible video and pause others
  useEffect(() => {
    if (!isOpen || !reels.length) return;
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === activeIndex) {
        video.currentTime = 0;
        video.play().catch(() => {});
        setIsPlaying(true);
      } else {
        video.pause();
      }
    });
  }, [activeIndex, isOpen, reels.length]);

  // Handle scroll snap detection (like Instagram Reels)
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    if (clientHeight === 0) return;
    const newIdx = Math.round(scrollTop / clientHeight);
    if (newIdx !== activeIndex && newIdx >= 0 && newIdx < reels.length) {
      setActiveIndex(newIdx);
    }
  };

  // Keyboard navigation (Esc, Arrow keys, Space)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        scrollToIndex(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        scrollToIndex(activeIndex - 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayCurrent();
      } else if (e.key.toLowerCase() === 'm') {
        setIsMuted((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, reels.length]);

  if (!isOpen || !reels.length) return null;

  const scrollToIndex = (idx: number) => {
    if (!containerRef.current || idx < 0 || idx >= reels.length) return;
    const slideHeight = containerRef.current.clientHeight;
    containerRef.current.scrollTo({
      top: idx * slideHeight,
      behavior: 'smooth'
    });
  };

  const togglePlayCurrent = () => {
    const currentVid = videoRefs.current[activeIndex];
    if (!currentVid) return;
    if (currentVid.paused) {
      currentVid.play().catch(() => {});
      setIsPlaying(true);
    } else {
      currentVid.pause();
      setIsPlaying(false);
    }
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 600);
  };

  const handleDoubleTap = (reelId: string) => {
    if (!likedReels[reelId]) {
      setLikedReels((prev) => ({ ...prev, [reelId]: true }));
      const base = reels.find((r) => r.id === reelId)?.likes || 1200;
      setLikesCount((prev) => ({ ...prev, [reelId]: (prev[reelId] || base) + 1 }));
    }
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 900);
  };

  const handleToggleLike = (reelId: string) => {
    const isLiked = likedReels[reelId];
    const base = reels.find((r) => r.id === reelId)?.likes || 1200;
    const current = likesCount[reelId] || base;

    if (isLiked) {
      setLikedReels((prev) => ({ ...prev, [reelId]: false }));
      setLikesCount((prev) => ({ ...prev, [reelId]: current - 1 }));
    } else {
      setLikedReels((prev) => ({ ...prev, [reelId]: true }));
      setLikesCount((prev) => ({ ...prev, [reelId]: current + 1 }));
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 900);
    }
  };

  const handleShare = (reel: SareeReel) => {
    const storeUrl = getPublicStoreUrl();
    const shareText = `Watch this trending saree video reel: "${reel.title}" on Viral Sarees!\n${storeUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
    onShowToast('WhatsApp Share Link opened!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center animate-fadeIn select-none">
      
      {/* Desktop chevrons to move up/down */}
      <div className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col gap-3 z-50">
        <button
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer backdrop-blur-md border border-white/20"
          title="Previous Reel"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex === reels.length - 1}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer backdrop-blur-md border border-white/20"
          title="Next Reel"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Reels Main Phone-Frame Container with Native Instagram Snap Scrolling */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="relative w-full h-[100dvh] max-w-sm sm:max-w-md bg-black overflow-y-scroll snap-y snap-mandatory scroll-smooth touch-pan-y [webkit-overflow-scrolling:touch] scrollbar-none shadow-2xl"
      >
        {reels.map((reel, idx) => {
          const linkedSaree = sarees.find((s) => s.id === reel.sareeId);
          const isLiked = likedReels[reel.id] || false;
          const currentLikes = likesCount[reel.id] || reel.likes;

          return (
            <div
              key={reel.id}
              className="relative w-full h-[100dvh] snap-start snap-always shrink-0 overflow-hidden flex flex-col justify-between bg-black"
            >
              {/* Background Video Player */}
              <div 
                className="absolute inset-0 z-0 cursor-pointer"
                onClick={togglePlayCurrent}
                onDoubleClick={() => handleDoubleTap(reel.id)}
              >
                <video
                  ref={(el) => {
                    videoRefs.current[idx] = el;
                  }}
                  src={reel.videoUrl}
                  poster={reel.thumbnailUrl}
                  loop
                  playsInline
                  muted={isMuted}
                  className="w-full h-full object-cover"
                />

                {/* Ambient Top & Bottom Gradients for readable text */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none" />
              </div>

              {/* Heart Pop Animation on Like / Double Tap */}
              {showHeartPop && idx === activeIndex && (
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-ping">
                  <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl" />
                </div>
              )}

              {/* Play / Pause Center Pulse Feedback */}
              {showPlayIcon && idx === activeIndex && (
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                  <div className="p-4 rounded-full bg-black/60 text-white backdrop-blur-md animate-scaleUp">
                    {isPlaying ? <Play className="w-8 h-8 fill-white" /> : <Pause className="w-8 h-8 fill-white" />}
                  </div>
                </div>
              )}

              {/* Top Header Bar */}
              <div className="relative z-20 p-4 pt-5 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 transition cursor-pointer"
                    aria-label="Close Reels"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-bold text-amber-200 bg-black/40 px-2.5 py-1 rounded-full border border-amber-400/30 backdrop-blur-md">
                    Viral Sarees
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 transition cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-amber-300" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                  <span className="text-[11px] font-bold bg-black/40 px-2.5 py-1 rounded-full text-stone-200 border border-white/10 backdrop-blur-md">
                    {idx + 1} / {reels.length}
                  </span>
                </div>
              </div>

              {/* Right Side Action Bar (Instagram Reels Style) */}
              <div className="absolute right-3.5 bottom-36 flex flex-col items-center gap-4 z-20">
                {/* Like Button */}
                <button
                  onClick={() => handleToggleLike(reel.id)}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                >
                  <div className={`p-3 rounded-full backdrop-blur-md transition shadow-lg ${
                    isLiked 
                      ? 'bg-rose-600 text-white scale-110' 
                      : 'bg-black/45 text-white hover:bg-black/60 border border-white/20'
                  }`}>
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-white' : ''}`} />
                  </div>
                  <span className="text-[11px] font-bold text-white drop-shadow-md">
                    {currentLikes.toLocaleString()}
                  </span>
                </button>

                {/* WhatsApp Share Button */}
                <button
                  onClick={() => handleShare(reel)}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-black/45 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md transition shadow-lg">
                    <Share2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-[11px] font-bold text-white drop-shadow-md">
                    Share
                  </span>
                </button>

                {/* Drape Info Badge */}
                {reel.drapeStyle && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="p-2.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/40 backdrop-blur-md shadow-lg">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-extrabold text-amber-200 drop-shadow-md text-center max-w-[50px] leading-tight">
                      Drape
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Content & Product Tag */}
              <div className="relative z-20 p-4 pb-6 space-y-3">
                {/* Creator & Caption */}
                <div className="space-y-1.5 text-white pr-14">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-rose-600 p-0.5 shadow-sm">
                      <div className="w-full h-full bg-stone-900 rounded-full flex items-center justify-center font-bold text-[11px] text-amber-300">
                        {reel.modelOrCreator[0]}
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-xs text-white drop-shadow-md flex items-center gap-1">
                        {reel.modelOrCreator}
                        <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                      </span>
                      <span className="text-[10px] text-stone-300">
                        {reel.creatorHandle}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-100 font-medium leading-relaxed drop-shadow-md line-clamp-2">
                    {reel.caption}
                  </p>

                  {/* Audio Track */}
                  {reel.musicTitle && (
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-200/90 font-medium bg-black/40 px-2 py-0.5 rounded-full w-fit backdrop-blur-xs">
                      <Music className="w-3 h-3 animate-spin text-amber-300" />
                      <span className="truncate max-w-[200px]">{reel.musicTitle}</span>
                    </div>
                  )}
                </div>

                {/* Instant Buy Product Card */}
                {linkedSaree && (
                  <div className="bg-stone-950/90 border-2 border-amber-400/70 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md text-white flex items-center justify-between gap-3 animate-slideUp">
                    <div 
                      onClick={() => {
                        onClose();
                        onSelectSaree(linkedSaree);
                      }}
                      className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                    >
                      <img
                        src={linkedSaree.images[0]}
                        alt={linkedSaree.title}
                        className="w-12 h-14 rounded-xl object-cover border border-amber-300/40 shrink-0 bg-stone-800"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                          Featured in Reel
                        </span>
                        <h4 className="text-xs font-bold text-white truncate">
                          {linkedSaree.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs mt-0.5">
                          <span className="font-extrabold text-amber-300">
                            ₹{linkedSaree.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-stone-400 line-through">
                            ₹{linkedSaree.originalPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          onAddToCart(linkedSaree);
                          onShowToast(`Added "${linkedSaree.title}" to cart!`);
                        }}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer"
                        title="Add to Cart"
                      >
                        <ShoppingBag className="w-4 h-4 text-amber-300" />
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onBuyNow(linkedSaree);
                        }}
                        className="py-2 px-3 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:opacity-95 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1 transition shadow-md cursor-pointer active:scale-95"
                      >
                        <span>Buy Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
