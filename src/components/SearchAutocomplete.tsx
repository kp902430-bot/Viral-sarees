import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Sparkles, Tag, ArrowRight, ChevronRight, Check } from 'lucide-react';
import { Saree } from '../types';

interface SearchAutocompleteProps {
  sarees: Saree[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onSelectSaree?: (saree: Saree) => void;
  onSelectFabric?: (fabric: string) => void;
  placeholder?: string;
  idPrefix?: string;
  inputClassName?: string;
  className?: string;
  onCloseMobileMenu?: () => void;
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  sarees,
  searchTerm,
  onSearchChange,
  onSelectSaree,
  onSelectFabric,
  placeholder = "Search Banarasi Silk, Kanjivaram, SKU...",
  idPrefix = "nav-search",
  inputClassName,
  className = "relative w-full",
  onCloseMobileMenu
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract fabric list & count occurrences dynamically
  const fabricStats = useMemo(() => {
    const counts: Record<string, number> = {};
    sarees.forEach((s) => {
      if (s.fabric) {
        counts[s.fabric] = (counts[s.fabric] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([fabric, count]) => ({
      name: fabric,
      count
    }));
  }, [sarees]);

  // Compute matched fabrics and matched sarees
  const trimmed = searchTerm.trim().toLowerCase();

  const matchedFabrics = useMemo(() => {
    if (!trimmed) {
      // If empty, return top 4-5 popular fabrics
      return fabricStats.slice(0, 5);
    }
    return fabricStats
      .filter((f) => f.name.toLowerCase().includes(trimmed))
      .slice(0, 4);
  }, [fabricStats, trimmed]);

  const matchedSarees = useMemo(() => {
    if (!trimmed) return [];
    return sarees
      .filter((s) => {
        const titleMatch = s.title.toLowerCase().includes(trimmed);
        const hindiMatch = s.hindiTitle ? s.hindiTitle.toLowerCase().includes(trimmed) : false;
        const skuMatch = s.sku.toLowerCase().includes(trimmed);
        const fabricMatch = s.fabric ? s.fabric.toLowerCase().includes(trimmed) : false;
        const categoryMatch = s.category ? s.category.toLowerCase().includes(trimmed) : false;
        return titleMatch || hindiMatch || skuMatch || fabricMatch || categoryMatch;
      })
      .slice(0, 5);
  }, [sarees, trimmed]);

  // Flatten suggestions for keyboard arrow key navigation
  const allSuggestions = useMemo(() => {
    const list: Array<{ type: 'fabric'; value: string } | { type: 'saree'; value: Saree }> = [];
    matchedFabrics.forEach((f) => list.push({ type: 'fabric', value: f.name }));
    matchedSarees.forEach((s) => list.push({ type: 'saree', value: s }));
    return list;
  }, [matchedFabrics, matchedSarees]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectFabric = (fabricName: string) => {
    onSearchChange(fabricName);
    if (onSelectFabric) {
      onSelectFabric(fabricName);
    }
    setIsOpen(false);
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  const handleSelectSaree = (saree: Saree) => {
    onSearchChange(saree.title);
    if (onSelectSaree) {
      onSelectSaree(saree);
    }
    setIsOpen(false);
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < allSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : allSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < allSuggestions.length) {
        e.preventDefault();
        const item = allSuggestions[highlightedIndex];
        if (item.type === 'fabric') {
          handleSelectFabric(item.value);
        } else {
          handleSelectSaree(item.value);
        }
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Helper to highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-amber-200 text-stone-950 font-bold px-0.5 rounded-xs">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div ref={containerRef} className={className}>
      <div className="relative w-full">
        <input
          ref={inputRef}
          id={`${idPrefix}-input`}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          autoComplete="off"
          onFocus={() => {
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          className={
            inputClassName ||
            "w-full pl-10 pr-9 py-2 text-sm bg-stone-50 border border-stone-200 rounded-full focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition shadow-inner font-medium text-stone-800 placeholder:text-stone-400"
          }
        />
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />

        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-2.5 p-0.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/60 transition cursor-pointer"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Auto-Complete Dropdown Popup */}
      {isOpen && (
        <div
          id={`${idPrefix}-suggestions-dropdown`}
          className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-stone-200/90 overflow-hidden z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150 max-h-[75vh] flex flex-col"
        >
          <div className="overflow-y-auto divide-y divide-stone-100 p-1.5">
            {/* 1. Fabric Category Suggestions */}
            {matchedFabrics.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between mb-1.5 px-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-900">
                    <Tag className="w-3 h-3 text-amber-600" />
                    <span>{trimmed ? 'Matching Fabric Types' : 'Popular Fabrics'}</span>
                  </div>
                  <span className="text-[10px] text-stone-600 font-medium">Click to filter</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {matchedFabrics.map((fabric, idx) => {
                    const isSelected = highlightedIndex === idx;
                    return (
                      <button
                        key={fabric.name}
                        type="button"
                        onClick={() => handleSelectFabric(fabric.name)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-100 text-stone-950 font-bold'
                            : 'hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <span className="truncate">
                          {trimmed ? highlightMatch(fabric.name, trimmed) : fabric.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono ml-1.5 shrink-0 border border-stone-200">
                          {fabric.count} {fabric.count === 1 ? 'saree' : 'sarees'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Saree Title & Weave Suggestions */}
            {trimmed && matchedSarees.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between mb-1.5 px-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-rose-950">
                    <Sparkles className="w-3 h-3 text-rose-600" />
                    <span>Catalogue Titles & Styles</span>
                  </div>
                  <span className="text-[10px] text-stone-600 font-medium">Instant preview</span>
                </div>

                <div className="space-y-1">
                  {matchedSarees.map((saree, sIdx) => {
                    const overallIndex = matchedFabrics.length + sIdx;
                    const isSelected = highlightedIndex === overallIndex;
                    const thumbnail = saree.images && saree.images.length > 0 ? saree.images[0] : '';

                    return (
                      <button
                        key={saree.id}
                        type="button"
                        onClick={() => handleSelectSaree(saree)}
                        onMouseEnter={() => setHighlightedIndex(overallIndex)}
                        className={`w-full text-left p-2 rounded-xl flex items-center gap-3 transition cursor-pointer ${
                          isSelected ? 'bg-rose-50/80 border border-rose-200' : 'hover:bg-stone-50 border border-transparent'
                        }`}
                      >
                        {/* Saree Image Thumbnail */}
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={saree.title}
                            className="w-11 h-13 object-cover rounded-lg shrink-0 border border-stone-200 bg-stone-100"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-11 h-13 bg-stone-200 rounded-lg flex items-center justify-center text-stone-400 text-xs shrink-0">
                            VL
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-stone-900 truncate">
                            {highlightMatch(saree.title, trimmed)}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                            <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200/60">
                              {saree.fabric}
                            </span>
                            <span className="font-mono text-[10px] text-stone-400">
                              {saree.sku}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-rose-950 font-serif-brand">
                            ₹{saree.price.toLocaleString('en-IN')}
                          </div>
                          {saree.originalPrice > saree.price && (
                            <div className="text-[10px] text-stone-400 line-through">
                              ₹{saree.originalPrice.toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>

                        <ChevronRight className="w-4 h-4 text-stone-300 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Empty Results State */}
            {trimmed && matchedFabrics.length === 0 && matchedSarees.length === 0 && (
              <div className="py-6 px-4 text-center">
                <p className="text-xs text-stone-600 font-medium">
                  No exact title or fabric match found for "<span className="font-bold text-stone-900">{trimmed}</span>"
                </p>
                <p className="text-[11px] text-stone-600 mt-1">
                  Try searching by "Banarasi", "Kanjivaram", "Organza", "Silk", or SKU.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Footer Call to Action */}
          {trimmed && (
            <div className="bg-stone-50 border-t border-stone-100 px-3 py-2 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onCloseMobileMenu) onCloseMobileMenu();
                }}
                className="text-[11px] font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
              >
                <span>View all catalogue results for "{trimmed}"</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <span className="text-[10px] text-stone-400 hidden sm:inline">Press Enter ↵</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
