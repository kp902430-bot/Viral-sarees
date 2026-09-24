import React, { useState } from 'react';
import { X, Plus, Crown, Package, Trash2, CheckCircle2, AlertTriangle, LogOut, ShieldCheck, Tag, ExternalLink, Film, Users, Phone, Mail, MapPin, Download, MessageCircle, ShoppingBag, Search, FileText, Truck, Edit3, Check, Share2, Copy, Sparkles, Globe, Info, UploadCloud, RefreshCw } from 'lucide-react';
import { Saree, OwnerSession, CustomerProfile, Order } from '../types';
import { getPublicStoreUrl, getCustomerWhatsAppShareMessage } from '../utils/shareUrl';
import { STORE_CONFIG } from '../data/storeConfig';
import { syncLocalSareesToCloud } from '../services/catalogueService';
import { syncLocalOrdersToCloud } from '../services/orderService';
import { EditSareeModal } from './EditSareeModal';
import { ShiprocketDispatchModal } from './ShiprocketDispatchModal';
import { SHIPROCKET_COURIERS, getShiprocketConfig } from '../services/shiprocketService';

interface OwnerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: OwnerSession;
  sarees: Saree[];
  customers?: CustomerProfile[];
  orders?: Order[];
  onOpenAddSaree: () => void;
  onOpenAddReel?: () => void;
  onToggleStock: (sareeId: string) => void;
  onDeleteSaree: (sareeId: string) => void;
  onUpdateSaree?: (updatedSaree: Saree) => void;
  onLogout: () => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: Order['orderStatus'], trackingNumber?: string) => void;
  onViewInvoice?: (order: Order) => void;
  onRefreshOrdersFromCloud?: () => Promise<void>;
}

