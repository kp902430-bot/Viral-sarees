import React, { useState } from 'react';
import { X, CheckCircle2, MessageCircle, FileText, Truck, ArrowRight, ShieldCheck, QrCode, Smartphone, ExternalLink, Copy, Check } from 'lucide-react';
import { Order } from '../types';
import { STORE_CONFIG, getStoreWhatsAppUrl, generateUpiPaymentUrl, generateUpiQrCodeUrl } from '../data/storeConfig';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onViewInvoice: (order: Order) => void;
  onTrackOrder: (orderId: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  order,
  onViewInvoice,
  onTrackOrder
}) => {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen || !order) return null;

  const whatsappUrl = getStoreWhatsAppUrl(order);
  const upiIntentUrl = generateUpiPaymentUrl(order);
  const qrCodeUrl = generateUpiQrCodeUrl(order);

  const handleCopyOrderId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(order.id);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border-2 border-amber-500/40 max-h-[92vh] flex flex-col">
        
        {/* Top Celebratory Header */}
        <div className="bg-linear-to-r from-[#590417] via-[#800020] to-[#3a020e] text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 text-stone-300 hover:text-white rounded-full transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/30 border-2 border-amber-200">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>

          <span className="bg-amber-400/20 text-amber-200 border border-amber-300/40 text-[10px] px-3 py-0.5 rounded-full font-black uppercase tracking-wider">
            Order Booked Successfully
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-brand mt-1.5 text-amber-100">
            Order Confirmed!
          </h2>
          <p className="text-xs text-amber-200/90 mt-1">
            Thank you for ordering with Viral Sarees Surat.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 bg-black/30 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-mono">
            <span className="text-stone-300">Order ID:</span>
            <strong className="text-amber-300 font-bold">{order.id}</strong>
            <button
              onClick={handleCopyOrderId}
              className="text-stone-300 hover:text-white p-0.5"
              title="Copy Order ID"
            >
              {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-stone-800 text-xs">
          
          {/* WhatsApp Direct Transmission Notice - Critical for user requirement! */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-2.5 shadow-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-emerald-950">
                  Send Order Booking To Viral Sarees WhatsApp Desk ({STORE_CONFIG.officialPhone})
                </h4>
                <p className="text-emerald-800 text-[11px] leading-relaxed mt-0.5">
                  Click below to send your complete order docket directly to our official store WhatsApp ({STORE_CONFIG.officialPhone}) for instant dispatch preparation and customer care.
                </p>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-md shadow-emerald-900/20 active:scale-98"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Order to Official WhatsApp ({STORE_CONFIG.officialPhone})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* UPI Payment section if UPI chosen */}
          {order.paymentMethod === 'UPI' && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-800" />
                  <span className="font-bold text-stone-900">UPI Payment Link & QR</span>
                </div>
                <span className="text-xs font-mono font-bold text-rose-900">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={upiIntentUrl}
                  className="flex-1 py-2 bg-[#800020] hover:bg-[#9B111E] text-amber-100 font-bold rounded-xl transition text-center flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Open UPI App (GPay/PhonePe)</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowQr(!showQr)}
                  className="px-3 py-2 bg-white border border-stone-300 text-stone-700 font-semibold rounded-xl hover:bg-stone-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{showQr ? 'Hide QR' : 'Show UPI QR'}</span>
                </button>
              </div>

              {showQr && (
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-center animate-fadeIn">
                  <img src={qrCodeUrl} alt="UPI QR Code" className="w-36 h-36 mx-auto rounded-lg" />
                  <p className="text-[11px] text-stone-600 mt-2">
                    Scan using any UPI App (Google Pay, PhonePe, Paytm, CRED) to pay ₹{order.totalAmount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] font-mono text-stone-400 mt-0.5">UPI ID: {STORE_CONFIG.upiId}</p>
                </div>
              )}
            </div>
          )}

          {/* Delivery Snapshot */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex justify-between items-center text-[11px] border-b border-stone-200 pb-1.5">
              <span className="text-stone-500 font-semibold">Delivery To:</span>
              <strong className="text-stone-900">{order.customerName} (+91 {order.phone})</strong>
            </div>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
            <div className="flex justify-between items-center text-[11px] pt-1 text-stone-600">
              <span>Payment Mode: <strong>{order.paymentMethod}</strong></span>
              <span>Courier: <strong>{order.courierName}</strong></span>
            </div>
          </div>

          {/* Ordered items summary */}
          <div>
            <span className="font-bold text-stone-800 text-xs block mb-2">
              Items Booked ({order.items.length}):
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 bg-stone-50 p-2 rounded-xl border border-stone-200">
                  <img src={item.saree.images[0]} alt="" className="w-9 h-11 object-cover rounded-md" />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold block truncate">{item.saree.title}</span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      Qty: {item.quantity} • ₹{item.saree.price.toLocaleString('en-IN')}
                      {item.stitchBlouse ? ' • Blouse Stitch' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unboxing Video Reminder */}
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              <strong>Security Seal Guarantee:</strong> Please record a continuous, uncut unboxing video when parcel arrives to claim 7-day hassle-free replacement.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={() => onViewInvoice(order)}
              className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold rounded-xl transition flex items-center justify-center gap-1.5 border border-stone-300 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-stone-700" />
              <span>Tax Invoice</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onTrackOrder(order.id);
              }}
              className="py-2.5 px-3 bg-[#800020] hover:bg-[#9B111E] text-amber-100 font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-4 h-4 text-amber-300" />
              <span>Live Tracking</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
