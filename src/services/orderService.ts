import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, CustomerProfile } from '../types';

const ORDERS_COLLECTION = 'orders';
const CUSTOMERS_COLLECTION = 'customers';
const LOGINS_COLLECTION = 'customer_logins';

export interface CustomerLoginRecord {
  id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  loginTimestamp: number;
  loginDate: string;
  city?: string;
  pincode?: string;
}

// Clean helper to remove any undefined properties so Firestore doesn't reject write operations
function cleanData<T extends Record<string, any>>(data: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        cleaned[key] = value.map((item) => (typeof item === 'object' && item !== null ? cleanData(item) : item));
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = cleanData(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

/**
 * Fetch all orders directly from Cloud Firestore (on-demand or on page load)
 */
export async function fetchOrdersFromCloud(): Promise<Order[]> {
  try {
    const colRef = collection(db, ORDERS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const ordersList: Order[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Order;
      if (data && data.id) {
        ordersList.push(data);
      }
    });
    ordersList.sort((a, b) => {
      const timeA = (a as any).createdAtTimestamp || 0;
      const timeB = (b as any).createdAtTimestamp || 0;
      return timeB - timeA;
    });
    return ordersList;
  } catch (err) {
    console.error('Failed to fetch orders directly from Firestore:', err);
    return [];
  }
}

/**
 * Fetch registered customers directly from Cloud Firestore
 */
export async function fetchCustomersFromCloud(): Promise<CustomerProfile[]> {
  try {
    const colRef = collection(db, CUSTOMERS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const custList: CustomerProfile[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as CustomerProfile;
      if (data && data.id) {
        custList.push(data);
      }
    });
    return custList;
  } catch (err) {
    console.error('Failed to fetch customers directly from Firestore:', err);
    return [];
  }
}

/**
 * Real-time listener for Orders from Cloud Firestore.
 * When ANY customer places an order on ANY phone or browser,
 * the Store Owner Dashboard updates INSTANTLY across all devices!
 */
export function subscribeToOrders(
  onUpdate: (orders: Order[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const colRef = collection(db, ORDERS_COLLECTION);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const ordersList: Order[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Order;
          if (data && data.id) {
            ordersList.push(data);
          }
        });
        // Sort newest orders first
        ordersList.sort((a, b) => {
          const timeA = (a as any).createdAtTimestamp || 0;
          const timeB = (b as any).createdAtTimestamp || 0;
          return timeB - timeA;
        });
        onUpdate(ordersList);
      },
      (error) => {
        console.warn('Firestore orders live subscription error:', error);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (err: any) {
    console.warn('Could not initialize orders subscription:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Save customer order to Cloud Firestore
 */
export async function saveOrderToCloud(order: Order): Promise<void> {
  if (!order || !order.id) throw new Error('Order ID is required');
  const orderWithTimestamp = {
    ...order,
    createdAtTimestamp: (order as any).createdAtTimestamp || Date.now()
  };
  const cleaned = cleanData(orderWithTimestamp);
  const docRef = doc(db, ORDERS_COLLECTION, order.id);
  await setDoc(docRef, cleaned, { merge: true });
}

/**
 * Update order status or tracking details in Cloud Firestore
 */
export async function updateOrderInCloud(orderId: string, updates: Partial<Order>): Promise<void> {
  if (!orderId) return;
  const cleaned = cleanData(updates);
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(docRef, cleaned);
}

/**
 * Delete or cancel order in Cloud Firestore
 */
export async function deleteOrderFromCloud(orderId: string): Promise<void> {
  if (!orderId) return;
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  await deleteDoc(docRef);
}

/**
 * Real-time listener for registered customers directory
 */
export function subscribeToCustomers(
  onUpdate: (customers: CustomerProfile[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const colRef = collection(db, CUSTOMERS_COLLECTION);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const custList: CustomerProfile[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as CustomerProfile;
          if (data && data.id) {
            custList.push(data);
          }
        });
        onUpdate(custList);
      },
      (error) => {
        console.warn('Firestore customers live subscription error:', error);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (err: any) {
    console.warn('Could not initialize customers subscription:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Save customer profile to Cloud Firestore
 */
export async function saveCustomerToCloud(customer: CustomerProfile): Promise<void> {
  if (!customer || !customer.id) return;
  const cleaned = cleanData(customer);
  const docRef = doc(db, CUSTOMERS_COLLECTION, customer.id);
  await setDoc(docRef, cleaned, { merge: true });
}

/**
 * Record a customer login event to Cloud Firestore for the owner ledger
 */
export async function recordCustomerLoginToCloud(customer: CustomerProfile): Promise<void> {
  if (!customer) return;
  try {
    const loginId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const record: CustomerLoginRecord = {
      id: loginId,
      customerId: customer.id || `cust-${Date.now()}`,
      name: customer.name || 'Valued Customer',
      email: customer.email || '',
      phone: customer.phone || '',
      loginTimestamp: Date.now(),
      loginDate: new Date().toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      city: customer.address?.city || '',
      pincode: customer.address?.pincode || ''
    };
    const cleaned = cleanData(record);
    await setDoc(doc(db, LOGINS_COLLECTION, loginId), cleaned);
  } catch (err) {
    console.warn('Could not record customer login event to Firestore:', err);
  }
}

/**
 * Fetch all customer login events from Cloud Firestore
 */
export async function fetchCustomerLoginsFromCloud(): Promise<CustomerLoginRecord[]> {
  try {
    const snap = await getDocs(collection(db, LOGINS_COLLECTION));
    const list: CustomerLoginRecord[] = [];
    snap.forEach((d) => {
      const data = d.data() as CustomerLoginRecord;
      if (data && data.id) list.push(data);
    });
    list.sort((a, b) => (b.loginTimestamp || 0) - (a.loginTimestamp || 0));
    return list;
  } catch (err) {
    console.warn('Could not fetch customer logins from Firestore:', err);
    return [];
  }
}

/**
 * Sync local offline/sample orders to Firestore so no previous orders are lost
 */
export async function syncLocalOrdersToCloud(localOrders: Order[]): Promise<number> {
  if (!localOrders || localOrders.length === 0) return 0;
  let count = 0;
  try {
    const snap = await getDocs(collection(db, ORDERS_COLLECTION));
    const cloudIds = new Set(snap.docs.map((d) => d.id));
    for (const ord of localOrders) {
      if (ord && ord.id && !cloudIds.has(ord.id)) {
        await saveOrderToCloud(ord);
        count++;
      }
    }
  } catch (e) {
    console.error('Error syncing local orders to cloud:', e);
  }
  return count;
}
