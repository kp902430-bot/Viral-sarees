/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { SareeCard } from './components/SareeCard';
import { SareeDetailModal } from './components/SareeDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingView } from './components/OrderTrackingView';
import { ReturnPolicyModal } from './components/ReturnPolicyModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { AddSareeModal } from './components/AddSareeModal';
import { OwnerDashboardModal } from './components/OwnerDashboardModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { InvoiceModal } from './components/InvoiceModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { STORE_CONFIG } from './data/storeConfig';
import { Footer } from './components/Footer';

import { INITIAL_SAREES, CATEGORIES, OCCASIONS, SAMPLE_ORDERS, SAMPLE_CUSTOMERS } from './data/sarees';
import { getDynamicCategories, isSareeMatchingCategory } from './utils/categoryHelper';
import { INITIAL_REELS } from './data/reels';
import { Saree, CartItem, Order, ReturnRequest, OwnerSession, SareeReel, ThemeMode, Review, CustomerProfile } from './types';
import { Filter, SlidersHorizontal, Sparkles, Check, Package, RotateCcw, AlertTriangle, Lock, Crown, ShieldAlert, Film, Camera } from 'lucide-react';

import { ReelsStoryBar } from './components/ReelsStoryBar';
import { ReelPlayerModal } from './components/ReelPlayerModal';
import { ReelsFeedView } from './components/ReelsFeedView';
import { AddReelModal } from './components/AddReelModal';
import { FeaturedReelsSection } from './components/FeaturedReelsSection';
import { MobileBottomNav } from './components/MobileBottomNav';
import { FloatingReelsWidget } from './components/FloatingReelsWidget';
import { InstallAppModal } from './components/InstallAppModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import confetti from 'canvas-confetti';
import { checkGoogleRedirectResult } from './services/firebasePhoneAuth';
import { 
  subscribeToCatalogue, 
  subscribeToReels, 
  saveSareeToCloud, 
  deleteSareeFromCloud, 
  updateSareeStockInCloud, 
  saveReelToCloud, 
  syncLocalSareesToCloud, 
  testFirestoreConnection 
} from './services/catalogueService';
import { getDefaultReviewsForSaree, calculateAverageRating } from './utils/reviewUtils';
import {
  subscribeToOrders,
  saveOrderToCloud,
  updateOrderInCloud,
  subscribeToCustomers,
  saveCustomerToCloud,
  recordCustomerLoginToCloud,
  syncLocalOrdersToCloud,
  fetchOrdersFromCloud
} from './services/orderService';
import { broadcastNewCatalogueEmail } from './services/catalogueBroadcastService';
import { notifyOwnerOfNewOrder, notifyOwnerOfCustomerLogin } from './services/ownerNotificationService';
import { OrderLoginPromptModal } from './components/OrderLoginPromptModal';

