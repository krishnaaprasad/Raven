import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import Product from "@/models/Product";
import StockLog from "@/models/StockLog";
import { sendDeliveryMessage } from "@/lib/notifications/whatsapp.service";
import { redeductRestoredStock } from "@/lib/orderInventory";

const ORDER_STATUSES = ["Payment Awaiting", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

export async function GET(req, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params; // ✅ FIX

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID missing" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id)
      .populate("userId", "name email phone isGuest");

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("❌ GET /api/admin/orders/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params; // ✅ FIX

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID missing" },
        { status: 400 }
      );
    }

    const { order_status } = await req.json();

    if (!ORDER_STATUSES.includes(order_status)) {
      return NextResponse.json(
        { success: false, error: "Invalid order status" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.order_status === order_status) {
      return NextResponse.json({ success: true, order });
    }

    // ✅ Save history
    order.orderHistory.push({
      from: order.order_status,
      to: order_status,
      by: "admin",
      at: new Date(),
    });

    const previousStatus = order.order_status;
    order.order_status = order_status;

    if (order_status === "Delivered" && previousStatus !== "Delivered" && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    await order.save();

    // ✅ Stock restoration on cancellation
    if (
      order_status === "Cancelled" &&
      previousStatus !== "Cancelled" &&
      order.payment_status === "PAID" &&
      order.stockDeducted === true &&
      !order.stockRestored
    ) {
      try {
        for (const item of order.cartItems) {
          const product = await Product.findOne({ slug: item.slug });
          if (!product) continue;

          const variant = product.variants.find(
            (v) => String(v.size) === String(item.size)
          );
          if (!variant) continue;

          const previousStock = variant.stock;
          const quantity = Number(item.quantity);

          const updated = await Product.findOneAndUpdate(
            {
              _id: product._id,
              "variants.size": item.size,
            },
            { $inc: { "variants.$.stock": quantity } },
            { new: true }
          );

          if (updated) {
            const updatedVariant = updated.variants.find(
              (v) => String(v.size) === String(item.size)
            );
            await StockLog.create({
              productId: product._id,
              variantSize: item.size,
              type: "ORDER_CANCELLED",
              quantity: quantity,
              previousStock,
              newStock: updatedVariant?.stock ?? previousStock + quantity,
              orderId: order._id,
              by: "admin",
            });
          }
        }

        order.stockRestored = true;
        await order.save();
      } catch (stockErr) {
        console.error("❌ Stock restoration error:", stockErr);
      }
    }

    // Un-cancelling a paid order: take back only the stock that cancelling returned
    if (
      previousStatus === "Cancelled" &&
      order_status !== "Cancelled" &&
      order.payment_status === "PAID" &&
      order.stockRestored === true
    ) {
      try {
        await redeductRestoredStock(order._id);
      } catch (stockErr) {
        console.error("❌ Re-deduct stock on un-cancel failed:", stockErr);
      }
    }

    if (order_status === "Delivered" && previousStatus !== "Delivered") {
      try {
        await sendDeliveryMessage(order);
      } catch (whatsappErr) {
        console.error("❌ Delivery WhatsApp message error:", whatsappErr);
      }
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("❌ PATCH /api/admin/orders/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params; // ✅ FIX like GET & PATCH

    const { reason } = await req.json();

    if (!reason) {
      return NextResponse.json(
        { success: false, error: "Delete reason required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    order.deleted = true;
    order.deleteReason = reason;
    order.deletedAt = new Date();

    order.orderHistory.push({
      from: order.order_status,
      to: "Deleted",
      by: "admin",
      note: reason,
      at: new Date(),
    });

    await order.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /api/admin/orders/[id]:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
