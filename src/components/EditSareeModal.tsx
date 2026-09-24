import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  UploadCloud, 
  Trash2, 
  Star, 
  ShieldCheck, 
  Check, 
  AlertCircle,
  Loader2,
  Edit3
} from 'lucide-react';
import { Saree, Fabric, Occasion } from '../types';
import { compressImageFile } from '../utils/imageCompressor';
import { BASE_CATEGORIES } from '../utils/categoryHelper';

interface EditSareeModalProps {
  isOpen: boolean;
  saree: Saree | null;
  onClose: () => void;
  onUpdateSaree: (updatedSaree: Saree) => void;
}

export const EditSareeModal: React.FC<EditSareeModalProps> = ({
  isOpen,
  saree,
  onClose,
  onUpdateSaree
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
  
  const [images, setImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [successMsg, setSuccessMsg] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (saree) {
      setTitle(saree.title || '');
      const existingFabric = (saree as any).category || saree.fabric || 'Banarasi Silk';
      const isKnown = BASE_CATEGORIES.some(b => b.id.toLowerCase() === existingFabric.toLowerCase());
      if (isKnown) {
        setFabric(existingFabric);
        setIsCustomCategory(false);
        setCustomCategoryName('');
      } else {
        setFabric('custom');
        setIsCustomCategory(true);
        setCustomCategoryName(existingFabric);
      }

      setOccasion(saree.occasion || 'Festive & Puja');
      setPrice(saree.price ? saree.price.toString() : '2499');
      setOriginalPrice(saree.originalPrice ? saree.originalPrice.toString() : '5999');
      setColor(saree.color || '');
      setWork(saree.work || '');
      setZariType(saree.zariType || 'Antique Gold Zari');
      setBlousePiece(saree.blousePiece || 'Unstitched Brocade Silk (0.8 Meter)');
      setLength(saree.length || '5.5 Meters Saree + 0.8 Meter Blouse');
      setDescription(saree.description || '');
      setImages(saree.images && saree.images.length > 0 ? [...saree.images] : []);
      setIsBestseller(!!saree.isBestseller);
      setInStock(saree.inStock !== false);
      setSuccessMsg(false);
      setPhotoError(null);
    }
  }, [saree, isOpen]);

  if (!isOpen || !saree) return null;

  const handleFiles = async (files: FileList | File[]) => {
    setPhotoError(null);
    setIsProcessing(true);
    const newImageUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const compressedBase64 = await compressImageFile(file, 1200, 0.8);
        newImageUrls.push(compressedBase64);
      }

      if (newImageUrls.length > 0) {
        setImages((prev) => [...prev, ...newImageUrls]);
      }
    } catch (err: any) {
      console.error(err);
      setPhotoError('Photo process karne me samasya aayi. Kripya doosri photo try karein.');
    } finally {
      setIsProcessing(false);
    }
  };

  const removePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (images.length === 0) {
      setPhotoError('Kripya saree ki kam se kam ek photo upload karein.');
      return;
    }

    const finalCategory = isCustomCategory && customCategoryName.trim()
      ? customCategoryName.trim()
      : fabric;

    const p = parseFloat(price) || saree.price;
    const orig = parseFloat(originalPrice) || (p * 2);
    const discount = Math.round(((orig - p) / orig) * 100);

    const updatedSaree: Saree = {
      ...saree,
      title: title.trim(),
      fabric: finalCategory as Fabric,
      category: finalCategory,
      occasion,
      price: p,
      originalPrice: orig,
      discountPercent: discount > 0 ? discount : 40,
      color,
      work,
      zariType,
      blousePiece,
      length,
      description: description.trim() || saree.description,
      images,
      inStock,
      isBestseller,
      tags: Array.from(new Set([...(saree.tags || []), finalCategory, 'Owner Pick']))
    };

    onUpdateSaree(updatedSaree);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#800020] to-[#550212] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 flex items-center justify-center border border-amber-400/30 text-amber-300">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-brand font-bold text-lg text-amber-100 flex items-center gap-2">
                <span>Update Saree & Category</span>
                <span className="text-[10px] bg-amber-400 text-stone-950 font-black px-2 py-0.5 rounded-full uppercase">
                  Live Edit
                </span>
              </h3>
              <p className="text-xs text-rose-200">
                Saree ki category, price ya photos update karein. Customers ko turant updated dikhega.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-rose-200 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-5 flex-1 text-xs">
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-center gap-2.5 font-bold text-xs">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Saree & Category safaltapoorvak update ho gayi hai! Sabhi customers ko ab updated dikhegi.</span>
            </div>
          )}

          {/* Title & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold text-stone-700 block mb-1">Saree Name / Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-800 bg-stone-50 outline-hidden font-medium"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">SKU Code</label>
              <input
                type="text"
                disabled
                value={saree.sku}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-stone-100 text-stone-500 font-mono"
              />
            </div>
          </div>

          {/* Category & Fabric Selection (Key Focus) */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-900 block text-xs">
                🏷️ Category / Fabric Selection *
              </label>
              <span className="text-[10px] text-amber-900 font-semibold">
                Customer isi category ke andar saree dekhega
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
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
                  className="w-full px-3 py-2 text-xs font-bold border border-amber-300 rounded-xl focus:ring-2 focus:ring-rose-800 bg-white outline-hidden"
                >
                  <optgroup label="Standard Categories">
                    {BASE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Custom Option">
                    <option value="custom">➕ Add / Type Custom Category...</option>
                  </optgroup>
                </select>
              </div>

              {/* Custom Category Input if selected */}
              {isCustomCategory ? (
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Type new category (e.g., Dola Silk, Cotton, Partywear)"
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border-2 border-rose-800 rounded-xl bg-white text-stone-900 outline-hidden placeholder:font-normal placeholder:text-stone-400"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="text-[11px] text-stone-600 flex items-center gap-1.5 px-2">
                  <span>Selected Category:</span>
                  <span className="font-black text-rose-950 bg-white border border-stone-200 px-2 py-0.5 rounded-md">
                    {fabric}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Photos Upload & Manage */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Saree Photos ({images.length} photos)
            </label>

            {/* Photos Preview */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-3">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative aspect-3/4 rounded-xl overflow-hidden border border-stone-200 group bg-stone-100">
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-amber-400 text-stone-950 font-black text-[9px] px-1 rounded">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Upload Trigger Tile */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="aspect-3/4 rounded-xl border-2 border-dashed border-stone-300 hover:border-rose-800 bg-stone-50 hover:bg-rose-50/40 flex flex-col items-center justify-center p-2 text-stone-500 hover:text-rose-900 transition cursor-pointer"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin text-rose-800" />
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5 mb-1 text-rose-800" />
                    <span className="text-[10px] font-bold text-center">+ Add More Photo</span>
                  </>
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-800 bg-stone-50 outline-hidden font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">MRP Original Price (₹)</label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-800 bg-stone-50 outline-hidden"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Occasion</label>
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

          {/* Color & Work */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-800 bg-stone-50 outline-hidden"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Work / Embroidery</label>
              <input
                type="text"
                value={work}
                onChange={(e) => setWork(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-800 bg-stone-50 outline-hidden"
              />
            </div>
          </div>

          {/* Stock Toggle & Bestseller */}
          <div className="flex flex-wrap items-center gap-6 p-3 bg-stone-50 rounded-xl border border-stone-200">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="w-4 h-4 text-rose-800 rounded-md focus:ring-rose-800"
              />
              <span>In Stock (Available for Customers)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="w-4 h-4 text-rose-800 rounded-md focus:ring-rose-800"
              />
              <span>★ Bestseller Tag</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-900 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2.5 bg-[#800020] hover:bg-[#9B111E] text-amber-100 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Save Saree & Category Updates</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
