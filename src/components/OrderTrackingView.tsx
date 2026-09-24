import React, { useState } from 'react';
import { Search, Package, CheckCircle2, Clock, Truck, MapPin, Copy, Check, ExternalLink, RotateCcw, AlertTriangle, Phone, ChevronRight, FileText } from 'lucide-react';
import { Order } from '../types';
import { STORE_CONFIG } from '../data/storeConfig';

interface OrderTrackingViewProps {
  orders: Order[];
  onOpenReturnRequest: (orderId: string) => void;
  onContinueShopping: () => void;
  onViewInvoice?: (order: Order) => void;
  defaultOrderId?: string;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  orders,
  onOpenReturnRequest,
  onContinueShopping,
  onViewInvoice,
  defaultOrderId
}) => {
  const [searchQuery, setSearchQuery] = useState(defaultOrderId || (orders.length > 0 ? orders[0].id : 'VLS-89421'));
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Find order by ID or phone
  const selectedOrder = orders.find(
    (o) => o.id.toLowerCase() === searchQuery.trim().toLowerCase() || o.phone.replace(/\D/g, '').includes(searchQuery.trim().replace(/\D/g, ''))
  ) || orders[0];

  const handleCopyTracking = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold">
          <Truck className="w-3.5 h-3.5" />
          <span>Live Courier Tracking & Delivery Updates</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif-brand">
          Track Your Viral Sarees Order
        </h2>
        <p className="text-xs sm:text-sm text-stone-500">
          Enter your Order ID (e.g. {orders[0]?.id || 'VLS-89421'}) or 10-digit mobile number to see real-time dispatch and delivery progress.
        </p>
      </div>

      {/* Search Bar & Order Switcher */}
      <div className="max-w-xl mx-auto">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter Order ID (e.g. VLS-89421) or Mobile Number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-stone-300 rounded-2xl shadow-xs focus:ring-2 focus:ring-rose-800"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-4" />
          </div>
          <button
            onClick={() => {}}
            className="px-6 py-3 bg-[#800020] hover:bg-[#9B111E] text-amber-100 font-bold text-xs sm:text-sm rounded-2xl transition shadow-md"
          >
            Track Status
          </button>
        </div>

        {/* Quick order chips */}
        {orders.length > 0 && (
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-xs">
            <span className="text-stone-400 font-medium shrink-0">Your Recent Orders:</span>
            {orders.map((ord) => (
              <button
                key={ord.id}
                onClick={() => setSearchQuery(ord.id)}
                className={`px-3 py-1 rounded-full border transition font-mono whitespace-nowrap ${
                  selectedOrder?.id === ord.id
                    ? 'border-rose-800 bg-rose-50 text-rose-900 font-bold'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'
                }`}
              >
                {ord.id} ({ord.orderStatus})
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedOrder ? (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-md overflow-hidden">
          
          {/* Order Snapshot Header */}
          <div className="p-6 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-mono font-extrabold text-amber-300">
                  {selectedOrder.id}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedOrder.orderStatus === 'Delivered'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                }`}>
                  ● {selectedOrder.orderStatus}
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-1">
                Placed on: <strong>{selectedOrder.orderDate}</strong> | Recipient: <strong>{selectedOrder.customerName}</strong>
              </p>
            </div>

            {/* Courier Tracking Badge */}
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/20 flex items-center justify-between gap-4 text-xs">
              <div>
                <div className="text-stone-400 text-[10px] uppercase font-bold">Courier Partner</div>
                <div className="font-bold text-white">{selectedOrder.courierName}</div>
                <div className="font-mono text-[11px] text-amber-200 mt-0.5 flex items-center gap-1.5">
                  <span>AWB: {selectedOrder.trackingNumber}</span>
                  <button
                    onClick={() => handleCopyTracking(selectedOrder.trackingNumber)}
                    className="hover:text-white p-0.5"
                    title="Copy AWB Tracking Number"
                  >
                    {copiedTracking ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="text-right border-l border-white/10 pl-4 space-y-2">
                <div>
                  <div className="text-stone-400 text-[10px] uppercase font-bold">Estimated Delivery</div>
                  <div className="font-extrabold text-amber-300">{selectedOrder.estimatedDelivery}</div>
                </div>
                {onViewInvoice && (
                  <button
                    onClick={() => onViewInvoice(selectedOrder)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 hover:text-white rounded-lg text-[11px] font-bold border border-amber-400/30 transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download Invoice</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Body: Tracking Stepper + Delivery & Product Details */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Cols: Live Stepper Timeline */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                <Clock className="w-4 h-4 text-stone-400" />
                <span>Real-Time Shipment Journey</span>
              </h3>

              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                {selectedOrder.timeline.map((step, idx) => (
                  <div key={idx} className="relative group">
                    {/* Stepper Dot */}
                    <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition ${
                      step.completed
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : 'bg-stone-200 text-stone-400'
                    }`}>
                      {step.completed ? <Check className="w-3 h-3 stroke-3" /> : <div className="w-1.5 h-1.5 bg-stone-400 rounded-full" />}
                    </div>

                    {/* Step Content */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h4 className={`text-sm font-bold ${step.completed ? 'text-stone-900' : 'text-stone-400'}`}>
                          {step.title}
                        </h4>
                        <span className="text-[11px] font-mono text-stone-500">{step.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-stone-500">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                        <span>{step.location}</span>
                      </div>
                      <p className="text-xs text-stone-600 pt-0.5 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Order Items & Delivery Address */}
            <div className="space-y-6 bg-stone-50 p-5 rounded-2xl border border-stone-200/80">
              
              {/* Delivery Address */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>Delivery Destination</span>
                </h4>
                <div className="text-xs text-stone-800 space-y-1 bg-white p-3 rounded-xl border border-stone-200">
                  <p className="font-bold">{selectedOrder.customerName}</p>
                  <p className="text-stone-600">{selectedOrder.shippingAddress.street}</p>
                  <p className="text-stone-600">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - <strong>{selectedOrder.shippingAddress.pincode}</strong>
                  </p>
                  <p className="text-stone-500 font-mono text-[11px] pt-1">Phone: {selectedOrder.phone}</p>
                </div>
              </div>

              {/* Items in this Order */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-stone-400" />
                  <span>Saree In This Package ({selectedOrder.items.length})</span>
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((it, i) => (
                    <div key={i} className="flex gap-3 bg-white p-2.5 rounded-xl border border-stone-200 text-xs">
                      <div className="w-14 h-16 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                        <img src={it.saree.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h5 className="font-bold text-stone-900 truncate">{it.saree.title}</h5>
                          <p className="text-[11px] text-stone-500">Qty: {it.quantity} • {it.saree.fabric}</p>
                        </div>
                        <span className="font-mono font-bold text-stone-950">
                          ₹{((it.saree.price + (it.stitchBlouse ? 499 : 0)) * it.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="pt-2 border-t border-stone-200 text-xs space-y-1 text-stone-600">
                <div className="flex justify-between">
                  <span>Payment Mode</span>
                  <span className="font-bold text-stone-900">{selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</span>
                </div>
                <div className="flex justify-between text-stone-900 font-bold text-sm pt-1">
                  <span>Total Paid</span>
                  <span className="font-mono text-rose-900">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Return Policy Notice & Request Button */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs space-y-2">
                <div className="flex items-start gap-1.5 text-amber-900 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>Need to Return or Exchange?</span>
                </div>
                <p className="text-[11px] text-stone-700 leading-snug">
                  7-Day Return Window. <strong>Unboxing video is strictly compulsory</strong> for missing items, defects, or courier damage claims.
                </p>
                <button
                  onClick={() => onOpenReturnRequest(selectedOrder.id)}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg transition text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Request Return / Exchange</span>
                </button>
              </div>

            </div>

          </div>

          {/* Footer Assistance */}
          <div className="bg-stone-50 p-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-stone-600">
              Need assistance with your delivery? WhatsApp Support is available from 10:00 AM to 8:00 PM.
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(`Namaste Viral Sarees, I need support for my order ${selectedOrder.id}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp Courier Support ({STORE_CONFIG.officialPhone})</span>
              </a>
              <button
                onClick={onContinueShopping}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-200 font-semibold transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>

        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
          <Package className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No order found with ID: {searchQuery}</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Please check your 10-digit mobile number or order confirmation SMS.
          </p>
        </div>
      )}

    </div>
  );
};
