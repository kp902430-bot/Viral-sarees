import React from 'react';
import { X, Printer, Download, Share2, ShieldCheck, CheckCircle2, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { Order } from '../types';
import { STORE_CONFIG, getStoreWhatsAppUrl } from '../data/storeConfig';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${order.id.replace('VLS-', '')}`;
  const orderDateFormatted = order.orderDate;

  // Amount in words helper
  const numberToWords = (num: number): string => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
      if (n === 0) return 'Zero';
      let str = '';
      if (Math.floor(n / 100000) > 0) {
        str += inWords(Math.floor(n / 100000)) + 'Lakh ';
        n %= 100000;
      }
      if (Math.floor(n / 1000) > 0) {
        str += inWords(Math.floor(n / 1000)) + 'Thousand ';
        n %= 1000;
      }
      if (Math.floor(n / 100) > 0) {
        str += inWords(Math.floor(n / 100)) + 'Hundred ';
        n %= 100;
      }
      if (n > 0) {
        if (n < 20) str += a[n];
        else {
          str += b[Math.floor(n / 10)] + ' ';
          if (n % 10 > 0) str += a[n % 10];
        }
      }
      return str;
    };

    return inWords(Math.floor(num)).trim() + ' Rupees Only';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-fadeIn print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border-2 border-stone-300 max-h-[95vh] flex flex-col print:max-h-none print:shadow-none print:border-none print:my-0 print:rounded-none">
        
        {/* Top Control Bar (Hidden during printing) */}
        <div className="bg-stone-900 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-400 text-stone-950 font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
              Official Tax Invoice
            </span>
            <span className="text-sm font-mono text-stone-300">{invoiceNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <a
              href={getStoreWhatsAppUrl(order)}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp Invoice</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-stone-900 bg-white font-sans text-xs print:p-8 print:text-black">
          
          {/* Company Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between border-b-2 border-amber-600/30 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#800020] text-amber-200 font-serif font-black text-xl flex items-center justify-center shadow-xs">
                  VL
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black font-serif-brand tracking-tight text-stone-950">
                    {STORE_CONFIG.storeName.toUpperCase()}
                  </h1>
                  <p className="text-[11px] font-bold text-amber-900 tracking-wide">
                    {STORE_CONFIG.tagline}
                  </p>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-stone-600 space-y-0.5 leading-relaxed max-w-md">
                <p>{STORE_CONFIG.shopAddress}</p>
                <p><strong>GSTIN:</strong> {STORE_CONFIG.gstin} | <strong>State Code:</strong> 24 (Gujarat)</p>
                <p><strong>Phone:</strong> {STORE_CONFIG.officialPhone} | <strong>Email:</strong> {STORE_CONFIG.supportEmail}</p>
              </div>
            </div>

            <div className="text-left sm:text-right bg-stone-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-stone-200 w-full sm:w-auto">
              <div className="text-base font-black font-mono text-rose-950 uppercase">TAX INVOICE</div>
              <div className="text-xs font-mono font-bold text-stone-700 mt-1">
                Invoice No: <span className="text-black">{invoiceNumber}</span>
              </div>
              <div className="text-xs font-mono text-stone-600 mt-0.5">
                Order ID: <strong>{order.id}</strong>
              </div>
              <div className="text-xs text-stone-600 mt-0.5">
                Date: <strong>{orderDateFormatted}</strong>
              </div>
              <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                ● Authentic Silk Mark Certified
              </div>
            </div>
          </div>

          {/* Billing & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1">
                Bill To / Customer:
              </span>
              <p className="font-bold text-sm text-stone-950">{order.customerName}</p>
              <p className="text-stone-700 mt-0.5 font-mono">Mobile: +91 {order.phone}</p>
              {order.email && <p className="text-stone-600">{order.email}</p>}
              <p className="text-stone-600 mt-1 text-[11px]">
                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
            </div>

            <div className="sm:border-l sm:border-stone-200 sm:pl-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1">
                Shipment & Payment Info:
              </span>
              <p className="text-stone-800"><strong>Courier:</strong> {order.courierName}</p>
              <p className="text-stone-800 font-mono"><strong>AWB / Tracking:</strong> {order.trackingNumber}</p>
              <p className="text-stone-800 mt-1">
                <strong>Payment Mode:</strong> {order.paymentMethod}
              </p>
              <p className="text-stone-800">
                <strong>Payment Status:</strong>{' '}
                <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
              </p>
              <p className="text-stone-600 text-[11px]">
                <strong>Dispatch Facility:</strong> Surat Main Logistics Center
              </p>
            </div>
          </div>

          {/* Saree Line Items Table */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden my-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-800 text-[11px] font-bold uppercase tracking-wider border-b border-stone-200">
                  <th className="p-3">#</th>
                  <th className="p-3">Saree Description & SKU</th>
                  <th className="p-3 text-center">HSN</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Blouse Stitch</th>
                  <th className="p-3 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs text-stone-800">
                {order.items.map((item, idx) => {
                  const blouseCost = item.stitchBlouse ? 499 : 0;
                  const itemTotal = (item.saree.price + blouseCost) * item.quantity;
                  return (
                    <tr key={idx} className="hover:bg-stone-50/50">
                      <td className="p-3 font-mono text-stone-500">{idx + 1}</td>
                      <td className="p-3">
                        <span className="font-bold text-stone-950 block">{item.saree.title}</span>
                        <span className="text-[11px] text-stone-500 font-mono">
                          SKU: {item.saree.sku} | Fabric: {item.saree.fabric}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-stone-600">5007</td>
                      <td className="p-3 text-center font-bold">{item.quantity}</td>
                      <td className="p-3 text-right font-mono">₹{item.saree.price.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-mono text-stone-600">
                        {item.stitchBlouse ? '₹499' : 'None'}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-stone-950">
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 my-6 pt-2">
            <div className="max-w-xs space-y-2 text-stone-600 text-[11px]">
              <div className="flex items-center gap-1.5 text-stone-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Declaration & Authentic Guarantee:</span>
              </div>
              <p className="leading-relaxed">
                We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. All pure silk items carry genuine Silk Mark India certification.
              </p>
              <p className="font-mono text-stone-500">
                Amount in Words:<br />
                <strong className="text-stone-900">{numberToWords(order.totalAmount)}</strong>
              </p>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-600">Subtotal (Items):</span>
                <span className="font-mono font-semibold">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between py-1 border-b border-stone-200 text-emerald-700 font-semibold">
                  <span>Discount Applied:</span>
                  <span className="font-mono">-₹{order.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-600">Express Courier Delivery:</span>
                <span className="font-mono font-semibold text-emerald-700">
                  {order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}
                </span>
              </div>
              <div className="flex justify-between py-1 text-stone-500 text-[11px]">
                <span>GST (5% Included in MRP):</span>
                <span className="font-mono">₹{Math.round((order.totalAmount * 5) / 105).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-stone-950 text-sm font-black text-stone-950 bg-stone-100 px-3 rounded-lg">
                <span>Total Amount:</span>
                <span className="font-mono text-[#800020]">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Signature & Seal Footer */}
          <div className="border-t border-stone-200 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] text-stone-500">
            <div>
              <p><strong>Return Policy:</strong> 7-Day Return Window. Continuous Unboxing Video mandatory for claims.</p>
              <p className="mt-0.5">This is a computer-generated official tax invoice and booking docket.</p>
            </div>

            <div className="text-center sm:text-right">
              <div className="font-serif-brand font-bold text-stone-900 text-xs">For VIRAL SAREES</div>
              <div className="w-36 h-12 border-b border-stone-300 mx-auto sm:ml-auto mt-2 flex items-end justify-center pb-1 text-[10px] text-stone-400 font-mono">
                [Digitally Signed Seal]
              </div>
              <p className="text-[10px] text-stone-600 font-bold mt-1">Authorized Signatory</p>
            </div>
          </div>

        </div>

        {/* Bottom Actions */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 flex items-center justify-between print:hidden">
          <span className="text-xs text-stone-500">
            Official Invoice • Viral Sarees Surat
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-black text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Close Invoice
          </button>
        </div>

      </div>
    </div>
  );
};
