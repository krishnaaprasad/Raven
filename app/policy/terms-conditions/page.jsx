export const metadata = {
  title: "Terms & Conditions | Raven Fragrance",
  description:
    "Official terms and conditions of Raven Fragrance, outlining website usage, orders, intellectual property, and governing law.",
};

export default function TermsConditionsPage() {
  return (
    <section className="bg-(--theme-bg) text-(--theme-text) px-5 md:px-20 py-16 transition-colors duration-500">
      <div className="max-w-4xl mx-auto border border-(--theme-border) bg-(--theme-soft) p-8 md:p-14">

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-[Crimson_Text] text-center mb-6 tracking-tight">
          Terms & Conditions
        </h1>

        <p className="text-sm text-(--theme-muted) text-center mb-10 font-[system-ui]">
          Last updated: October 2025
        </p>

        <p className="mb-10 text-[1.05rem] text-center text-(--theme-muted) font-[system-ui] leading-relaxed">
          By accessing and using our website, you agree to comply with and be bound by
          the following Terms & Conditions. Please read them carefully before making a purchase.
        </p>

        {/* 1. General */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 font-[Crimson_Text]">
            1. General
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-(--theme-muted) font-[system-ui] leading-relaxed">
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
          <h2 className="text-2xl font-semibold mb-4 font-[Crimson_Text]">
            2. Orders & Payments
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-(--theme-muted) font-[system-ui] leading-relaxed">
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
          <h2 className="text-2xl font-semibold mb-4 font-[Crimson_Text]">
            3. Intellectual Property
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-(--theme-muted) font-[system-ui] leading-relaxed">
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
          <h2 className="text-2xl font-semibold mb-4 font-[Crimson_Text]">
            4. Limitation of Liability
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-(--theme-muted) font-[system-ui] leading-relaxed">
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
          <h2 className="text-2xl font-semibold mb-4 font-[Crimson_Text]">
            5. Governing Law
          </h2>
          <p className="text-(--theme-muted) font-[system-ui] leading-relaxed">
            These Terms & Conditions are governed by the laws of India. Any disputes or
            claims shall fall under the exclusive jurisdiction of the courts in{" "}
            <span className="font-medium text-(--theme-text)">
              Mumbai, Maharashtra
            </span>.
          </p>
        </section>

        {/* 6. Contact */}
        <section className="border-t border-(--theme-border) pt-8">
          <h2 className="text-2xl font-semibold mb-4 font-[Crimson_Text]">
            6. Contact Information
          </h2>
          <p className="text-(--theme-muted) font-[system-ui] leading-relaxed">
            For any questions or concerns regarding these Terms & Conditions, please
            contact us at:
          </p>

          <p className="mt-3 font-semibold text-(--theme-text)">
            contact@ravenfragrance.in
          </p>

          <p className="text-(--theme-muted) font-[system-ui]">
            Support Hours: Monday – Saturday, 10:00 AM – 6:00 PM
          </p>

          <p className="text-(--theme-muted) font-[system-ui] mt-2">
            Legal Entity Name:{" "}
            <span className="font-medium text-(--theme-text)">
              ABHISHEK SURESH AMBRE
            </span>
          </p>
        </section>

      </div>
    </section>
  );
}
