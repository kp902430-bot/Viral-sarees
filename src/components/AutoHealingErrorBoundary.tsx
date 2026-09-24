import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Sparkles, ShieldCheck, Home, AlertCircle } from 'lucide-react';
import { canAutoHealReload, autoFixAndRestoreStore } from '../utils/autoHealer';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  countdown: number;
  isAutoHealing: boolean;
}

export class AutoHealingErrorBoundary extends Component<Props, State> {
  private timer: number | null = null;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    countdown: 3,
    isAutoHealing: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('AutoHealingErrorBoundary intercepted an application error:', error, errorInfo);
    this.setState({ errorInfo });

    // Check if we can automatically heal & reload for the customer
    if (canAutoHealReload()) {
      this.setState({ isAutoHealing: true, countdown: 2 });
      this.startCountdownAndReload();
    }
  }

  public componentWillUnmount(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private startCountdownAndReload = () => {
    if (this.timer) clearInterval(this.timer);

    this.timer = window.setInterval(() => {
      this.setState((prev) => {
        if (prev.countdown <= 1) {
          if (this.timer) clearInterval(this.timer);
          autoFixAndRestoreStore(false);
          return { ...prev, countdown: 0 };
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
  };

  private handleManualHeal = (hard = false) => {
    autoFixAndRestoreStore(hard);
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FCF9F5] text-stone-900 flex items-center justify-center p-4 selection:bg-rose-100 selection:text-rose-900 font-sans">
          <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-stone-200/90 shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden">
            
            {/* Top decorative branding bar */}
            <div className="h-2 w-full bg-gradient-to-r from-[#800020] via-amber-500 to-[#800020] absolute top-0 left-0" />

            {/* Logo Icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#800020] text-amber-300 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-900/20">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            {/* Brand Name */}
            <h1 className="text-2xl font-black text-[#800020] font-serif tracking-wide uppercase mb-1">
              Viral Sarees
            </h1>
            <p className="text-xs font-bold text-amber-800 tracking-wider uppercase mb-5">
              ✨ Smart Self-Healing & Store Auto-Recovery System
            </p>

            {/* Status Card */}
            <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 text-left mb-6 space-y-2">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>Automatic Bug Fix Active</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                Aapka page open karne me koi temporary network ya browser cache issue detect hua tha. Hamara smart system ise <strong>automatically refresh &amp; fix</strong> kar raha hai.
              </p>
              
              {this.state.isAutoHealing && (
                <div className="mt-3 pt-3 border-t border-amber-200 flex items-center justify-between text-xs text-stone-800">
                  <span className="font-semibold flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-[#800020] animate-spin" />
                    Auto-Restoring Store in:
                  </span>
                  <span className="font-mono text-sm font-black bg-[#800020] text-amber-200 px-2 py-0.5 rounded-md">
                    {this.state.countdown}s
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => this.handleManualHeal(false)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#800020] to-[#9B111E] hover:opacity-95 text-amber-100 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>🔄 1-Tap Refresh &amp; Open Store Now</span>
              </button>

              <button
                type="button"
                onClick={() => this.handleManualHeal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-stone-300"
              >
                <Home className="w-3.5 h-3.5 text-stone-600" />
                <span>Reset Store Cache &amp; Return to Home</span>
              </button>
            </div>

            {/* Technical Details (Collapsible) */}
            {this.state.error && (
              <details className="mt-6 text-left border-t border-stone-200 pt-3">
                <summary className="text-[11px] text-stone-500 hover:text-stone-700 cursor-pointer font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-stone-400" />
                  <span>Technical details (optional for developers)</span>
                </summary>
                <p className="mt-2 text-[10px] font-mono text-stone-600 bg-stone-100 p-2.5 rounded-lg break-all">
                  {this.state.error.toString()}
                </p>
              </details>
            )}

            {/* Reassurance Footer */}
            <p className="text-[11px] text-stone-500 mt-5">
              🔒 100% Secure • Authenticity Guaranteed • Viral Sarees
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
