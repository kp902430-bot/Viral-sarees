import React, { useState } from 'react';
import { X, AlertTriangle, Video, CheckCircle2, ShieldAlert, Clock, HelpCircle, FileText, ArrowRight, Upload, Phone } from 'lucide-react';
import { ReturnRequest } from '../types';
import { STORE_CONFIG } from '../data/storeConfig';

interface ReturnPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrderId?: string;
  onSubmitReturnRequest: (request: ReturnRequest) => void;
}

export const ReturnPolicyModal: React.FC<ReturnPolicyModalProps> = ({
  isOpen,
  onClose,
  defaultOrderId = '',
  onSubmitReturnRequest
}) => {
  const [activeTab, setActiveTab] = useState<'policy' | 'request'>('policy');
  
  // Form State
  const [orderId, setOrderId] = useState(defaultOrderId || '');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState<ReturnRequest['reason']>('Product Not Received / Missing Item');
  const [details, setDetails] = useState('');
  const [hasUnboxingVideo, setHasUnboxingVideo] = useState(false);
  const [videoFile, setVideoFile] = useState<string>('');
  const [refundMethod, setRefundMethod] = useState<ReturnRequest['refundMethod']>('Original Payment Method');
  const [upiId, setUpiId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if ((reason === 'Product Not Received / Missing Item' || reason === 'Damaged / Torn Saree') && !hasUnboxingVideo) {
      alert('Important: As per Viral Sarees store policy, an Unboxing Video is compulsory for missing or damaged item claims.');
      return;
    }

    const req: ReturnRequest = {
      id: `RET-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: orderId.trim(),
      customerPhone: phone.trim(),
      customerName: customerName.trim(),
      reason,
      details,
      hasUnboxingVideo,
      videoFileName: videoFile,
      refundMethod,
      upiId: refundMethod === 'UPI' ? upiId : undefined,
      status: hasUnboxingVideo ? 'Approved' : 'Video Verification Pending',
      createdAt: new Date().toLocaleDateString('en-IN')
    };

    onSubmitReturnRequest(req);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#800020] to-[#9B111E] text-amber-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-200">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Return & Exchange Policy</h3>
              <p className="text-[11px] text-amber-200">Sudathi-Standard 7-Day Hassle Free Returns</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-amber-200 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('policy')}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'policy'
                ? 'border-rose-900 text-rose-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Official Policy & Unboxing Guidelines</span>
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'request'
                ? 'border-rose-900 text-rose-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>Submit Return / Exchange Request</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="overflow-y-auto p-6 text-xs text-stone-700 space-y-6">
          
          {activeTab === 'policy' && (
            <div className="space-y-6">
              
              {/* Critical Alert Box regarding Unboxing Video */}
              <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 text-stone-900 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm sm:text-base">
                  <ShieldAlert className="w-6 h-6 text-rose-800 shrink-0" />
                  <span>CRITICAL MANDATE: UNBOXING VIDEO COMPULSORY FOR CLAIMS</span>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-amber-300 font-medium text-stone-800 leading-relaxed text-xs space-y-2">
                  <p className="font-bold text-rose-950">
                    If a customer claims a product was not received (missing item), wrong saree was delivered, or the parcel arrived damaged/torn:
                  </p>
                  <p>
                    Under our courier transit and loss prevention rules, <strong>an unbroken, continuous 360-degree unboxing video is strictly COMPULSORY</strong>. The recording must begin before cutting or peeling the courier security seal. In the absence of an authentic unboxing video, claims regarding <em>"Product Not Received"</em> or <em>"Missing Item inside parcel"</em> cannot be verified or entertained.
                  </p>
                </div>

                {/* Checklist for proper unboxing video */}
                <div>
                  <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-rose-900" />
                    <span>Standard Guidelines for Valid Unboxing Video:</span>
                  </h4>
                  <ul className="space-y-1.5 pl-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Start before opening:</strong> Record before tearing the courier plastic bag or cutting the seal tape.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Show Shipping Label clearly:</strong> Point the camera at the white barcode label showing your Name, Address & Tracking Number (AWB).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>360-degree all sides inspection:</strong> Show all 6 sides of the package to confirm it has not been previously opened or tampered with.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>No cuts or pauses:</strong> The entire opening, unpacking, and saree inspection must be captured in one continuous, unedited video.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Report within 48 Hours:</strong> Share the video with our support team on WhatsApp or via the return portal within 48 hours of delivery.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* General 7-Day Policy Points */}
              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 text-sm">
                  1. General 7-Day Return & Exchange Window
                </h4>
                <p className="leading-relaxed">
                  We want you to love your Viral Sarees! You can request a return or exchange within <strong>7 days of delivery</strong> for unstitched sarees, provided:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-900 block mb-0.5">Original Condition</span>
                    The saree must remain unused, unworn, unwashed, and neatly folded with all original Silk Mark and brand tags attached.
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-900 block mb-0.5">Blouse Piece Intact</span>
                    The unstitched blouse piece attached to the saree must not be cut or altered. (Custom-tailored stitched blouses are non-returnable).
                  </div>
                </div>
              </div>

              {/* Refund Process & Timelines */}
              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 text-sm">
                  2. Reverse Pickup & Refund Timelines
                </h4>
                <p className="leading-relaxed">
                  Once your return request and video are approved, our courier partner (BlueDart / Delhivery) will pick up the package from your doorstep within <strong>24-48 business hours</strong>.
                </p>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                  <p><strong>Prepaid Orders (UPI/Card/NetBanking):</strong> Refund credited directly back to your source account within 3-5 bank working days after quality inspection.</p>
                  <p><strong>Cash on Delivery (COD) Orders:</strong> Refund credited directly to your verified UPI ID or Bank Account via NEFT within 24 hours of return delivery.</p>
                  <p><strong>Store Credit / Wallet:</strong> Instant credit to your Viral Sarees Wallet with an additional 5% bonus for future purchases.</p>
                </div>
              </div>

              {/* Support Contact */}
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h5 className="font-bold text-rose-950 text-sm">Need Help with Return or Video Verification?</h5>
                  <p className="text-rose-800 text-[11px]">Our dedicated returns desk is active Monday-Saturday, 10 AM to 8 PM.</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent('Namaste Viral Sarees, I need help with return verification / unboxing video.')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp Video</span>
                  </a>
                  <button
                    onClick={() => setActiveTab('request')}
                    className="px-4 py-2 bg-rose-900 hover:bg-rose-950 text-amber-100 font-bold rounded-xl transition"
                  >
                    Start Return Request →
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'request' && (
            <div>
              {isSubmitted ? (
                <div className="py-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900">Return Request Submitted Successfully!</h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Request Reference <strong>#RET-8921</strong> for Order <strong>{orderId}</strong>. Our quality verification team will inspect your unboxing video and schedule doorstep courier pickup within 24 hours.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-[#800020] text-amber-100 font-bold rounded-xl text-xs"
                  >
                    Back to Store
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Order ID & Customer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Order ID *</label>
                      <input
                        type="text"
                        required
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="e.g. VLS-89421"
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  {/* Return Reason Dropdown */}
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Reason for Return / Exchange *</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value as any)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white text-xs font-medium"
                    >
                      <option value="Product Not Received / Missing Item">
                        Product Not Received / Missing Item in Parcel (Mandatory Unboxing Video Required)
                      </option>
                      <option value="Damaged / Torn Saree">
                        Damaged / Torn Saree (Mandatory Unboxing Video Required)
                      </option>
                      <option value="Defective Weaving or Zari">
                        Defective Weaving or Zari Work
                      </option>
                      <option value="Wrong Product Delivered">
                        Wrong Product / Color Delivered
                      </option>
                      <option value="Color Mismatch">
                        Color / Fabric Not As Expected
                      </option>
                      <option value="Other">Other Reasons</option>
                    </select>
                  </div>

                  {/* Mandatory Video Warning banner inside form */}
                  {(reason === 'Product Not Received / Missing Item' || reason === 'Damaged / Torn Saree') && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-950 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-rose-900">
                        <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                        <span>Mandatory Unboxing Video Required for "{reason}"</span>
                      </div>
                      <p className="text-[11px] text-stone-700">
                        Because you selected missing/damage, a continuous uncut parcel opening video showing the shipping label is mandatory to prevent courier transit theft.
                      </p>
                    </div>
                  )}

                  {/* Video Checkbox & Proof */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasUnboxingVideo}
                        onChange={(e) => setHasUnboxingVideo(e.target.checked)}
                        className="w-4 h-4 text-rose-800 rounded mt-0.5"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-stone-900 block">
                          I have recorded a continuous 360-degree Unboxing Video of the sealed parcel
                        </span>
                        <span className="text-stone-500 text-[11px]">
                          Video shows parcel sealed label before opening and continuous extraction.
                        </span>
                      </div>
                    </label>

                    {hasUnboxingVideo && (
                      <div className="pt-2 border-t border-stone-200">
                        <label className="font-bold text-stone-700 block mb-1">
                          Attach Video Proof or WhatsApp Confirmation:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={videoFile}
                            onChange={(e) => setVideoFile(e.target.value)}
                            placeholder="File name or WhatsApp video link"
                            className="flex-1 px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                          />
                          <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-md">
                            Attached
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Comments */}
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Explain the Issue in Detail *</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Please mention exactly what was missing or defect observed..."
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>

                  {/* Refund Destination */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Refund Method Preference</label>
                      <select
                        value={refundMethod}
                        onChange={(e) => setRefundMethod(e.target.value as any)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white text-xs"
                      >
                        <option value="Original Payment Method">Original Payment Method (Source Account)</option>
                        <option value="UPI">Instant UPI Transfer</option>
                        <option value="Store Credit (Viral Sarees Wallet)">Store Credit (+5% Extra Bonus)</option>
                      </select>
                    </div>

                    {refundMethod === 'UPI' && (
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Your UPI ID (VPA)</label>
                        <input
                          type="text"
                          required
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. mobile@upi or name@okaxis"
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('policy')}
                      className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-100 font-semibold"
                    >
                      Back to Guidelines
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#800020] hover:bg-[#9B111E] text-amber-100 font-bold rounded-xl shadow-md transition flex items-center gap-2"
                    >
                      <span>Submit Return Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
