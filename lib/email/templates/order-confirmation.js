export default function orderConfirmationTemplate(data) {

  function estimatedDelivery() {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  const {
    name,
    orderId,
    paymentMethod,
    subtotal,
    shippingCost,
    discount = 0,
    couponCode = null,
    totalAmount,
    items,
    address,
    date
  } = data;

  const format = (n) => Number(n || 0).toFixed(2);

  const itemsHTML = items.map(item => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #eeeeee;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="70" style="vertical-align: top;">
              <img src="${item.image || ""}" width="70" height="70" style="border-radius: 8px; object-fit: cover; display: block;" />
            </td>
            <td style="padding-left: 15px; vertical-align: top;">
              <p style="margin: 0; font-family: 'Crimson Text', serif; font-size: 16px; font-weight: 700; color: #111111;">
                ${item.name}
              </p>
              ${item.size ? `<p style="margin: 4px 0 0 0; font-family: system-ui; font-size: 13px; color: #666666;">Size: ${item.size}ml</p>` : ""}
              <p style="margin: 4px 0 0 0; font-family: system-ui; font-size: 13px; color: #666666;">Qty: ${item.quantity}</p>
            </td>
            <td style="text-align: right; vertical-align: top; font-family: 'Crimson Text', serif; font-size: 16px; font-weight: 700; color: #111111;">
              ₹${format(item.price * item.quantity)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      body { margin: 0; padding: 0; background-color: #f7f7f7; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
      table { border-collapse: collapse !important; }
    </style>
  </head>

  <body style="background-color: #f7f7f7; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eeeeee;">
      
      <!-- Header / Logo -->
      <div style="padding: 40px 40px 20px 40px; text-align: center;">
        <img src="https://ravenfragrance.in/logo.png" alt="Raven Fragrance" width="140" style="display: inline-block;" />
      </div>

      <!-- Hero Message -->
      <div style="padding: 0 40px 30px 40px; text-align: center;">
        <h1 style="font-family: 'Crimson Text', serif; font-size: 28px; font-weight: 700; color: #111111; margin: 0 0 10px 0;">
          Order Confirmed
        </h1>
        <p style="font-size: 15px; color: #555555; margin: 0; line-height: 1.5;">
          Thank you for choosing Raven. Your fragrance journey has begun. We’re preparing your order for dispatch.
        </p>
      </div>

      <div style="padding: 0 40px; margin-bottom: 30px;">
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 0;" />
      </div>

      <!-- Order Info Labels -->
      <div style="padding: 0 40px 30px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%" style="padding-bottom: 10px; font-size: 13px; color: #888888; text-transform: uppercase; letter-spacing: 0.05em;">Order ID</td>
            <td width="50%" style="padding-bottom: 10px; font-size: 13px; color: #888888; text-transform: uppercase; letter-spacing: 0.05em; text-align: right;">Date</td>
          </tr>
          <tr>
            <td style="padding-bottom: 20px; font-size: 15px; font-weight: 600; color: #111111;">${orderId}</td>
            <td style="padding-bottom: 20px; font-size: 15px; font-weight: 600; color: #111111; text-align: right;">${date}</td>
          </tr>
          <tr>
            <td width="50%" style="padding-bottom: 10px; font-size: 13px; color: #888888; text-transform: uppercase; letter-spacing: 0.05em;">Payment</td>
            <td width="50%" style="padding-bottom: 10px; font-size: 13px; color: #888888; text-transform: uppercase; letter-spacing: 0.05em; text-align: right;">Delivery Est.</td>
          </tr>
          <tr>
            <td style="font-size: 15px; font-weight: 600; color: #111111;">${paymentMethod}</td>
            <td style="font-size: 15px; font-weight: 600; color: #111111; text-align: right;">${estimatedDelivery()}</td>
          </tr>
        </table>
      </div>

      <!-- Items Table -->
      <div style="padding: 0 40px;">
        <h3 style="font-family: 'Crimson Text', serif; font-size: 20px; font-weight: 700; color: #111111; margin: 0 0 15px 0;">Order Summary</h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${itemsHTML}
        </table>
      </div>

      <!-- Totals -->
      <div style="padding: 20px 40px 30px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-bottom: 10px; font-size: 14px; color: #555555;">Subtotal</td>
            <td style="padding-bottom: 10px; font-size: 14px; color: #111111; text-align: right;">₹${format(subtotal)}</td>
          </tr>
          <tr>
            <td style="padding-bottom: 10px; font-size: 14px; color: #555555;">Shipping</td>
            <td style="padding-bottom: 10px; font-size: 14px; color: #111111; text-align: right;">${shippingCost > 0 ? `₹${format(shippingCost)}` : "Free"}</td>
          </tr>
          ${discount > 0 ? `
          <tr>
            <td style="padding-bottom: 10px; font-size: 14px; color: #1b5e20;">Discount ${couponCode ? `(${couponCode})` : ""}</td>
            <td style="padding-bottom: 10px; font-size: 14px; color: #1b5e20; text-align: right;">- ₹${format(discount)}</td>
          </tr>
          ` : ""}
          <tr>
            <td style="padding-top: 15px; border-top: 1px solid #eeeeee; font-family: 'Crimson Text', serif; font-size: 20px; font-weight: 700; color: #111111;">Total</td>
            <td style="padding-top: 15px; border-top: 1px solid #eeeeee; font-family: 'Crimson Text', serif; font-size: 20px; font-weight: 700; color: #111111; text-align: right;">₹${format(totalAmount)}</td>
          </tr>
        </table>
      </div>

      <!-- Shipping Address -->
      <div style="background-color: #fafafa; padding: 40px;">
        <h3 style="font-family: 'Crimson Text', serif; font-size: 18px; font-weight: 700; color: #111111; margin: 0 0 12px 0;">Shipping Address</h3>
        <div style="font-size: 14px; color: #555555; line-height: 1.6;">
          <p style="margin: 0; color: #111111; font-weight: 600;">${name}</p>
          <p style="margin: 4px 0;">${address.address1}</p>
          ${address.address2 ? `<p style="margin: 4px 0;">${address.address2}</p>` : ""}
          <p style="margin: 4px 0;">${address.city}, ${address.state} - ${address.pincode}</p>
          <p style="margin: 8px 0 0 0; color: #111111;"><strong>Phone:</strong> ${address.phone}</p>
        </div>
      </div>

      <!-- CTA -->
      <div style="padding: 40px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL !== 'http://localhost:3001' && process.env.NEXT_PUBLIC_BASE_URL !== 'http://localhost:3000' ? process.env.NEXT_PUBLIC_BASE_URL : "https://www.ravenfragrance.in"}" 
           style="background-color: #111111; color: #ffffff; padding: 16px 32px; border-radius: 4px; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block; letter-spacing: 0.1em; text-transform: uppercase;">
           Continue Shopping
        </a>
      </div>

      <!-- Footer -->
      <div style="background-color: #f7f7f7; padding: 30px 40px; text-align: center; border-top: 1px solid #eeeeee;">
        <p style="font-size: 12px; color: #999999; margin: 0 0 10px 0; line-height: 1.6;">
          You’re receiving this email because you placed an order on ravenfragrance.in
        </p>
        <p style="font-size: 12px; color: #999999; margin: 0;">
          Need help? Contact us at <a href="mailto:ravenfragrances@gmail.com" style="color: #111111; text-decoration: underline;">ravenfragrances@gmail.com</a>
        </p>
      </div>

    </div>
  </body>
  </html>
  `;
}