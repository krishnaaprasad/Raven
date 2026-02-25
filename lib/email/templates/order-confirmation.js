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
    <div style="border:1px solid #e5e5e5; padding:14px; border-radius:10px; margin-bottom:14px;">
      <div style="display:flex; gap:14px; align-items:center;">
        
        <img 
          src="${item.image || ""}" 
          style="width:70px; height:70px; border-radius:8px; object-fit:cover;" 
        />

        <div style="flex:1;">
          <p style="margin:0; font-weight:600; font-family:'Crimson Text', serif; font-size:16px;">
            ${item.name}
          </p>
          <p style="margin:3px 0; font-size:13px; color:#666;">Size: ${item.size}</p>
          <p style="margin:3px 0; font-size:13px;">Qty: ${item.quantity}</p>
        </div>

        <div style="font-weight:600; font-size:15px;">
          ₹${format(item.price * item.quantity)}
        </div>

      </div>
    </div>
  `).join("");

  return `
  <html>
  <head>
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:wght@600;700&display=swap" rel="stylesheet">
  </head>

  <body style="background:#f4f4f4; font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif; padding:30px;">

    <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:16px;padding:36px;">

      <!-- Logo -->
      <div style="text-align:center;margin-bottom:25px;">
        <img src="https://ravenfragrance.in/logo.png" style="width:130px;" />
      </div>

      <!-- Title -->
      <h2 style="font-family:'Crimson Text',serif;margin:0;color:#111;font-size:26px;">
        Thank You for Your Order, ${name}
      </h2>

      <p style="color:#555;margin-top:8px;font-size:14px;">
        Your payment has been successfully verified. We’re now preparing your fragrance for dispatch.
      </p>

      <hr style="border:0;border-top:1px solid #e5e5e5;margin:28px 0;" />

      <!-- Meta -->
      <div style="font-size:14px; line-height:1.7;">
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p><strong>Transaction Date:</strong> ${date}</p>
        <p><strong>Estimated Delivery:</strong> ${estimatedDelivery()}</p>
      </div>

      <!-- Order Summary -->
      <h3 style="margin-top:30px;font-family:'Crimson Text',serif;font-size:18px;">
        Order Summary
      </h3>

      ${itemsHTML}

      <!-- Totals -->
      <div style="margin-top:20px; font-size:14px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span>Subtotal</span>
          <span>₹${format(subtotal)}</span>
        </div>

        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span>Shipping</span>
          <span>${shippingCost ? `₹${format(shippingCost)}` : "Free"}</span>
        </div>

        ${
          discount > 0
            ? `
          <div style="display:flex; justify-content:space-between; margin-bottom:6px; color:#1b5e20;">
            <span>Discount ${couponCode ? `(${couponCode})` : ""}</span>
            <span>- ₹${format(discount)}</span>
          </div>
        `
            : ""
        }

        <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:700; border-top:1px solid #e5e5e5; padding-top:10px; margin-top:8px;">
          <span>Total</span>
          <span>₹${format(totalAmount)}</span>
        </div>
      </div>

      <!-- Shipping Address -->
      <h3 style="margin-top:30px;font-family:'Crimson Text',serif;font-size:18px;">
        Shipping Address
      </h3>

      <p style="line-height:1.6; font-size:14px; color:#333;">
        ${address.address1}<br/>
        ${address.address2 ? address.address2 + "<br/>" : ""}
        ${address.city}, ${address.state} - ${address.pincode}<br/>
        <strong>Phone:</strong> ${address.phone || "Not Provided"}
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin-top:28px;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}" 
           style="background:#111;color:#fff;padding:12px 26px;border-radius:6px;text-decoration:none;font-weight:600;">
           Continue Shopping
        </a>
      </div>

      <!-- Footer -->
      <p style="font-size:11px;text-align:center;margin-top:40px;color:#777;">
        You’re receiving this email because you placed an order on ravenfragrance.in<br/>
        Need help? Contact us at contact@ravenfragrance.in
      </p>

    </div>
  </body>
  </html>
  `;
}