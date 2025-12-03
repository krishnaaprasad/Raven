import connectToDatabase from "@/lib/mongodb";
import Cart from "@/models/Cart";
import { Order } from "@/models/Order";

export async function POST(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;   // ❌ no await

    const body = await req.json(); // form data sent from front

    const cart = await Cart.findById(id).populate("userId");
    if (!cart) {
      return Response.json({ success: false, message: "Cart not found" });
    }

    const totalAmount = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = new Order({
      userId: cart.userId?._id || null,
      userName: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address1,
      addressDetails: {
        address1: body.address1,
        address2: body.address2,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
      },
      cartItems: cart.items,
      deliveryType: "standard",
      shippingCharge: 0,
      totalAmount,
      payment_status: "PENDING",
      order_status: "Payment Awaiting",
    });

    await order.save();
    await Cart.findByIdAndDelete(id);

    return Response.json({
      success: true,
      orderId: order._id,
      clearCart: true,              // tells frontend to clear
      isGuest: !cart.userId,        // detect type
      sessionId: cart.sessionId || null
    });

  } catch (e) {
    console.error("Convert Error:", e);
    return Response.json({ success: false, message: e.message });
  }
}
