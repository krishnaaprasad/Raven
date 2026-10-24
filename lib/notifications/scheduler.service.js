import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendReviewRequest } from "./whatsapp.service";
import { sendReviewRequestEmail } from "./email.service";

export async function runWhatsAppDailyScheduler() {
  await connectToDatabase();

  const now = new Date();
  const fiveDaysAgo = new Date(now);
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  // Only recent deliveries — stops the first run from messaging every old customer at once
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const reviewOrders = await Order.find({
    deleted: { $ne: true },
    order_status: "Delivered",
    deliveredAt: { $lte: fiveDaysAgo, $gte: fourteenDaysAgo },
    reviewRequestSent: { $ne: true },
  }).sort({ deliveredAt: 1 });

  const reviewResults = [];
  for (const order of reviewOrders) {
    // Send WhatsApp review request
    const whatsappResult = await sendReviewRequest(order);

    // Send email review request (alongside WhatsApp) — only once, even if WhatsApp is retried on later runs
    let emailOk = Boolean(order.reviewEmailSent);
    if (!emailOk) {
      try {
        const emailResult = await sendReviewRequestEmail(order);
        emailOk = emailResult?.ok || false;
      } catch (emailErr) {
        console.error("❌ Review email error:", emailErr.message);
      }
    }

    // Mark reviewRequestSent only if WhatsApp succeeded
    // (sendReviewRequest already sets this flag internally when ok)
    // Persist email state separately so we can retry email on next run if it failed
    if (emailOk && !order.reviewEmailSent) {
      await Order.findByIdAndUpdate(order._id, { reviewEmailSent: true });
    }

    reviewResults.push({ orderId: order._id.toString(), result: whatsappResult, emailOk });
  }

  return {
    reviewChecked: reviewOrders.length,
    reviewResults,
  };
}
