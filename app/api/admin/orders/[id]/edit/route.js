import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import Product from "@/models/Product";

function trackChange(changes, label, oldVal, newVal) {
  if (String(oldVal ?? "") !== String(newVal ?? "")) {
    changes.push({
      field: label,
      from: oldVal ?? "--",
      to: newVal ?? "--",
    });
  }
}

export async function PUT(req, context) {
  try {
    await connectToDatabase();

    const { id } = context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID missing" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (!order.cartItems || order.cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order items" },
        { status: 400 }
      );
    }

    // ❌ Block website / Cashfree orders
    if (order.paymentGateway !== "Manual") {
      return NextResponse.json(
        { success: false, error: "Only manual orders can be edited" },
        { status: 403 }
      );
    }

    const {
      userName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      quantity,
      shippingCharge,
      paymentMethod,
      price,
      remark,
      variantSize,
      discount,
      couponCode,
    } = body;

    const changes = [];
    const cartItem = order.cartItems[0];

    const oldValues = {
      quantity: cartItem.quantity,
      price: cartItem.price,
      shipping: order.shippingCharge,
      discount: order.discount || 0,
      couponCode: order.couponCode || "",
    };

    // 🔁 Handle variant change
    if (variantSize && variantSize !== cartItem.size) {
      const product = await Product.findOne({ slug: cartItem.slug });
      if (!product) {
        return NextResponse.json(
          { success: false, error: "Product not found" },
          { status: 400 }
        );
      }

      const variant = product.variants.find(
        (v) => String(v.size) === String(variantSize)
      );
      if (!variant) {
        return NextResponse.json(
          { success: false, error: "Invalid variant size" },
          { status: 400 }
        );
      }
      cartItem.size = variant.size;
      cartItem.price = Number(price ?? variant.price);
    } else {
      cartItem.price = Number(price ?? cartItem.price);
    }

    cartItem.quantity = Number(quantity ?? cartItem.quantity);

    // 🔢 Recalculate totals
    const subTotal = cartItem.quantity * cartItem.price;
    const shipAmount = Number(shippingCharge ?? order.shippingCharge ?? 0);
    const discountAmount = Number(discount ?? order.discount ?? 0);
    order.shippingCharge = shipAmount;
    order.discount = discountAmount;
    order.couponCode = couponCode || null;

    order.totalAmount = Math.max(
      0,
      subTotal + shipAmount - discountAmount
    );

    // 📊 Track changes
    trackChange(changes, "Customer Name", order.userName, userName);
    trackChange(changes, "Phone", order.phone, phone);
    trackChange(changes, "Email", order.email, email);

    trackChange(changes, "Address", order.addressDetails?.address1, address);
    trackChange(changes, "City", order.addressDetails?.city, city);
    trackChange(changes, "State", order.addressDetails?.state, state);
    trackChange(changes, "Pincode", order.addressDetails?.pincode, pincode);

    trackChange(changes, "Quantity", oldValues.quantity, cartItem.quantity);
    trackChange(changes, "Price", oldValues.price, cartItem.price);
    trackChange(changes, "Shipping", oldValues.shipping, order.shippingCharge);
    trackChange(changes, "Discount", oldValues.discount, order.discount);
    trackChange(changes, "Coupon Code", oldValues.couponCode, order.couponCode);
    trackChange(changes, "Payment Method", order.paymentMethod, paymentMethod);

    // ✏️ Update editable fields
    order.userName = userName;
    order.email = email;
    order.phone = phone;
    order.addressDetails = {
      address1: address,
      city,
      state,
      pincode,
    };
    order.paymentMethod = paymentMethod;

    if (changes.length > 0) {
      order.orderHistory.push({
        type: "EDIT",
        at: new Date(),
        by: "admin",
        changes,
      });
    }

    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (e) {
    console.error("❌ EDIT ORDER ERROR:", e);
    return NextResponse.json(
      { success: false, error: "Failed to edit order" },
      { status: 500 }
    );
  }
}