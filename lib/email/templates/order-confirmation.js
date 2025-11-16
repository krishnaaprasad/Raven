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
    totalAmount,
    items,
    address,
    date
  } = data;

  const itemsHTML = items.map(item => `
    <div style="border:1px solid #e7e1cf; padding:14px; border-radius:12px; margin-bottom:16px;">
      <div style="display:flex; gap:12px;">
        
        <img 
          src="${item.image || ""}" 
          style="width:70px; height:70px; border-radius:10px; object-fit:cover;" 
        />

        <div style="flex:1;">
          <p style="margin:0; font-weight:600; font-family:'Playfair Display', serif;">
            ${item.name}
          </p>
          <p style="margin:2px 0; font-size:13px; color:#9a864c;">Size: ${item.size}</p>
          <p style="margin:2px 0; font-size:13px;">Qty: ${item.quantity}</p>
        </div>

        <div style="font-weight:700; font-size:15px;">
          ₹${(item.price * item.quantity).toFixed(2)}
        </div>

      </div>
    </div>
  `).join("");

  return `
  <html>
  <body style="background:#fcfbf8; font-family:'Manrope',sans-serif; padding:20px;">
    <div style="max-width:650px;margin:auto;background:white;border:1px solid #e7e1cf;border-radius:18px;padding:32px;">

      <div style="text-align:center;">
        <img src="https://ravenfragrance.in/logo.png" style="width:140px;margin-bottom:20px;" />
      </div>

      <h2 style="font-family:'Playfair Display',serif;margin:0;color:#1b180d;">
        Thank You for Your Order, ${name}!
      </h2>

      <p style="color:#6b6654;margin-top:5px;">
        Your payment has been verified successfully. We're preparing your luxury fragrance for dispatch.
      </p>

      <hr style="border:0;border-top:1px solid #e7e1cf;margin:25px 0;" />

      <p><b>Order ID:</b> ${orderId}</p>
      <p><b>Payment Method:</b> ${paymentMethod}</p>
      <p><b>Transaction Date:</b> ${date}</p>
      <p><b>Estimated Delivery:</b> ${estimatedDelivery()}</p>

      <h3 style="margin-top:28px;font-family:'Playfair Display',serif;">Order Summary</h3>
      ${itemsHTML}

      <p><b>Subtotal:</b> ₹${subtotal.toFixed(2)}</p>
      <p><b>Shipping:</b> ₹${shippingCost.toFixed(2)}</p>
      <p style="font-size:18px;font-weight:700;">Total: ₹${totalAmount.toFixed(2)}</p>

      <h3 style="margin-top:25px;font-family:'Playfair Display',serif;">Shipping Address</h3>

      <p style="line-height:1.5;">
        ${address.address1}<br/>
        ${address.address2 ? address.address2 + "<br/>" : ""}
        ${address.city}, ${address.state} - ${address.pincode}<br/>
        <b>Phone:</b> ${address.phone || "Not Provided"}
      </p>

      <div style="text-align:center;margin-top:25px;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}" 
           style="background:#b28c34;color:white;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:600;">
           Continue Shopping
        </a>
      </div>

      <p style="font-size:11px;text-align:center;margin-top:35px;color:#9a864c;">
        You’re receiving this email because you placed an order on ravenfragrance.in<br/>
        Need help? Contact us at contact@ravenfragrance.in
      </p>

    </div>
  </body>
  </html>
  `;
}
