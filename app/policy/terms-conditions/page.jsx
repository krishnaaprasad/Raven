export const metadata = {
  title: "Terms & Conditions | Raven Fragrance",
  description:
    "Official terms and conditions of Raven Fragrance, outlining website usage, orders, intellectual property, and governing law.",
};

export default function TermsConditionsPage() {
  return (
    <section className="px-5 md:px-20 py-16 bg-[#f9f6f3] text-stone-700 leading-relaxed">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-14">
        <h1 className="text-4xl md:text-5xl font-serif text-[#b66f19] mb-6 text-center">
          Terms & Conditions
        </h1>
        <p className="text-sm text-gray-500 text-center mb-10">
          Last updated: October 2025
        </p>

        <p className="mb-10 text-[1.05rem] text-center text-gray-600">
          By accessing and using our website, you agree to comply with and be bound by
          the following Terms & Conditions. Please read them carefully before making a purchase.
        </p>

        {/* 1. General */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">1. General</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Raven Fragrance reserves the right to modify or update these terms at any
              time without prior notice.
            </li>
            <li>All products are for personal use only and not for resale.</li>
            <li>
              Product images are for representation purposes only — packaging and
              appearance may vary slightly.
            </li>
            <li>
              Prices, offers, and product availability are subject to change without
              notice.
            </li>
            <li>
              Continued use of the website after changes indicates acceptance of those
              changes.
            </li>
          </ul>
        </section>

        {/* 2. Orders & Payments */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">
            2. Orders & Payments
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Orders are processed only after successful payment confirmation.</li>
            <li>Raven Fragrance reserves the right to cancel or refuse any order.</li>
            <li>
              Customers are responsible for providing accurate contact and delivery
              details.
            </li>
            <li>
              Payments are securely processed through trusted gateways. Raven Fragrance
              does not store any card or banking details.
            </li>
          </ul>
        </section>

        {/* 3. Intellectual Property */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">
            3. Intellectual Property
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              All trademarks, logos, images, and written content on this website are the
              property of Raven Fragrance.
            </li>
            <li>
              Any unauthorized reproduction, distribution, or use of content is strictly
              prohibited.
            </li>
            <li>
              The Raven Fragrance name and logo may not be used without prior written
              permission.
            </li>
          </ul>
        </section>

        {/* 4. Limitation of Liability */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">
            4. Limitation of Liability
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Raven Fragrance is not liable for any direct or indirect damages arising
              from the use of our website or products.
            </li>
            <li>
              Fragrance experience may differ from person to person based on individual
              body chemistry and preferences.
            </li>
            <li>
              We are not responsible for courier or logistics delays beyond our control.
            </li>
          </ul>
        </section>

        {/* 5. Governing Law */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">
            5. Governing Law
          </h2>
          <p>
            These Terms & Conditions are governed by the laws of India. Any disputes or
            claims shall fall under the exclusive jurisdiction of the courts in{" "}
            <span className="text-[#ad563c] font-medium">Mumbai, Maharashtra</span>.
          </p>
        </section>

        {/* 6. Contact */}
        <section>
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">
            6. Contact Information
          </h2>
          <p>
            For any questions or concerns regarding these Terms & Conditions, please
            contact us at: <br />
            <span className="text-[#ad563c] font-semibold">
              contact@ravenfragrance.in
            </span>
            <br />
            Support Hours: Monday – Saturday, 10:00 AM – 6:00 PM <br />
            Legal Entity Name: <strong>ABHISHEK SURESH AMBRE</strong>
          </p>
        </section>
      </div>
    </section>
  );
}
