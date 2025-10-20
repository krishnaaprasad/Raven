import nodemailer from 'nodemailer'

// POST handler for contact form
export async function POST(req) {
  try {
    const { name, email, subject, message, token } = await req.json()

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
      host: 'smtp.hostinger.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER, // e.g., contact@ravenfragrance.in
        pass: process.env.EMAIL_PASS, // email password
      },
    })

    // Send mail
    await transporter.sendMail({
      from: `"Raven Fragrance Contact" <${process.env.EMAIL_USER}>`, // Must match authenticated email
      to: process.env.EMAIL_USER, // Your inbox (same email)
      replyTo: email, // User’s email for easy reply
      subject: subject || 'New Contact Form Message',
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
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
