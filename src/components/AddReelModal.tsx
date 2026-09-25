import React, { useState, useRef } from 'react';
import { Saree, SareeReel } from '../types';
import { X, Film, PlusCircle, Check, Upload, Play, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface AddReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  sarees: Saree[];
  onAddReel: (reel: SareeReel) => void;
}

export const AddReelModal: React.FC<AddReelModalProps> = ({
  isOpen,
  onClose,
  sarees,
  onAddReel
}) => {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [selectedSareeId, setSelectedSareeId] = useState(sarees[0]?.id || '');
  const [modelOrCreator, setModelOrCreator] = useState('Pooja Varma');
  const [creatorHandle, setCreatorHandle] = useState('@pooja_drapes');
  const [musicTitle, setMusicTitle] = useState('Banarasi Looms Classical Shehnai');
  const [drapeStyle, setDrapeStyle] = useState('Royal Banarasi Drape');
  const [tags, setTags] = useState('Bridal, Banarasi, Festive');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);

  const videoFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Automatically capture a crisp snapshot frame from the uploaded video as thumbnail
  const extractThumbnailFromVideo = (videoSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const vid = document.createElement('video');
      vid.src = videoSrc;
      vid.crossOrigin = 'anonymous';
      vid.muted = true;
      vid.playsInline = true;
      vid.currentTime = 1.0; // grab 1 second in

      vid.onloadeddata = () => {
        vid.currentTime = Math.min(1.0, vid.duration / 2);
      };

      vid.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = vid.videoWidth || 480;
          canvas.height = vid.videoHeight || 854;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
            const thumb = canvas.toDataURL('image/jpeg', 0.85);
            resolve(thumb);
            return;
          }
        } catch {
          // fallback
        }
        resolve('');
      };

      vid.onerror = () => {
        resolve('');
      };

      // Timeout safety
      setTimeout(() => resolve(''), 3000);
    });
  };

  // Direct video file selection from phone camera roll, gallery, or computer
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a valid video file (MP4, MOV, WebM).');
      return;
    }

    setUploadError(null);
    setIsProcessingVideo(true);
    setVideoFileName(file.name);

    try {
      // 1. Create fast object URL for immediate live player preview
      const objectUrl = URL.createObjectURL(file);
      setVideoUrl(objectUrl);

      // 2. Auto-derive clean title if empty
      if (!title.trim()) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .trim();
        const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        setTitle(capitalized || 'Exclusive Saree Drape Reel');
      }

      // 3. Auto-generate thumbnail frame
      const autoThumb = await extractThumbnailFromVideo(objectUrl);
      if (autoThumb) {
        setThumbnailUrl(autoThumb);
      } else {
        const sareeImg = sarees.find((s) => s.id === selectedSareeId)?.images[0];
        if (sareeImg) setThumbnailUrl(sareeImg);
      }

      // 4. Also convert file to Data URL for persistence
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        if (dataUrl) {
          // If file is moderately sized, use dataUrl so it persists across reloads
          if (file.size < 15 * 1024 * 1024) {
            setVideoUrl(dataUrl);
          }
        }
      };
      reader.readAsDataURL(file);

    } catch (err) {
      console.error('Error handling video file:', err);
      setUploadError('Failed to process video. Please try again or choose another clip.');
    } finally {
      setIsProcessingVideo(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      setUploadError('Please select a video from your phone/device.');
      return;
    }

    const linkedSaree = sarees.find((s) => s.id === selectedSareeId);

    const newReel: SareeReel = {
      id: `reel-${Date.now().toString().slice(-4)}`,
      sareeId: selectedSareeId,
      title: title.trim(),
      caption: caption.trim() || title.trim(),
      videoUrl: videoUrl.trim(),
      thumbnailUrl:
        thumbnailUrl.trim() ||
        linkedSaree?.images[0] ||
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      likes: 120,
      views: '1.2K',
      modelOrCreator: modelOrCreator.trim() || 'Viral Sarees Stylist',
      creatorHandle: creatorHandle.trim() || '@viralsarees_official',
      musicTitle: musicTitle.trim() || 'Banarasi Heritage Audio',
      drapeStyle: drapeStyle.trim() || 'Classic Drape',
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      commentsCount: 0,
      duration: '0:30'
    };

    onAddReel(newReel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-fadeIn">
      <div className="relative w-full max-w-lg bg-stone-900 text-white rounded-none sm:rounded-3xl border-0 sm:border-2 sm:border-amber-500/50 shadow-2xl h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header - Fixed & Sticky */}
        <div className="shrink-0 p-4 sm:p-5 bg-gradient-to-r from-[#800020] via-[#590214] to-[#2B0109] border-b border-amber-500/30 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white font-serif-brand">
                Add Saree Video Reel
              </h3>
              <p className="text-[11px] text-amber-200">
                Direct video upload from mobile or computer — no URL link needed
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 text-amber-200 hover:text-white rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body - Full Mobile Touch Pan & Vertical Scrolling */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-y-contain touch-pan-y [webkit-overflow-scrolling:touch] p-4 sm:p-6 space-y-4 text-xs">
            
            {uploadError && (
              <div className="p-3 bg-rose-900/60 border border-rose-500/80 rounded-xl text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Direct Video Picker Box - Primary & Prominent */}
            <div className="space-y-2">
              <label className="font-bold text-stone-200 block text-sm flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Choose Saree Video File *</span>
              </label>

              <input
                ref={videoFileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*"
                onChange={handleVideoFileChange}
                className="hidden"
              />

              {!videoUrl ? (
                /* Empty Upload Target */
                <button
                  type="button"
                  onClick={() => videoFileInputRef.current?.click()}
                  className="w-full py-8 px-4 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border-2 border-dashed border-amber-400/60 hover:border-amber-300 flex flex-col items-center justify-center gap-3 text-stone-300 transition cursor-pointer group active:scale-98"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm text-white">
                      Tap to Choose Video from Phone / PC
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Directly pick from Gallery, Camera, or Files (MP4, MOV, WebM)
                    </p>
                    <span className="mt-2 inline-block text-[10px] bg-amber-400/20 text-amber-200 px-3 py-1 rounded-full border border-amber-300/30 font-semibold">
                      ✨ No Web Link Required
                    </span>
                  </div>
                </button>
              ) : (
                /* Video Live Preview */
                <div className="p-3 bg-stone-800/90 rounded-2xl border border-amber-400/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-xs text-emerald-300">
                        {videoFileName ? `Video Selected: ${videoFileName}` : 'Video Attached'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => videoFileInputRef.current?.click()}
                      className="px-2.5 py-1 bg-stone-700 hover:bg-stone-600 rounded-lg text-[10px] text-amber-200 font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Change Video</span>
                    </button>
                  </div>

                  <div className="relative rounded-xl overflow-hidden bg-black max-h-56 flex items-center justify-center border border-stone-700">
                    <video
                      src={videoUrl}
                      controls
                      playsInline
                      className="w-full max-h-56 object-contain"
                    />
                  </div>

                  {isProcessingVideo && (
                    <p className="text-[11px] text-amber-300 animate-pulse text-center">
                      Auto-generating thumbnail frame from video...
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Reel Title */}
            <div>
              <label className="font-bold text-stone-200 block mb-1">Reel Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Red Banarasi Katan Silk Drape"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-400 placeholder:text-stone-500"
              />
            </div>

            {/* Tag Catalogue Saree (Product link) */}
            <div>
              <label className="font-bold text-stone-200 block mb-1">Tag Catalogue Saree (Product to Shop)</label>
              <select
                value={selectedSareeId}
                onChange={(e) => setSelectedSareeId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-amber-300 font-bold focus:outline-hidden focus:border-amber-400 cursor-pointer"
              >
                {sarees.length === 0 ? (
                  <option value="">No sarees in catalogue yet (Optional link)</option>
                ) : (
                  sarees.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} (₹{s.price.toLocaleString('en-IN')}) - {s.fabric}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Drape Style & Stylist Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-200 block mb-1">Drape Style</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Banarasi Drape"
                  value={drapeStyle}
                  onChange={(e) => setDrapeStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>
              <div>
                <label className="font-bold text-stone-200 block mb-1">Stylist / Model Name</label>
                <input
                  type="text"
                  value={modelOrCreator}
                  onChange={(e) => setModelOrCreator(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>
            </div>

            {/* Reel Caption */}
            <div>
              <label className="font-bold text-stone-200 block mb-1">Caption & Description</label>
              <textarea
                rows={2}
                placeholder="Highlight the pure zari luster, fabric drape, and wedding styling..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-400 placeholder:text-stone-500"
              />
            </div>

            {/* Optional URL Toggle (Only if owner wants to enter web link instead) */}
            <div className="pt-1">
              {!showUrlFallback ? (
                <button
                  type="button"
                  onClick={() => setShowUrlFallback(true)}
                  className="text-[11px] text-stone-400 hover:text-amber-200 underline cursor-pointer"
                >
                  Or enter external video web URL instead
                </button>
              ) : (
                <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700 space-y-2">
                  <span className="text-[11px] text-stone-300 font-bold block">Video Web URL (Optional):</span>
                  <input
                    type="url"
                    placeholder="https://...saree-drape.mp4"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white text-[11px] font-mono focus:border-amber-400 outline-hidden"
                  />
                </div>
              )}
            </div>

          </div>

          {/* Fixed Footer Actions - Always Accessible */}
          <div className="shrink-0 p-3.5 sm:p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-end gap-3 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!videoUrl || isProcessingVideo}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-stone-950 font-black shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Saree Reel</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