export default function App() {
  // 1. Core State with LocalStorage Persistence
  const [sarees, setSarees] = useState<Saree[]>(() => {
    try {
      const saved = localStorage.getItem('vls_catalogue_sarees');
      if (saved) {
        const parsed = JSON.parse(saved);
        // User requested: "demo saree jitni bhi hai hta do"
        // Filter out legacy hardcoded demo sarees (vls-001 ... vls-008)
        const real = Array.isArray(parsed)
          ? parsed.filter((s: Saree) => !/^vls-00[1-9]/.test(s?.id || '') && !s?.id?.startsWith('vls-demo'))
          : [];
        return real;
      }
      return INITIAL_SAREES;
    } catch {
      return INITIAL_SAREES;
    }
  });

  const [reels, setReels] = useState<SareeReel[]>(() => {
    try {
      const saved = localStorage.getItem('vls_saree_reels');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove old demo mock reels
          const realReels = parsed.filter((r: SareeReel) => !/^reel-0[1-9]/.test(r.id || ''));
          return realReels;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('vls_cart_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed)
          ? parsed.filter((item: CartItem) => item?.saree && !/^vls-00[1-9]/.test(item.saree.id || ''))
          : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Saree[]>(() => {
    try {
      const saved = localStorage.getItem('vls_wishlist_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed)
          ? parsed.filter((s: Saree) => s && !/^vls-00[1-9]/.test(s.id || ''))
          : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('vls_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        const real = Array.isArray(parsed)
          ? parsed.filter((o: Order) => o.id !== 'VLS-89421')
          : [];
        return real;
      }
      return SAMPLE_ORDERS;
    } catch {
      return SAMPLE_ORDERS;
    }
  });

  // Customer Account Session & Customer Leads Directory (Persistent)
  const [currentCustomer, setCurrentCustomer] = useState<CustomerProfile | null>(() => {
    try {
      const saved = localStorage.getItem('vls_current_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Owner Authentication Session (STRICT: ONLY kp902430@gmail.com is authorized)
  const [ownerSession, setOwnerSession] = useState<OwnerSession | null>(() => {
    try {
      const savedCustomer = localStorage.getItem('vls_current_customer');
      const savedOwner = localStorage.getItem('vls_owner_session');
      if (savedCustomer && savedOwner) {
        const cust = JSON.parse(savedCustomer);
        const owner = JSON.parse(savedOwner);
        if (
          cust?.email?.trim().toLowerCase() === 'kp902430@gmail.com' &&
          owner?.email?.trim().toLowerCase() === 'kp902430@gmail.com'
        ) {
          return owner;
        }
      }
      localStorage.removeItem('vls_owner_session');
      return null;
    } catch {
      return null;
    }
  });

  // Strict check: ONLY kp902430@gmail.com can EVER see or access the Owner Portal
  const isOwnerAuthorized = Boolean(
    currentCustomer &&
    currentCustomer.email &&
    currentCustomer.email.trim().toLowerCase() === 'kp902430@gmail.com' &&
    ownerSession?.isLoggedIn &&
    ownerSession?.email?.trim().toLowerCase() === 'kp902430@gmail.com'
  );

  const [customers, setCustomers] = useState<CustomerProfile[]>(() => {
    try {
      const saved = localStorage.getItem('vls_customers_db');
      return saved ? JSON.parse(saved) : SAMPLE_CUSTOMERS;
    } catch {
      return SAMPLE_CUSTOMERS;
    }
  });

  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);

  // 2. View & Navigation State
  const [activeView, setActiveView] = useState<'home' | 'reels' | 'tracking' | 'returns' | 'privacy'>('home');
  const [trackingTargetOrderId, setTrackingTargetOrderId] = useState<string>('');

  // Royal Festive Theme Mode (Crimson & Gold, Peacock & Gold, Emerald & Gold)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('vls_theme_mode');
      return (saved as ThemeMode) || 'crimson';
    } catch {
      return 'crimson';
    }
  });

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      localStorage.setItem('vls_theme_mode', mode);
    } catch {
      // ignore
    }
    showToast(`Royal Theme changed to ${mode.toUpperCase()} & Gold!`);
  };

  // 3. Modals & Drawers
  const [selectedSaree, setSelectedSaree] = useState<Saree | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderLoginPromptOpen, setIsOrderLoginPromptOpen] = useState(false);
  const [pendingCheckoutAfterLogin, setPendingCheckoutAfterLogin] = useState(false);
  const [isReturnPolicyOpen, setIsReturnPolicyOpen] = useState(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [isAddSareeOpen, setIsAddSareeOpen] = useState(false);
  const [isOwnerDashboardOpen, setIsOwnerDashboardOpen] = useState(false);
  const [isOwnerAuthOpen, setIsOwnerAuthOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const handleOpenOwnerPortal = () => {
    if (isOwnerAuthorized) {
      setIsOwnerDashboardOpen(true);
    } else {
      showToast('Store Owner access is only available for kp902430@gmail.com.');
      setIsCustomerAuthOpen(true);
    }
  };

  // Reels Modals
  const [isReelPlayerOpen, setIsReelPlayerOpen] = useState(false);
  const [selectedReelId, setSelectedReelId] = useState<string>('');
  const [isAddReelOpen, setIsAddReelOpen] = useState(false);

  // App Installation & Sharing Modal
  const [isInstallAppOpen, setIsInstallAppOpen] = useState(false);

  // 4. Filters & Search
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOccasion, setSelectedOccasion] = useState('All Occasions');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutCoupon, setCheckoutCoupon] = useState('VIRAL10');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('vls_catalogue_sarees', JSON.stringify(sarees));
    } catch (e) {
      console.error(e);
    }
  }, [sarees]);

  useEffect(() => {
    try {
      localStorage.setItem('vls_cart_items', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('vls_wishlist_items', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('vls_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('vls_saree_reels', JSON.stringify(reels));
    } catch (e) {
      console.error(e);
    }
  }, [reels]);

  useEffect(() => {
    try {
      if (ownerSession) {
        localStorage.setItem('vls_owner_session', JSON.stringify(ownerSession));
      } else {
        localStorage.removeItem('vls_owner_session');
      }
    } catch (e) {
      console.error(e);
    }
  }, [ownerSession]);

  useEffect(() => {
    try {
      if (currentCustomer) {
        localStorage.setItem('vls_current_customer', JSON.stringify(currentCustomer));
      } else {
        localStorage.removeItem('vls_current_customer');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentCustomer]);

  useEffect(() => {
    try {
      localStorage.setItem('vls_customers_db', JSON.stringify(customers));
    } catch (e) {
      console.error(e);
    }
  }, [customers]);

  // Real-Time Cloud Firestore Sync for Live Catalogue, Reels, Orders & Customers
  useEffect(() => {
    testFirestoreConnection();

    // Listen to live sarees from Cloud Firestore
    const unsubCatalogue = subscribeToCatalogue((cloudSarees) => {
      if (cloudSarees && cloudSarees.length > 0) {
        setSarees(cloudSarees);
        try {
          localStorage.setItem('vls_catalogue_sarees', JSON.stringify(cloudSarees));
        } catch {}
      } else {
        // If Firestore collection has no items yet, check if local storage has sarees added by owner
        try {
          const localSaved = localStorage.getItem('vls_catalogue_sarees');
          if (localSaved) {
            const parsed = JSON.parse(localSaved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Automatically upload existing local sarees to Firestore so customers see them!
              syncLocalSareesToCloud(parsed);
            }
          }
        } catch {}
      }
    });

    // Listen to live reels from Cloud Firestore
    const unsubReels = subscribeToReels((cloudReels) => {
      if (cloudReels && cloudReels.length > 0) {
        setReels(cloudReels);
        try {
          localStorage.setItem('vls_saree_reels', JSON.stringify(cloudReels));
        } catch {}
      }
    });

    // Listen to live customer orders from Cloud Firestore across all devices!
    const unsubOrders = subscribeToOrders((cloudOrders) => {
      if (cloudOrders && cloudOrders.length > 0) {
        setOrders(cloudOrders);
        try {
          localStorage.setItem('vls_customer_orders', JSON.stringify(cloudOrders));
          localStorage.setItem('vls_orders', JSON.stringify(cloudOrders));
        } catch {}
      } else {
        // If cloud orders empty, sync any local orders placed so far
        try {
          const localOrders = localStorage.getItem('vls_customer_orders');
          if (localOrders) {
            const parsed = JSON.parse(localOrders);
            if (Array.isArray(parsed) && parsed.length > 0) {
              syncLocalOrdersToCloud(parsed);
            }
          }
        } catch {}
      }
    });

    // Fetch latest cloud orders immediately on launch to ensure 24/7 data availability
    fetchOrdersFromCloud().then((cloudOrders) => {
      if (cloudOrders && cloudOrders.length > 0) {
        setOrders(cloudOrders);
        try {
          localStorage.setItem('vls_orders', JSON.stringify(cloudOrders));
          localStorage.setItem('vls_customer_orders', JSON.stringify(cloudOrders));
        } catch {}
      }
    }).catch((err) => console.warn('Could not fetch cloud orders on mount:', err));

    // Listen to registered customers in Cloud Firestore
    const unsubCustomers = subscribeToCustomers((cloudCustomers) => {
      if (cloudCustomers && cloudCustomers.length > 0) {
        setCustomers(cloudCustomers);
        try {
          localStorage.setItem('vls_customers_db', JSON.stringify(cloudCustomers));
        } catch {}
      }
    });

    return () => {
      unsubCatalogue();
      unsubReels();
      unsubOrders();
      unsubCustomers();
    };
  }, []);

  // Google Phone Redirect Listener (Logs user in upon returning from accounts.google.com)
  useEffect(() => {
    checkGoogleRedirectResult().then((res) => {
      if (res.success && res.user) {
        const gUser = res.user;
        const cleanEmail = (gUser.email || '').trim().toLowerCase();
        const cleanPhone = gUser.phoneNumber ? gUser.phoneNumber.replace(/\D/g, '').slice(-10) : '';
        const matched = customers.find(
          (c) =>
            (cleanEmail && c.email && c.email.toLowerCase() === cleanEmail) ||
            (cleanPhone && c.phone && c.phone.replace(/\D/g, '') === cleanPhone)
        );
        const displayName = gUser.displayName || matched?.name || (cleanEmail ? cleanEmail.split('@')[0] : 'Customer');
        const customerProfile: CustomerProfile = {
          id: matched ? matched.id : `cust_${Date.now()}`,
          name: displayName,
          phone: cleanPhone || matched?.phone || '',
          email: cleanEmail,
          address: matched?.address || {
            street: 'Main Road',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110001',
            landmark: ''
          },
          registeredAt: matched?.registeredAt || new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          lastLoginAt: 'Just now',
          totalOrdersCount: matched?.totalOrdersCount || 0,
          totalSpent: matched?.totalSpent || 0
        };

        setCurrentCustomer(customerProfile);
        try {
          localStorage.setItem('vls_current_customer', JSON.stringify(customerProfile));
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}

        if (cleanEmail === 'kp902430@gmail.com') {
          const ownerSess: OwnerSession = {
            isLoggedIn: true,
            email: 'kp902430@gmail.com',
            name: displayName || 'Kamal (Owner)',
            role: 'Store Owner',
            loginTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          };
          setOwnerSession(ownerSess);
          try {
            localStorage.setItem('vls_owner_session', JSON.stringify(ownerSess));
          } catch {}
          showToast(`👑 Store Owner Verified! Welcome back. Merchant dashboard unlocked.`);
        } else {
          setOwnerSession(null);
          try {
            localStorage.removeItem('vls_owner_session');
          } catch {}
          showToast(`Google account verified! Welcome back, ${displayName}.`);
        }
      }
    }).catch((err) => {
      console.warn('Google redirect check skipped or unavailable in this environment:', err);
    });
  }, [customers]);

  // Deep Link Saree Auto-Opener: Opens saree when visiting from shared WhatsApp / deep link
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const sareeId = params.get('saree');
      if (sareeId && sarees.length > 0) {
        const targetSaree = sarees.find((s) => s.id === sareeId);
        if (targetSaree) {
          setSelectedSaree(targetSaree);
        }
      }
    } catch (e) {
      console.warn('Error reading deep link parameter:', e);
    }
  }, [sarees]);

  // Sync selectedSaree to browser URL search parameter for seamless direct sharing
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      if (selectedSaree) {
        if (url.searchParams.get('saree') !== selectedSaree.id) {
          url.searchParams.set('saree', selectedSaree.id);
          window.history.replaceState({}, '', url.toString());
        }
      } else {
        if (url.searchParams.has('saree')) {
          url.searchParams.delete('saree');
          window.history.replaceState({}, '', url.toString());
        }
      }
    } catch (e) {
      console.warn('Error synchronizing URL parameter:', e);
    }
  }, [selectedSaree]);

  // Cart operations
  const handleAddToCart = (saree: Saree, stitchBlouse = false) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.saree.id === saree.id && item.stitchBlouse === stitchBlouse);
      if (existing) {
        return prev.map((item) =>
          item.saree.id === saree.id && item.stitchBlouse === stitchBlouse
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { saree, quantity: 1, stitchBlouse }];
    });
    showToast(`Added "${saree.title}" to Bag!`);
  };

  const handleUpdateCartQuantity = (sareeId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.saree.id === sareeId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (sareeId: string) => {
    setCart((prev) => prev.filter((item) => item.saree.id !== sareeId));
    showToast('Item removed from Bag');
  };

  // Wishlist operations
  const handleToggleWishlist = (saree: Saree) => {
    setWishlist((prev) => {
      const exists = prev.some((s) => s.id === saree.id);
      if (exists) {
        showToast(`Removed from Wishlist`);
        return prev.filter((s) => s.id !== saree.id);
      } else {
        showToast(`Saved to Wishlist!`);
        return [...prev, saree];
      }
    });
  };

  // Checkout flow trigger: checks login compulsory status for COD
  const initiateCheckoutFlow = (discountAmount?: number, coupon?: string) => {
    if (discountAmount !== undefined) setCheckoutDiscount(discountAmount);
    if (coupon !== undefined) setCheckoutCoupon(coupon);

    // If customer is already logged in with email, open checkout directly (COD available)
    if (currentCustomer?.email && currentCustomer.email.trim().includes('@')) {
      setIsCheckoutOpen(true);
      return;
    }

    // If not logged in, prompt customer: email login compulsory for COD, else advance online pay required
    setIsOrderLoginPromptOpen(true);
  };

  // Buy Now
  const handleBuyNow = (saree: Saree, stitchBlouse = false) => {
    setCart([{ saree, quantity: 1, stitchBlouse }]);
    const discount = Math.round(saree.price * 0.1);
    initiateCheckoutFlow(discount, 'VIRAL10');
  };

  // Owner Product Management (Restricted to kp902430@gmail.com)
  const handleTriggerAddSaree = () => {
    if (isOwnerAuthorized) {
      setIsAddSareeOpen(true);
    } else {
      showToast('Store Owner access is only for kp902430@gmail.com.');
      setIsCustomerAuthOpen(true);
    }
  };

  const handleAddNewSaree = async (newSaree: Saree, customTagline?: string, shouldBroadcast: boolean = true) => {
    setSarees((prev) => [newSaree, ...prev]);
    showToast(`🎉 "${newSaree.title}" published to live catalogue!`);
    try {
      await saveSareeToCloud(newSaree);
      if (shouldBroadcast) {
        // Automatically broadcast new catalogue alert to all registered customers via email
        broadcastNewCatalogueEmail(newSaree, customers, customTagline).then((res) => {
          if (res.success && res.sentCount > 0) {
            showToast(`📢 New arrival email sent to ${res.sentCount} customer(s)!`);
          }
        }).catch((broadcastErr) => {
          console.warn('Background broadcast error:', broadcastErr);
        });
      }
    } catch (err) {
      console.error('Failed to sync new saree to Cloud Firestore:', err);
    }
  };

  const handleUpdateSaree = async (updatedSaree: Saree) => {
    setSarees((prev) =>
      prev.map((s) => (s.id === updatedSaree.id ? updatedSaree : s))
    );
    showToast(`✅ "${updatedSaree.title}" & Category updated!`);
    try {
      await saveSareeToCloud(updatedSaree);
    } catch (err) {
      console.error('Failed to sync updated saree to Cloud Firestore:', err);
    }
  };

  const handleToggleStock = async (sareeId: string) => {
    const current = sarees.find((s) => s.id === sareeId);
    const newStock = !current?.inStock;
    setSarees((prev) =>
      prev.map((s) => (s.id === sareeId ? { ...s, inStock: newStock } : s))
    );
    showToast('Stock status updated');
    try {
      await updateSareeStockInCloud(sareeId, newStock);
    } catch (err) {
      console.error('Failed to update stock in cloud:', err);
    }
  };

  const handleDeleteSaree = async (sareeId: string) => {
    setSarees((prev) => prev.filter((s) => s.id !== sareeId));
    showToast('Item removed from catalogue');
    try {
      await deleteSareeFromCloud(sareeId);
    } catch (err) {
      console.error('Failed to delete saree from cloud:', err);
    }
  };

  const handleOwnerLogout = () => {
    setOwnerSession(null);
    try {
      localStorage.removeItem('vls_owner_session');
    } catch {}
    showToast('Logged out from Owner Portal');
  };

  // Reels Handlers
  const handleOpenReel = (reelOrId: SareeReel | string) => {
    const id = typeof reelOrId === 'string' ? reelOrId : reelOrId.id;
    setSelectedReelId(id);
    setIsReelPlayerOpen(true);
  };

  const handleLikeReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) =>
        r.id === reelId ? { ...r, likes: r.likes + 1 } : r
      )
    );
    showToast('Liked Saree Reel ❤️');
  };

  const handleAddNewReel = async (newReel: SareeReel) => {
    setReels((prev) => [newReel, ...prev]);
    showToast(`🎬 "${newReel.caption}" Reel added successfully!`);
    try {
      await saveReelToCloud(newReel);
    } catch (err) {
      console.error('Failed to save reel to cloud:', err);
    }
  };

  const handleTriggerAddReel = () => {
    if (isOwnerAuthorized) {
      setIsAddReelOpen(true);
    } else {
      showToast('Store Owner access is only for kp902430@gmail.com.');
      setIsCustomerAuthOpen(true);
    }
  };

  // Customer Account Management
  const handleCustomerLogin = (profile: CustomerProfile) => {
    setCurrentCustomer(profile);
    const updatedProfile: CustomerProfile = {
      ...profile,
      lastLoginAt: new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setCustomers((prev) => {
      const cleanPhone = profile.phone.replace(/\D/g, '');
      const existsIndex = prev.findIndex(
        (c) => (c.phone && c.phone.replace(/\D/g, '') === cleanPhone) || (profile.email && c.email === profile.email)
      );
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = {
          ...updated[existsIndex],
          ...updatedProfile
        };
        return updated;
      }
      return [updatedProfile, ...prev];
    });

    // Save customer profile and login record to Cloud Firestore in real time
    saveCustomerToCloud(updatedProfile).catch((err) => {
      console.warn('Could not sync customer to Firestore on login:', err);
    });
    recordCustomerLoginToCloud(updatedProfile).catch((err) => {
      console.warn('Could not record customer login event:', err);
    });
    // Send automated real-time notification to owner
    notifyOwnerOfCustomerLogin(updatedProfile).catch((err) => {
      console.warn('Could not notify owner of login event:', err);
    });

    const normalizedEmail = (profile.email || '').trim().toLowerCase();
    if (normalizedEmail === 'kp902430@gmail.com') {
      const ownerSess: OwnerSession = {
        isLoggedIn: true,
        email: 'kp902430@gmail.com',
        name: profile.name || 'Kamal (Viral Sarees Owner)',
        role: 'Store Owner',
        loginTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setOwnerSession(ownerSess);
      try {
        localStorage.setItem('vls_owner_session', JSON.stringify(ownerSess));
      } catch {}
      showToast('👑 Store Owner Verified! Merchant controls & inventory dashboard unlocked.');
    } else {
      // Any other customer or visitor: strictly ensure owner session is wiped and null
      setOwnerSession(null);
      try {
        localStorage.removeItem('vls_owner_session');
      } catch {}
      showToast(`Welcome back, ${profile.name}!`);
    }

    if (pendingCheckoutAfterLogin) {
      setPendingCheckoutAfterLogin(false);
      setIsCheckoutOpen(true);
      showToast('🎉 Email Verified! Cash on Delivery (COD) unlocked for your order.');
    }
  };

  const handleCustomerLogout = () => {
    setCurrentCustomer(null);
    setOwnerSession(null);
    try {
      localStorage.removeItem('vls_current_customer');
      localStorage.removeItem('vls_owner_session');
    } catch {}
    showToast('Signed out successfully');
  };

  // Order Placement
  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem('vls_customer_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setCart([]); // Clear cart
    try {
      localStorage.setItem('vls_cart_items', JSON.stringify([]));
    } catch {}
    setTrackingTargetOrderId(newOrder.id);
    setSuccessOrder(newOrder); // Opens the comprehensive Order Success Modal with WhatsApp dispatch & invoice option!
    showToast(`Order Confirmed! Booking ID: ${newOrder.id}`);

    // Persist new order to Cloud Firestore in real time so owner receives it instantly!
    saveOrderToCloud(newOrder).catch((err) => {
      console.warn('Could not sync order to Cloud Firestore immediately:', err);
    });

    // Notify store owner with real-time email containing complete Excel-like order breakdown
    notifyOwnerOfNewOrder(newOrder).catch((err) => {
      console.warn('Could not notify owner of new order:', err);
    });

    // Update or register customer record in store customer database
    setCustomers((prev) => {
      const cleanPhone = newOrder.phone.replace(/\D/g, '');
      const existsIndex = prev.findIndex((c) => c.phone.replace(/\D/g, '') === cleanPhone);
      let updated: CustomerProfile[];
      let profileToSave: CustomerProfile;
      if (existsIndex >= 0) {
        updated = [...prev];
        const prevCust = updated[existsIndex];
        profileToSave = {
          ...prevCust,
          name: newOrder.customerName || prevCust.name,
          address: newOrder.shippingAddress,
          totalOrdersCount: (prevCust.totalOrdersCount || 0) + 1,
          totalSpent: (prevCust.totalSpent || 0) + newOrder.totalAmount,
          lastLoginAt: 'Just now'
        };
        updated[existsIndex] = profileToSave;
      } else {
        profileToSave = {
          id: `cust-${Date.now()}`,
          name: newOrder.customerName,
          phone: newOrder.phone,
          email: newOrder.email,
          address: newOrder.shippingAddress,
          registeredAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          lastLoginAt: 'Just now',
          totalOrdersCount: 1,
          totalSpent: newOrder.totalAmount
        };
        updated = [profileToSave, ...prev];
      }
      try {
        localStorage.setItem('vls_customers_db', JSON.stringify(updated));
      } catch {}

      // Save customer profile to Cloud Firestore
      saveCustomerToCloud(profileToSave).catch((err) => {
        console.warn('Could not sync customer to Firestore:', err);
      });

      return updated;
    });

    // Auto-update current customer session if logged in or set active
    setCurrentCustomer((prev) => {
      let custProfile: CustomerProfile;
      if (prev) {
        custProfile = {
          ...prev,
          name: newOrder.customerName || prev.name,
          phone: newOrder.phone || prev.phone,
          email: newOrder.email || prev.email,
          address: newOrder.shippingAddress,
          totalOrdersCount: (prev.totalOrdersCount || 0) + 1,
          totalSpent: (prev.totalSpent || 0) + newOrder.totalAmount
        };
      } else {
        custProfile = {
          id: `cust-${Date.now()}`,
          name: newOrder.customerName,
          phone: newOrder.phone,
          email: newOrder.email,
          address: newOrder.shippingAddress,
          registeredAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          lastLoginAt: 'Just now',
          totalOrdersCount: 1,
          totalSpent: newOrder.totalAmount
        };
      }
      try {
        localStorage.setItem('vls_current_customer', JSON.stringify(custProfile));
      } catch {}
      return custProfile;
    });
  };

  // Order status management from Owner Dashboard
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['orderStatus'], trackingNumber?: string) => {
    let updatedOrderObj: Order | undefined;
    setOrders((prev) => {
      const updated = prev.map((o) => {
        if (o.id === orderId) {
          const newTimeline = [...(o.timeline || [])];
          newTimeline.push({
            title: `Order Status: ${newStatus}`,
            location: STORE_CONFIG.dispatchHub,
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            completed: true,
            description: trackingNumber
              ? `Courier AWB updated to ${trackingNumber}. Dispatching from Surat Hub.`
              : `Order status moved to ${newStatus}.`
          });
          const mod: Order = {
            ...o,
            orderStatus: newStatus,
            trackingNumber: trackingNumber || o.trackingNumber,
            timeline: newTimeline
          };
          updatedOrderObj = mod;
          return mod;
        }
        return o;
      });
      try {
        localStorage.setItem('vls_customer_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (updatedOrderObj) {
      updateOrderInCloud(orderId, {
        orderStatus: newStatus,
        trackingNumber: trackingNumber || (updatedOrderObj as Order).trackingNumber,
        timeline: (updatedOrderObj as Order).timeline
      }).catch((e) => console.warn('Could not sync status update to Cloud Firestore:', e));
    }

    showToast(`Order ${orderId} updated to "${newStatus}"!`);
  };

  // Return request submission
  const handleSubmitReturn = (request: ReturnRequest) => {
    showToast(`Return Request #${request.id} submitted for ${request.orderId}!`);
    // update order status
    setOrders((prev) =>
      prev.map((o) => (o.id === request.orderId ? { ...o, orderStatus: 'Return Requested' } : o))
    );
  };

  // Customer Review Submission
  const handleAddReview = (sareeId: string, newReview: Review) => {
    let updatedSareeToSync: Saree | null = null;

    setSarees((prevSarees) => {
      const updated = prevSarees.map((s) => {
        if (s.id === sareeId) {
          const baseReviews = s.reviews && s.reviews.length > 0 ? s.reviews : getDefaultReviewsForSaree(s);
          const updatedReviews = [newReview, ...baseReviews];
          const newAvgRating = calculateAverageRating(updatedReviews, s.rating);
          const updatedSaree: Saree = {
            ...s,
            reviews: updatedReviews,
            reviewsCount: updatedReviews.length,
            rating: newAvgRating
          };
          updatedSareeToSync = updatedSaree;
          return updatedSaree;
        }
        return s;
      });
      try {
        localStorage.setItem('vls_catalogue_sarees', JSON.stringify(updated));
        localStorage.setItem('vls_sarees_catalog', JSON.stringify(updated));
      } catch {
        // ignore storage quota error
      }
      return updated;
    });

    // Sync updated reviews & rating to Cloud Firestore so all shoppers and devices see the new average rating
    if (updatedSareeToSync) {
      saveSareeToCloud(updatedSareeToSync).catch((err) => {
        console.warn('Could not sync review to Firestore:', err);
      });
    }

    setSelectedSaree((prev) => {
      if (!prev || prev.id !== sareeId) return prev;
      const baseReviews = prev.reviews && prev.reviews.length > 0 ? prev.reviews : getDefaultReviewsForSaree(prev);
      const updatedReviews = [newReview, ...baseReviews];
      const newAvgRating = calculateAverageRating(updatedReviews, prev.rating);
      return {
        ...prev,
        reviews: updatedReviews,
        reviewsCount: updatedReviews.length,
        rating: newAvgRating
      };
    });

    showToast('Verified customer review submitted successfully! Average rating updated.');
  };

  // Dynamic Categories derived directly from current sarees list
  const dynamicCategories = useMemo(() => {
    return getDynamicCategories(sarees);
  }, [sarees]);

  // Filtered & Sorted Sarees
  const filteredSarees = useMemo(() => {
    return sarees.filter((saree) => {
      // Category filter with alias & custom category matching
      if (selectedCategory !== 'all' && !isSareeMatchingCategory(saree, selectedCategory)) {
        return false;
      }
      // Occasion filter
      if (selectedOccasion !== 'All Occasions' && saree.occasion !== selectedOccasion) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = saree.title.toLowerCase().includes(query);
        const matchesFabric = saree.fabric.toLowerCase().includes(query);
        const matchesSku = saree.sku.toLowerCase().includes(query);
        const matchesWork = saree.work.toLowerCase().includes(query);
        const matchesDesc = saree.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesFabric && !matchesSku && !matchesWork && !matchesDesc) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      // Default: featured (bestsellers first)
      if (a.isBestseller && !b.isBestseller) return -1;
      if (!a.isBestseller && b.isBestseller) return 1;
      return 0;
    });
  }, [sarees, selectedCategory, selectedOccasion, searchTerm, sortBy]);

  const containerBgClass =
    themeMode === 'peacock'
      ? 'bg-[#F2F7FA]'
      : themeMode === 'emerald'
      ? 'bg-[#F2F7F4]'
      : 'bg-[#FCF9F5]';

  return (
    <div className={`min-h-screen ${containerBgClass} flex flex-col justify-between transition-colors duration-500 w-full overflow-x-hidden`}>
      
      {/* Top Navbar */}
      <Navbar
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        wishlistCount={wishlist.length}
        ownerSession={isOwnerAuthorized ? ownerSession : null}
        currentCustomer={currentCustomer}
        onOpenCustomerAuth={() => setIsCustomerAuthOpen(true)}
        themeMode={themeMode}
        onThemeChange={handleThemeChange}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenTracking={() => {
          setActiveView('tracking');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenReturnPolicy={() => setIsReturnPolicyOpen(true)}
        onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)}
        onOpenAddSaree={handleTriggerAddSaree}
        onOpenOwnerDashboard={handleOpenOwnerPortal}
        onOpenReels={() => {
          setActiveView('reels');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenInstallApp={() => setIsInstallAppOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sarees={sarees}
        onSelectSaree={(saree) => setSelectedSaree(saree)}
        onGoHome={() => setActiveView('home')}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-amber-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border border-amber-400/30 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Content Views */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 pt-3 sm:pt-5">
        
        {/* VIEW 1: Order Tracking Page */}
        {activeView === 'tracking' && (
          <OrderTrackingView
            orders={orders}
            onOpenReturnRequest={(orderId) => {
              setTrackingTargetOrderId(orderId);
              setIsReturnPolicyOpen(true);
            }}
            onContinueShopping={() => setActiveView('home')}
            onViewInvoice={(ord) => setInvoiceOrder(ord)}
            defaultOrderId={trackingTargetOrderId}
          />
        )}

        {/* VIEW 2: Return Policy & Unboxing Video Rules Dedicated Page */}
        {activeView === 'returns' && (
          <div className="py-6 animate-fadeIn">
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-md space-y-6">
              <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-stone-900 font-serif-brand">
                    Viral Sarees - 7-Day Return & Exchange Policy
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Surat & Banarasi Handloom Return & Replacement Guidelines
                  </p>
                </div>
                <button
                  onClick={() => setIsReturnPolicyOpen(true)}
                  className="px-4 py-2 bg-[#800020] text-amber-100 rounded-xl font-bold text-xs hover:bg-[#9B111E] transition cursor-pointer self-start sm:self-auto"
                >
                  Submit Return Request Form
                </button>
              </div>

              {/* Highlighting the unboxing video requirement as explicitly demanded in prompt */}
              <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 text-stone-900 space-y-3">
                <div className="flex items-center gap-2 text-rose-900 font-extrabold text-base">
                  <ShieldAlert className="w-6 h-6 text-rose-800 shrink-0" />
                  <span>MANDATORY REQUIREMENT: UNBOXING VIDEO COMPULSORY FOR ALL CLAIMS</span>
                </div>
                <div className="text-xs text-stone-800 space-y-2 leading-relaxed">
                  <p className="font-bold text-rose-950">
                    If a customer claims a product was not received (missing item inside parcel), an incorrect saree was delivered, or the fabric arrived damaged/torn:
                  </p>
                  <p>
                    Under our loss prevention and courier fraud protection rules, <strong>an unbroken, continuous 360-degree Unboxing Video recorded prior to breaking the courier seal is strictly COMPULSORY</strong>.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 font-medium text-stone-700">
                    <li>The recording must begin before cutting or peeling open the sealed courier package.</li>
                    <li>The shipping label (AWB barcode, customer name, and address) must be clearly visible to the camera.</li>
                    <li>The video must clearly capture all 6 sides of the package to verify it has not been previously tampered with.</li>
                    <li>The entire unpacking and inspection must be captured in one single uncut video file and reported within 48 hours of delivery.</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <h4 className="font-bold text-stone-900">7-Day Free Returns</h4>
                  <p className="text-stone-600">Unused sarees with original Silk Mark tags & unstitched blouse intact.</p>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <h4 className="font-bold text-stone-900">Doorstep Courier Pickup</h4>
                  <p className="text-stone-600">BlueDart / Delhivery reverse courier arranged within 24-48 hours.</p>
                </div>
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <h4 className="font-bold text-stone-900">100% Full Refund</h4>
                  <p className="text-stone-600">Refund credited directly to your original payment method, UPI, or Store Wallet.</p>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-stone-200">
                <button
                  onClick={() => setActiveView('home')}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-100"
                >
                  ← Back to Catalogue
                </button>
                <button
                  onClick={() => setIsReturnPolicyOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-[#800020] text-amber-100 font-bold text-xs hover:bg-[#9B111E]"
                >
                  Start Return / Exchange Flow →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Privacy Policy Dedicated Page */}
        {activeView === 'privacy' && (
          <div className="py-6 animate-fadeIn">
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-md space-y-6 text-xs text-stone-700">
              <div className="border-b border-stone-200 pb-4">
                <h2 className="text-2xl font-bold text-stone-900 font-serif-brand">
                  Viral Sarees Privacy & Payment Security Policy
                </h2>
                <p className="text-stone-500 mt-1">
                  100% Safe Shopping with 256-Bit SSL Encrypted Payment Gateways
                </p>
              </div>
              <div className="space-y-4 leading-relaxed">
                <p>
                  At <strong>Viral Sarees</strong>, we prioritize customer trust, secure payment handling, and privacy. We comply strictly with Indian e-commerce consumer guidelines and IT security standards.
                </p>
                <h4 className="font-bold text-stone-900 text-sm">Secure Payment Gateways</h4>
                <p>
                  All transactions via UPI (GPay, PhonePe, Paytm), RuPay, Visa, Mastercard, and NetBanking are routed through certified, Level 1 PCI-DSS compliant banking partners. We never store credit/debit card numbers or bank credentials on our servers.
                </p>
                <h4 className="font-bold text-stone-900 text-sm">Strict Anti-Fraud Unboxing Verification</h4>
                <p>
                  Videos provided for missing item claims or damage inquiries are handled confidentially and accessed strictly for courier claim investigations and reverse reimbursement.
                </p>
              </div>
              <button
                onClick={() => setActiveView('home')}
                className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition"
              >
                ← Return to Home Catalogue
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: Saree Reels Feed Discovery */}
        {activeView === 'reels' && (
          <ReelsFeedView
            sarees={sarees}
            reels={reels}
            onSelectReel={handleOpenReel}
            onAddToCart={(s) => handleAddToCart(s)}
            onBuyNow={(s) => handleBuyNow(s)}
            onBackToCatalogue={() => setActiveView('home')}
          />
        )}

        {/* VIEW 5: Main Shopping Catalogue (Default View) */}
        {activeView === 'home' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Clean Hero Header with Logo, Title, Taglines & Store Description */}
            <HeroBanner
              onExploreClick={() => {
                const el = document.getElementById('saree-catalogue-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onTrackClick={() => setActiveView('tracking')}
              onReturnPolicyClick={() => setIsReturnPolicyOpen(true)}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              onOpenReels={() => setActiveView('reels')}
              onInstallAppClick={() => setIsInstallAppOpen(true)}
            />

            {/* Saree Catalogue Section: Directly after Description */}
            <div id="saree-catalogue-section" className="space-y-6">
              
              {/* Category Filter Horizontal Scrollbar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-200/80">
                {dynamicCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#800020] text-amber-100 shadow-md shadow-rose-950/20 ring-2 ring-amber-400/40'
                        : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400 hover:text-stone-900'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      selectedCategory === cat.id ? 'bg-amber-400 text-stone-950' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sub-Filter Controls: Occasion, Sort, Result Count, Owner Controlled Add Button */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
                
                <div className="flex flex-wrap items-center gap-3">
                  {/* Occasion Filter */}
                  <div className="flex items-center gap-1.5 text-xs text-stone-600">
                    <Filter className="w-3.5 h-3.5 text-stone-400" />
                    <span className="font-bold">Occasion:</span>
                    <select
                      value={selectedOccasion}
                      onChange={(e) => setSelectedOccasion(e.target.value)}
                      className="px-2.5 py-1 rounded-lg border border-stone-300 text-xs font-medium bg-stone-50"
                    >
                      {OCCASIONS.map((occ) => (
                        <option key={occ} value={occ}>{occ}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div className="flex items-center gap-1.5 text-xs text-stone-600">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
                    <span className="font-bold">Sort By:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-2.5 py-1 rounded-lg border border-stone-300 text-xs font-medium bg-stone-50"
                    >
                      <option value="featured">Featured / Bestseller</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Customer Rating</option>
                    </select>
                  </div>
                </div>

                {/* Saree Count & Restricted Owner Action */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-500 font-medium">
                    Showing <strong>{filteredSarees.length}</strong> Sarees
                  </span>

                  {/* Saree Count & Restricted Owner Action (Strictly kp902430@gmail.com only) */}
                  {isOwnerAuthorized && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTriggerAddReel}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Add Video Reel for a Saree"
                      >
                        <Film className="w-3.5 h-3.5 text-rose-800" />
                        <span>+ Reel</span>
                      </button>
                      <button
                        id="owner-add-saree-btn"
                        onClick={() => setIsAddSareeOpen(true)}
                        className="px-3.5 py-1.5 bg-[#800020] hover:bg-[#9B111E] text-amber-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-300" />
                        <span>+ Add Saree</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Sarees Grid */}
              {filteredSarees.length === 0 ? (
                <div className="py-16 px-4 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
                  <Package className="w-12 h-12 text-stone-300 mx-auto" />
                  <h3 className="text-base font-bold text-stone-800">
                    {sarees.length === 0 ? 'No sarees currently in the catalog' : 'No Sarees Found Matching Your Filters'}
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    {sarees.length === 0
                      ? (isOwnerAuthorized
                          ? 'You are signed in as Store Owner. Click below to upload saree photos and publish items!'
                          : 'New handcrafted collections and trending weaves will be live shortly.')
                      : 'Try clearing your search term or selecting "All Sarees" to view our complete collection.'}
                  </p>
                  {sarees.length === 0 ? (
                    isOwnerAuthorized ? (
                      <button
                        onClick={() => setIsAddSareeOpen(true)}
                        className="px-5 py-2.5 bg-[#800020] hover:bg-[#9B111E] text-amber-100 text-xs font-bold rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Camera className="w-4 h-4 text-amber-300" />
                        <span>+ Add Saree Photo</span>
                      </button>
                    ) : null
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedOccasion('All Occasions');
                        setSearchTerm('');
                      }}
                      className="px-4 py-2 bg-[#800020] text-amber-100 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredSarees.map((saree) => (
                    <SareeCard
                      key={saree.id}
                      saree={saree}
                      isWishlisted={wishlist.some((w) => w.id === saree.id)}
                      hasReel={reels.some((r) => r.sareeId === saree.id)}
                      onWatchReel={(sareeId) => {
                        const matched = reels.find((r) => r.sareeId === sareeId);
                        if (matched) handleOpenReel(matched.id);
                      }}
                      onToggleWishlist={handleToggleWishlist}
                      onSelectSaree={(s) => setSelectedSaree(s)}
                      onAddToCart={(s) => handleAddToCart(s)}
                      onShare={(s) => showToast(`🔗 Link to "${s.title}" copied! Share it with friends & family.`)}
                    />
                  ))}
                </div>
              )}

            </div>

            {/* Trending Saree Video Reels & Stories (Placed after Catalogue Products) */}
            <div className="pt-4 border-t border-stone-200/80 space-y-4">
              <ReelsStoryBar
                reels={reels}
                onSelectReel={handleOpenReel}
                onOpenAllReels={() => {
                  setActiveView('reels');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>

            {/* Featured Saree Video Drapes & Reels Showcase (वीडियो देखकर खरीदारी करें) */}
            <FeaturedReelsSection
              reels={reels}
              sarees={sarees}
              onSelectReel={(reel) => handleOpenReel(reel.id)}
              onOpenAllReels={() => {
                setActiveView('reels');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onAddToCart={(s) => handleAddToCart(s)}
            />

            {/* Special Highlight on Return & Unboxing Video Policy like Sudathi */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border border-amber-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-900 text-amber-200 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">
                      Viral Sarees Easy Return & Exchange Promise
                    </h3>
                    <p className="text-xs text-stone-600 mt-0.5 max-w-2xl leading-relaxed">
                      Shop with total peace of mind! 7-day doorstep reverse pickup. 
                      <strong> Note: If product is not received or parcel is damaged, a continuous 360° unboxing video from sealed state is strictly compulsory.</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsReturnPolicyOpen(true)}
                  className="px-4 py-2 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold rounded-xl text-xs transition whitespace-nowrap shadow-xs cursor-pointer"
                >
                  Read Video Guidelines →
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        onOpenTracking={() => {
          setActiveView('tracking');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenReturnPolicy={() => setIsReturnPolicyOpen(true)}
        onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* MODALS & DRAWERS */}
      
      {/* Saree Detail Modal */}
      <SareeDetailModal
        saree={selectedSaree}
        isOpen={!!selectedSaree}
        onClose={() => setSelectedSaree(null)}
        onAddToCart={(s, stitch) => handleAddToCart(s, stitch)}
        onBuyNow={(s, stitch) => handleBuyNow(s, stitch)}
        isWishlisted={selectedSaree ? wishlist.some((w) => w.id === selectedSaree.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onOpenReturnPolicy={() => setIsReturnPolicyOpen(true)}
        hasReel={selectedSaree ? reels.some((r) => r.sareeId === selectedSaree.id) : false}
        onWatchReel={() => {
          if (selectedSaree) {
            const matched = reels.find((r) => r.sareeId === selectedSaree.id);
            if (matched) {
              setSelectedSaree(null);
              handleOpenReel(matched.id);
            }
          }
        }}
        onAddReview={handleAddReview}
        onShowToast={(msg) => showToast(msg)}
        currentCustomer={currentCustomer}
        orders={orders}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={(discount, coupon) => {
          setIsCartOpen(false);
          initiateCheckoutFlow(discount, coupon);
        }}
        currentCustomer={currentCustomer}
        onOpenCustomerAuth={() => setIsCustomerAuthOpen(true)}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={(id) => setWishlist((p) => p.filter((s) => s.id !== id))}
        onMoveToCart={(saree) => {
          handleAddToCart(saree);
          showToast(`Moved "${saree.title}" to Bag!`);
        }}
      />

      {/* Pre-Checkout Email Login Prompt Modal (Enforces Email Login for COD) */}
      <OrderLoginPromptModal
        isOpen={isOrderLoginPromptOpen}
        onClose={() => setIsOrderLoginPromptOpen(false)}
        onLoginWithEmail={() => {
          setIsOrderLoginPromptOpen(false);
          setPendingCheckoutAfterLogin(true);
          setIsCustomerAuthOpen(true);
        }}
        onContinueWithoutLogin={() => {
          setIsOrderLoginPromptOpen(false);
          setIsCheckoutOpen(true);
        }}
        itemsCount={cart.length}
      />

      {/* Secure Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        discount={checkoutDiscount}
        appliedCoupon={checkoutCoupon}
        onOrderSuccess={handleOrderSuccess}
        currentCustomer={currentCustomer}
        onOpenCustomerAuth={() => {
          setIsCheckoutOpen(false);
          setPendingCheckoutAfterLogin(true);
          setIsCustomerAuthOpen(true);
        }}
      />

      {/* Customer Account & Authentication Modal */}
      <CustomerAuthModal
        isOpen={isCustomerAuthOpen}
        onClose={() => setIsCustomerAuthOpen(false)}
        currentCustomer={currentCustomer}
        onLogin={handleCustomerLogin}
        onLogout={handleCustomerLogout}
        orders={orders}
        customers={customers}
        onOpenOwnerPortal={handleOpenOwnerPortal}
        onTrackOrder={(orderId) => {
          setTrackingTargetOrderId(orderId);
          setActiveView('tracking');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Return & Exchange Policy Modal (With Unboxing Video Rule) */}
      <ReturnPolicyModal
        isOpen={isReturnPolicyOpen}
        onClose={() => setIsReturnPolicyOpen(false)}
        defaultOrderId={trackingTargetOrderId || (orders.length > 0 ? orders[0].id : '')}
        onSubmitReturnRequest={handleSubmitReturn}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyPolicyOpen}
        onClose={() => setIsPrivacyPolicyOpen(false)}
      />

      {/* Add Saree to Catalogue Modal (Only for Authenticated Owner) */}
      <AddSareeModal
        isOpen={isAddSareeOpen}
        onClose={() => setIsAddSareeOpen(false)}
        onAddSaree={handleAddNewSaree}
        customersCount={customers.length}
      />

      {/* Add Saree Reel Modal (Owner Restricted) */}
      <AddReelModal
        isOpen={isAddReelOpen}
        onClose={() => setIsAddReelOpen(false)}
        sarees={sarees}
        onAddReel={handleAddNewReel}
      />

      {/* Reel Player Modal with 9:16 Video Player & Instant Shop */}
      <ReelPlayerModal
        isOpen={isReelPlayerOpen}
        onClose={() => setIsReelPlayerOpen(false)}
        reels={reels}
        initialReelId={selectedReelId}
        sarees={sarees}
        onAddToCart={(s) => handleAddToCart(s)}
        onBuyNow={(s) => handleBuyNow(s)}
        onSelectSaree={(s) => setSelectedSaree(s)}
        onShowToast={(msg) => showToast(msg)}
      />

      {/* Owner Inventory Dashboard Modal - STRICTLY restricted to kp902430@gmail.com */}
      {isOwnerAuthorized && ownerSession && isOwnerDashboardOpen && (
        <OwnerDashboardModal
          isOpen={isOwnerDashboardOpen}
          onClose={() => setIsOwnerDashboardOpen(false)}
          session={ownerSession}
          sarees={sarees}
          customers={customers}
          orders={orders}
          onOpenAddSaree={() => setIsAddSareeOpen(true)}
          onOpenAddReel={handleTriggerAddReel}
          onToggleStock={handleToggleStock}
          onDeleteSaree={handleDeleteSaree}
          onUpdateSaree={handleUpdateSaree}
          onLogout={handleOwnerLogout}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onViewInvoice={(ord) => setInvoiceOrder(ord)}
          onRefreshOrdersFromCloud={async () => {
            const fresh = await fetchOrdersFromCloud();
            if (fresh && fresh.length > 0) {
              setOrders(fresh);
            }
          }}
        />
      )}

      {/* Official Order Placed Confirmation & WhatsApp Modal */}
      <OrderSuccessModal
        isOpen={!!successOrder}
        onClose={() => setSuccessOrder(null)}
        order={successOrder}
        onTrackOrder={(orderId) => {
          setSuccessOrder(null);
          setTrackingTargetOrderId(orderId);
          setActiveView('tracking');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onViewInvoice={(ord) => {
          setInvoiceOrder(ord);
        }}
      />

      {/* Official Tax Invoice & GST Receipt Modal */}
      <InvoiceModal
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
        order={invoiceOrder}
      />

      {/* PWA & Mobile Install Modal (Send to Anyone / 1-Click Install) */}
      <InstallAppModal
        isOpen={isInstallAppOpen}
        onClose={() => setIsInstallAppOpen(false)}
        onShowToast={(msg) => showToast(msg)}
      />

      {/* Offline Status Toast Indicator */}
      <OfflineIndicator />

      {/* Floating Saree Reels Launcher Widget */}
      <FloatingReelsWidget
        onOpenReels={() => {
          setActiveView('reels');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        reelsCount={reels.length}
      />

      {/* Mobile Fixed Bottom Navigation with Prominent Reels Button */}
      <MobileBottomNav
        activeView={activeView}
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        wishlistCount={wishlist.length}
        onGoHome={() => {
          setActiveView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenReels={() => {
          setActiveView('reels');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearch={() => {
          setActiveView('home');
          const el = document.getElementById('navbar-search-input');
          el?.focus();
        }}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
      />

    </div>
  );
}
