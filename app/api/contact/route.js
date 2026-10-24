import nodemailer from 'nodemailer'

// Visitor input goes into an HTML email — escape it so nobody can inject links/markup
const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

// POST handler for contact form
export async function POST(req) {
  try {
    const { name, email, phone, subject, message } = await req.json()

    // Type-check first: a number/array here would otherwise throw (500) or slip through via String()
    if (
      typeof name !== 'string' || !name.trim() ||
      typeof message !== 'string' || !message.trim() ||
      typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      (phone != null && typeof phone !== 'string') ||
      (subject != null && typeof subject !== 'string')
    ) {
      return new Response(JSON.stringify({ success: false, message: 'Name, valid email and message are required' }), { status: 400 })
    }
    if (message.length > 5000 || name.length > 100 || (subject || '').length > 200 || (phone || '').length > 20) {
      return new Response(JSON.stringify({ success: false, message: 'Message is too long' }), { status: 400 })
    }

    // Optional: verify reCAPTCHA server-side here if needed
    // const recaptchaRes = await fetch(
    //   `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    //   { method: 'POST' }
    // )
    // const recaptchaData = await recaptchaRes.json()
    // if (!recaptchaData.success) {
    //   return new Response(JSON.stringify({ success: false, message: 'reCAPTCHA failed' }), { status: 400 })
    // }

    // Create Hostinger SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.MAIL_PORT) || 465,
      secure: Number(process.env.MAIL_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    })

    // Send mail
    await transporter.sendMail({
      from: `"Raven Fragrance Contact" <${process.env.EMAIL_USER}>`,
      to: "ravenfragrances@gmail.com",
      replyTo: email,
      subject: (subject || 'New Contact Form Message').replace(/[\r\n]/g, ' '),
      html: `
        <h2>New Inquiry Received</h2>
        <p><strong>Name:</strong> ${esc(name)}</p>
        <p><strong>Email:</strong> ${esc(email)}</p>
        <p><strong>Phone:</strong> ${esc(phone || "Not Provided")}</p>
        <p><strong>Subject:</strong> ${esc(subject || "General Inquiry")}</p>
        <p><strong>Message:</strong><br/>${esc(message).replace(/\n/g, '<br/>')}</p>
        <br/>
        <p>This message was sent from the Raven Fragrance Contact Form.</p>
      `,
    })

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    console.error('Contact API Error:', err)
    return new Response(
      JSON.stringify({ success: false, message: 'Failed to send email' }),
      { status: 500 }
    )
  }
}
