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

  const itemsHTML = items.map(item => {
    const imgSrc = typeof item.image === "string"
      ? item.image
      : item.image?.original || item.image?.thumbnail || "";

    return `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #f0ece3;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="64" style="vertical-align: top;">
              ${imgSrc ? `<img src="${imgSrc}" width="64" height="64" alt="${item.name}" style="border-radius: 8px; object-fit: cover; display: block; border: 1px solid #f0ece3;" />` : `<div style="width: 64px; height: 64px; border-radius: 8px; background: #f5f1e6;"></div>`}
            </td>
            <td style="padding-left: 14px; vertical-align: top;">
              <p style="margin: 0; font-family: system-ui, sans-serif; font-size: 14px; font-weight: 600; color: #1b180d;">
                ${item.name}
              </p>
              ${item.size ? `<p style="margin: 4px 0 0 0; font-family: system-ui, sans-serif; font-size: 12px; color: #6b6654;">Size: ${item.size}ml</p>` : ""}
              <p style="margin: 3px 0 0 0; font-family: system-ui, sans-serif; font-size: 12px; color: #6b6654;">Qty: ${item.quantity}</p>
            </td>
            <td style="text-align: right; vertical-align: top; font-family: system-ui, sans-serif; font-size: 14px; font-weight: 700; color: #1b180d;">
              &#x20B9;${format(item.price * item.quantity)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
  }).join("");

  return `
  <!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>Order Confirmed - Raven Fragrance</title>
    <style>
      :root { color-scheme: light dark; supported-color-schemes: light dark; }
      body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
      table { border-collapse: collapse !important; }

      /* Dark mode overrides for email clients that support it */
      @media (prefers-color-scheme: dark) {
        .email-body { background-color: #1a1a1a !important; }
        .email-container { background-color: #242424 !important; border-color: #333333 !important; }
        .text-dark { color: #f5f5f5 !important; }
        .text-muted { color: #aaaaaa !important; }
        .text-subtle { color: #888888 !important; }
        .bg-light { background-color: #1e1e1e !important; }
        .border-light { border-color: #333333 !important; }
        .logo-light { display: none !important; }
        .logo-dark { display: inline-block !important; }
      }
    </style>
  </head>

  <body class="email-body" style="background-color: #f8f6f1; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px 16px;">
    <div class="email-container" style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.04); border: 1px solid #e7e1cf;">
      
      <!-- Header -->
      <div style="background-color: #1b180d; padding: 24px 40px; text-align: center;">
        <h2 style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: 2px;">
          RAVEN FRAGRANCE
        </h2>
      </div>

      <!-- Confirmation Badge -->
      <div style="padding: 35px 40px 25px 40px; text-align: center;">
        <table align="center" cellpadding="0" cellspacing="0" style="margin: 0 auto 16px;">
          <tr>
            <td style="width: 52px; height: 52px; background-color: #e8f5e9; border-radius: 26px; text-align: center; vertical-align: middle; font-size: 22px; color: #2e7d32;">
              &#10004;
            </td>
          </tr>
        </table>
        <h1 class="text-dark" style="font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 700; color: #1b180d; margin: 0 0 8px 0;">
          Order Confirmed!
        </h1>
        <p class="text-muted" style="font-size: 14px; color: #6b6654; margin: 0; line-height: 1.5;">
          Hi ${name}, thanks for shopping with Raven Fragrance.<br/>We're preparing your order for dispatch.
        </p>
      </div>

      <!-- Order Meta -->
      <div style="padding: 0 40px 28px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fcfbf8; border-radius: 10px; border: 1px solid #f0ece3;">
          <tr>
            <td style="padding: 16px 20px; border-bottom: 1px solid #f0ece3; width: 50%;">
              <p class="text-subtle" style="margin: 0; font-size: 11px; color: #9a864c; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600;">Order ID</p>
              <p class="text-dark" style="margin: 4px 0 0; font-size: 14px; font-weight: 700; color: #1b180d;">${orderId}</p>
            </td>
            <td style="padding: 16px 20px; border-bottom: 1px solid #f0ece3; text-align: right;">
              <p class="text-subtle" style="margin: 0; font-size: 11px; color: #9a864c; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600;">Date</p>
              <p class="text-dark" style="margin: 4px 0 0; font-size: 14px; font-weight: 600; color: #1b180d;">${date}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 20px;">
              <p class="text-subtle" style="margin: 0; font-size: 11px; color: #9a864c; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600;">Payment</p>
              <p class="text-dark" style="margin: 4px 0 0; font-size: 14px; font-weight: 600; color: #1b180d;">${paymentMethod}</p>
            </td>
            <td style="padding: 16px 20px; text-align: right;">
              <p class="text-subtle" style="margin: 0; font-size: 11px; color: #9a864c; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600;">Est. Delivery</p>
              <p class="text-dark" style="margin: 4px 0 0; font-size: 14px; font-weight: 600; color: #1b180d;">${estimatedDelivery()}</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- Items -->
      <div style="padding: 0 40px;">
        <p class="text-dark" style="font-size: 13px; font-weight: 700; color: #1b180d; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 12px;">
          Order Items
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${itemsHTML}
        </table>
      </div>

      <!-- Totals -->
      <div style="padding: 24px 40px 30px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td class="text-muted" style="padding-bottom: 8px; font-size: 13px; color: #6b6654;">Subtotal</td>
            <td class="text-dark" style="padding-bottom: 8px; font-size: 13px; color: #1b180d; text-align: right; font-weight: 600;">&#x20B9;${format(subtotal)}</td>
          </tr>
          <tr>
            <td class="text-muted" style="padding-bottom: 8px; font-size: 13px; color: #6b6654;">Shipping</td>
            <td class="text-dark" style="padding-bottom: 8px; font-size: 13px; color: #1b180d; text-align: right; font-weight: 600;">${shippingCost > 0 ? `&#x20B9;${format(shippingCost)}` : "Free"}</td>
          </tr>
          ${discount > 0 ? `
          <tr>
            <td style="padding-bottom: 8px; font-size: 13px; color: #2e7d32;">Discount${couponCode ? ` (${couponCode})` : ""}</td>
            <td style="padding-bottom: 8px; font-size: 13px; color: #2e7d32; text-align: right; font-weight: 600;">- &#x20B9;${format(discount)}</td>
          </tr>
          ` : ""}
          <tr>
            <td class="text-dark border-light" style="padding-top: 14px; border-top: 2px solid #1b180d; font-size: 18px; font-weight: 700; color: #1b180d;">Total</td>
            <td class="text-dark border-light" style="padding-top: 14px; border-top: 2px solid #1b180d; font-size: 18px; font-weight: 700; color: #1b180d; text-align: right;">&#x20B9;${format(totalAmount)}</td>
          </tr>
        </table>
      </div>

      <!-- Shipping Address -->
      <div class="bg-light" style="background-color: #fcfbf8; padding: 30px 40px; border-top: 1px solid #f0ece3;">
        <p class="text-subtle" style="font-size: 11px; font-weight: 700; color: #9a864c; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 10px;">
          Shipping To
        </p>
        <p class="text-dark" style="font-size: 14px; color: #1b180d; line-height: 1.6; margin: 0;">
          <strong>${name}</strong><br/>
          ${address.address1}${address.address2 ? `, ${address.address2}` : ""}<br/>
          ${address.city}, ${address.state} - ${address.pincode}<br/>
          <span style="color: #6b6654;">Phone: ${address.phone}</span>
        </p>
      </div>

      <!-- CTA -->
      <div style="padding: 35px 40px; text-align: center;">
        <a href="https://www.ravenfragrance.in/my-account" 
           style="background-color: #b28c34; color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 700; display: inline-block; letter-spacing: 0.08em; text-transform: uppercase;">
           Track My Order
        </a>
        <p class="text-muted" style="font-size: 12px; color: #9a864c; margin: 14px 0 0;">
          Invoice is attached as a PDF with this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #1b180d; padding: 28px 40px; text-align: center;">
        <p style="font-size: 12px; color: #9a864c; margin: 0 0 6px; line-height: 1.5;">
          Raven Fragrance &mdash; Premium fragrances crafted for the modern rebel.
        </p>
        <p style="font-size: 11px; color: #6b6654; margin: 0;">
          Questions? <a href="mailto:ravenfragrances@gmail.com" style="color: #b28c34; text-decoration: underline;">ravenfragrances@gmail.com</a>
        </p>
        <p style="font-size: 11px; color: #6b6654; margin: 8px 0 0;">
          <a href="https://www.ravenfragrance.in" style="color: #b28c34; text-decoration: none;">www.ravenfragrance.in</a>
        </p>
      </div>

    </div>
  </body>
  </html>
  `;
}
