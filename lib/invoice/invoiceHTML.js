// lib/invoice/invoiceHTML.js
export function invoiceHTML(order) {
  const { orderId, customer, address, items, subtotal, shipping, total, paymentMethod } = order;

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td>${item.name} (${item.size})</td>
        <td>${item.quantity}</td>
        <td>₹${item.price}</td>
        <td>₹${item.price * item.quantity}</td>
      </tr>`
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html>
  <body style="font-family:Manrope;padding:20px;">
    <div style="text-align:center;">
      <img src="${process.env.NEXT_PUBLIC_BASE_URL}/logo.png" width="130"/>
      <h2>Invoice</h2>
      <p>Order #${orderId}</p>
    </div>

    <h3>Customer Details</h3>
    <p>${customer.name}<br/>${customer.email}<br/>${customer.phone}</p>

    <h3>Shipping Address</h3>
    <p>${address.address1}<br/>
       ${address.address2 || ""}<br/>
       ${address.city}, ${address.state} - ${address.pincode}</p>

    <h3>Items</h3>
    <table width="100%" border="1" cellspacing="0" cellpadding="8">
      <tr><th>Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr>
      ${itemRows}
    </table>

    <h3>Totals</h3>
    <p>Subtotal: ₹${subtotal}.00</p>
    <p>Shipping: ₹${shipping}.00</p>
    <p><strong>Grand Total: ₹${total}.00</strong></p>

    <p>Payment Method: ${paymentMethod}</p>

  </body>
  </html>`;
}
