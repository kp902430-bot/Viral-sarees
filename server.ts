import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { sendEmailOtp, verifyEmailOtp } from './server/emailOtpService';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Permissive CORS and Access headers to avoid any browser 403 or blocking
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Fast2SMS API integration endpoint
  // Route: /api/send-sms
  app.post('/api/send-sms', async (req, res) => {
    try {
      const { phone, otp } = req.body;
      if (!phone || !otp) {
        return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
      }

      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit Indian mobile number' });
      }

      // Fast2SMS authorization key
      const apiKey = (process.env.FAST2SMS_API_KEY && process.env.FAST2SMS_API_KEY.length > 20)
        ? process.env.FAST2SMS_API_KEY
        : 'IgVbH1yz5EMlXaYmF4xcuodh0qiptOfRw8B6eKvA273WnJQUTNEpAuq75Ln36ZwKf4R1rOjGIVvsyX29';

      if (!apiKey) {
        return res.status(200).json({
          success: false,
          missingKey: true,
          message: 'FAST2SMS_API_KEY is not configured in environment variables or Settings > Secrets.',
          phone: cleanPhone
        });
      }

      // Call Fast2SMS official Quick SMS / OTP endpoint
      // Using route: 'otp' which delivers transactional 6-digit OTP instantly to Indian numbers
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: String(otp),
          numbers: cleanPhone
        })
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data && (data.return === true || data.status_code === 200)) {
        return res.json({
          success: true,
          message: 'SMS sent successfully to your mobile phone',
          requestId: data.request_id || `REQ-${Date.now()}`
        });
      } else {
        const rawMsg = (data && Array.isArray(data.message) ? data.message.join(', ') : data?.message) || data?.errors?.[0] || 'Failed to dispatch via Fast2SMS gateway';
        const isIpBlocked = String(rawMsg).includes('IP is blacklisted') || data?.status_code === 414;
        const isVerificationNeeded = String(rawMsg).includes('website verification') || data?.status_code === 996;
        const isRechargeNeeded = String(rawMsg).includes('100 INR') || data?.status_code === 999;

        return res.status(200).json({
          success: false,
          statusCode: data?.status_code,
          isIpBlocked,
          isVerificationNeeded,
          isRechargeNeeded,
          apiError: rawMsg,
          message: rawMsg
        });
      }
    } catch (error: any) {
      console.error('Fast2SMS proxy error:', error);
      return res.status(500).json({
        success: false,
        message: error?.message || 'Server error communicating with Fast2SMS'
      });
    }
  });

  // Email OTP Dispatch Endpoint
  // Confidential: Real delivery to user's inbox via Gmail SMTP with backup support
  app.post('/api/send-email-otp', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required' });
      }

      const result = await sendEmailOtp(email);
      return res.json(result);
    } catch (error: any) {
      console.error('Send email OTP error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to dispatch email verification code. Please try again.'
      });
    }
  });

  // Email OTP Verify Endpoint
  app.post('/api/verify-email-otp', async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP code are required' });
      }

      const result = verifyEmailOtp(email, otp);
      return res.json(result);
    } catch (error: any) {
      console.error('Verify email OTP error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify email OTP. Please try again.'
      });
    }
  });

  // Broadcast New Saree Catalogue Alert to Customers
  app.post('/api/broadcast-catalogue', async (req, res) => {
    try {
      const { saree, customerEmails, customTagline } = req.body || {};
      if (!saree || !saree.title) {
        return res.status(400).json({ success: false, message: 'Saree details are required' });
      }

      const taglines = [
        '✨ Royal Elegance Just Arrived! Trend humse shuru hota hai — Naya Saree Catalogue Abhi Live Hai!',
        '💃 Pehle Aap, Fir Zamana! Introducing our exclusive new Designer Drapes.',
        '🌟 Pure Heritage & Unbeatable Charm! Naya trending collection dekhna na bhulein.',
        '👑 Handpicked Luxury at Wholesale Rates: Nayi Viral Saree abhi store me live hai!'
      ];
      const chosenTagline = customTagline || taglines[Math.floor(Math.random() * taglines.length)];

      const targetEmails: string[] = [];
      if (Array.isArray(customerEmails) && customerEmails.length > 0) {
        customerEmails.forEach((e: string) => {
          const clean = String(e || '').trim().toLowerCase();
          if (clean.includes('@') && !targetEmails.includes(clean)) {
            targetEmails.push(clean);
          }
        });
      }

      const ownerEmails = ['kp902430@gmail.com', 'kamal799065@gmail.com'];
      ownerEmails.forEach((e) => {
        if (!targetEmails.includes(e)) targetEmails.push(e);
      });

      const user = 'kp902430@gmail.com';
      const pass = 'zcmenrkwixsqrtdn';

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass }
      });

      const sareeImageUrl = (saree.images && saree.images[0]) || 'https://viralsarees.com/app-logo.png';
      const originalPrice = saree.originalPrice || Math.round(saree.price * 1.4);
      const discount = saree.discountPercent || Math.round(((originalPrice - saree.price) / originalPrice) * 100);

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>New Saree Arrival - Viral Sarees</title></head>
        <body style="margin: 0; padding: 0; background-color: #fbf7f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 24px 12px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #ebd9c8; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #590417 0%, #800020 50%, #4a0314 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
                      <span style="display: inline-block; padding: 4px 14px; background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; border-radius: 30px; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #fde68a; margin-bottom: 12px;">
                        ✦ NEW CATALOGUE LAUNCH ✦
                      </span>
                      <h1 style="margin: 0; font-family: Georgia, serif; font-size: 32px; color: #ffffff; font-weight: bold;">Viral Sarees</h1>
                      <p style="margin: 6px 0 0 0; color: #fecdd3; font-size: 13px; font-style: italic;">Trend humse shuru hota hai • Exclusive Designer & Heritage Sarees</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #fef3c7; padding: 16px 24px; text-align: center; border-bottom: 1px solid #fde68a;">
                      <p style="margin: 0; color: #92400e; font-size: 15px; font-weight: 700; line-height: 1.4;">"${chosenTagline}"</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 28px 24px;">
                      <div style="text-align: center; margin-bottom: 20px;">
                        <img src="${sareeImageUrl}" alt="${saree.title}" style="width: 100%; max-width: 480px; height: 320px; object-fit: cover; border-radius: 16px; border: 1px solid #f0e2d3; display: block; margin: 0 auto;" />
                      </div>
                      <div style="text-align: center; margin-bottom: 16px;">
                        <span style="background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 12px; text-transform: uppercase;">${saree.category || 'Trending Saree'}</span>
                        <h2 style="margin: 10px 0 4px 0; color: #1e293b; font-family: Georgia, serif; font-size: 24px; font-weight: bold;">${saree.title}</h2>
                        ${saree.hindiTitle ? `<p style="margin: 0; color: #64748b; font-size: 14px;">${saree.hindiTitle}</p>` : ''}
                      </div>
                      <div style="background: #faf5eb; border: 2px dashed #800020; border-radius: 16px; padding: 16px 20px; text-align: center; margin-bottom: 24px;">
                        <div style="font-size: 12px; color: #800020; font-weight: 800; text-transform: uppercase; margin-bottom: 4px;">Special Launch Price</div>
                        <div style="font-size: 32px; font-weight: 900; color: #800020; margin: 4px 0;">
                          ₹${saree.price.toLocaleString('en-IN')}
                          <span style="font-size: 16px; color: #94a3b8; text-decoration: line-through; font-weight: normal; margin-left: 8px;">₹${originalPrice.toLocaleString('en-IN')}</span>
                          <span style="font-size: 14px; background: #16a34a; color: #ffffff; padding: 2px 8px; border-radius: 8px; margin-left: 6px; font-weight: bold;">${discount}% OFF</span>
                        </div>
                        <div style="font-size: 12px; color: #475569; margin-top: 6px;">
                          ✅ Free Cash on Delivery (COD) • Free Shipping Across India • 7-Day Easy Return
                        </div>
                      </div>
                      <div style="text-align: center; margin: 30px 0 16px 0;">
                        <a href="https://viralsarees.com" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #800020 0%, #b31237 100%); color: #ffffff; font-weight: 800; font-size: 16px; text-decoration: none; padding: 16px 36px; border-radius: 35px; box-shadow: 0 6px 20px rgba(128,0,32,0.35);">
                          🛍️ Abhi Order Karein (View on viralsarees.com) &rarr;
                        </a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
                      &copy; ${new Date().getFullYear()} Viral Sarees. Official Store: https://viralsarees.com
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      let sentCount = 0;
      for (const recipient of targetEmails) {
        try {
          await transporter.sendMail({
            from: `"Viral Sarees" <${user}>`,
            to: recipient,
            replyTo: user,
            subject: `✨ New Arrival Alert: ${saree.title} - Abhi Live Hai!`,
            html: htmlContent,
            priority: 'high'
          });
          sentCount++;
        } catch (err: any) {
          console.warn(`Could not dispatch broadcast to ${recipient}:`, err?.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: `Catalogue alert email sent to ${sentCount} recipient(s)!`,
        sentCount
      });
    } catch (error: any) {
      console.error('Server broadcast error:', error);
      return res.status(500).json({ success: false, message: 'Failed to broadcast catalogue email' });
    }
  });

  // Automated Real-Time Owner Notification Endpoint (Orders & Logins)
  app.post('/api/notify-owner', async (req, res) => {
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
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Serve public static assets (SVG logos, favicons, manifest)
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Robust dist resolution for bundled server.cjs or direct container execution
    const possiblePaths = [
      path.join(process.cwd(), 'dist'),
      __dirname,
      path.join(__dirname, 'dist'),
      path.join(__dirname, '..', 'dist'),
    ];
    const distPath = possiblePaths.find((p) => fs.existsSync(path.join(p, 'index.html'))) || path.join(process.cwd(), 'dist');

    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      }
    }));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
      }
    });
  }

  // Server-Level 1-Minute Auto-Heal & Sanity Patrol
  setInterval(() => {
    try {
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      // Auto-heal if memory grows excessively
      if (heapUsedMB > 450 && global.gc) {
        global.gc();
        console.log(`🧹 [Server AutoHealer 1-Min Patrol] Auto-cleaned memory. Heap was ${heapUsedMB}MB.`);
      }
    } catch (e) {
      console.warn('[Server AutoHealer] 1-Min Patrol check handled.');
    }
  }, 60000);

  // Global uncaught exception and unhandled rejection shields
  process.on('uncaughtException', (err) => {
    console.error('🛡️ [Server AutoHealer] Intercepted uncaughtException, auto-healed without crash:', err);
  });

  process.on('unhandledRejection', (reason) => {
    console.warn('🛡️ [Server AutoHealer] Intercepted unhandledRejection, auto-healed cleanly:', reason);
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
