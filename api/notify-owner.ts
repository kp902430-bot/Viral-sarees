import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { type, data } = req.body || {};
    if (!type || !data) {
      return res.status(400).json({ success: false, message: 'Type and data are required' });
    }

    const user = 'kp902430@gmail.com';
    const pass = 'zcmenrkwixsqrtdn';

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass }
    });

    const recipients = ['kp902430@gmail.com', 'kamal799065@gmail.com'];
    let subject = '';
    let htmlContent = '';

    if (type === 'order') {
      const order = data;
      const itemsList = Array.isArray(order.items)
        ? order.items.map((i: any) => `${i.saree?.title || 'Saree'} (Qty: ${i.quantity || 1}) - ₹${i.saree?.price || 0}`).join('<br>')
        : 'Saree Item';

      const fullAddress = `${order.shippingAddress?.street || ''}, ${order.shippingAddress?.landmark ? order.shippingAddress.landmark + ', ' : ''}${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}`;

      subject = `📦 Naya Customer Order Aaya! #${order.id} - ₹${(order.totalAmount || 0).toLocaleString('en-IN')} (${order.customerName})`;

      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b;">
          <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="background: linear-gradient(135deg, #107c41 0%, #0d5f32 100%); padding: 20px; color: #ffffff; text-align: center;">
              <span style="background: rgba(255,255,255,0.2); font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; letter-spacing: 1px; text-transform: uppercase;">
                📊 Excel Sheet Live Entry
              </span>
              <h1 style="margin: 8px 0 0 0; font-size: 22px; font-weight: bold;">Naya Customer Order Saved</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Viral Sarees Order Ledger Entry</p>
            </div>

            <div style="padding: 24px;">
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
                <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600;">
                  ✅ Customer ka order aapke Excel Sheet Ledger aur Firestore me 100% save ho gaya hai.
                </p>
              </div>

              <!-- Excel Table Mockup -->
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #cbd5e1; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #0f766e; color: #ffffff; text-align: left;">
                    <th style="padding: 10px; border: 1px solid #0d9488; width: 35%;">Field (Excel Column)</th>
                    <th style="padding: 10px; border: 1px solid #0d9488;">Customer & Order Data (Value)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="background-color: #f8fafc;">
                    <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">Booking / Order ID</td>
                    <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #0f172a;">${order.id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">Customer Name</td>
                    <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: bold;">${order.customerName}</td>
                  </tr>
                  <tr style="background-color: #f8fafc;">
                    <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">Mobile Phone</td>
                    <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-family: monospace;"><a href="tel:${order.phone}" style="color: #0284c7; text-decoration: none;">+91 ${order.phone}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">Email Address</td>
                    <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-family: monospace;">${order.email || '—'}</td>
                  </tr>
                  <tr style="background-color: #f8fafc;">
                    <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">Delivery Address</td>
                    <td style="padding: 9px 12px; border: 1px solid #cbd5e1;">${fullAddress}</td>
                  </tr>
                  <tr>
                    <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">Items Ordered</td>
                    <td style="padding: 9px 12px; border: 1px solid #cbd5e1;">${itemsList}</td>
                  </tr>
                  <tr style="background-color: #f8fafc;">
                    <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">Payment Method</td>
                    <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: ${order.paymentMethod === 'COD' ? '#b45309' : '#047857'};">${order.paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">Total Amount</td>
                    <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-size: 16px; font-weight: 800; color: #15803d;">₹${(order.totalAmount || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style="background-color: #f8fafc;">
                    <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">Order Date & Time</td>
                    <td style="padding: 9px 12px; border: 1px solid #cbd5e1;">${order.orderDate || new Date().toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              <div style="text-align: center; margin-top: 24px;">
                <a href="https://viralsarees.com" target="_blank" style="background: #107c41; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">
                  Open Excel Sheet Ledger on viralsarees.com &rarr;
                </a>
              </div>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
              Viral Sarees • Owner Automated Ledger Notification
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === 'login') {
      const cust = data;
      subject = `👤 Naya Customer Login Alert: ${cust.name || 'Customer'} (+91 ${cust.phone || ''})`;

      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 18px; color: #ffffff; text-align: center;">
              <span style="background: rgba(255,255,255,0.2); font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; letter-spacing: 1px; text-transform: uppercase;">
                📋 Customer Activity Ledger
              </span>
              <h1 style="margin: 8px 0 0 0; font-size: 20px; font-weight: bold;">Naya Customer Login / Registration</h1>
            </div>

            <div style="padding: 24px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #cbd5e1; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #1e3a8a; color: #ffffff;">
                    <th style="padding: 8px 12px; border: 1px solid #1e40af; width: 40%; text-align: left;">Detail</th>
                    <th style="padding: 8px 12px; border: 1px solid #1e40af; text-align: left;">Customer Information</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">Customer Name</td>
                    <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold;">${cust.name || 'Valued Customer'}</td>
                  </tr>
                  <tr style="background-color: #f8fafc;">
                    <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">Mobile Number</td>
                    <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-family: monospace;">+91 ${cust.phone || '—'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">Email Address</td>
                    <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-family: monospace;">${cust.email || '—'}</td>
                  </tr>
                  <tr style="background-color: #f8fafc;">
                    <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">City / Location</td>
                    <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${cust.address?.city || cust.city || '—'}, ${cust.address?.pincode || cust.pincode || ''}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">Total Orders Count</td>
                    <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${cust.totalOrdersCount || 0}</td>
                  </tr>
                  <tr style="background-color: #f8fafc;">
                    <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">Login Timestamp</td>
                    <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${new Date().toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              <div style="text-align: center;">
                <a href="https://viralsarees.com" target="_blank" style="background: #1e40af; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 13px;">
                  Open Merchant Portal &rarr;
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    for (const recipient of recipients) {
      try {
        await transporter.sendMail({
          from: `"Viral Sarees Ledger" <${user}>`,
          to: recipient,
          subject,
          html: htmlContent
        });
      } catch (err: any) {
        console.warn(`Could not send owner notification to ${recipient}:`, err?.message);
      }
    }

    return res.status(200).json({ success: true, message: 'Owner notified successfully' });
  } catch (error: any) {
    console.error('Owner notification error:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Failed to notify owner' });
  }
}
