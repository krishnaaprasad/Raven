export const metadata = {
  title: "Privacy Policy | Raven Fragrance",
  description:
    "Understand how Raven Fragrance protects your privacy and personal information in India.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="bg-(--theme-bg) text-(--theme-text) px-5 md:px-20 py-16 transition-colors duration-500">
      <div className="max-w-4xl mx-auto border border-(--theme-border) bg-(--theme-soft) p-8 md:p-14">

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-[Crimson_Text] text-center mb-6 tracking-tight">
          Privacy Policy
        </h1>

        <p className="text-sm text-(--theme-muted) text-center mb-10 font-[system-ui]">
          Last updated: October 2025
        </p>

        {/* Intro */}
        <p className="mb-8 text-[1.05rem] text-(--theme-muted) font-[system-ui] leading-relaxed">
          At Raven, your privacy matters. This Privacy Policy explains how we
          collect, use, and protect your personal information within India.
        </p>

        {/* Sections */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 font-[Crimson_Text]">
            Information Collection
          </h2>
          <p className="text-(--theme-muted) font-[system-ui] leading-relaxed">
            We collect only essential details like your name, contact info, and
            address for order processing and customer support.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 font-[Crimson_Text]">
            Use of Information
          </h2>
          <p className="text-(--theme-muted) font-[system-ui] leading-relaxed">
            Your data is used solely for fulfilling orders, assisting you, and
            sharing occasional product updates. We do not share your information
            with third parties for marketing.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 font-[Crimson_Text]">
            Legal Compliance
          </h2>
          <p className="text-(--theme-muted) font-[system-ui] leading-relaxed">
            We follow all applicable data protection laws in India to ensure
            your privacy rights are respected.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 font-[Crimson_Text]">
            Data Retention
          </h2>
          <p className="text-(--theme-muted) font-[system-ui] leading-relaxed">
            Your information is retained only as long as needed for the purposes
            stated or as required by law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 font-[Crimson_Text]">
            Payment Data
          </h2>
          <p className="text-(--theme-muted) font-[system-ui] leading-relaxed">
            Raven does not store your card or banking details. Payments are
            securely handled by trusted payment gateway providers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 font-[Crimson_Text]">
            Contact Information
          </h2>
          <p className="text-(--theme-muted) font-[system-ui] leading-relaxed">
            For privacy-related queries, reach us at:
            <span className="ml-1 font-semibold text-(--theme-text)">
              ravenfragrances@gmail.com
            </span>
          </p>
        </section>

        {/* Closing */}
        <p className="mt-8 text-(--theme-muted) font-[system-ui]">
          By using Raven’s services, you agree to this Privacy Policy.
        </p>

        <p className="mt-6 font-semibold">Thank you for choosing Raven.</p>
        <p className="font-[system-ui] text-(--theme-muted)">Sincerely,</p>
        <p className="font-[system-ui] text-(--theme-muted)">
          The Raven Team
        </p>

      </div>
    </section>
  );
}
