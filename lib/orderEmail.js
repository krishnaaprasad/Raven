// Order confirmation email, sent exactly once per order.
// The verify page and the Cashfree webhook often run at the same moment: the conditional
// claim on emailSent lets only one of them send. The send is awaited (an un-awaited fetch
// can be cut off on Vercel) and the claim is undone if it fails, so a later call can retry.

import { Order } from "@/models/Order";

const MAIL_TIMEOUT_MS = 15000;

export async function sendOrderConfirmationOnce(orderId, paymentMethod) {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, emailSent: { $ne: true } },
    { $set: { emailSent: true } },
    { new: true }
  );
  if (!order || !order.email) return false;

  try {
    // Built inside the try: any error here must also release the emailSent claim
    const items = Array.isArray(order.cartItems) ? order.cartItems : [];
    const payload = {
      email: order.email,
      name: order.userName,
      orderId: order.customOrderId || order._id.toString(),
      paymentMethod: paymentMethod || order.paymentMethod || "Online Payment",
      subtotal: items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      shippingCost: order.shippingCharge,
      discount: order.discount || 0,
      couponCode: order.couponCode || null,
      totalAmount: order.totalAmount,
      items,
      shipping: order.deliveryType,
      address: { ...(order.addressDetails?.toObject?.() || order.addressDetails || {}), phone: order.phone },
    };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.ravenfragrance.in"}/api/send-confirmation-mail`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-internal-key": process.env.NEXTAUTH_SECRET || "" },
        body: JSON.stringify(payload),
        // A hung mail route must not hold the payment request open; the claim is released below
        signal: AbortSignal.timeout(MAIL_TIMEOUT_MS),
      }
    );
    if (!res.ok) throw new Error(`mail route returned ${res.status}`);
    return true;
  } catch (err) {
    console.error("📩 Order confirmation email failed:", order.customOrderId, err.message);
    await Order.updateOne({ _id: order._id }, { $set: { emailSent: false } }).catch(() => {});
    return false;
  }
}
