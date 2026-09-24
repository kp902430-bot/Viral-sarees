export type Occasion = 'Bridal' | 'Wedding' | 'Festive & Puja' | 'Partywear' | 'Daily Casual';

export type Fabric = 
  | 'Banarasi Silk' 
  | 'Kanjivaram Silk' 
  | 'Pure Organza' 
  | 'Georgette' 
  | 'Chiffon' 
  | 'Chanderi Silk' 
  | 'Bandhani' 
  | 'Paithani Silk' 
  | 'Tissue Silk'
  | 'Cotton Silk'
  | string;

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase?: boolean;
  location?: string;
  helpfulCount?: number;
}

export interface Saree {
  id: string;
  title: string;
  hindiTitle?: string;
  sku: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  fabric: Fabric;
  category?: string;
  color: string;
  colorHex: string;
  occasion: Occasion;
  zariType: string;
  blousePiece: string;
  length: string;
  border: string;
  work: string;
  description: string;
  images: string[];
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  reviews?: Review[];
  isBestseller?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  tags?: string[];
  careInstructions: string;
}

export interface CartItem {
  saree: Saree;
  quantity: number;
  stitchBlouse?: boolean;
}

export interface TrackingStep {
  title: string;
  location: string;
  time: string;
  completed: boolean;
  description: string;
}

export interface Order {
  id: string;
  orderDate: string;
  customerName: string;
  phone: string;
  email: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  totalAmount: number;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'COD';
  paymentStatus: 'Paid' | 'Pending' | 'COD_Awaited';
  orderStatus: 'Confirmed' | 'Packed' | 'Dispatched' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Return Requested';
  courierName: string;
  trackingNumber: string;
  estimatedDelivery: string;
  timeline: TrackingStep[];
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerPhone: string;
  customerName: string;
  reason: 'Product Not Received / Missing Item' | 'Damaged / Torn Saree' | 'Defective Weaving or Zari' | 'Wrong Product Delivered' | 'Color Mismatch' | 'Other';
  details: string;
  hasUnboxingVideo: boolean;
  videoFileName?: string;
  refundMethod: 'Original Payment Method' | 'UPI' | 'Store Credit (Viral Sarees Wallet)';
  upiId?: string;
  status: 'Under Review' | 'Video Verification Pending' | 'Approved' | 'Replacement Dispatched' | 'Refund Completed' | 'Rejected';
  createdAt: string;
}

export interface OwnerSession {
  isLoggedIn: boolean;
  email: string;
  name: string;
  role: 'Store Owner' | 'Catalogue Manager';
  loginTime: string;
}

export interface SareeReel {
  id: string;
  sareeId: string; // Linked catalogue saree ID
  title: string;
  caption: string;
  videoUrl: string;
  thumbnailUrl: string;
  likes: number;
  views: string;
  modelOrCreator: string;
  creatorHandle: string;
  musicTitle: string;
  drapeStyle: string;
  tags: string[];
  commentsCount: number;
  duration?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  registeredAt: string;
  lastLoginAt: string;
  totalOrdersCount: number;
  totalSpent: number;
}

export type ThemeMode = 'crimson' | 'peacock' | 'emerald';
