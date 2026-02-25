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


export async function PUT(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const body = await req.json();

    const order = await Order.findById(id);
    const changes = [];
    const item = order.cartItems[0];

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
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

      // ✅ ADD THESE
      discount,
      couponCode,
    } = body;

    const cartItem = order.cartItems[0];

    const oldValues = {
      quantity: order.cartItems[0].quantity,
      price: order.cartItems[0].price,
      shipping: order.shippingCharge,
      discount: order.discount || 0,     // ✅ ADD
      couponCode: order.couponCode || "",// ✅ ADD
    };


    // 🔁 If size changed, re-validate price
    if (variantSize && variantSize !== cartItem.size) {
      const product = await Product.findOne({ slug: cartItem.slug });
      if (!product) throw new Error("Product missing");

      const variant = product.variants.find(
        v => String(v.size) === String(variantSize)
      );
      if (!variant) throw new Error("Invalid variant");

      cartItem.size = variant.size;
      cartItem.price = Number(price || variant.price);
    } else {
      cartItem.price = Number(price || cartItem.price);
    }

    cartItem.quantity = Number(quantity || cartItem.quantity);

    // 🔢 Recalculate total
    const ship = Number(shippingCharge || 0);
    order.shippingCharge = ship;
    const subTotal = cartItem.quantity * cartItem.price;
    const shipAmount = Number(shippingCharge || 0);
    const discountAmount = Number(discount || 0);

    order.shippingCharge = shipAmount;
    order.discount = discountAmount;
    order.couponCode = couponCode || null;

    // ✅ NEW TOTAL LOGIC
    order.totalAmount = subTotal + shipAmount - discountAmount;

    trackChange(changes, "Customer Name", order.userName, userName);
    trackChange(changes, "Phone", order.phone, phone);
    trackChange(changes, "Email", order.email, email);

    trackChange(changes, "Address", order.addressDetails?.address1, address);
    trackChange(changes, "City", order.addressDetails?.city, city);
    trackChange(changes, "State", order.addressDetails?.state, state);
    trackChange(changes, "Pincode", order.addressDetails?.pincode, pincode);

    trackChange(
  changes,
  "Quantity",
  oldValues.quantity,
  cartItem.quantity
);

trackChange(
  changes,
  "Price",
  oldValues.price,
  cartItem.price
);

trackChange(
  changes,
  "Shipping",
  oldValues.shipping,
  order.shippingCharge
);

trackChange(
  changes,
  "Discount",
  oldValues.discount,
  order.discount
);

trackChange(
  changes,
  "Coupon Code",
  oldValues.couponCode,
  order.couponCode
);
    trackChange(changes, "Payment Method", order.paymentMethod, paymentMethod);


    // ✏️ Editable fields
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
