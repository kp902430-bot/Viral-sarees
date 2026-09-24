import React, { useState } from 'react';
import { Truck, Package, CheckCircle2, Printer, MessageCircle, ExternalLink, X, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Order } from '../types';
import { 
  SHIPROCKET_COURIERS, 
  dispatchWithShiprocket, 
  generateShiprocketLabelHtml,
  ShiprocketDispatchResult,
  getShiprocketConfig
} from '../services/shiprocketService';
import { STORE_CONFIG } from '../data/storeConfig';

interface ShiprocketDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onDispatched: (orderId: string, courierName: string, awbNumber: string) => void;
  onShowToast: (msg: string) => void;
}

export const ShiprocketDispatchModal: React.FC<ShiprocketDispatchModalProps> = ({
  isOpen,
  onClose,
  order,
  onDispatched,
  onShowToast
}) => {
  const [selectedCourierCode, setSelectedCourierCode] = useState('BLUEDART_AIR');
  const [packageWeight, setPackageWeight] = useState(0.85);
  const [isDispatching, setIsDispatching] = useState(false);
  const [result, setResult] = useState<ShiprocketDispatchResult | null>(null);

  if (!isOpen || !order) return null;

  const handleDispatch = async () => {
    setIsDispatching(true);
    try {
      const res = await dispatchWithShiprocket(order, selectedCourierCode, packageWeight);
      setResult(res);
      onDispatched(order.id, res.courierName, res.awbCode);
      onShowToast(`🚀 Dispatched with ${res.courierName}! AWB: ${res.awbCode}`);
    } catch (err: any) {
      onShowToast('Could not process Shiprocket booking. Please retry.');
    } finally {
      setIsDispatching(false);
    }
  };

  const handlePrintLabel = () => {
    if (!result) return;
    const html = generateShiprocketLabelHtml(order, {
      awb: result.awbCode,
      courier: result.courierName,
      shipmentId: result.shipmentId
    });
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const customerCleanPhone = order.phone.replace(/\D/g, '').replace(/^91/, '');
  const whatsAppMessage = result ? 
    `Namaste ${order.customerName} Ji,\nGreat news! Your Viral Sarees order *${order.id}* has been dispatched via *${result.courierName}* (Shiprocket Logistics Hub Surat).\n\nAirway Bill (AWB): *${result.awbCode}*\nExpected Delivery: *${result.estimatedDeliveryDate}*\n\nLive Courier Tracking Link:\n${result.trackingUrl}\n\nThank you for choosing Viral Sarees!` : '';

  const whatsAppUrl = `https://wa.me/91${customerCleanPhone}?text=${encodeURIComponent(whatsAppMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-300 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1B365D] via-[#0F2038] to-[#1B365D] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-md">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wide text-white">Shiprocket Official Logistics</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-black px-2 py-0.5 rounded-full border border-emerald-400/40">
                  Surat Hub Active
                </span>
              </div>
              <p className="text-xs text-stone-300">Automated AWB Generation & Courier Dispatch</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-stone-300 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Order Snapshot */}
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-stone-900">{order.id}</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                  {order.paymentMethod} (₹{order.totalAmount.toLocaleString('en-IN')})
                </span>
              </div>
              <div className="text-stone-600 mt-1">
                <strong>Recipient:</strong> {order.customerName} (+91 {order.phone})
              </div>
              <div className="text-stone-500 text-[11px]">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-stone-500 block">Pickup Hub:</span>
              <strong className="text-xs text-stone-800 block">{STORE_CONFIG.dispatchHub}</strong>
            </div>
          </div>

          {result ? (
            /* Success View */
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Shipment Successfully Generated!</span>
                </div>
                <p className="text-xs text-emerald-800">
                  {result.message}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200/60 font-mono text-xs">
                  <div>
                    <span className="text-stone-500 block text-[10px]">COURIER PARTNER</span>
                    <strong className="text-emerald-950">{result.courierName}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">AIRWAY BILL (AWB)</span>
                    <strong className="text-rose-900 text-sm">{result.awbCode}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">PICKUP SCHEDULE</span>
                    <strong className="text-stone-800 text-[11px]">{result.pickupScheduledDate}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px]">EST. DELIVERY</span>
                    <strong className="text-emerald-800">{result.estimatedDeliveryDate}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintLabel}
                  className="py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Shipping Label</span>
                </button>

                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-md transition text-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send AWB to Customer WhatsApp</span>
                </a>
              </div>

              <div className="text-center pt-2">
                <a
                  href={result.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-stone-600 hover:text-amber-800 font-bold inline-flex items-center gap-1 text-xs underline"
                >
                  <span>Open Shiprocket Live Tracking Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            /* Courier Selection & Form */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  Select Shiprocket Courier Partner for this Order:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SHIPROCKET_COURIERS.map((courier) => {
                    const isSelected = selectedCourierCode === courier.code;
                    return (
                      <div
                        key={courier.code}
                        onClick={() => setSelectedCourierCode(courier.code)}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? 'border-amber-600 bg-amber-50/60 shadow-xs'
                            : 'border-stone-200 bg-white hover:border-stone-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-stone-900">{courier.name}</span>
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700">
                            ★ {courier.rating}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-stone-500">
                          <span>{courier.mode}</span>
                          <span className="font-bold text-stone-800">Est. {courier.deliveryDays}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Consignment Weight (Kg)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={packageWeight}
                    onChange={(e) => setPackageWeight(parseFloat(e.target.value) || 0.85)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 font-mono text-xs"
                  />
                  <span className="text-[10px] text-stone-400">Handloom saree box average: 0.85 kg</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Pickup Warehouse
                  </label>
                  <div className="px-3 py-2 border border-stone-200 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold">
                    Surat Textile Hub (395002)
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold">✓ Verified daily courier pickup</span>
                </div>
              </div>

              {/* Submit Dispatch */}
              <div className="pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={handleDispatch}
                  disabled={isDispatching}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer disabled:opacity-60"
                >
                  <Truck className="w-4 h-4" />
                  <span>{isDispatching ? 'Booking with Shiprocket...' : 'Confirm Dispatch & Generate Shiprocket AWB'}</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
