import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendRepurchaseReminder, sendReviewRequest } from "./whatsapp.service";
import { sendReviewRequestEmail } from "./email.service";

export async function runWhatsAppDailyScheduler() {
  await connectToDatabase();

  const now = new Date();
  const fiveDaysAgo = new Date(now);
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  const thirtyFiveDaysAgo = new Date(now);
  thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);

  const reviewOrders = await Order.find({
    deleted: { $ne: true },
    order_status: "Delivered",
    deliveredAt: { $lte: fiveDaysAgo },
    reviewRequestSent: { $ne: true },
  }).sort({ deliveredAt: 1 });

  const repurchaseOrders = await Order.find({
    deleted: { $ne: true },
    order_status: "Delivered",
    deliveredAt: { $lte: thirtyFiveDaysAgo },
    repurchaseReminderSent: { $ne: true },
  }).sort({ deliveredAt: 1 });

  const reviewResults = [];
  for (const order of reviewOrders) {
    // Send WhatsApp review request
    const whatsappResult = await sendReviewRequest(order);

    // Send email review request (alongside WhatsApp)
    let emailOk = false;
    try {
      const emailResult = await sendReviewRequestEmail(order);
      emailOk = emailResult?.ok || false;
    } catch (emailErr) {
      console.error("❌ Review email error:", emailErr.message);
    }

    // Mark reviewRequestSent only if WhatsApp succeeded
    // (sendReviewRequest already sets this flag internally when ok)
    // Persist email state separately so we can retry email on next run if it failed
    if (emailOk) {
      await Order.findByIdAndUpdate(order._id, { reviewEmailSent: true });
    }

    reviewResults.push({ orderId: order._id.toString(), result: whatsappResult, emailOk });
  }

  const repurchaseResults = [];
  for (const order of repurchaseOrders) {
    repurchaseResults.push({ orderId: order._id.toString(), result: await sendRepurchaseReminder(order) });
  }

  return {
    reviewChecked: reviewOrders.length,
    repurchaseChecked: repurchaseOrders.length,
    reviewResults,
    repurchaseResults,
  };
}
