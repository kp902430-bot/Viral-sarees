import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldCheck, Check, Sparkles, Scissors, Lock, Mail, UserCheck } from 'lucide-react';
import { CartItem, CustomerProfile } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (sareeId: string, delta: number) => void;
  onRemoveItem: (sareeId: string) => void;
  onProceedToCheckout: (discountAmount: number, appliedCoupon: string) => void;
  currentCustomer?: CustomerProfile | null;
  onOpenCustomerAuth?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  currentCustomer,
  onOpenCustomerAuth
}) => {
  const [couponCode, setCouponCode] = useState('VIRAL10');
  const [appliedCoupon, setAppliedCoupon] = useState<string>('VIRAL10');
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Subtotal calculation (including stitch blouse fee if selected)
  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.saree.price + (item.stitchBlouse ? 499 : 0);
    return sum + itemPrice * item.quantity;
  }, 0);

  // Discount calculation
  let discount = 0;
  if (appliedCoupon === 'VIRAL10' || appliedCoupon === 'VIJAY10') {
    discount = Math.round(subtotal * 0.1);
  } else if (appliedCoupon === 'FESTIVE15') {
    discount = Math.round(subtotal * 0.15);
  } else if (appliedCoupon === 'FIRST500') {
    discount = subtotal > 1500 ? 500 : 0;
  }

  const freeShippingThreshold = 999;
  const isFreeShipping = subtotal >= freeShippingThreshold || items.length === 0;
  const shippingCharge = isFreeShipping ? 0 : 99;
  const total = Math.max(0, subtotal - discount + shippingCharge);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'VIRAL10' || code === 'VIJAY10' || code === 'FESTIVE15' || code === 'FIRST500') {
      setAppliedCoupon(code);
      setCouponError(null);
    } else {
      setCouponError('Invalid coupon code. Try VIRAL10 or FESTIVE15');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-900" />
            <h3 className="font-bold text-base text-stone-900 font-serif-brand">
              My Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-200 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-200/80 text-xs">
          {isFreeShipping ? (
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Congratulations! You qualify for FREE Express Courier Delivery</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex justify-between text-stone-700 font-medium">
                <span>Add ₹{freeShippingThreshold - subtotal} more for <strong>FREE Delivery</strong></span>
                <span className="font-bold">₹{subtotal} / ₹{freeShippingThreshold}</span>
              </div>
              <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-stone-800 text-base">Your Bag is Empty</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Discover exquisite Banarasi, Kanjivaram & Organza sarees crafted with pure heritage.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#800020] text-amber-100 font-bold text-xs"
              >
                Browse Saree Catalogue
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.saree.id}
                className="p-3 bg-stone-50/70 rounded-2xl border border-stone-200/80 flex gap-3 relative group"
              >
                <div className="w-20 h-24 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-300">
                  <img src={item.saree.images[0]} alt={item.saree.title} className="w-full h-full object-cover object-top" />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-bold text-xs text-stone-900 truncate">
                        {item.saree.title}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.saree.id)}
                        className="text-stone-400 hover:text-rose-700 p-1 transition"
                        title="Remove from Bag"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-[11px] text-stone-500 block">
                      Fabric: {item.saree.fabric}
                    </span>

                    {item.stitchBlouse && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-rose-100 text-rose-900 font-semibold px-1.5 py-0.2 rounded mt-0.5">
                        <Scissors className="w-3 h-3" />
                        Stitched Blouse (+₹499)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="font-mono font-extrabold text-stone-950 text-sm">
                      ₹{((item.saree.price + (item.stitchBlouse ? 499 : 0)) * item.quantity).toLocaleString('en-IN')}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 border border-stone-300 bg-white rounded-lg px-2 py-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.saree.id, -1)}
                        className="p-0.5 text-stone-500 hover:text-stone-900"
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.saree.id, 1)}
                        className="p-0.5 text-stone-500 hover:text-stone-900"
                        title="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-4 border-t border-stone-200 bg-white space-y-3">
            
            {/* Coupon Application Box */}
            <form onSubmit={handleApplyCoupon} className="space-y-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter Coupon (VIRAL10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs uppercase font-mono border border-stone-300 rounded-lg focus:ring-1 focus:ring-rose-800"
                  />
                  <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-lg hover:bg-stone-800"
                >
                  Apply
                </button>
              </div>

              {appliedCoupon && !couponError && (
                <div className="flex items-center justify-between text-[11px] text-emerald-700 font-semibold px-1">
                  <span>Coupon <strong>{appliedCoupon}</strong> Applied!</span>
                  <button 
                    type="button" 
                    onClick={() => setAppliedCoupon('')} 
                    className="text-stone-400 hover:text-stone-700 text-[10px] underline"
                  >
                    Remove
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-[11px] text-rose-600 px-1">{couponError}</p>
              )}
            </form>

            {/* Price breakdown */}
            <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span className="font-mono">-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-mono">
                  {shippingCharge === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${shippingCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-stone-950 pt-2 border-t border-stone-200">
                <span>Total Amount</span>
                <span className="font-mono text-base text-rose-900">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Customer Auth & COD Eligibility Note */}
            {currentCustomer?.email ? (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-[11px] text-emerald-950">
                <div className="flex items-center gap-2 truncate">
                  <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="truncate">Email: <strong className="font-mono text-emerald-900">{currentCustomer.email}</strong></span>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full shrink-0">
                  ✓ COD Available
                </span>
              </div>
            ) : (
              <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-xl space-y-1.5 text-stone-800">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-[11px] text-amber-950 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Cash on Delivery (COD) Notice:</span>
                  </span>
                  <span className="text-[9px] bg-rose-100 text-rose-900 font-bold px-1.5 py-0.5 rounded">
                    Login Needed
                  </span>
                </div>
                <p className="text-[10px] text-stone-600 leading-snug">
                  COD keval verified Email se login karne par hi uplabdh hoga. Bina login ke keval <strong>Advance Online Payment</strong> se order book hoga.
                </p>
                {onOpenCustomerAuth && (
                  <button
                    type="button"
                    onClick={onOpenCustomerAuth}
                    className="w-full py-1.5 px-2 bg-gradient-to-r from-amber-600 to-[#800020] hover:opacity-95 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Mail className="w-3 h-3 text-amber-200" />
                    <span>Email OTP Login Karein (COD Unlock Karein)</span>
                  </button>
                )}
              </div>
            )}

            {/* Security note */}
            <div className="flex items-center gap-2 text-[10px] text-stone-500 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted • 7-Day Hassle-Free Returns</span>
            </div>

            {/* Checkout Action Button */}
            <button
              id="cart-proceed-checkout-btn"
              onClick={() => onProceedToCheckout(discount, appliedCoupon)}
              className="w-full py-3 px-4 rounded-xl bg-[#800020] hover:bg-[#9B111E] text-amber-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20 transition cursor-pointer"
            >
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
