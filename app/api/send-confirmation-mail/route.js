import nodemailer from "nodemailer";
import orderConfirmationTemplate from "@/lib/email/templates/order-confirmation";
import { generateInvoice } from "@/lib/invoice/generateInvoice";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function POST(req) {
  try {
    // Authentication check: Verify API key or NextAuth session
    const apiKey = req.headers.get("x-api-key");
    const authToken = req.headers.get("authorization");
    
    if (!apiKey && !authToken) {
      return Response.json(
        { success: false, message: "Unauthorized: Missing credentials" },
        { status: 401 }
      );
    }

    // For now, verify API key (can be extended to NextAuth session later)
    const validApiKey = process.env.CONFIRMATION_EMAIL_API_KEY;
    if (apiKey && apiKey !== validApiKey) {
      return Response.json(
        { success: false, message: "Unauthorized: Invalid credentials" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      email,
      name,
      orderId,
      paymentMethod,
      subtotal,
      shippingCost,
      items,
      address,
    } = body;

    // Validate orderId is provided
    if (!orderId) {
      return Response.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    if (!email) {
      return Response.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Connect to database and fetch the canonical order record
    await connectToDatabase();
    const order = await Order.findById(orderId);

    if (!order) {
      return Response.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Use server-side values from the order record, not client-supplied values
    const serverDiscount = order.discount || 0;
    const serverCouponCode = order.couponCode || null;
    const serverTotalAmount = order.totalAmount;
    const serverItems = order.cartItems || items || [];
    const serverEmail = order.email || email;
    const serverName = order.userName || name;
    const serverPaymentMethod = order.paymentMethod || paymentMethod;
    const serverAddress = order.addressDetails || address;

    // Validate and coerce numeric fields from server values
    const subtotalNum = Number(order.subtotal || subtotal) || 0;
    const shippingCostNum = Number(order.shippingCharge || shippingCost) || 0;
    const discountNum = Number(serverDiscount) || 0;
    const totalAmountNum = Number(serverTotalAmount) || 0;

    // Verify all values are finite and non-negative
    if (!Number.isFinite(subtotalNum) || subtotalNum < 0) {
      return Response.json(
        { success: false, message: "Invalid subtotal in order record" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(shippingCostNum) || shippingCostNum < 0) {
      return Response.json(
        { success: false, message: "Invalid shipping cost in order record" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(discountNum) || discountNum < 0) {
      return Response.json(
        { success: false, message: "Invalid discount in order record" },
        { status: 400 }
      );
    }

    // Verify discount doesn't exceed subtotal + shipping
    const maxDiscount = subtotalNum + shippingCostNum;
    if (discountNum > maxDiscount) {
      return Response.json(
        { success: false, message: "Discount exceeds order total in record" },
        { status: 400 }
      );
    }

    // Compute expected total and verify math integrity
    const computedTotal = subtotalNum + shippingCostNum - discountNum;
    
    if (!Number.isFinite(totalAmountNum) || totalAmountNum < 0) {
      return Response.json(
        { success: false, message: "Invalid total amount in order record" },
        { status: 400 }
      );
    }

    // Check if provided total matches computed total (allow 0.01 tolerance for rounding)
    if (Math.abs(totalAmountNum - computedTotal) > 0.01) {
      return Response.json(
        { success: false, message: "Total amount calculation mismatch in order record" },
        { status: 400 }
      );
    }

    // Generate Invoice PDF
    const pdfBuffer = await generateInvoice({
      orderId: order.customOrderId || order._id.toString(),
      transactionDate: order.transactionDate || order.createdAt,

      customer: {
        name: serverName,
        email: serverEmail,
        phone: serverAddress?.phone || order.phone,
      },

      items: serverItems,

      subtotal: subtotalNum,
      shipping: shippingCostNum,

      // Use server-side values from order record
      discount: discountNum,
      couponCode: serverCouponCode,

      total: computedTotal,

      address: serverAddress,
      paymentMethod: serverPaymentMethod,
    });

    // Hostinger SMTP Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.hostinger.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `Raven Fragrance <${process.env.EMAIL_USER}>`,
      to: serverEmail,
      bcc: "ravenfragrances@gmail.com",
      subject: `Your Order ${orderId} is Confirmed – Raven Fragrance`,
      html: orderConfirmationTemplate({
        name: serverName,
        orderId: order.customOrderId || orderId,
        paymentMethod: serverPaymentMethod,
        subtotal: subtotalNum,
        shippingCost: shippingCostNum,
        discount: discountNum,   
        couponCode: serverCouponCode,
        totalAmount: computedTotal,
        items: serverItems,
        shipping: shippingCostNum,
        address: serverAddress,
        date: new Date().toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        receiptUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/receipt/${orderId}`,
      }),
      attachments: [
        {
          filename: `RavenFragrance-Invoice-${orderId}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    // 2️⃣ Send admin copy with server-side values
    await transporter.sendMail({
      from: `Raven Fragrance <${process.env.EMAIL_USER}>`,
      to: "contact@ravenfragrance.in",
      subject: `New Order Received - ${orderId}`,
      html: `
        <h2>New Order Received</h2>
        <p><strong>Customer:</strong> ${serverName}</p>
        <p><strong>Order ID:</strong> ${order.customOrderId || orderId}</p>
        <p><strong>Email:</strong> ${serverEmail}</p>
        <p><strong>Phone:</strong> ${serverAddress?.phone || order.phone}</p>
        <p><strong>Subtotal:</strong> ₹${subtotalNum.toFixed(2)}</p>
        <p><strong>Shipping:</strong> ₹${shippingCostNum.toFixed(2)}</p>
        ${
          discountNum > 0
            ? `<p><strong>Discount (${serverCouponCode}):</strong> - ₹${discountNum.toFixed(2)}</p>`
            : ""
        }
        <p><strong>Total Amount:</strong> ₹${computedTotal.toFixed(2)}</p>
        <br/>
        <p>Please login to Admin Panel for details.</p>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("❌ MAIL ERROR:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
