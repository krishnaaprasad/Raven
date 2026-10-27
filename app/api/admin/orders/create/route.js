import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import Product from "@/models/Product";
import { generateSequentialOrderIdFromItems } from "@/lib/generateOrderId";
import { reserveStock, undoReservation, logReservation } from "@/lib/orderInventory";
import { buildManualLines } from "@/lib/manualOrderItems";

function orderCreatedAt(orderDate) {
  if (typeof orderDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(orderDate)) return new Date();
  const todayIst = new Date(Date.now() + 330 * 60 * 1000).toISOString().slice(0, 10);
  if (orderDate === todayIst) return new Date();
  const d = new Date(`${orderDate}T12:00:00+05:30`);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}


export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const {
      userName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      items,
      // legacy single-product fields (older admin page)
      productId,
      variantSize,
      quantity,
      price,
      shippingCharge,
      paymentMethod,
      orderDate,
      remark,
      discount,
      couponCode,
    } = body;

    if (!userName || !phone) {
      return NextResponse.json(
        { success: false, error: "Customer name and phone are required" },
        { status: 400 }
      );
    }

    // Validate + price every product line (supports several products per order)
    const rawItems = Array.isArray(items) && items.length
      ? items
      : productId
        ? [{ productId, variantSize, quantity: quantity ?? 1, price }]
        : [];
    const built = await buildManualLines(rawItems);
    if (!built.ok) {
      return NextResponse.json({ success: false, error: built.error }, { status: 400 });
    }
    const { lines, subtotal: subTotal } = built;

    const ship = Number(shippingCharge || 0);
    if (!Number.isFinite(ship) || ship < 0) {
      return NextResponse.json(
        { success: false, error: "Invalid shipping charge" },
        { status: 400 }
      );
    }

    const discountAmount = Number(discount || 0);
    if (!Number.isFinite(discountAmount) || discountAmount < 0) {
      return NextResponse.json(
        { success: false, error: "Invalid discount value" },
        { status: 400 }
      );
    }
    if (discountAmount > subTotal) {
      return NextResponse.json(
        { success: false, error: "Discount cannot exceed subtotal" },
        { status: 400 }
      );
    }
    const totalAmount = subTotal + ship - discountAmount;

    // Number first: if it fails, no stock has been taken yet
    const customOrderId = await generateSequentialOrderIdFromItems(lines);

    // Manual sales take stock too — all lines or none
    const reservation = await reserveStock(lines);
    if (!reservation.ok) {
      const p = await Product.findOne({ slug: reservation.item.slug }).select("variants").lean();
      const left = p?.variants?.find((v) => String(v.size) === String(reservation.item.size))?.stock ?? 0;
      return NextResponse.json(
        { success: false, error: `Not enough stock: ${reservation.item.name} (${reservation.item.size}) has ${left} left` },
        { status: 400 }
      );
    }

    // ✅ CREATE ORDER
    let order;
    try {
    order = await Order.create({
      customOrderId,

      userId: null,
      userName,
      email: email || "",
      phone,
      address,
      addressDetails: {
        address1: address,
        city,
        state,
        pincode,
      },

      deliveryType: "standard",

      cartItems: lines,

      shippingCharge: ship,

      // ✅ ADD THESE
      discount: discountAmount,
      couponCode: couponCode || null,

      totalAmount,

      payment_status: "PAID",
      status: "PAID",
      order_status: "Processing",

      paymentGateway: "Manual",
      paymentMethod: paymentMethod || "Cash",
      stockDeducted: true, // so cancelling this order puts the stock back

      // Today → now (keeps order of entries); a past day → noon IST of that day
      createdAt: orderCreatedAt(orderDate),

      orderHistory: [
        {
          from: "Created",
          to: "Processing",
          by: "admin",
          note: remark || "Manual order entry",
          changes: [
            {
              field: "Discount",
              from: "--",
              to: discountAmount,
            },
            {
              field: "Coupon Code",
              from: "--",
              to: couponCode || "--",
            },
          ],
        },
      ],
    });
    } catch (createErr) {
      await undoReservation(reservation.taken);
      throw createErr;
    }
    await logReservation(reservation.taken, order._id);

    // Send confirmation email for manual order
    if (order.email) {
      try {
        const emailPayload = {
          email: order.email,
          name: order.userName,
          orderId: order.customOrderId || order._id.toString(),
          paymentMethod: order.paymentMethod || "Cash",
          subtotal: subTotal,
          shippingCost: ship,
          discount: discountAmount,
          couponCode: couponCode || null,
          totalAmount: order.totalAmount,
          items: order.cartItems,
          shipping: order.deliveryType,
          address: {
            ...order.addressDetails,
            phone: order.phone,
          },
        };

        // Await it: on Vercel an un-awaited fetch can be cut off when the response is sent
        const mailRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.ravenfragrance.in"}/api/send-confirmation-mail`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-internal-key": process.env.NEXTAUTH_SECRET || "" },
            body: JSON.stringify(emailPayload),
            signal: AbortSignal.timeout(15000), // don't hang the admin request on a slow mail route
          }
        );

        if (mailRes.ok) await Order.findByIdAndUpdate(order._id, { emailSent: true });
        else console.error("📩 Manual order email failed:", mailRes.status);
      } catch (mailErr) {
        console.error("❌ Manual order email error:", mailErr);
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (e) {
    console.error("❌ CREATE MANUAL ORDER ERROR:", e);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
