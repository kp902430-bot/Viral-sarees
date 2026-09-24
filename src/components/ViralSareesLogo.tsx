import React from 'react';

interface ViralSareesLogoProps {
  variant?: 'app-icon' | 'horizontal' | 'compact' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  className?: string;
  showTagline?: boolean;
  showPill?: boolean;
  dark?: boolean;
}

export const ViralSareesLogo: React.FC<ViralSareesLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
}) => {
  // Ultra-HD crisp rendering styles for High-DPI, Retina & 4K displays
  const hdImgStyle: React.CSSProperties = {
    imageRendering: '-webkit-optimize-contrast',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
  };

  // 1. APP-ICON / SQUIRCLE EMBLEM (App install, PWA modal, hero badges)
  if (variant === 'app-icon' || variant === 'badge') {
    const sizeClasses =
      size === 'sm'
        ? 'w-24 h-24 rounded-2xl'
        : size === 'lg'
        ? 'w-48 h-48 sm:w-56 sm:h-56 rounded-3xl'
        : size === 'xl'
        ? 'w-64 h-64 sm:w-72 sm:h-72 rounded-3xl'
        : 'w-36 h-36 sm:w-44 sm:h-44 rounded-3xl';

    return (
      <div className={`relative inline-block select-none ${className}`}>
        <img
          src="/app-logo.svg"
          alt="Viral Sarees - Trend humse shuru hota hai"
          className={`${sizeClasses} object-contain shadow-2xl transition-transform hover:scale-102 border-2 border-amber-400/40`}
          style={hdImgStyle}
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  // 2. COMPACT / MOBILE HEADER EMBLEM
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <img
          src="/app-logo.svg"
          alt="Viral Sarees"
          className="h-11 sm:h-12 w-11 sm:w-12 aspect-square object-contain shrink-0 rounded-xl shadow-md border border-amber-400/40"
          style={hdImgStyle}
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  // 3. HORIZONTAL / STANDARD BRAND LOGO (Header Navbar, Footer, Navigation)
  const sizeClasses =
    size === 'sm'
      ? 'h-10 w-10 sm:h-11 sm:w-11 rounded-xl'
      : size === 'lg'
      ? 'h-16 w-16 sm:h-20 sm:w-20 rounded-2xl'
      : size === 'xl'
      ? 'h-24 w-24 sm:h-28 sm:w-28 rounded-3xl'
      : 'h-13 w-13 sm:h-15 sm:w-15 md:h-16 md:w-16 rounded-2xl';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <img
        src="/app-logo.svg"
        alt="Viral Sarees - Trend humse shuru hota hai. Price Kam, Quality Mein Dum"
        className={`${sizeClasses} aspect-square object-contain shrink-0 shadow-lg border border-amber-400/50 transition-transform group-hover:scale-103 duration-200`}
        style={hdImgStyle}
        loading="eager"
        decoding="async"
      />
    </div>
  );
};
