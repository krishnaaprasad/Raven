'use client';

import { useState } from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

import ContactHero from './components/ContactHero';
import ContactInteractive from './components/ContactInteractive';
import ContactPhilosophy from './components/ContactPhilosophy';

export default function ContactPageClient() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
    >
      <div className="min-h-screen bg-(--theme-bg) transition-colors duration-500">

        {/* Toasts */}
        {submitted && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2
            bg-[#9a864c] text-white px-6 py-3 rounded-full
            text-sm shadow-lg z-50 animate-fade-in">
            ✨ Thank you! We’ll get back to you soon.
          </div>
        )}

        {error && (
          <div className="fixed top-2 left-1/2 -translate-x-1/2
            bg-red-600 text-white px-6 py-3 rounded-full
            text-sm shadow-lg z-50 animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        <ContactHero />
        <ContactInteractive
          setSubmitted={setSubmitted}
          setError={setError}
        />
        <ContactPhilosophy />
      </div>
    </GoogleReCaptchaProvider>
  );
}
