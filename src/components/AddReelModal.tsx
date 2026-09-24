import React, { useState } from 'react';
import { Saree, SareeReel } from '../types';
import { X, Film, PlusCircle, Sparkles, Check, Link, User, Music, Layers } from 'lucide-react';

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
  const [musicTitle, setMusicTitle] = useState('Kashi Heritage Shehnai - Banaras Looms');
  const [drapeStyle, setDrapeStyle] = useState('Royal Pleated Drape');
  const [tags, setTags] = useState('Bridal, Banarasi, Festive');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) return;

    const newReel: SareeReel = {
      id: `reel-${Date.now().toString().slice(-4)}`,
      sareeId: selectedSareeId,
      title: title.trim(),
      caption: caption.trim() || title.trim(),
      videoUrl: videoUrl.trim(),
      thumbnailUrl: thumbnailUrl.trim() || (sarees.find(s => s.id === selectedSareeId)?.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),
      likes: 120,
      views: '1.2K',
      modelOrCreator: modelOrCreator.trim() || 'Viral Sarees Stylist',
      creatorHandle: creatorHandle.trim() || '@viralsarees_official',
      musicTitle: musicTitle.trim() || 'Heritage Studio Audio',
      drapeStyle: drapeStyle.trim() || 'Classic Drape',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      commentsCount: 0,
      duration: '0:30'
    };

    onAddReel(newReel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-stone-900 text-white rounded-3xl border-2 border-amber-500/50 shadow-2xl overflow-hidden animate-scaleUp my-8">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#800020] via-[#590214] to-[#2B0109] border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white font-serif-brand">
                Owner Portal: Add Saree Reel
              </h3>
              <p className="text-[11px] text-amber-200">
                Upload or link 9:16 vertical drape video with tagged saree
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-amber-200 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div>
            <label className="font-bold text-stone-200 block mb-1">Reel Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., Royal Banarasi Kadwa Drape in Red"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-400"
            />
          </div>

          <div>
            <label className="font-bold text-stone-200 block mb-1">Tag Catalogue Saree (Product to Shop)</label>
            <select
              value={selectedSareeId}
              onChange={(e) => setSelectedSareeId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-amber-300 font-bold focus:outline-hidden focus:border-amber-400"
            >
              {sarees.length === 0 ? (
                <option value="">Catalogue me koi saree nahi hai (Optional link)</option>
              ) : (
                sarees.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} (₹{s.price.toLocaleString('en-IN')}) - {s.fabric}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-200 block mb-1">Video MP4 URL *</label>
              <input
                type="url"
                required
                placeholder="https://...video.mp4"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-400"
              />
              <span className="text-[10px] text-stone-400">Direct MP4 or video streaming link</span>
            </div>

            <div>
              <label className="font-bold text-stone-200 block mb-1">Cover Poster Image URL</label>
              <input
                type="url"
                placeholder="Auto-derived from saree if left empty"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-stone-200 block mb-1">Reel Caption & Description</label>
            <textarea
              rows={2}
              placeholder="Add description highlighting the zari, weight, and occasion styling..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-200 block mb-1">Model / Creator Name</label>
              <input
                type="text"
                value={modelOrCreator}
                onChange={(e) => setModelOrCreator(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>
            <div>
              <label className="font-bold text-stone-200 block mb-1">Creator Handle</label>
              <input
                type="text"
                value={creatorHandle}
                onChange={(e) => setCreatorHandle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-200 block mb-1">Drape Style</label>
              <input
                type="text"
                placeholder="e.g. Gujarati Pallu, Nivi Drape"
                value={drapeStyle}
                onChange={(e) => setDrapeStyle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>
            <div>
              <label className="font-bold text-stone-200 block mb-1">Audio / Music Track</label>
              <input
                type="text"
                placeholder="e.g. Shehnai Classical Tune"
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          {/* Quick presets for video links */}
          <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700 space-y-1.5">
            <span className="text-[11px] font-bold text-amber-300 block">
              Popular HD Reel Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setVideoUrl('https://assets.mixkit.co/videos/preview/mixkit-indian-bride-dressed-in-red-and-gold-41722-large.mp4');
                  setTitle('Bridal Red Banarasi Zari Drape');
                }}
                className="px-2 py-1 bg-stone-700 hover:bg-stone-600 rounded text-[10px] text-white"
              >
                Sample 1: Bridal Red
              </button>
              <button
                type="button"
                onClick={() => {
                  setVideoUrl('https://assets.mixkit.co/videos/preview/mixkit-woman-wearing-an-indian-saree-41718-large.mp4');
                  setTitle('Royal Blue Kanjivaram Shine');
                }}
                className="px-2 py-1 bg-stone-700 hover:bg-stone-600 rounded text-[10px] text-white"
              >
                Sample 2: Royal Blue
              </button>
              <button
                type="button"
                onClick={() => {
                  setVideoUrl('https://assets.mixkit.co/videos/preview/mixkit-woman-dressed-in-traditional-indian-clothing-41719-large.mp4');
                  setTitle('Lightweight Organza Silk Flow');
                }}
                className="px-2 py-1 bg-stone-700 hover:bg-stone-600 rounded text-[10px] text-white"
              >
                Sample 3: Organza Flow
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black shadow-lg flex items-center gap-1.5 cursor-pointer"
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
