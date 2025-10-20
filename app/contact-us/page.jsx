'use client'
import React, { useState } from 'react'
import Head from 'next/head'
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3'

function ContactForm({ setSubmitted, setError }) {
  const { executeRecaptcha } = useGoogleReCaptcha()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validateField = (name, value) => {
    let error = ''
    if (!value.trim()) error = 'This field is required.'
    else if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      error = 'Please enter a valid email address.'
    setErrors((prev) => ({ ...prev, [name]: error }))
    return error === ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    validateField(name, value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isValid = Object.keys(form).every((key) => validateField(key, form[key]))
    if (!isValid) return

    if (!executeRecaptcha) {
      setError('reCAPTCHA not ready.')
      return
    }

    setLoading(true)
    try {
      const token = await executeRecaptcha('contact_form')

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, token }),
      })

      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
        setForm({ name: '', email: '', subject: '', message: '' })
        setErrors({})
        setError('')
        setTimeout(() => setSubmitted(false), 3000)
      } else {
        setError(data.message || 'Failed to send message.')
      }
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again later.')
    }
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-[620px] bg-white rounded-2xl shadow-md border border-[#e4d5b5] px-8 py-10"
    >
      {[
        { label: 'Name', name: 'name', type: 'text', placeholder: 'Your Name' },
        { label: 'Email', name: 'email', type: 'email', placeholder: 'Your Email' },
        { label: 'Subject', name: 'subject', type: 'text', placeholder: 'Subject' },
      ].map((field, i) => (
        <div key={i} className="mb-6">
          <label className="block text-[#191919] font-medium mb-2">{field.label}</label>
          <input
            name={field.name}
            type={field.type}
            placeholder={field.placeholder}
            value={form[field.name]}
            onChange={handleChange}
            className={`w-full h-14 px-5 rounded-xl border ${
              errors[field.name] ? 'border-red-500' : 'border-[#e7e1cf]'
            } bg-[#FAF5E8] text-[#191919] placeholder:text-[#B4933A]/70 focus:outline-none focus:ring-1 focus:ring-[#B4933A] transition-all`}
          />
          {errors[field.name] && <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>}
        </div>
      ))}

      <div className="mb-7">
        <label className="block text-[#191919] font-medium mb-2">Message</label>
        <textarea
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={handleChange}
          className={`w-full min-h-36 px-5 py-3 rounded-xl border ${
            errors.message ? 'border-red-500' : 'border-[#e7e1cf]'
          } bg-[#FAF5E8] text-[#191919] placeholder:text-[#B4933A]/70 focus:outline-none focus:ring-1 focus:ring-[#B4933A] transition-all resize-none`}
        ></textarea>
        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-[#B4933A] hover:bg-[#a07f2e] text-white font-semibold h-14 rounded-xl transition-all shadow-sm flex items-center justify-center ${
          loading ? 'cursor-not-allowed opacity-70' : ''
        }`}
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}

function ContactPageInner() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  return (
    <div
      className="relative flex min-h-screen w-full flex-col bg-[#FAF5E8] overflow-x-hidden"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      {/* Toasts */}
      {submitted && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#B4933A] text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium z-50 transition-all animate-fade-in">
          ✨ Thank you! We’ll get back to you soon.
        </div>
      )}
      {error && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium z-50 transition-all animate-fade-in">
          ⚠️ {error}
        </div>
      )}

      <div className="flex justify-center py-20 px-6 sm:px-12 lg:px-24">
        <div className="max-w-[1080px] w-full flex flex-col">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-serif text-[#b66f19] mb-6 text-center">
              Contact Us
            </h1>
            <p className="mb-3 text-[1.08rem] text-center text-gray-600 mx-auto">
              Reach out for any questions or feedback, our team ensures every Raven experience feels personal and refined.
            </p>
          </div>

          <ContactForm setSubmitted={setSubmitted} setError={setError} />

          <div className="mt-16">
            <h2 className="text-[#191919] text-2xl font-bold mb-3 text-center">Our Location</h2>
            <p className="text-[#191919]/80 text-center mb-8">
              Visit our place or reach us through the details below.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-[#B4933A] font-medium">Address</p>
                <p className="text-[#191919] text-sm mt-1">60ft Road, Sakinaka, Mumbai, India</p>
              </div>
              <div>
                <p className="text-[#B4933A] font-medium">Phone</p>
                <p className="text-[#191919] text-sm mt-1">+91 84248 32375</p>
              </div>
              <div>
                <p className="text-[#B4933A] font-medium">Email</p>
                <p className="text-[#191919] text-sm mt-1">support@ravenfragrance.in</p>
              </div>
            </div>

            <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-lg mt-6">
              <iframe
                src="https://www.google.com/maps?q=Sakinaka,+Mumbai,+India+400072&output=embed"
                width="100%"
                height="100%"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-in-out;
        }
      `}</style>
    </div>
  )
}

// Export with GoogleReCaptchaProvider
export default function ContactPage() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}>
      <Head>
        <title>Contact Us - Raven Fragrance</title>
      </Head>
      <ContactPageInner />
    </GoogleReCaptchaProvider>
  )
}
