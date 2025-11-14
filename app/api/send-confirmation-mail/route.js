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
      subject: `Your Order ${orderId} is Confirmed – Raven Fragrance`,
      html: orderConfirmationTemplate({
        name,
        orderId,
        paymentMethod,
        subtotal,
        shippingCost,
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

    return Response.json({ success: true });
  } catch (error) {
    console.error("❌ MAIL ERROR:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
