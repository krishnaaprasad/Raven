import nodemailer from 'nodemailer'

// POST handler for contact form
export async function POST(req) {
  try {
    const { name, email, phone, subject, message, token } = await req.json()

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
      subject: subject || 'New Contact Form Message',
      html: `
        <h2>New Inquiry Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not Provided"}</p>
        <p><strong>Subject:</strong> ${subject || "General Inquiry"}</p>
        <p><strong>Message:</strong><br/>${message}</p>
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
