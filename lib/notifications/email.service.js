import nodemailer from "nodemailer";
import reviewRequestTemplate from "@/lib/email/templates/review-request";

function getTransporter() {
  const port = Number(process.env.MAIL_PORT) || 465;
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Send review request email to customer
 * Called 5 days after delivery (alongside WhatsApp)
 */
export async function sendReviewRequestEmail(order) {
  if (!order?.email) return { ok: false, reason: "No email" };

  // Skip fake emails
  if (order.email.includes("@raven.local")) return { ok: false, reason: "Fake email" };

  const items = Array.isArray(order.cartItems) ? order.cartItems : [];
  if (!items.length) return { ok: false, reason: "No items" };

  const html = reviewRequestTemplate({
    name: order.userName || "Customer",
    orderId: order.customOrderId || order._id?.toString(),
    items,
  });

  const transporter = getTransporter();

  await transporter.sendMail({
    from: `Raven Fragrance <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: `How's your fragrance? Share your review! 🌟`,
    html,
  });

  return { ok: true };
}
