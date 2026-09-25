import React, { useState } from 'react';
import { ShoppingBag, Heart, Search, Package, RotateCcw, PlusCircle, ShieldCheck, Phone, Menu, X, Crown, Lock, Film, Sparkles, Palette, Smartphone, Download, ExternalLink, User, UserCheck } from 'lucide-react';
import { OwnerSession, ThemeMode, CustomerProfile, Saree } from '../types';
import { STORE_CONFIG } from '../data/storeConfig';
import { SearchAutocomplete } from './SearchAutocomplete';
import { ViralSareesLogo } from './ViralSareesLogo';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  ownerSession: OwnerSession | null;
  currentCustomer?: CustomerProfile | null;
  onOpenCustomerAuth: () => void;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenReels: () => void;
  onOpenTracking: () => void;
  onOpenReturnPolicy: () => void;
  onOpenPrivacyPolicy: () => void;
  onOpenAddSaree: () => void;
  onOpenOwnerDashboard: () => void;
  onOpenInstallApp?: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onGoHome: () => void;
  activeView: 'home' | 'reels' | 'tracking' | 'returns' | 'privacy';
  setActiveView: (view: 'home' | 'reels' | 'tracking' | 'returns' | 'privacy') => void;
  sarees?: Saree[];
  onSelectSaree?: (saree: Saree) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  ownerSession,
  currentCustomer,
  onOpenCustomerAuth,
  themeMode,
  onThemeChange,
  onOpenCart,
  onOpenWishlist,
  onOpenReels,
  onOpenTracking,
  onOpenReturnPolicy,
  onOpenPrivacyPolicy,
  onOpenAddSaree,
  onOpenOwnerDashboard,
  onOpenInstallApp,
  searchTerm,
  onSearchChange,
  onGoHome,
  activeView,
  setActiveView,
  sarees = [],
  onSelectSaree,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // STRICT SECURITY RULE: Only kp902430@gmail.com is authorized as owner
  // Customer or any other email will NEVER see any owner button or detail anywhere!
  const isOwnerAuthorized = Boolean(
    currentCustomer &&
    currentCustomer.email &&
    currentCustomer.email.trim().toLowerCase() === 'kp902430@gmail.com' &&
    ownerSession?.isLoggedIn &&
    ownerSession?.email?.trim().toLowerCase() === 'kp902430@gmail.com'
  );

  const handleLogoTap = () => {
    setActiveView('home');
    onGoHome();
  };
  const [showThemePicker, setShowThemePicker] = useState(false);

  // Gradient themes for top announcement
  const announcementThemeClass = 
    themeMode === 'peacock'
      ? 'bg-linear-to-r from-[#002D52] via-[#05445E] to-[#0A192F] text-cyan-100'
      : themeMode === 'emerald'
      ? 'bg-linear-to-r from-[#083E2D] via-[#0D5C3A] to-[#032317] text-emerald-100'
      : 'bg-linear-to-r from-[#500010] via-[#800020] to-[#3B000C] text-amber-100';

  const logoGradientClass =
    themeMode === 'peacock'
      ? 'from-[#05445E] to-[#189AB4] text-cyan-200'
      : themeMode === 'emerald'
      ? 'from-[#083E2D] to-[#2E8B57] text-emerald-200'
      : 'from-[#800020] to-[#b91c1c] text-amber-200';

  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b-2 border-amber-200/80 shadow-md w-full">
      
      {/* Top Announcement Bar with Theme Customizer & Offers */}
      <div className={`${announcementThemeClass} text-xs py-1.5 px-4 sm:px-6 lg:px-8 font-medium transition-colors duration-500 w-full`}>
        <div className="max-w-[1550px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="bg-amber-400/25 text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-400/40 uppercase tracking-widest font-black flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Festive Offer</span>
            </span>
            <span className="truncate">Use Coupon <strong>VIRAL10</strong> for Flat 10% Off | Free Fall & Pico Included | COD Available</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs shrink-0 pr-1 sm:pr-2">
            {/* Theme Selector Pill */}
            <div className="relative">
              <button
                onClick={() => setShowThemePicker(!showThemePicker)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-[11px] font-bold transition cursor-pointer"
                title="Change Festive Royal Theme"
              >
                <Palette className="w-3 h-3 text-amber-300" />
                <span className="hidden sm:inline">Theme:</span>
                <span className="capitalize">{themeMode}</span>
              </button>

              {showThemePicker && (
                <div className="absolute right-0 top-7 mt-1 w-48 bg-stone-900 text-white rounded-2xl p-2 shadow-2xl border-2 border-amber-400/50 z-50 text-xs space-y-1 animate-fadeIn">
                  <div className="text-[10px] font-bold text-amber-300 uppercase px-2 py-1">
                    Select Royal Theme
                  </div>
                  <button
                    onClick={() => {
                      onThemeChange('crimson');
                      setShowThemePicker(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 font-bold cursor-pointer transition ${
                      themeMode === 'crimson' ? 'bg-[#800020] text-amber-200' : 'hover:bg-stone-800 text-stone-200'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-[#800020] border border-amber-300" />
                    <span>Royal Crimson & Gold</span>
                  </button>
                  <button
                    onClick={() => {
                      onThemeChange('peacock');
                      setShowThemePicker(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 font-bold cursor-pointer transition ${
                      themeMode === 'peacock' ? 'bg-[#05445E] text-cyan-200' : 'hover:bg-stone-800 text-stone-200'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-[#05445E] border border-cyan-300" />
                    <span>Peacock Blue & Gold</span>
                  </button>
                  <button
                    onClick={() => {
                      onThemeChange('emerald');
                      setShowThemePicker(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 font-bold cursor-pointer transition ${
                      themeMode === 'emerald' ? 'bg-[#083E2D] text-emerald-200' : 'hover:bg-stone-800 text-stone-200'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-[#083E2D] border border-emerald-300" />
                    <span>Emerald Green & Gold</span>
                  </button>
                </div>
              )}
            </div>

            {onOpenInstallApp && (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={onOpenInstallApp}
                  className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black text-[10px] sm:text-xs flex items-center gap-1 hover:bg-amber-300 transition shadow-xs cursor-pointer active:scale-95"
                  title="Install Viral Sarees App on your phone or share with customers"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Install Mobile App</span>
                </button>
              </div>
            )}

            <div className="hidden lg:flex items-center gap-3">
              <button 
                onClick={onOpenReturnPolicy}
                className="hover:text-white transition flex items-center gap-1 underline underline-offset-2"
              >
                <span>7-Day Returns</span>
              </button>
              <span>•</span>
              <a 
                href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`} 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-white transition flex items-center gap-1 font-bold"
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>{STORE_CONFIG.officialPhone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="w-full max-w-[1550px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-1.5 sm:gap-4">
          
          {/* Logo Brand (Single corner brand logo for the entire site) */}
          <button 
            id="brand-logo-btn"
            onClick={handleLogoTap}
            className="flex items-center text-left focus:outline-hidden group shrink-0 cursor-pointer"
            title="Viral Sarees - Trend humse shuru hota hai"
          >
            <ViralSareesLogo 
              variant="horizontal" 
              size="md" 
            />
          </button>

          {/* Search Bar - Desktop */}
          <div className="hidden xl:flex flex-1 max-w-sm 2xl:max-w-md mx-2 min-w-0">
            <SearchAutocomplete
              idPrefix="navbar-search-desktop"
              sarees={sarees}
              searchTerm={searchTerm}
              onSearchChange={(val) => {
                onSearchChange(val);
                if (activeView !== 'home') setActiveView('home');
              }}
              onSelectSaree={(saree) => {
                if (activeView !== 'home') setActiveView('home');
                if (onSelectSaree) onSelectSaree(saree);
              }}
              onSelectFabric={(fabric) => {
                if (activeView !== 'home') setActiveView('home');
              }}
              placeholder="Search Banarasi Silk, Kanjivaram, SKU..."
            />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-sm font-bold text-stone-800 shrink-0">
            <button
              id="nav-catalogue-btn"
              onClick={() => {
                setActiveView('home');
                onGoHome();
              }}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                activeView === 'home' 
                  ? 'text-stone-950 bg-amber-100 font-extrabold border border-amber-300 shadow-xs' 
                  : 'hover:text-rose-900 hover:bg-stone-100'
              }`}
            >
              Catalogue
            </button>

            {/* Saree Reels Navigation Button - Ultra-Prominent & Interactive */}
            <button
              id="nav-reels-btn"
              onClick={() => {
                onOpenReels();
              }}
              className={`relative px-3.5 py-1.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider cursor-pointer shadow-md group ${
                activeView === 'reels'
                  ? 'bg-linear-to-r from-rose-700 via-pink-600 to-amber-600 text-white border-2 border-amber-300 shadow-rose-900/30 scale-105'
                  : 'bg-linear-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white border border-white/40 hover:scale-105'
              }`}
              title="Watch Saree Drapes & Live Video Reels"
            >
              <Film className="w-4 h-4 text-amber-200 animate-pulse" />
              <span>Saree Reels</span>
              
              {/* Pulsing Live Pill */}
              <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-white text-stone-950 text-[9px] font-black tracking-widest shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                LIVE
              </span>
            </button>
            
            <button
              id="nav-tracking-btn"
              onClick={() => {
                setActiveView('tracking');
                onOpenTracking();
              }}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeView === 'tracking'
                  ? 'text-stone-950 bg-amber-100 font-extrabold border border-amber-300' 
                  : 'hover:text-rose-900 hover:bg-stone-100'
              }`}
            >
              <Package className="w-4 h-4 text-rose-800" />
              <span>Track Order</span>
            </button>
            
            <button
              id="nav-returns-btn"
              onClick={() => {
                setActiveView('returns');
                onOpenReturnPolicy();
              }}
              className={`hidden lg:flex px-3 py-1.5 rounded-xl transition items-center gap-1.5 cursor-pointer ${
                activeView === 'returns'
                  ? 'text-stone-950 bg-amber-100 font-extrabold border border-amber-300' 
                  : 'hover:text-rose-900 hover:bg-stone-100'
              }`}
            >
              <RotateCcw className="w-4 h-4 text-amber-700" />
              <span>Returns</span>
            </button>

            {/* Owner Section - STRICTLY only visible if kp902430@gmail.com is logged in */}
            {isOwnerAuthorized && (
              <div className="flex items-center gap-1.5 ml-1">
                <button
                  id="nav-owner-dashboard-btn"
                  onClick={onOpenOwnerDashboard}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200 transition flex items-center gap-1 font-black text-xs shadow-xs cursor-pointer"
                  title="Owner Dashboard"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-700" />
                  <span>Owner Portal</span>
                </button>
              </div>
            )}
          </nav>

          {/* Right Action Icons: Customer Sign In, Wishlist, Cart, Mobile Toggle - Safely within viewport with proper padding */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0 ml-auto pr-1 sm:pr-3 z-20">
            
            {/* Customer Sign In / Account Button */}
            <button
              id="nav-customer-account-btn"
              onClick={onOpenCustomerAuth}
              className={`relative p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border shrink-0 ${
                currentCustomer
                  ? 'bg-rose-50 hover:bg-rose-100 text-[#800020] border-rose-200 shadow-2xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 border-stone-200'
              }`}
              title={currentCustomer ? `Account: ${currentCustomer.name}` : 'Customer Sign In'}
              aria-label="Customer Account"
            >
              <div className="relative">
                <User className="w-4 h-4 text-[#800020]" />
                {currentCustomer && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                )}
              </div>
              <span className="hidden sm:inline truncate max-w-[85px]">
                {currentCustomer ? currentCustomer.name.split(' ')[0] : 'Sign In'}
              </span>
            </button>

            {/* Wishlist Button */}
            <button
              id="nav-wishlist-btn"
              onClick={onOpenWishlist}
              className="relative p-2 text-stone-700 hover:text-rose-800 hover:bg-rose-50 rounded-full transition shrink-0"
              title="View Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-rose-700 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart / Shopping Bag Button */}
            <button
              id="nav-cart-btn"
              onClick={onOpenCart}
              className="relative p-2 bg-[#800020] text-amber-100 hover:bg-[#9B111E] rounded-full transition shadow-md shadow-rose-900/20 shrink-0"
              title="Shopping Bag"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-amber-400 text-stone-900 rounded-full text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button - Horizontal Triple Line (Brought inward & high visibility) */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 sm:p-2.5 bg-stone-100 hover:bg-amber-50 active:bg-stone-200 text-stone-900 md:hidden rounded-xl border border-stone-300/90 shadow-xs shrink-0 cursor-pointer transition-all flex items-center justify-center ml-0.5"
              aria-label="Toggle Navigation Menu"
              title="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-stone-900 stroke-[2.5]" />
              ) : (
                <Menu className="w-5 h-5 text-stone-900 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar with Auto-Complete */}
        <div className="lg:hidden pb-3">
          <SearchAutocomplete
            idPrefix="navbar-search-mobile"
            sarees={sarees}
            searchTerm={searchTerm}
            onSearchChange={(val) => {
              onSearchChange(val);
              if (activeView !== 'home') setActiveView('home');
            }}
            onSelectSaree={(saree) => {
              if (activeView !== 'home') setActiveView('home');
              if (onSelectSaree) onSelectSaree(saree);
            }}
            onSelectFabric={(fabric) => {
              if (activeView !== 'home') setActiveView('home');
            }}
            placeholder="Search Banarasi, Kanjivaram, Organza sarees..."
            inputClassName="w-full pl-9 pr-9 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-fadeIn">
          {onOpenInstallApp && (
            <button
              onClick={() => {
                onOpenInstallApp();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-3 rounded-xl font-black text-amber-950 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 border-2 border-amber-400 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-rose-900 animate-bounce" />
                <span>Install & Share Mobile App</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#800020] text-amber-100 text-[10px] font-bold">
                1-Click App
              </span>
            </button>
          )}

          {/* Customer Account / Sign In */}
          <button
            onClick={() => {
              onOpenCustomerAuth();
              setIsMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2.5 rounded-xl font-bold flex items-center justify-between transition border ${
              currentCustomer
                ? 'bg-rose-50 text-[#800020] border-rose-200'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#800020]" />
              <span>{currentCustomer ? `My Account (${currentCustomer.name})` : 'Customer Sign In / Register'}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#800020] text-amber-100">
              {currentCustomer ? 'Profile & Orders' : 'Sign In'}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveView('home');
              onGoHome();
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-semibold text-stone-800 hover:bg-rose-50"
          >
            Catalogue Home
          </button>
          <button
            onClick={() => {
              onOpenReels();
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-bold text-rose-950 bg-gradient-to-r from-rose-50 to-amber-50 border border-amber-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-rose-700 animate-pulse" />
              <span>Saree Video Reels (Watch & Shop)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-linear-to-r from-rose-600 to-amber-600 text-white text-[9px] font-black uppercase">
              Live
            </span>
          </button>
          <button
            onClick={() => {
              setActiveView('tracking');
              onOpenTracking();
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-medium text-stone-800 hover:bg-rose-50 flex items-center gap-2"
          >
            <Package className="w-4 h-4 text-rose-800" />
            <span>Track My Order</span>
          </button>
          <button
            onClick={() => {
              setActiveView('returns');
              onOpenReturnPolicy();
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-medium text-stone-800 hover:bg-rose-50 flex items-center gap-2 text-rose-900 font-semibold"
          >
            <RotateCcw className="w-4 h-4 text-amber-700" />
            <span>Return & Refund Policy (Unboxing Video Rules)</span>
          </button>
          <button
            onClick={() => {
              setActiveView('privacy');
              onOpenPrivacyPolicy();
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-medium text-stone-800 hover:bg-rose-50 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Privacy & Security Policy</span>
          </button>

          {/* Owner options in mobile (3 horizontal lines) - STRICTLY only when kp902430@gmail.com is logged in */}
          {isOwnerAuthorized && (
            <>
              <button
                onClick={() => {
                  onOpenOwnerDashboard();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg bg-amber-100 text-amber-950 font-bold flex items-center gap-2 cursor-pointer"
              >
                <Crown className="w-4 h-4 text-amber-700" />
                <span>Owner Dashboard (Logged In)</span>
              </button>
              <button
                onClick={() => {
                  onOpenAddSaree();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg bg-[#800020] text-amber-100 font-bold flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-amber-300" />
                <span>+ Add Saree to Catalogue</span>
              </button>
            </>
          )}
          
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Customer Support (10 AM - 8 PM)</span>
            <a href={`tel:${STORE_CONFIG.officialPhone.replace(/\s+/g, '')}`} className="font-semibold text-rose-800 underline">
              {STORE_CONFIG.officialPhone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
