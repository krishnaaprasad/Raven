export const metadata = {
  title: "Privacy Policy | Raven Fragrance",
  description: "Understand how Raven Fragrance protects your privacy and personal information in India.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="px-5 md:px-20 py-16 bg-[#f9f6f3] text-stone-700 leading-relaxed">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-14">
        <h1 className="text-4xl md:text-5xl font-serif text-[#b66f19] mb-6 text-center">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 text-center mb-10">Last updated: October 2025</p>

        <p className="mb-8 text-[1.05rem] text-gray-600">
          At Raven, your privacy matters. This Privacy Policy explains how we collect, use, and protect your personal information within India.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">Information Collection</h2>
          <p>
            We collect only essential details like your name, contact info, and address for order processing and customer support.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">Use of Information</h2>
          <p>
            Your data is used solely for fulfilling orders, assisting you, and sharing occasional product updates. We do not share your information with third parties for marketing.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">Legal Compliance</h2>
          <p>
            We follow all applicable data protection laws in India to ensure your privacy rights are respected.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">Data Retention</h2>
          <p>
            Your information is retained only as long as needed for the purposes stated or as required by law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">Payment Data</h2>
          <p>
            Raven does not store your card or banking details. Payments are securely handled by trusted payment gateway providers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">Contact Information</h2>
          <p>
            For privacy-related queries, reach us at:{" "}
            <span className="text-[#ad563c] font-semibold">ravenfragrances@gmail.com</span>
          </p>
        </section>

        <p className="mt-8 text-gray-700">
          By using Raven’s services, you agree to this Privacy Policy.
        </p>

        <p className="mt-6 text-gray-700 font-semibold">Thank you for choosing Raven.</p>
        <p className="text-gray-700">Sincerely,</p>
        <p className="text-gray-700">The Raven Team</p>
      </div>
    </section>
  );
}
