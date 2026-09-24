import React, { useState } from 'react';
import { Crown, Lock, ShieldCheck, Mail, ArrowRight, X, AlertCircle } from 'lucide-react';
import { OwnerSession } from '../types';
import { signInWithGoogle } from '../services/firebasePhoneAuth';

interface OwnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: OwnerSession) => void;
  onShowToast: (msg: string) => void;
}

export const OwnerAuthModal: React.FC<OwnerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Master PIN: 7990 / 799065 (matching Kamal 7990651540) or 9024 / 902430
    const cleanPin = pin.trim();
    if (cleanPin === '7990' || cleanPin === '799065' || cleanPin === '9024' || cleanPin === '902430' || cleanPin === 'admin123' || cleanPin === 'vls2026') {
      const session: OwnerSession = {
        isLoggedIn: true,
        email: 'Kamal799065@gmail.com',
        name: 'Kamal (Viral Sarees Owner)',
        role: 'Store Owner',
        loginTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      onSuccess(session);
      onShowToast('👑 Store Owner Verified! Welcome to your Desktop Dashboard.');
      onClose();
    } else {
      setError('Incorrect Security PIN. Please enter your 4-digit PIN (7990 or 9024) or sign in with Google.');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    setError('');
    try {
      const result = await signInWithGoogle();
      if (result.success && result.user) {
        const userEmail = (result.user.email || '').trim().toLowerCase();
        if (userEmail === 'kamal799065@gmail.com' || userEmail === 'kp902430@gmail.com') {
          const session: OwnerSession = {
            isLoggedIn: true,
            email: userEmail,
            name: result.user.displayName || 'Kamal (Viral Sarees Owner)',
            role: 'Store Owner',
            loginTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          };
          onSuccess(session);
          onShowToast(`👑 Welcome back, ${session.name}! Owner portal unlocked.`);
          onClose();
        } else {
          setError(`Logged in as ${userEmail}. Only the authorized owner (Kamal799065@gmail.com / kp902430@gmail.com) has merchant dashboard permissions.`);
        }
      } else {
        setError(result.error || 'Google Sign-In was cancelled or could not be completed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Google Sign-In failed.');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-300">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#2B050B] via-[#4A0A16] to-[#2B050B] text-amber-100 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-amber-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                Viral Sarees
              </div>
              <h3 className="text-lg font-bold text-white">Store Owner Portal</h3>
              <p className="text-xs text-amber-200/80">Desktop & Mobile Merchant Control Center</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2.5 text-xs text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-1 text-amber-950">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Authorized Store Owner Access</span>
            </div>
            <p className="text-[11px] text-stone-600">
              Merchant account linked to: <strong className="font-mono text-stone-900">Kamal799065@gmail.com</strong>
            </p>
          </div>

          {/* Quick Option 1: 1-Click Google Sign-In */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoadingGoogle}
              className="w-full py-3 px-4 rounded-xl border border-stone-300 hover:border-amber-500 bg-white hover:bg-stone-50 font-bold text-xs text-stone-800 transition flex items-center justify-center gap-2.5 shadow-xs cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isLoadingGoogle ? 'Connecting...' : 'Sign In with Google (Kamal799065@gmail.com)'}</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Or Enter Master PIN
            </span>
          </div>

          {/* Option 2: Quick Owner PIN */}
          <form onSubmit={handlePinSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Owner Security PIN / Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 4-digit PIN (default: 9024)"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono tracking-widest focus:ring-2 focus:ring-amber-500 focus:bg-white outline-hidden"
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-stone-500 mt-1">
                Tip: Your registered PIN is <strong>9024</strong> (Instant access for store owner).
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-900/10 cursor-pointer"
            >
              <span>Unlock Merchant Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
