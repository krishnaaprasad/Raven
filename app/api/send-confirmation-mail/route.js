import nodemailer from "nodemailer";
import orderConfirmationTemplate from "@/lib/email/templates/order-confirmation";
import { generateInvoice } from "@/lib/invoice/generateInvoice";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      email,
      name,
      orderId,
      paymentMethod,
      subtotal,
      shippingCost,
      discount = 0,
      couponCode = null,
      totalAmount,
      items,
      shipping,
      address,
    } = body;

    if (!email) {
      return Response.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Generate Invoice PDF
    const pdfBuffer = await generateInvoice({
      orderId,
      transactionDate: new Date(),

      customer: {
        name,
        email,
        phone: address.phone,
      },

      items,

      subtotal,
      shipping: shippingCost,

      // ✅ ADD THESE
      discount,
      couponCode,

      total: totalAmount,

      address,
      paymentMethod,
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
      to: email,
      bcc: "ravenfragrances@gmail.com",
      subject: `Your Order ${orderId} is Confirmed – Raven Fragrance`,
      html: orderConfirmationTemplate({
        name,
        orderId,
        paymentMethod,
        subtotal,
        shippingCost,
        discount,   
        couponCode,
        totalAmount,
        items,
        shipping,
        address,
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

    // 2️⃣ Send admin copy
    await transporter.sendMail({
      from: `Raven Fragrance <${process.env.EMAIL_USER}>`,
      to: "contact@ravenfragrance.in",
      subject: `New Order Received - ${orderId}`,
      html: `
        <h2>New Order Received</h2>
        <p><strong>Customer:</strong> ${name}</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${address.phone}</p>
        <p><strong>Subtotal:</strong> ₹${subtotal}</p>
        <p><strong>Shipping:</strong> ₹${shippingCost}</p>
        ${
          discount > 0
            ? `<p><strong>Discount (${couponCode}):</strong> - ₹${discount}</p>`
            : ""
        }
        <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
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
