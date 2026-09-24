import { Saree, CustomerProfile } from '../types';

export const INITIAL_SAREES: Saree[] = [];

export const CATEGORIES = [
  { id: 'all', name: 'All Sarees', count: 0, icon: 'Sparkles' },
  { id: 'Banarasi Silk', name: 'Banarasi Silk', count: 0, icon: 'Crown' },
  { id: 'Kanjivaram Silk', name: 'Kanjivaram Silk', count: 0, icon: 'Gem' },
  { id: 'Pure Organza', name: 'Pure Organza', count: 0, icon: 'Feather' },
  { id: 'Paithani Silk', name: 'Paithani Silk', count: 0, icon: 'Flower' },
  { id: 'Bandhani', name: 'Bandhani & Bandhej', count: 0, icon: 'Sun' },
  { id: 'Georgette', name: 'Georgette & Chikankari', count: 0, icon: 'Heart' },
  { id: 'Tissue Silk', name: 'Tissue Silk', count: 0, icon: 'Star' },
  { id: 'Chanderi Silk', name: 'Chanderi & Cotton', count: 0, icon: 'Shirt' },
];

export const OCCASIONS = ['All Occasions', 'Bridal', 'Wedding', 'Festive & Puja', 'Partywear', 'Daily Casual'];

export const SAMPLE_ORDERS: import('../types').Order[] = [];

export const SAMPLE_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'cust-101',
    name: 'Ananya Sharma',
    phone: '9876543210',
    email: 'ananya.sharma@example.com',
    address: {
      street: 'B-104, Shanti Kunj Apartments, MG Road',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      landmark: 'Near Connaught Place'
    },
    registeredAt: '12 Sep 2026',
    lastLoginAt: '18 Sep 2026, 11:30 AM',
    totalOrdersCount: 2,
    totalSpent: 8498
  },
  {
    id: 'cust-102',
    name: 'Pooja Verma',
    phone: '9823145678',
    email: 'pooja.verma@example.com',
    address: {
      street: 'Flat 402, Royal Palms, Civil Lines',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302006',
      landmark: 'Behind Metro Pillar 42'
    },
    registeredAt: '15 Sep 2026',
    lastLoginAt: '17 Sep 2026, 04:15 PM',
    totalOrdersCount: 1,
    totalSpent: 3899
  },
  {
    id: 'cust-103',
    name: 'Sunita Mehra',
    phone: '9123456780',
    email: 'sunita.mehra@example.com',
    address: {
      street: 'House No. 54, Sector 15',
      city: 'Chandigarh',
      state: 'Punjab',
      pincode: '160015',
      landmark: 'Opposite Community Center'
    },
    registeredAt: '16 Sep 2026',
    lastLoginAt: '18 Sep 2026, 09:10 AM',
    totalOrdersCount: 1,
    totalSpent: 4299
  }
];
