export default function reviewRequestTemplate(data) {
  const {
    name,
    orderId,
    items = [],
  } = data;

  const baseUrl = "https://www.ravenfragrance.in";

  // HTML escape helper
  const esc = (val) =>
    String(val ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  // URL-encode for href attributes
  const escUrl = (val) => String(val ?? "").replace(/"/g, "%22").replace(/</g, "%3C").replace(/>/g, "%3E");

  const safeName = esc(name);
  const safeOrderId = esc(orderId);

  const itemsHTML = items.map(item => {
    const rawImg = typeof item.image === "string"
      ? item.image
      : item.image?.original || item.image?.thumbnail || "";
    const imgSrc = escUrl(rawImg);
    const slug = encodeURIComponent(item.slug || "");
    const reviewUrl = `${baseUrl}/product/${slug}?review=true#reviews-section`;
    const safeName = esc(item.name);
    const safeSize = esc(item.size);

    return `
    <tr>
      <td style="padding: 20px 0; border-bottom: 1px solid #f0ece3;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="80" style="vertical-align: top;">
              ${imgSrc ? `<img src="${imgSrc}" width="80" height="80" alt="${safeName}" style="border-radius: 10px; object-fit: cover; display: block; border: 1px solid #f0ece3;" />` : `<div style="width: 80px; height: 80px; border-radius: 10px; background: #f5f1e6;"></div>`}
            </td>
            <td style="padding-left: 16px; vertical-align: middle;">
              <p style="margin: 0; font-family: system-ui, sans-serif; font-size: 15px; font-weight: 700; color: #1b180d;">
                ${safeName}
              </p>
              ${safeSize ? `<p style="margin: 4px 0 0; font-family: system-ui, sans-serif; font-size: 12px; color: #6b6654;">Size: ${safeSize}ml</p>` : ""}
              <div style="margin-top: 12px;">
                <a href="${reviewUrl}" style="background-color: #b28c34; color: #ffffff; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 700; display: inline-block; letter-spacing: 0.05em;">
                  Write a Review
                </a>
              </div>
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
    <title>Share Your Experience - Raven Fragrance</title>
    <style>
      :root { color-scheme: light dark; supported-color-schemes: light dark; }
      body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
      img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
      table { border-collapse: collapse !important; }
      @media (prefers-color-scheme: dark) {
        .email-body { background-color: #1a1a1a !important; }
        .email-container { background-color: #242424 !important; border-color: #333333 !important; }
        .text-dark { color: #f5f5f5 !important; }
        .text-muted { color: #aaaaaa !important; }
        .bg-light { background-color: #1e1e1e !important; }
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

      <!-- Star Rating Visual -->
      <div style="padding: 35px 40px 10px 40px; text-align: center;">
        <p style="font-size: 32px; margin: 0;">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
      </div>

      <!-- Hero -->
      <div style="padding: 10px 40px 30px 40px; text-align: center;">
        <h1 class="text-dark" style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 700; color: #1b180d; margin: 0 0 10px;">
          How was your experience?
        </h1>
        <p class="text-muted" style="font-size: 14px; color: #6b6654; margin: 0; line-height: 1.6;">
          Hi ${safeName}, we hope you're loving your fragrance!<br/>
          Your feedback helps other customers and means a lot to us.
        </p>
      </div>

      <!-- Products to Review -->
      <div style="padding: 0 40px 10px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${itemsHTML}
        </table>
      </div>

      <!-- Motivation -->
      <div class="bg-light" style="background-color: #fcfbf8; padding: 28px 40px; margin: 20px 40px; border-radius: 10px; border: 1px solid #f0ece3; text-align: center;">
        <p class="text-dark" style="font-size: 14px; color: #1b180d; margin: 0 0 6px; font-weight: 600;">
          Why your review matters
        </p>
        <p class="text-muted" style="font-size: 13px; color: #6b6654; margin: 0; line-height: 1.5;">
          Your honest review helps fellow fragrance lovers make confident choices. Share your thoughts on the scent, longevity, and overall experience.
        </p>
      </div>

      <!-- Tips -->
      <div style="padding: 20px 40px 30px; text-align: center;">
        <p class="text-muted" style="font-size: 12px; color: #9a864c; margin: 0; line-height: 1.6;">
          &#128161; <em>Tip: Mention the fragrance notes you enjoyed, how long it lasted, and the occasions you wore it for!</em>
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #1b180d; padding: 28px 40px; text-align: center;">
        <p style="font-size: 12px; color: #9a864c; margin: 0 0 6px; line-height: 1.5;">
          Order #${safeOrderId} &mdash; Delivered
        </p>
        <p style="font-size: 11px; color: #6b6654; margin: 0;">
          <a href="${baseUrl}" style="color: #b28c34; text-decoration: none;">www.ravenfragrance.in</a>
        </p>
      </div>

    </div>
  </body>
  </html>
  `;
}
