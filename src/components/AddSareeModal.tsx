import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  UploadCloud, 
  Trash2, 
  Star, 
  ShieldCheck, 
  Check, 
  Crown, 
  AlertCircle,
  Loader2,
  Plus,
  Mail,
  Sparkles,
  Send
} from 'lucide-react';
import { Saree, Fabric, Occasion } from '../types';
import { compressImageFile } from '../utils/imageCompressor';

interface AddSareeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSaree: (newSaree: Saree, tagline?: string, shouldBroadcast?: boolean) => void;
  customersCount?: number;
}

export const AddSareeModal: React.FC<AddSareeModalProps> = ({
  isOpen,
  onClose,
  onAddSaree,
  customersCount = 0
}) => {
  const [title, setTitle] = useState('');
  const [fabric, setFabric] = useState<string>('Banarasi Silk');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [occasion, setOccasion] = useState<Occasion>('Festive & Puja');
  const [price, setPrice] = useState('2499');
  const [originalPrice, setOriginalPrice] = useState('5999');
  const [color, setColor] = useState('Royal Crimson Red');
  const [work, setWork] = useState('Zari Weaving with Kadwa Floral Jaal');
  const [zariType, setZariType] = useState('Antique Gold Zari');
  const [blousePiece, setBlousePiece] = useState('Unstitched Brocade Silk (0.8 Meter)');
  const [length, setLength] = useState('5.5 Meters Saree + 0.8 Meter Blouse');
  const [description, setDescription] = useState('');

  // Automatic Email Broadcast to Customers State
  const [sendEmailBroadcast, setSendEmailBroadcast] = useState(true);
  const [selectedTaglineIndex, setSelectedTaglineIndex] = useState(0);
  const [customTagline, setCustomTagline] = useState('');

  const PRESET_TAGLINES = [
    '✨ Royal Elegance Just Arrived! Trend humse shuru hota hai — Naya Saree Catalogue Abhi Live Hai!',
    '🔥 Limited Edition Festive Drapes: Pehle Aap, Fir Zamana!',
    '👑 Handpicked Luxury at Wholesale Rates: Nayi Viral Saree abhi store me live hai!',
    '💃 Shaadi & Tyohar Special: Har Nazar Aap Par — Exclusive New Collection!',
    '🌟 Pure Banarasi Silk Weaving Masterpiece — Abhi Order Karein!'
  ];
  
  // Direct Photo Upload State (Replaces text URL)
  const [images, setImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [fallbackUrlInput, setFallbackUrlInput] = useState('');

  const [isBestseller, setIsBestseller] = useState(true);
  const [inStock, setInStock] = useState(true);
  const [successMsg, setSuccessMsg] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process files selected via input or drop
  const handleFiles = async (files: FileList | File[]) => {
    setPhotoError(null);
    setIsProcessing(true);
    const newImageUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          continue;
        }
        // Resize & compress to lightweight Data URL (<150KB)
        const compressed = await compressImageFile(file, 1200, 0.84);
        newImageUrls.push(compressed);
      }

      if (newImageUrls.length > 0) {
        setImages((prev) => [...prev, ...newImageUrls]);
      } else {
        setPhotoError('Valid image file select karein (JPEG, PNG, WebP).');
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setPhotoError('Photo process karne me truti hui. Kripya punah prayas karein.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = ''; // Reset input to allow selecting same file again
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryPhoto = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  const handleAddUrlPhoto = () => {
    if (!fallbackUrlInput.trim()) return;
    setImages((prev) => [...prev, fallbackUrlInput.trim()]);
    setFallbackUrlInput('');
    setShowUrlFallback(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (images.length === 0) {
      setPhotoError('Kripya saree ki kam se kam ek photo upload karein.');
      return;
    }

    const p = parseFloat(price) || 1999;
    const orig = parseFloat(originalPrice) || (p * 2);
    const discount = Math.round(((orig - p) / orig) * 100);
    const finalCategory = isCustomCategory && customCategoryName.trim()
      ? customCategoryName.trim()
      : fabric;

    const skuPrefix = finalCategory.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'SAREE';
    const skuCode = `VLS-${skuPrefix}-${Math.floor(100 + Math.random() * 900)}`;

    const newSaree: Saree = {
      id: `vls-${Date.now()}`,
      title: title.trim(),
      sku: skuCode,
      price: p,
      originalPrice: orig,
      discountPercent: discount > 0 ? discount : 40,
      fabric: finalCategory as Fabric,
      category: finalCategory,
      color,
      colorHex: '#800020',
      occasion,
      zariType,
      blousePiece,
      length,
      border: 'Intricate Designer Border',
      work,
      description: description.trim() || `Exquisite handcrafted ${finalCategory} saree from Viral Sarees collection. Perfect for weddings, festivals, and special celebrations.`,
      images,
      inStock,
      rating: 5.0,
      reviewsCount: 1,
      isBestseller,
      isNewArrival: true,
      careInstructions: 'Dry Clean Only. Keep in muslin cloth bag.',
      tags: ['New Arrival', finalCategory, 'Silk Mark Verified', 'Owner Pick']
    };

    const chosenTagline = selectedTaglineIndex === -1 ? (customTagline.trim() || PRESET_TAGLINES[0]) : PRESET_TAGLINES[selectedTaglineIndex];
    onAddSaree(newSaree, chosenTagline, sendEmailBroadcast);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#590417] via-[#800020] to-[#3a020e] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Add Saree to Catalogue</h3>
                <span className="bg-amber-400/20 text-amber-200 border border-amber-300/30 text-[10px] px-1.5 py-0.5 rounded font-mono">
                  Owner Portal
                </span>
              </div>
              <p className="text-[11px] text-stone-300">
                Directly upload saree photos and publish to customer store.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-300 hover:text-white rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 text-xs">
          
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-2 font-bold text-sm">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Saree successfully uploaded and published to live catalogue!</span>
            </div>
          )}

          {/* Saree Title */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Saree Title & Design Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Crimson Red Pure Banarasi Katan Silk Saree"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-800 outline-hidden"
            />
          </div>

          {/* DIRECT PHOTO UPLOAD SECTION */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-stone-800 text-sm flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#800020]" />
                  <span>Saree Photo Upload *</span>
                </label>
                <p className="text-[11px] text-stone-500">
                  Apne device, gallery ya camera se sidha saree ki photo add karein.
                </p>
              </div>
              {images.length > 0 && (
                <span className="text-[11px] font-bold text-stone-600 bg-white px-2.5 py-1 rounded-full border border-stone-200">
                  {images.length} {images.length === 1 ? 'Photo Added' : 'Photos Added'}
                </span>
              )}
            </div>

            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {/* Drag & Drop Upload Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`p-6 border-2 border-dashed rounded-2xl text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                isDragOver
                  ? 'border-[#800020] bg-rose-50/70'
                  : 'border-stone-300 hover:border-[#800020] bg-white'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {isProcessing ? (
                <div className="py-4 flex flex-col items-center gap-2 text-stone-600">
                  <Loader2 className="w-8 h-8 text-[#800020] animate-spin" />
                  <span className="font-bold">Compressing & Preparing Photo...</span>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-rose-50 text-[#800020] flex items-center justify-center shadow-xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800 text-xs sm:text-sm">
                      Click to Select Photos from Device / Gallery
                    </p>
                    <p className="text-stone-400 text-[11px] mt-0.5">
                      Drag & Drop photos here (supports JPG, PNG, WebP)
                    </p>
                  </div>
                  
                  {/* Action buttons inside zone */}
                  <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-[#800020] hover:bg-[#9B111E] text-amber-100 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Choose Photos</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="Open device camera directly"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-300" />
                      <span>Take Photo</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Error Message */}
            {photoError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 font-medium text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{photoError}</span>
              </div>
            )}

            {/* Uploaded Images Preview Gallery */}
            {images.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span>Uploaded Previews (First photo will be Cover):</span>
                  <span>Click ★ on any photo to set as Cover</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative group rounded-xl overflow-hidden border-2 aspect-3/4 bg-stone-100 shadow-xs transition ${
                        idx === 0 ? 'border-[#800020] ring-2 ring-rose-200' : 'border-stone-200'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Saree view ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Primary Cover Badge */}
                      {idx === 0 && (
                        <div className="absolute top-1.5 left-1.5 bg-[#800020] text-amber-200 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-amber-300" />
                          <span>Main Cover</span>
                        </div>
                      )}

                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-1">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryPhoto(idx)}
                            className="p-1.5 bg-amber-400 text-stone-900 rounded-lg hover:bg-amber-300 transition"
                            title="Set as Main Cover Photo"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add more button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-3/4 rounded-xl border-2 border-dashed border-stone-300 hover:border-[#800020] bg-white flex flex-col items-center justify-center gap-1 text-stone-500 hover:text-[#800020] transition cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-[10px] font-bold">+ Add More</span>
                  </button>
                </div>
              </div>
            )}

            {/* Optional URL input fallback (secondary toggle) */}
            <div className="pt-1">
              {!showUrlFallback ? (
                <button
                  type="button"
                  onClick={() => setShowUrlFallback(true)}
                  className="text-[11px] text-stone-400 hover:text-stone-700 underline cursor-pointer"
                >
                  Agar image URL se add karna ho toh yahan click karein
                </button>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-700 text-[11px]">Paste Image URL</span>
                    <button
                      type="button"
                      onClick={() => setShowUrlFallback(false)}
                      className="text-stone-400 hover:text-stone-600 text-[11px]"
                    >
                      Hide
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.example.com/saree.jpg"
                      value={fallbackUrlInput}
                      onChange={(e) => setFallbackUrlInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-lg outline-hidden font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrlPhoto}
                      className="px-3 py-1.5 bg-stone-800 text-white font-bold rounded-lg text-xs hover:bg-stone-900"
                    >
                      Add URL
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Fabric & Occasion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Fabric Category *</label>
              <select
                value={isCustomCategory ? 'custom' : fabric}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomCategory(true);
                  } else {
                    setIsCustomCategory(false);
                    setFabric(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-800 bg-white outline-hidden font-medium"
              >
                <optgroup label="Standard Categories">
                  <option value="Banarasi Silk">Banarasi Silk</option>
                  <option value="Kanjivaram Silk">Kanjivaram Silk</option>
                  <option value="Pure Organza">Pure Organza</option>
                  <option value="Georgette">Georgette & Chikankari</option>
                  <option value="Chiffon">Chiffon</option>
                  <option value="Paithani Silk">Paithani Silk</option>
                  <option value="Bandhani">Bandhani & Bandhej</option>
                  <option value="Tissue Silk">Tissue Silk</option>
                  <option value="Chanderi Silk">Chanderi & Cotton</option>
                </optgroup>
                <optgroup label="Custom Option">
                  <option value="custom">➕ Add Custom Category / Nayi Category...</option>
                </optgroup>
              </select>

              {isCustomCategory && (
                <div className="mt-2 animate-fadeIn">
                  <input
                    type="text"
                    required
                    placeholder="Type new category (e.g., Dola Silk, Linen, Cotton)"
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border-2 border-rose-800 rounded-xl bg-amber-50/50 text-stone-900 outline-hidden font-bold"
                    autoFocus
                  />
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Ye nayi category store ke category bar me automatically add ho jayegi.
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Occasion *</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value as Occasion)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-800 bg-white outline-hidden"
              >
                <option value="Festive & Puja">Festive & Puja</option>
                <option value="Bridal">Bridal</option>
                <option value="Wedding">Wedding Guest</option>
                <option value="Partywear">Partywear & Cocktail</option>
                <option value="Daily Casual">Daily Casual & Office</option>
              </select>
            </div>
          </div>

          {/* Pricing & Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl font-mono font-bold text-rose-900 outline-hidden"
                placeholder="2499"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Original MRP (₹)</label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl font-mono outline-hidden"
                placeholder="5999"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Primary Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Royal Crimson Red"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl outline-hidden"
              />
            </div>
          </div>

          {/* Weave, Zari & Blouse Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Weave & Work Type</label>
              <input
                type="text"
                placeholder="e.g. Kadwa Jaal Weaving"
                value={work}
                onChange={(e) => setWork(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl outline-hidden"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Zari Specifications</label>
              <input
                type="text"
                placeholder="e.g. Antique Gold Floral Zari"
                value={zariType}
                onChange={(e) => setZariType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Saree Length</label>
              <input
                type="text"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl outline-hidden"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Blouse Piece Details</label>
              <input
                type="text"
                placeholder="e.g. Unstitched Brocade (0.8 Meter)"
                value={blousePiece}
                onChange={(e) => setBlousePiece(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl outline-hidden"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">Description & Craft Notes</label>
            <textarea
              rows={2}
              placeholder="Describe the weave, drape feel, and artisanal backstory..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl outline-hidden"
            />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="w-4 h-4 text-rose-800 rounded"
              />
              <span>Mark as Bestseller Highlight</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="w-4 h-4 text-rose-800 rounded"
              />
              <span>In Stock & Ready for Dispatch</span>
            </label>
          </div>

          {/* AUTOMATIC CUSTOMER EMAIL BROADCAST WITH VIRAL TAGLINES */}
          <div className="p-4 bg-gradient-to-br from-amber-50/80 via-rose-50/40 to-white border-2 border-amber-300/80 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#800020] text-amber-300 flex items-center justify-center shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                    <span>Automatic Customer Email Blast</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                      Auto-Notify
                    </span>
                  </h4>
                  <p className="text-[11px] text-stone-600">
                    Saree add hote hi registered customers ko high-conversion mail chala jayega.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={sendEmailBroadcast}
                  onChange={(e) => setSendEmailBroadcast(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#800020]"></div>
              </label>
            </div>

            {sendEmailBroadcast && (
              <div className="space-y-3 pt-2 border-t border-amber-200/70">
                <div>
                  <label className="font-bold text-stone-800 text-xs flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Choose Catchy Email Tagline (आकर्षक टैगलाइन चुनें):</span>
                  </label>
                  <div className="space-y-1.5">
                    {PRESET_TAGLINES.map((t, idx) => (
                      <label
                        key={idx}
                        onClick={() => setSelectedTaglineIndex(idx)}
                        className={`flex items-start gap-2 p-2 rounded-xl border text-xs cursor-pointer transition ${
                          selectedTaglineIndex === idx
                            ? 'bg-amber-100/90 border-[#800020] text-stone-900 font-semibold shadow-2xs'
                            : 'bg-white/80 border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="email_tagline"
                          checked={selectedTaglineIndex === idx}
                          onChange={() => setSelectedTaglineIndex(idx)}
                          className="mt-0.5 text-[#800020]"
                        />
                        <span className="leading-snug">{t}</span>
                      </label>
                    ))}

                    <label
                      onClick={() => setSelectedTaglineIndex(-1)}
                      className={`flex items-start gap-2 p-2 rounded-xl border text-xs cursor-pointer transition ${
                        selectedTaglineIndex === -1
                          ? 'bg-amber-100/90 border-[#800020] text-stone-900 font-semibold shadow-2xs'
                          : 'bg-white/80 border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="email_tagline"
                        checked={selectedTaglineIndex === -1}
                        onChange={() => setSelectedTaglineIndex(-1)}
                        className="mt-0.5 text-[#800020]"
                      />
                      <span>✍️ Custom Tagline (Apni pasand ki line likhein)</span>
                    </label>
                  </div>
                </div>

                {selectedTaglineIndex === -1 && (
                  <div className="pl-6">
                    <input
                      type="text"
                      placeholder="e.g. Shaadi season ka sabse bada dhamaka — Viral Sarees ka naya roop!"
                      value={customTagline}
                      onChange={(e) => setCustomTagline(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-amber-300 rounded-xl bg-white outline-hidden focus:ring-2 focus:ring-[#800020]"
                    />
                  </div>
                )}

                {/* Email Live Preview Banner */}
                <div className="p-2.5 bg-stone-900 text-white rounded-xl text-[11px] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      Recipients: <strong>All registered customers</strong> + Owner Gmail
                    </span>
                  </div>
                  <span className="text-amber-300 font-mono text-[10px]">
                    Gmail SMTP • Instant Dispatch
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-[#800020] hover:bg-[#9B111E] text-amber-100 font-bold shadow-md shadow-rose-900/20 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>Publish Saree to Catalogue</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
