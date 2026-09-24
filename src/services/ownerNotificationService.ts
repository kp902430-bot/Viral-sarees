/**
 * Dispatches automated real-time notification to store owner (kp902430@gmail.com, kamal799065@gmail.com)
 * when a customer logs in or places an order, formatted with full Excel-like table data.
 */

import { Order, CustomerProfile } from '../types';

export async function notifyOwnerOfNewOrder(order: Order): Promise<void> {
  try {
    await fetch('/api/notify-owner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'order',
        data: order
      })
    });
  } catch (err) {
    console.warn('Could not dispatch owner order notification:', err);
  }
}

export async function notifyOwnerOfCustomerLogin(customer: CustomerProfile): Promise<void> {
  try {
    await fetch('/api/notify-owner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'login',
        data: customer
      })
    });
  } catch (err) {
    console.warn('Could not dispatch owner customer login notification:', err);
  }
}
