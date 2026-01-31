/* app/contact-us/page.jsx */

/* ✅ SEO metadata (server-safe) */
export const metadata = {
  title: 'Contact Us – Raven Fragrance',
  description:
    'Get in touch with Raven Fragrance. We value thoughtful conversation, personal responses, and meaningful connections.',
};

import ContactPageClient from './ContactPageClient';

export default function ContactPage() {
  return <ContactPageClient />;
}
