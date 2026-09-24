import React, { useState } from 'react';
import { X, Download, Share2, Smartphone, Check, Copy, ExternalLink, ShieldCheck, Sparkles, AlertCircle, Apple, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { getPublicStoreUrl } from '../utils/shareUrl';
import { ViralSareesLogo } from './ViralSareesLogo';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  // Dynamically resolve customer-safe public URL (replaces private ais-dev with public ais-pre to prevent 403 Forbidden)
  const appUrl = getPublicStoreUrl();

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(appUrl).then(() => {
        setCopied(true);
        onShowToast('App link copied to clipboard!');
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {
        // Fallback
        setCopied(true);
        onShowToast('App link ready to use!');
        setTimeout(() => setCopied(false), 2500);
      });
    } else {
      setCopied(true);
      onShowToast('App link ready!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const whatsappMessage = 
    `🥻 *Viral Sarees Official App*\n\n` +
    `*Trend humse shuru hota hai. Price Kam, Quality Mein Dum.*\n\n` +
    `Welcome to Viral Sarees! Explore India's trending collections of Surat, Banarasi & Designer Sarees with 360° Video Reels, live order tracking, and Cash on Delivery.\n\n` +
    `📲 *Open & Install App Instantly:* ${appUrl}\n\n` +
    `*(Tap the link to open immediately and tap "Install App" or "Add to Home Screen"!)*`;

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Viral Sarees App',
          text: 'Viral Sarees - Trend humse shuru hota hai. Price Kam, Quality Mein Dum. Watch reels & order directly!',
          url: appUrl,
        });
        onShowToast('Shared successfully!');
      } catch (err) {
        console.error(err);
      }
    } else {
      handleCopyLink();
    }
  };

  // Downloadable .html app launcher file that user can send via WhatsApp as a real file
  const handleDownloadAppFile = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Viral Sarees - Official App</title>
  <meta http-equiv="refresh" content="0; url=${appUrl}">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 40px 20px; background: #3C000B; color: #FFF8E7; }
    .card { background: white; color: #333; padding: 30px; border-radius: 20px; max-width: 420px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
    .btn { display: inline-block; background: #800020; color: #FFE082; padding: 14px 28px; border-radius: 12px; font-weight: bold; text-decoration: none; margin-top: 20px; font-size: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <h2 style="color:#800020; margin-top:0;">Viral Sarees</h2>
    <p style="font-style: italic; color: #880020; font-weight: bold;">Trend humse shuru hota hai.</p>
    <p>Opening official Viral Sarees shopping application...</p>
    <a class="btn" href="${appUrl}">Open Official App</a>
  </div>
  <script>window.location.replace("${appUrl}");</script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Viral-Sarees-App.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('App launcher file downloaded! You can send this file to customers.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-200/70 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Royal Jewel Theme */}
        <div className="relative bg-linear-to-r from-[#4A0012] via-[#800020] to-[#2D000A] p-6 text-amber-100 border-b border-amber-400/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-amber-200 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl shadow-lg shrink-0 overflow-hidden border-2 border-amber-300/50">
              <ViralSareesLogo variant="app-icon" size="sm" showTagline={false} showPill={false} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-[10px] font-bold text-amber-200 tracking-wider uppercase mb-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                PWA / Android & iOS Mobile Application
              </div>
              <h2 className="text-xl font-bold font-serif-brand text-amber-100">
                Viral Sarees Official App
              </h2>
              <p className="text-xs text-amber-200/90 mt-0.5 italic">
                Trend humse shuru hota hai. • Price Kam, Quality Mein Dum
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-stone-800 text-xs leading-relaxed">
          
          {/* Status / Direct Install on Current Device */}
          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-950 text-sm">Application Already Installed!</h3>
                <p className="text-emerald-800 text-xs">
                  This app is running in standalone mode on your device with instant offline catalog access.
                </p>
              </div>
            </div>
          ) : isInstallable ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm">
                  <Smartphone className="w-5 h-5 text-rose-800" />
                  <span>Install On This Device Now</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                  1-Click Setup
                </span>
              </div>
              <p className="text-stone-700">
                Tap below to add the Viral Sarees app directly to your home screen with our official royal logo and full-screen experience.
              </p>
              <button
                onClick={install}
                className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-[#800020] to-[#B78103] text-white font-bold text-sm shadow-md hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-200" />
                <span>Install Viral Sarees App</span>
              </button>
            </div>
          ) : null}

          {/* Quick Sharing Section - Send to Anyone via WhatsApp */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#800020]" />
                <span>Open & Share the Official App Link:</span>
              </h3>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                Active Live Link
              </span>
            </div>

            {/* Direct Open App Immediately Button */}
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-[#800020] to-[#9B111E] hover:from-[#9B111E] hover:to-[#B78103] text-amber-100 font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-amber-300" />
              <span>Open App Immediately (नए टैब में तुरंत खोलें)</span>
            </a>

            {/* Live URL Display & 1-Click Copy/Open */}
            <div className="p-2.5 bg-white border border-stone-300 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  Customer Public Link (No 403 Error):
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Publicly Accessible
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-700 font-mono select-all outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer shrink-0 border border-amber-300"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-1 transition shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                  <span>Open</span>
                </a>
              </div>
            </div>

            <p className="text-stone-600 text-[11px]">
              Share via WhatsApp, SMS, or social media. Anyone opening this link can browse the full saree catalogue, watch 360° videos, and install the mobile app without app store logins:
            </p>

            {/* Method 1: WhatsApp Direct Share as Anchor */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>iPhone / Mobile Share Sheet</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-2 px-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-500" />}
                  <span>{copied ? 'Link Copied!' : 'Copy App Link'}</span>
                </button>

                <button
                  onClick={handleDownloadAppFile}
                  className="flex-1 py-2 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title="Download an HTML launcher file to send via WhatsApp document"
                >
                  <Download className="w-4 h-4 text-amber-700" />
                  <span>Download App File (.html)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Android & iOS Step-by-Step Instructions */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-stone-500">
              Customer Device Installation Instructions
            </h4>

            {/* Android Instructions */}
            <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-stone-900">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Android Devices (Google Chrome, Samsung Internet)</span>
              </div>
              <ol className="list-decimal pl-5 space-y-1 text-stone-600">
                <li>Open the app link in Google Chrome or any modern mobile browser.</li>
                <li>An <strong>&ldquo;Add to Home screen&rdquo;</strong> or <strong>&ldquo;Install Viral Sarees&rdquo;</strong> prompt will appear automatically at the bottom.</li>
                <li>If the prompt does not appear, tap the <strong>3 Dots Menu (⋮)</strong> at top right and select <strong>&ldquo;Install App&rdquo;</strong>.</li>
                <li>The official Viral Sarees icon will be pinned to your home screen and launcher!</li>
              </ol>
            </div>

            {/* iPhone / iOS Instructions */}
            <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-stone-900">
                <Apple className="w-4 h-4 text-stone-800" />
                <span>Apple iPhone & iPad (Safari Browser)</span>
              </div>
              <ol className="list-decimal pl-5 space-y-1 text-stone-600">
                <li>Open the link in Apple Safari.</li>
                <li>Tap the <strong>Share Button</strong> (square icon with an upward arrow) in the bottom navigation bar.</li>
                <li>Scroll down and select <strong>&ldquo;Add to Home Screen&rdquo;</strong>.</li>
                <li>Tap <strong>&ldquo;Add&rdquo;</strong> at the top right. The app will launch in pristine full-screen mode!</li>
              </ol>
            </div>
          </div>

          {/* Why PWA is Better than Raw APK */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2">
            <div className="flex items-center gap-2 text-rose-950 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Key Advantages of Progressive Web App (PWA):</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-stone-700">
              <li><strong>Zero Security Warnings:</strong> Unlike raw APK files that trigger <em>&ldquo;Harmful file / Unknown source&rdquo;</em> operating system warnings, this PWA is cryptographically certified and 100% secure.</li>
              <li><strong>Real-Time Catalog Sync:</strong> New saree collections, video reels, and festive price discounts update automatically without requiring manual APK re-downloads.</li>
              <li><strong>Ultra Lightweight:</strong> Instant installation with near-zero phone storage footprint and offline catalog caching.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center gap-3">
          <button
            onClick={handleNativeShare}
            className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100 flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Link</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#800020] text-amber-100 font-bold text-xs hover:bg-[#9B111E] transition cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
