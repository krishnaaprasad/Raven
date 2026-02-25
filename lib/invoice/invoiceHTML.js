export function invoiceHTML(order) {
  const {
    orderId,
    transactionDate,
    customer,
    address,
    items,
    subtotal,
    shipping,
    discount = 0,
    couponCode = null,
    total,
    paymentMethod,
  } = order;

  const format = (n) => Number(n || 0).toFixed(2);

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:14px 0; border-bottom:1px solid #e7e1cf;">
          <div style="font-weight:600;">${item.name}</div>
          <div style="font-size:12px; color:#6b6654;">Size: ${item.size}ml</div>
        </td>
        <td style="text-align:center; border-bottom:1px solid #e7e1cf;">
          ${item.quantity}
        </td>
        <td style="border-bottom:1px solid #e7e1cf;">
          ₹${format(item.price)}
        </td>
        <td style="border-bottom:1px solid #e7e1cf; font-weight:600;">
          ₹${format(item.price * item.quantity)}
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

    <!-- Crimson for headings -->
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:wght@600;700&display=swap" rel="stylesheet">

    <style>
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        margin: 0;
        padding: 0;
        background: #fcfbf8;
        color: #1b180d;
      }

      .invoice {
        width: 820px;
        margin: 20px auto;
        background: #ffffff;
        border: 1px solid #e7e1cf;
        padding: 40px;
      }

      .brand {
        text-align: center;
        margin-bottom: 25px;
      }

      .brand h1 {
        font-family: 'Crimson Text', serif;
        font-size: 32px;
        letter-spacing: 2px;
        margin: 0;
      }

      .invoice-title {
        font-family: 'Crimson Text', serif;
        font-size: 20px;
        margin-top: 8px;
      }

      .meta {
        display: flex;
        justify-content: space-between;
        margin-top: 30px;
        font-size: 14px;
      }

      .section {
        margin-top: 35px;
      }

      .section h3 {
        font-family: 'Crimson Text', serif;
        font-size: 18px;
        margin-bottom: 10px;
        border-bottom: 1px solid #b28c34;
        display: inline-block;
        padding-bottom: 4px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
        font-size: 14px;
      }

      th {
        text-align: left;
        padding-bottom: 10px;
        border-bottom: 2px solid #e7e1cf;
      }

      .summary {
        margin-top: 30px;
        width: 300px;
        margin-left: auto;
        font-size: 14px;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .discount {
        color: #2e7d32;
        font-weight: 600;
      }

      .grand-total {
        font-family: 'Crimson Text', serif;
        font-size: 20px;
        font-weight: 700;
        border-top: 2px solid #1b180d;
        padding-top: 10px;
        margin-top: 10px;
      }

      .footer {
        text-align: center;
        margin-top: 50px;
        font-size: 12px;
        color: #9a864c;
      }
    </style>
  </head>

  <body>
    <div class="invoice">

      <div class="brand">
        <h1>RAVEN FRAGRANCE</h1>
        <div class="invoice-title">TAX INVOICE</div>
        <div style="font-size:13px; margin-top:5px;">
          Order #${orderId}
        </div>
        
      </div>

      <div class="meta">
        <div>
          <strong>Date:</strong><br/>
          ${new Date(transactionDate).toLocaleString("en-IN")}
        </div>
        <div>
          <strong>Payment Method:</strong><br/>
          ${paymentMethod}
        </div>
      </div>

      <div class="section">
        <h3>Customer Details</h3>
        <div>
          ${customer.name}<br/>
          ${customer.email}<br/>
          ${customer.phone}
        </div>
      </div>

      <div class="section">
        <h3>Shipping Address</h3>
        <div>
          ${address.address1}<br/>
          ${address.address2 ? address.address2 + "<br/>" : ""}
          ${address.city}, ${address.state} - ${address.pincode}<br/>
          India
        </div>
      </div>

      <div class="section">
        <h3>Order Items</h3>
        <table>
          <tr>
            <th>Product</th>
            <th style="text-align:center;">Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
          ${itemRows}
        </table>
      </div>

      <div class="summary">
        <div class="summary-row">
          <span>Subtotal</span>
          <span>₹${format(subtotal)}</span>
        </div>

        <div class="summary-row">
          <span>Shipping</span>
          <span>${shipping ? `₹${format(shipping)}` : "Free"}</span>
        </div>

        ${
          discount > 0
            ? `
        <div class="summary-row discount">
          <span>Discount</span>
          <span>- ₹${format(discount)}</span>
        </div>`
            : ""
        }

        <div class="summary-row grand-total">
          <span>Grand Total</span>
          <span>₹${format(total)}</span>
        </div>
      </div>

      <div class="footer">
        Thank you for shopping with Raven Fragrance.<br/>
        www.ravenfragrance.in
      </div>

    </div>
  </body>
  </html>
  `;
}