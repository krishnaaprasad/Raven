export const metadata = {
  title: "Privacy Policy | Raven Fragrance",
  description: "Learn how Raven Fragrance collects and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="px-5 md:px-20 py-16 bg-[#f9f6f3] text-stone-700 leading-relaxed">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-14">
        <h1 className="text-4xl md:text-5xl font-serif text-[#b66f19] mb-6 text-center">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 text-center mb-10">Last updated: October 18, 2025</p>

        <p className="mb-8 text-[1.05rem] text-gray-600">
          At Raven Fragrance, we respect your privacy and are dedicated to protecting your
          personal information. This Privacy Policy explains the types of information we collect,
          how we use it, and your rights.
        </p>

        {/* 1. Information We Collect */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">1. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Personal details such as your name, email address, and phone number.</li>
            <li>Shipping and billing addresses provided during checkout.</li>
            <li>Payment information, which is processed securely by trusted third-party payment gateways.</li>
            <li>Communications and customer service interactions with Raven Fragrance.</li>
          </ul>
        </section>

        {/* 2. How We Use Your Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To process and fulfill your orders in a timely manner.</li>
            <li>To provide effective customer support during and after your purchase.</li>
            <li>To enhance our services and improve communication with our customers.</li>
            <li>To comply with applicable legal and regulatory requirements.</li>
          </ul>
        </section>

        {/* 3. Data Security */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">3. Data Security</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>We use advanced security protocols to store and securely transmit your information.</li>
            <li>Payment data is handled exclusively by secure payment providers and is not stored on our servers.</li>
          </ul>
        </section>

        {/* 4. Sharing of Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">4. Sharing of Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>We do not sell or rent your personal data to any third parties.</li>
            <li>Your information may be shared with trusted partners strictly for order shipping and processing.</li>
          </ul>
        </section>

        {/* 5. Your Consent */}
        <section>
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">5. Your Consent</h2>
          <p>
            By using our website and services, you consent to the collection and use of your
            information as outlined in this Privacy Policy.
          </p>
        </section>
      </div>
    </section>
  );
}