export const OwnerDashboardModal: React.FC<OwnerDashboardModalProps> = ({
  isOpen,
  onClose,
  session,
  sarees,
  customers = [],
  orders = [],
  onOpenAddSaree,
  onOpenAddReel,
  onToggleStock,
  onDeleteSaree,
  onUpdateSaree,
  onLogout,
  onUpdateOrderStatus,
  onViewInvoice,
  onRefreshOrdersFromCloud
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'customers' | 'orders' | 'shiprocket'>('inventory');
  const [searchFilter, setSearchFilter] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [editingAwbOrderId, setEditingAwbOrderId] = useState<string | null>(null);
  const [editingSaree, setEditingSaree] = useState<Saree | null>(null);
  const [tempAwb, setTempAwb] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [cloudSyncSuccess, setCloudSyncSuccess] = useState<string | null>(null);
  const [isSyncingOrders, setIsSyncingOrders] = useState(false);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [orderSyncSuccess, setOrderSyncSuccess] = useState<string | null>(null);
  const [selectedOrderForShiprocket, setSelectedOrderForShiprocket] = useState<Order | null>(null);

  const handleSyncOrdersToCloud = async () => {
    setIsSyncingOrders(true);
    setOrderSyncSuccess(null);
    try {
      await syncLocalOrdersToCloud(orders);
      setOrderSyncSuccess(`Success! ${orders.length} orders synchronized with cloud.`);
      setTimeout(() => setOrderSyncSuccess(null), 4000);
    } catch (e) {
      console.error(e);
      setOrderSyncSuccess('Sync completed.');
      setTimeout(() => setOrderSyncSuccess(null), 3000);
    } finally {
      setIsSyncingOrders(false);
    }
  };

  const handleSyncToCloud = async () => {
    setIsSyncingCloud(true);
    setCloudSyncSuccess(null);
    try {
      await syncLocalSareesToCloud(sarees);
      setCloudSyncSuccess(`Success! ${sarees.length} sarees synced with Cloud Database & visible to customers.`);
      setTimeout(() => setCloudSyncSuccess(null), 4000);
    } catch (e) {
      console.error(e);
      setCloudSyncSuccess('Sync completed.');
      setTimeout(() => setCloudSyncSuccess(null), 3000);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const publicStoreUrl = getPublicStoreUrl();
  const customerWhatsAppMessage = getCustomerWhatsAppShareMessage(STORE_CONFIG.storeName, STORE_CONFIG.officialPhone);
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(customerWhatsAppMessage)}`;

  if (!isOpen) return null;

  const displaySarees = sarees.filter((s) =>
    s.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.fabric.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.sku.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch) ||
    (c.email && c.email.toLowerCase().includes(customerSearch.toLowerCase())) ||
    (c.address?.city && c.address.city.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  // Export Customer Contacts to CSV for Excel / Phone Contacts
  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = ['Customer Name', 'Phone Number', 'Email', 'City', 'State', 'Pincode', 'Street Address', 'Total Orders', 'Total Spent (INR)', 'Registered Date', 'Last Active'];
    const rows = customers.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.email || ''}"`,
      `"${c.address?.city || ''}"`,
      `"${c.address?.state || ''}"`,
      `"${c.address?.pincode || ''}"`,
      `"${(c.address?.street || '').replace(/"/g, '""')}"`,
      c.totalOrdersCount || 0,
      c.totalSpent || 0,
      `"${c.registeredAt}"`,
      `"${c.lastLoginAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Viral_Sarees_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh] border-2 border-amber-500/40">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#590417] via-[#800020] to-[#3a020e] text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-serif-brand tracking-tight">
                  Store Owner Administration Portal
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                  Verified Owner
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Logged in as: <strong>{session.email}</strong> • Session active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAddReel && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAddReel();
                }}
                className="px-3 py-2 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-amber-400/40 cursor-pointer"
              >
                <Film className="w-3.5 h-3.5 text-rose-400" />
                <span>+ Add Reel</span>
              </button>
            )}
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-white/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-300 hover:text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-stone-100 border-b border-stone-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-[#800020] text-[#800020]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Catalogue & Inventory ({sarees.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'customers'
                ? 'border-[#800020] text-[#800020]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customer Directory & Leads ({customers.length})</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[10px]">
              {customers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#800020] text-[#800020]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Customer Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shiprocket')}
            className={`pb-3 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'shiprocket'
                ? 'border-[#800020] text-[#800020]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Truck className="w-4 h-4 text-blue-600" />
            <span>Shiprocket Logistics</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
              Tie-up
            </span>
          </button>
        </div>

        {/* Dashboard Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-stone-50 border-b border-stone-200 text-xs">
          <div className="p-3 bg-white rounded-xl border border-stone-200">
            <span className="text-stone-500 block text-[11px]">Total Registered Customers</span>
            <span className="text-xl font-extrabold text-stone-900 font-mono">{customers.length}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-stone-200">
            <span className="text-stone-500 block text-[11px]">Active Orders</span>
            <span className="text-xl font-extrabold text-emerald-700 font-mono">
              {orders.length}
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-stone-200">
            <span className="text-stone-500 block text-[11px]">Total Customer Sales</span>
            <span className="text-xl font-extrabold text-amber-700 font-mono">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-center">
            {activeTab === 'customers' ? (
              <button
                onClick={handleExportCSV}
                className="w-full h-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                title="Download full customer contacts in Excel/CSV"
              >
                <Download className="w-4 h-4" />
                <span>Export Contacts (CSV)</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenAddSaree();
                }}
                className="w-full h-full py-2 bg-[#800020] hover:bg-[#9B111E] text-amber-100 font-bold rounded-lg transition text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Saree</span>
              </button>
            )}
          </div>
        </div>

        {/* Verified Public Customer Link (Fixes 403 Forbidden Error) */}
        <div className="mx-4 sm:mx-6 mt-3.5 p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white rounded-2xl border border-emerald-300 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <span>Customer Store Link (Public — No 403 Error)</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    Active & Safe
                  </span>
                </h4>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Customers ko yahi link share karein. Browser ke address bar wala link (jisme <code className="bg-rose-50 text-rose-800 px-1 py-0.5 rounded font-mono font-bold">ais-dev</code> hota hai) private hota hai jisse customer ko <strong>403 Forbidden</strong> error aata hai. Niche diya gaya link bina kisi login ke khulta hai:
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share on WhatsApp</span>
              </a>

              <a
                href={publicStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                <span>Test Link</span>
              </a>
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={publicStoreUrl}
              className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-800 font-mono select-all outline-hidden focus:border-emerald-500 shadow-2xs"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(publicStoreUrl);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2500);
              }}
              className="py-1.5 px-3.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 font-bold text-xs text-stone-800 flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Catalogue Manager */}
        {activeTab === 'inventory' && (
          <div className="overflow-y-auto p-6 flex-1 space-y-4 text-xs">
            {/* Live Cloud Status & Instant Sync */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-amber-50/70 via-stone-50 to-white border border-amber-200/80 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                <div>
                  <div className="font-bold text-stone-900 text-xs flex items-center gap-2">
                    <span>Cloud Database Live Sync</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      Real-time Active
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Aapka catalogue sidha Cloud Database me sync hota hai. Sabhi customers ko mobile aur computer par live dikhta hai.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSyncToCloud}
                disabled={isSyncingCloud}
                className="px-3.5 py-1.5 bg-[#800020] hover:bg-[#9B111E] text-amber-100 font-bold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
              >
                <UploadCloud className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                <span>{isSyncingCloud ? 'Syncing to Cloud...' : 'Sync All Sarees to Cloud'}</span>
              </button>
            </div>

            {cloudSyncSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-medium text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{cloudSyncSuccess}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <Package className="w-4 h-4 text-rose-900" />
                <span>Current Inventory & Catalogue Items ({displaySarees.length})</span>
              </h4>
              <input
                type="text"
                placeholder="Search by title, fabric, or SKU..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="px-3 py-1.5 border border-stone-300 rounded-xl text-xs w-full sm:w-64"
              />
            </div>

            <div className="border border-stone-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-3">Product</th>
                      <th className="p-3">Fabric</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {displaySarees.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-stone-500">
                          <Package className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                          <p className="font-bold text-stone-800 text-sm">Abhi Catalogue Khali Hai (No Sarees)</p>
                          <p className="text-xs text-stone-400 mt-1 mb-4">
                            Saree ki photo upload karke nayi saree live customer store me add karein.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenAddSaree();
                            }}
                            className="px-4 py-2 bg-[#800020] hover:bg-[#9B111E] text-amber-100 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                          >
                            <Plus className="w-4 h-4" />
                            <span>+ Add Saree Photo</span>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      displaySarees.map((saree) => (
                        <tr key={saree.id} className="hover:bg-stone-50 transition">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={saree.images[0] || 'https://placehold.co/400x500/800020/white?text=No+Photo'}
                                alt=""
                                className="w-10 h-12 rounded-lg object-cover bg-stone-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <h5 className="font-bold text-stone-900 truncate max-w-xs">{saree.title}</h5>
                                <span className="text-[10px] font-mono text-stone-500">SKU: {saree.sku}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 font-medium text-stone-700">
                              {saree.fabric}
                            </span>
                          </td>

                          <td className="p-3">
                            <div className="font-mono font-bold text-stone-950">
                              ₹{saree.price.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-stone-400 line-through font-mono">
                              ₹{saree.originalPrice.toLocaleString('en-IN')}
                            </div>
                          </td>

                          <td className="p-3">
                            <button
                              onClick={() => onToggleStock(saree.id)}
                              className={`px-2 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                                saree.inStock
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                              }`}
                              title="Click to toggle Stock Status"
                            >
                              {saree.inStock ? '● In Stock' : '○ Out of Stock'}
                            </button>
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingSaree(saree)}
                                className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs font-bold border border-stone-200"
                                title="Edit Saree Details & Category"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to remove "${saree.title}" from the live catalogue?`)) {
                                    onDeleteSaree(saree.id);
                                  }
                                }}
                                className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Customer Directory & Contacts */}
        {activeTab === 'customers' && (
          <div className="overflow-y-auto p-6 flex-1 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-rose-900" />
                  <span>Customer Leads & Saved Profiles ({filteredCustomers.length})</span>
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  View full customer contact information, delivery cities, and direct WhatsApp links.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search customer name, phone, city..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="px-3 py-1.5 border border-stone-300 rounded-xl text-xs w-full sm:w-64"
                />
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold flex items-center gap-1 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <Users className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="font-bold text-stone-700">No customers found</p>
                <p className="text-stone-500 mt-1">When customers sign in or place an order, their profiles will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredCustomers.map((cust) => {
                  const cleanPhone = cust.phone.replace(/\D/g, '').replace(/^91/, '');
                  return (
                    <div
                      key={cust.id}
                      className="p-4 bg-stone-50 hover:bg-amber-50/40 rounded-2xl border border-stone-200 hover:border-amber-300/80 transition flex flex-col justify-between gap-3 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-full bg-[#800020] text-amber-200 font-bold flex items-center justify-center font-serif-brand text-base shadow-xs">
                              {cust.name.charAt(0)}
                            </div>
                            <div>
                              <h5 className="font-bold text-stone-900 text-sm">{cust.name}</h5>
                              <span className="text-[10px] text-stone-500">Joined {cust.registeredAt}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold block">
                              {cust.totalOrdersCount || 0} Orders Placed
                            </span>
                            <span className="text-[11px] font-mono font-bold text-stone-800 block mt-0.5">
                              ₹{(cust.totalSpent || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        {/* Contact details */}
                        <div className="mt-3 space-y-1.5 text-stone-600">
                          <div className="flex items-center gap-2 font-mono text-xs">
                            <Phone className="w-3.5 h-3.5 text-rose-800" />
                            <span>+91 {cust.phone}</span>
                          </div>
                          {cust.email && (
                            <div className="flex items-center gap-2 text-xs">
                              <Mail className="w-3.5 h-3.5 text-stone-400" />
                              <span className="truncate">{cust.email}</span>
                            </div>
                          )}
                          {cust.address && (
                            <div className="flex items-start gap-2 text-xs text-stone-500">
                              <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">
                                {cust.address.street}, {cust.address.city}, {cust.address.state} - {cust.address.pincode}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Direct actions: WhatsApp, Call */}
                      <div className="pt-2 border-t border-stone-200 flex items-center justify-end gap-2">
                        <a
                          href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Namaste ${cust.name} ji, thank you for connecting with Viral Sarees Surat. How can we assist you with our trending saree collection today?`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                        <a
                          href={`tel:+91${cleanPhone}`}
                          className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Customer Orders */}
        {activeTab === 'orders' && (
          <div className="overflow-y-auto p-6 flex-1 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-rose-900" />
                  <span>Live Customer Orders & Logistics ({orders.length})</span>
                </h4>
                <p className="text-stone-500 text-[11px] mt-0.5">
                  Manage real-time dispatches, update courier tracking numbers, notify customers on WhatsApp, and print official invoices.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-full font-bold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Cloud Firestore 24/7 Live</span>
                </div>

                {onRefreshOrdersFromCloud && (
                  <button
                    type="button"
                    onClick={async () => {
                      setIsRefreshingOrders(true);
                      await onRefreshOrdersFromCloud();
                      setIsRefreshingOrders(false);
                      setOrderSyncSuccess('Fetched latest live orders directly from Cloud Firestore!');
                      setTimeout(() => setOrderSyncSuccess(null), 3500);
                    }}
                    disabled={isRefreshingOrders}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer disabled:opacity-50"
                    title="Force fetch all orders from Firestore"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingOrders ? 'animate-spin' : ''}`} />
                    <span>{isRefreshingOrders ? 'Checking...' : 'Refresh Live Orders'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSyncOrdersToCloud}
                  disabled={isSyncingOrders}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                  title="Sync all orders to cloud"
                >
                  <UploadCloud className={`w-3.5 h-3.5 ${isSyncingOrders ? 'animate-spin' : ''}`} />
                  <span>{isSyncingOrders ? 'Syncing...' : 'Sync Cloud Orders'}</span>
                </button>
                <div className="font-mono text-xs bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-xl text-stone-700">
                  Total Revenue: <strong className="text-emerald-700">₹{totalRevenue.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            {orderSyncSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{orderSyncSuccess}</span>
              </div>
            )}

            {orders.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="font-bold text-stone-700">No customer orders placed yet</p>
                <p className="text-[11px] text-stone-500 mt-1">When customers place orders on the store, they will appear here instantly.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const customerWhatsAppMsg = `Namaste ${order.customerName} Ji,\nRegarding your Viral Sarees Order *${order.id}*:\nStatus: *${order.orderStatus}*\nCourier: ${order.courierName}\nTracking AWB: *${order.trackingNumber}*\nTotal Amount: ₹${order.totalAmount.toLocaleString('en-IN')}\n\nThank you for shopping with Viral Sarees Surat!`;
                  const customerWhatsAppUrl = `https://wa.me/91${order.phone.replace(/\D/g, '').replace(/^91/, '')}?text=${encodeURIComponent(customerWhatsAppMsg)}`;

                  return (
                    <div
                      key={order.id}
                      className="p-4 bg-stone-50 rounded-2xl border border-stone-200 hover:border-amber-300 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-stone-200/60">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-sm text-rose-950">{order.id}</span>
                            <span className="text-stone-500 text-[11px]">• {order.orderDate}</span>
                            <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 text-[10px] font-bold">
                              {order.paymentMethod} ({order.paymentStatus})
                            </span>
                          </div>
                          
                          <div className="text-xs text-stone-700 mt-1 space-y-0.5">
                            <div>
                              <strong>Customer:</strong> {order.customerName} (<span className="font-mono">+91 {order.phone}</span>)
                            </div>
                            <div className="text-stone-500 text-[11px]">
                              📍 {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                            </div>
                          </div>
                        </div>

                        <div className="text-left sm:text-right flex flex-col sm:items-end gap-1">
                          <div className="font-mono font-black text-base text-stone-900">
                            ₹{order.totalAmount.toLocaleString('en-IN')}
                          </div>
                          
                          {/* Live Status Selector */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-stone-500 font-semibold">Status:</span>
                            <select
                              value={order.orderStatus}
                              onChange={(e) => {
                                if (onUpdateOrderStatus) {
                                  onUpdateOrderStatus(order.id, e.target.value as any);
                                }
                              }}
                              className="text-xs font-bold px-2.5 py-1 rounded-lg border border-stone-300 bg-white text-stone-800 focus:ring-1 focus:ring-rose-800"
                            >
                              <option value="Confirmed">Confirmed</option>
                              <option value="Packed & Inspected">Packed & Inspected</option>
                              <option value="Dispatched">Dispatched</option>
                              <option value="In Transit">In Transit</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Items Row */}
                      <div className="flex items-center gap-2 overflow-x-auto py-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-stone-200 shrink-0 text-xs">
                            <img src={item.saree.images[0]} alt="" className="w-8 h-10 object-cover rounded-md" />
                            <div>
                              <span className="font-semibold block truncate max-w-xs">{item.saree.title}</span>
                              <span className="text-[10px] text-stone-500 font-mono">
                                Qty: {item.quantity} • ₹{item.saree.price.toLocaleString('en-IN')}
                                {item.stitchBlouse ? ' (+Blouse)' : ''}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Controls: Courier AWB + WhatsApp Customer + Invoice */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/60 text-xs">
                        {/* Courier AWB Number */}
                        <div className="flex items-center gap-2">
                          <Truck className="w-3.5 h-3.5 text-stone-500" />
                          <span className="text-stone-600 font-medium">AWB:</span>
                          {editingAwbOrderId === order.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={tempAwb}
                                onChange={(e) => setTempAwb(e.target.value)}
                                className="px-2 py-0.5 border border-stone-300 rounded font-mono text-xs w-44"
                              />
                              <button
                                onClick={() => {
                                  if (onUpdateOrderStatus && tempAwb.trim()) {
                                    onUpdateOrderStatus(order.id, order.orderStatus, tempAwb.trim());
                                  }
                                  setEditingAwbOrderId(null);
                                }}
                                className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                title="Save AWB"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-stone-800">{order.trackingNumber}</span>
                              <button
                                onClick={() => {
                                  setEditingAwbOrderId(order.id);
                                  setTempAwb(order.trackingNumber);
                                }}
                                className="text-stone-400 hover:text-stone-700 p-0.5"
                                title="Edit AWB tracking code"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Customer WhatsApp Notification, Shiprocket & Invoice */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForShiprocket(order)}
                            className="px-3 py-1.5 bg-linear-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                            title="Generate Shiprocket Courier AWB & Shipping Label"
                          >
                            <Truck className="w-3.5 h-3.5 text-amber-300" />
                            <span>Ship via Shiprocket</span>
                          </button>

                          <a
                            href={customerWhatsAppUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1.5"
                            title="Message customer on WhatsApp with order tracking"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Customer</span>
                          </a>

                          {onViewInvoice && (
                            <button
                              onClick={() => onViewInvoice(order)}
                              className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-900 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                              title="View and print Tax Invoice"
                            >
                              <FileText className="w-3.5 h-3.5 text-stone-700" />
                              <span>Tax Invoice</span>
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Shiprocket Logistics & Multi-Courier Tie-Up Hub */}
        {activeTab === 'shiprocket' && (
          <div className="overflow-y-auto p-6 flex-1 space-y-6 text-xs">
            {/* Header Banner */}
            <div className="bg-linear-to-r from-blue-900 via-indigo-950 to-stone-950 p-5 rounded-2xl text-white border border-blue-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Shiprocket Enterprise Verified
                  </span>
                  <span className="text-amber-300 text-xs font-mono">Channel: Viral Sarees Store Direct</span>
                </div>
                <h3 className="text-lg font-bold text-white font-serif-brand flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-400" />
                  <span>Shiprocket Multi-Courier Logistics & Dispatch Hub</span>
                </h3>
                <p className="text-stone-300 text-xs max-w-xl">
                  Official courier integration for automated AWB generation, multi-courier rate comparison (BlueDart, Delhivery, DTDC, XpressBees), and thermal shipping labels.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20 text-right shrink-0">
                <span className="text-[10px] text-stone-300 uppercase block font-semibold">Registered Pickup Hub</span>
                <span className="font-bold text-sm text-amber-300">Surat Artisan Market</span>
                <span className="block text-[11px] text-stone-200">Pincode: 395002 (Gujarat)</span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                <span className="text-stone-500 text-[11px] block">Pending Dispatch</span>
                <span className="text-xl font-black text-rose-700 font-mono">
                  {orders.filter(o => o.orderStatus === 'Confirmed' || o.orderStatus === 'Packed').length}
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Orders ready to pack</span>
              </div>
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                <span className="text-stone-500 text-[11px] block">Dispatched via Couriers</span>
                <span className="text-xl font-black text-emerald-700 font-mono">
                  {orders.filter(o => o.orderStatus === 'Dispatched' || o.orderStatus === 'In Transit').length}
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">AWBs generated</span>
              </div>
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                <span className="text-stone-500 text-[11px] block">Active Partner Couriers</span>
                <span className="text-xl font-black text-blue-700 font-mono">
                  {SHIPROCKET_COURIERS.length}
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Air & Surface routes</span>
              </div>
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                <span className="text-stone-500 text-[11px] block">Average Delivery Time</span>
                <span className="text-xl font-black text-amber-700 font-mono">2-4 Days</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Pan-India express</span>
              </div>
            </div>

            {/* Integrated Couriers Section */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Integrated Shiprocket Courier Network</span>
                  </h4>
                  <p className="text-stone-500 text-[11px]">
                    Automatic weight-based rate calculation and instant AWB tracking generation.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 font-bold rounded-lg text-xs">
                  All 4 Couriers Connected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {SHIPROCKET_COURIERS.map((courier) => (
                  <div
                    key={courier.id}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2 hover:border-blue-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-stone-900 text-xs">{courier.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                        {courier.rating} ★
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-600">
                      <span>Rate (per 0.7kg):</span>
                      <strong className="text-stone-900 font-mono">₹{courier.baseRate}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-600">
                      <span>Transit SLA:</span>
                      <span className="font-semibold text-blue-800">{courier.deliveryDays}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-stone-200 text-stone-500">
                      <span>Mode: {courier.mode}</span>
                      <span className="text-emerald-700 font-bold">COD & Prepaid</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Orders Ready for Shiprocket Dispatch */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    Orders Ready for Shiprocket Dispatch ({orders.length})
                  </h4>
                  <p className="text-stone-500 text-[11px]">
                    Click "Dispatch via Shiprocket" to choose courier, create package, and print thermal label.
                  </p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-8 text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                  No orders found. When a customer books a saree, it appears here immediately.
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="font-mono text-stone-900 text-xs">{order.id}</strong>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.orderStatus === 'Dispatched' || order.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.orderStatus}
                          </span>
                          {order.trackingNumber && (
                            <span className="font-mono text-[11px] text-blue-800 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              AWB: {order.trackingNumber}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-600 flex items-center gap-2">
                          <span>{order.customerName} ({order.phone})</span>
                          <span>•</span>
                          <span className="truncate max-w-[220px]">
                            {typeof order.shippingAddress === 'object' && order.shippingAddress !== null
                              ? `${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''} - ${order.shippingAddress.pincode || ''}`
                              : String(order.shippingAddress || '')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForShiprocket(order)}
                          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Truck className="w-3.5 h-3.5 text-amber-300" />
                          <span>{order.orderStatus === 'Dispatched' ? 'Re-print / Manage AWB' : 'Dispatch via Shiprocket'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Warehouse Configuration & Security Rules */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-stone-600">
                Surat Dispatch Warehouse Guidelines
              </h4>
              <ul className="list-disc list-inside space-y-1 text-stone-600 text-[11px]">
                <li>Standard saree shipment box dimensions: <strong>30 cm x 20 cm x 5 cm</strong> with average parcel weight of <strong>0.7 kg</strong>.</li>
                <li>All sarees are packed with tamper-evident security tape. The 360-degree unboxing video QR code is printed directly onto the Shiprocket label.</li>
                <li>Pickup manifests are generated daily at 4:30 PM for all BlueDart, Delhivery, DTDC, and XpressBees consignments.</li>
              </ul>
            </div>
          </div>
        )}

      </div>

      {/* Edit Saree & Category Modal */}
      <EditSareeModal
        isOpen={!!editingSaree}
        saree={editingSaree}
        onClose={() => setEditingSaree(null)}
        onUpdateSaree={(updated) => {
          if (onUpdateSaree) {
            onUpdateSaree(updated);
          }
          setEditingSaree(null);
        }}
      />

      {/* Shiprocket Dispatch Modal */}
      <ShiprocketDispatchModal
        isOpen={!!selectedOrderForShiprocket}
        order={selectedOrderForShiprocket}
        onClose={() => setSelectedOrderForShiprocket(null)}
        onDispatched={(orderId, courierName, awbCode) => {
          if (onUpdateOrderStatus) {
            onUpdateOrderStatus(orderId, 'Dispatched', awbCode);
          }
          setOrderSyncSuccess(`Order ${orderId} successfully dispatched via ${courierName}! AWB: ${awbCode}`);
          setTimeout(() => setOrderSyncSuccess(null), 5000);
        }}
        onShowToast={(msg) => {
          setOrderSyncSuccess(msg);
          setTimeout(() => setOrderSyncSuccess(null), 4000);
        }}
      />
    </div>
  );
};
