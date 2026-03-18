'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import ContactHero from './components/ContactHero';
import ContactInteractive from './components/ContactInteractive';
import ContactPhilosophy from './components/ContactPhilosophy';

export default function ContactPageClient() {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
    >
      <div className="min-h-screen bg-(--theme-bg) transition-colors duration-500">
        <ContactHero />
        <ContactInteractive />
        <ContactPhilosophy />
      </div>
    </GoogleReCaptchaProvider>
  );
}
