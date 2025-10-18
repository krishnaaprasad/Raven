export const metadata = {
  title: "Terms & Conditions | Raven Fragrance",
  description: "Official terms and conditions of Raven Fragrance, including refund and cancellation policies.",
};

export default function TermsConditionsPage() {
  return (
    <section className="px-5 md:px-20 py-16 bg-[#f9f6f3] text-stone-700 leading-relaxed">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-14">
        <h1 className="text-4xl md:text-5xl font-serif text-[#b66f19] mb-6 text-center">
          Terms & Conditions
        </h1>
        <p className="text-sm text-gray-500 text-center mb-10">Last updated: October 2025</p>

        <p className="mb-10 text-[1.05rem] text-center text-gray-600">
          By accessing our website and purchasing our products, you agree to comply
          with and be bound by the following Terms & Conditions. Please read them carefully before making a purchase.
        </p>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">1. General</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Raven reserves the right to modify or update these terms at any time without prior notice.</li>
            <li>All products are for personal use only, not for resale or redistribution.</li>
            <li>Product visuals are for representation; packaging may vary.</li>
            <li>Prices, offers and product availability may change without notice.</li>
            <li>Continued use means acceptance of changes.</li>
          </ul>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">2. Orders & Payments</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Orders confirmed after successful payment authorization.</li>
            <li>Raven can refuse or cancel orders at its discretion.</li>
            <li>Customers are responsible for accurate delivery info.</li>
            <li>Payments are processed securely through trusted gateways.</li>
          </ul>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">3. Intellectual Property</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>All trademarks, logos, names and content belong to Raven Fragrance.</li>
            <li>Unauthorized use or copying of materials is prohibited.</li>
            <li>The Raven brand cannot be used without prior consent.</li>
          </ul>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">4. Limitation of Liability</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Raven is not liable for damages from product use, website use, or delivery delays.</li>
            <li>Fragrance experience may vary per individual.</li>
            <li>Courier or logistics issues beyond Raven’s control are not our responsibility.</li>
          </ul>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">5. Refund & Cancellation Policy</h2>
          <p>
            You may cancel orders within 1 hour of placement. After that, cancellations are not accepted to ensure freshness and quality.
          </p>
          <p className="mt-4">
            Due to the nature of fragrances and hygiene, <strong>refunds are not provided</strong> for changed minds or dissatisfaction.
            Refunds or replacements are only offered if products are damaged or defective upon delivery, consistent with our Store Replacement Policy.  
            Claims must be submitted with evidence within 7 days of receipt.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">6. Governing Law</h2>
          <p>
            These Terms are governed by the laws of India. Disputes fall under the jurisdiction of the courts in <span className="text-[#ad563c] font-medium">Mumbai, Maharashtra.</span>
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">7. Contact</h2>
          <p>
            Contact us for any questions about these terms or your orders: <br />
            <span className="text-[#ad563c] font-semibold">support@ravenfragrance.in</span><br />
            Support Hours: Monday – Saturday, 10:00 AM – 6:00 PM
          </p>
        </div>
      </div>
    </section>
  );
}
