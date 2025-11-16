export function invoiceHTML(order) {
  const { orderId, transactionDate, customer, address, items, subtotal, shipping, total, paymentMethod } = order;

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #e7e1cf;">
          <strong>${item.name}</strong><br/>
          <span style="font-size:13px; color:#6b6654;">Size: ${item.size}</span>
        </td>
        <td style="padding:10px 0; border-bottom:1px solid #e7e1cf; text-align:center;">
          ${item.quantity}
        </td>
        <td style="padding:10px 0; border-bottom:1px solid #e7e1cf;">
          ₹${item.price}
        </td>
        <td style="padding:10px 0; border-bottom:1px solid #e7e1cf;">
          ₹${item.price * item.quantity}
        </td>
      </tr>
    `
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice - Raven Fragrance</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=Manrope:wght@400;500;600&display=swap');

      body {
        font-family: 'Manrope', sans-serif;
        margin: 0;
        padding: 0;
        background: #fcfbf8;
        color: #1b180d;
      }

      .invoice-container {
        width: 750px;
        margin: 30px auto;
        background: #ffffff;
        border: 2px solid #e7e1cf;
        padding: 40px 50px;
        border-radius: 16px;
      }

      .header {
        text-align: center;
        margin-bottom: 25px;
      }

      .header img {
        width: 180px;
        margin-bottom: 10px;
      }

      .top-gold-bar {
        width: 100%;
        height: 6px;
        background: #b28c34;
        border-radius: 6px;
        margin-bottom: 30px;
      }

      .section-title {
        font-family: 'Playfair Display', serif;
        font-size: 22px;
        font-weight: 600;
        color: #1b180d;
        margin-top: 30px;
        border-bottom: 2px solid #b28c34;
        padding-bottom: 6px;
        display: inline-block;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
      }

      th {
        text-align: left;
        font-size: 15px;
        font-weight: 600;
        border-bottom: 2px solid #e7e1cf;
        padding-bottom: 10px;
        color: #1b180d;
      }

      .total-text {
        font-size: 18px;
        font-weight: 700;
        color: #1b180d;
      }
    </style>
  </head>

  <body>
    <div class="invoice-container">

      <div class="top-gold-bar"></div>

      <!-- HEADER -->
      <div class="header">
        <img src="https://ravenfragrance.in/logo.png" alt="Raven Fragrance" />
        <h2 style="font-family:'Playfair Display', serif; font-size:28px; margin-top:10px;">
          INVOICE
        </h2>
        <p style="font-size:14px; color:#6b6654;">Order #${orderId}</p>
      </div>

      <!-- ORDER DETAILS -->
      <h3 class="section-title">Order Details</h3>
      <p><strong>Transaction Date:</strong> ${new Date(transactionDate).toLocaleString("en-IN")}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>

      <!-- CUSTOMER DETAILS -->
      <h3 class="section-title">Customer Details</h3>
      <p>
        ${customer.name}<br/>
        ${customer.email}<br/>
        ${customer.phone}
      </p>

      <!-- SHIPPING -->
      <h3 class="section-title">Shipping Address</h3>
      <p>
        ${address.address1}<br/>
        ${address.address2 ? address.address2 + "<br/>" : ""}
        ${address.city}, ${address.state} - ${address.pincode}
      </p>

      <!-- ITEMS -->
      <h3 class="section-title">Items</h3>
      <table>
        <tr>
          <th>Product</th>
          <th style="text-align:center;">Qty</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
        ${itemRows}
      </table>

      <!-- TOTALS -->
      <div style="margin-top:30px; text-align:right;">
        <p class="total-text">Subtotal: ₹${subtotal}</p>
        <p class="total-text">Shipping: ₹${shipping}</p>
        <p class="total-text" style="font-size:20px; margin-top:10px;">
          Grand Total: ₹${total}
        </p>
      </div>

      <div style="text-align:center; margin-top:40px; color:#9a864c; font-size:12px;">
        Thank you for shopping with Raven Fragrance.
      </div>

    </div>
  </body>
  </html>
  `;
}
