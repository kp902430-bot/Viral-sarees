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
    const { saree, customerEmails, customTagline } = req.body || {};

    if (!saree || !saree.title) {
      return res.status(400).json({ success: false, message: 'Saree details are required' });
    }

    // Default taglines if none provided
    const taglines = [
      '✨ Royal Elegance Just Arrived! Trend humse shuru hota hai — Naya Saree Catalogue Abhi Live Hai!',
      '💃 Pehle Aap, Fir Zamana! Introducing our exclusive new Designer Drapes.',
      '🌟 Pure Heritage & Unbeatable Charm! Naya trending collection dekhna na bhulein.',
      '👑 Handpicked Luxury at Wholesale Rates: Nayi Viral Saree abhi store me live hai!'
    ];
    const chosenTagline = customTagline || taglines[Math.floor(Math.random() * taglines.length)];

    // Target recipients: customer emails + store owner notifications
    const targetEmails: string[] = [];
    if (Array.isArray(customerEmails) && customerEmails.length > 0) {
      customerEmails.forEach((e: string) => {
        const clean = String(e || '').trim().toLowerCase();
        if (clean.includes('@') && !targetEmails.includes(clean)) {
          targetEmails.push(clean);
        }
      });
    }

    // Always include owner notifications so owner sees the live broadcast
    const ownerEmails = ['kp902430@gmail.com', 'kamal799065@gmail.com'];
    ownerEmails.forEach((e) => {
      if (!targetEmails.includes(e)) {
        targetEmails.push(e);
      }
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
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Saree Arrival - Viral Sarees</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #fbf7f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fbf7f2; padding: 24px 12px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #ebd9c8; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">
                
                <!-- Royal Brand Banner Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #590417 0%, #800020 50%, #4a0314 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
                    <span style="display: inline-block; padding: 4px 14px; background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; border-radius: 30px; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #fde68a; margin-bottom: 12px;">
                      ✦ NEW CATALOGUE LAUNCH ✦
                    </span>
                    <h1 style="margin: 0; font-family: Georgia, serif; font-size: 32px; letter-spacing: 1px; color: #ffffff; font-weight: bold;">
                      Viral Sarees
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #fecdd3; font-size: 13px; font-style: italic;">
                      Trend humse shuru hota hai • Exclusive Designer & Heritage Sarees
                    </p>
                  </td>
                </tr>

                <!-- Catchy Tagline -->
                <tr>
                  <td style="background-color: #fef3c7; padding: 16px 24px; text-align: center; border-bottom: 1px solid #fde68a;">
                    <p style="margin: 0; color: #92400e; font-size: 15px; font-weight: 700; line-height: 1.4;">
                      "${chosenTagline}"
                    </p>
                  </td>
                </tr>

                <!-- Saree Showcase Body -->
                <tr>
                  <td style="padding: 28px 24px;">
                    
                    <!-- Saree Hero Image -->
                    <div style="text-align: center; margin-bottom: 20px;">
                      <img src="${sareeImageUrl}" alt="${saree.title}" style="width: 100%; max-width: 480px; height: 320px; object-fit: cover; border-radius: 16px; border: 1px solid #f0e2d3; display: block; margin: 0 auto; box-shadow: 0 6px 16px rgba(0,0,0,0.08);" />
                    </div>

                    <!-- Title & Tag -->
                    <div style="text-align: center; margin-bottom: 16px;">
                      <span style="background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px;">
                        ${saree.category || 'Trending Saree'}
                      </span>
                      <h2 style="margin: 10px 0 4px 0; color: #1e293b; font-family: Georgia, serif; font-size: 24px; font-weight: bold;">
                        ${saree.title}
                      </h2>
                      ${saree.hindiTitle ? `<p style="margin: 0; color: #64748b; font-size: 14px;">${saree.hindiTitle}</p>` : ''}
                    </div>

                    <!-- Price & Offer Box -->
                    <div style="background: #faf5eb; border: 2px dashed #800020; border-radius: 16px; padding: 16px 20px; text-align: center; margin-bottom: 24px;">
                      <div style="font-size: 12px; color: #800020; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                        Special Launch Price
                      </div>
                      <div style="font-size: 32px; font-weight: 900; color: #800020; margin: 4px 0;">
                        ₹${saree.price.toLocaleString('en-IN')}
                        <span style="font-size: 16px; color: #94a3b8; text-decoration: line-through; font-weight: normal; margin-left: 8px;">
                          ₹${originalPrice.toLocaleString('en-IN')}
                        </span>
                        <span style="font-size: 14px; background: #16a34a; color: #ffffff; padding: 2px 8px; border-radius: 8px; margin-left: 6px; font-weight: bold;">
                          ${discount}% OFF
                        </span>
                      </div>
                      <div style="font-size: 12px; color: #475569; margin-top: 6px;">
                        ✅ Free Cash on Delivery (COD) • Free Shipping Across India • 7-Day Easy Return
                      </div>
                    </div>

                    <!-- Specs Grid -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="8" style="background: #f8fafc; border-radius: 12px; margin-bottom: 24px; font-size: 13px; color: #334155;">
                      <tr>
                        <td width="50%"><strong>🧵 Fabric:</strong> ${saree.fabric || 'Pure Silk / Designer'}</td>
                        <td width="50%"><strong>🎨 Color:</strong> ${saree.color || 'Royal Palette'}</td>
                      </tr>
                      <tr>
                        <td width="50%"><strong>✨ Work:</strong> ${saree.work || 'Intricate Zari Weaving'}</td>
                        <td width="50%"><strong>👚 Blouse:</strong> ${saree.blousePiece || 'Running Blouse Included'}</td>
                      </tr>
                      <tr>
                        <td colspan="2"><strong>🎉 Occasion:</strong> ${saree.occasion || 'Wedding, Festive & Celebrations'}</td>
                      </tr>
                    </table>

                    <!-- Big CTA Button -->
                    <div style="text-align: center; margin: 30px 0 16px 0;">
                      <a href="https://viralsarees.com" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #800020 0%, #b31237 100%); color: #ffffff; font-weight: 800; font-size: 16px; text-decoration: none; padding: 16px 36px; border-radius: 35px; box-shadow: 0 6px 20px rgba(128,0,32,0.35); letter-spacing: 0.5px;">
                        🛍️ Abhi Order Karein (View on viralsarees.com) &rarr;
                      </a>
                    </div>
                    <p style="text-align: center; color: #64748b; font-size: 12px; margin: 8px 0 0 0;">
                      Limited Stock Available. Har saree video reel dekhkar order karein!
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f1f5f9; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6;">
                    <p style="margin: 0 0 4px 0; font-weight: bold; color: #334155;">Viral Sarees Official Store</p>
                    <p style="margin: 0 0 8px 0;">Website: <a href="https://viralsarees.com" style="color: #800020; font-weight: bold;">https://viralsarees.com</a></p>
                    <p style="margin: 0;">Aapko yeh email isliye bheja gaya hai kyunki aap Viral Sarees ke registered customer hain. Happy Shopping!</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send emails
    let dispatchedCount = 0;
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
        dispatchedCount++;
      } catch (err: any) {
        console.warn(`Could not dispatch broadcast email to ${recipient}:`, err?.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `New Catalogue announcement email sent to ${dispatchedCount} customer(s)!`,
      sentCount: dispatchedCount,
      recipients: targetEmails
    });
  } catch (error: any) {
    console.error('Broadcast email error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Error broadcasting new catalogue email'
    });
  }
}
