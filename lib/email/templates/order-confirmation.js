// templates/order-confirmation.js
export default function orderConfirmationTemplate({
  name,
  orderId,
  paymentMethod,
  subtotal,
  shippingCost,
  totalAmount,
  items,
  address,
  date,
  receiptUrl,
}) {
  const itemsHTML = items
    .map(
      (item) => `
      <div class="item-box">
        <div style="display:flex; justify-content:space-between;">
          <div>
            <p style="margin:0; font-size:15px; font-weight:600;">${item.name}</p>
            <p style="color:#9a864c; margin:0;">Size: ${item.size}</p>
            <p style="margin:6px 0 0;">Qty: ${item.quantity}</p>
          </div>
          <strong>₹${(item.price * item.quantity).toFixed(2)}</strong>
        </div>
      </div>`
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html>
  <body style="background:#fcfbf8; padding:20px;">
    <div style="max-width:600px;margin:0 auto;background:white;border:1px solid #e7e1cf;padding:25px;border-radius:12px;">

      <div style="text-align:center;">
        <img src="${process.env.NEXT_PUBLIC_BASE_URL}/logo.png" style="width:150px;margin-bottom:20px;" />
      </div>

      <h2>Thank You for Your Order, ${name}!</h2>
      <p>Your payment has been successfully verified.</p>

      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      <p><strong>Transaction Date:</strong> ${date}</p>

      <h3>Order Summary</h3>
      ${itemsHTML}

      <p><strong>Subtotal:</strong> ₹${subtotal}.00</p>
      <p><strong>Shipping:</strong> ₹${shippingCost}.00</p>
      <p><strong>Total:</strong> ₹${totalAmount}.00</p>

      <h3>Shipping Address</h3>
      <p>
        ${address.address1}<br/>
        ${address.address2 || ""}<br/>
        ${address.city}, ${address.state} - ${address.pincode}<br/>
        Phone: ${address.phone}
      </p>

      <div style="text-align:center;margin-top:20px;">
        <a href="${receiptUrl}" style="padding:10px 20px;background:#b28c34;color:white;font-weight:bold;border-radius:6px;text-decoration:none;">View Invoice</a>
      </div>

      <p style="margin-top:30px;text-align:center;color:#9a864c;font-size:12px;">
        Need help? Contact us at support@ravenfragrance.com
      </p>

    </div>
  </body>
  </html>`;
}
