export const metadata = {
  title: "Refund & Cancellation Policy | Raven Fragrance",
  description:
    "Read Raven Fragrance’s refund, return, and cancellation policy. Understand how returns and refunds are processed for your purchases.",
};

export default function RefundCancellationPolicyPage() {
  return (
    <section className="bg-(--theme-bg) text-(--theme-text) px-5 md:px-20 py-16 transition-colors duration-500">
      <div className="max-w-4xl mx-auto border border-(--theme-border) bg-(--theme-soft) p-8 md:p-14">

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-[Crimson_Text] text-center mb-6 tracking-tight">
          Refund & Cancellation Policy
        </h1>

        <p className="text-sm text-(--theme-muted) text-center mb-10 font-[system-ui]">
          Last updated: October 2025
        </p>

        {/* Intro */}
        <p className="mb-8 text-[1.05rem] text-(--theme-muted) font-[system-ui] leading-relaxed">
          At <strong className="text-(--theme-text)">Raven Fragrance</strong>, customer satisfaction is our top
          priority. Please read our refund, return, and cancellation policy
          carefully before making a purchase.
        </p>

        {/* Return Policy */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 font-[Crimson_Text]">
            Return Policy
          </h2>

          <p className="text-(--theme-muted) mb-4 font-[system-ui] leading-relaxed">
            Products must be returned to us within <strong className="text-(--theme-text)">7 days</strong> from
            the date of delivery. All returns must be unused, with all tags
            intact, and in their original packaging, along with the courier
            receipt, invoice, and any other related documents.
          </p>

          <p className="text-(--theme-muted) font-[system-ui] leading-relaxed">
            To initiate a return, please contact us via email at{" "}
            <span className="font-semibold text-(--theme-text)">
              contact@ravenfragrance.in
            </span>{" "}
            or WhatsApp at{" "}
            <span className="font-semibold text-(--theme-text)">
              +91-8424832375
            </span>
            . Once your request is reviewed, we’ll share the return instructions.
          </p>
        </section>

        {/* Refund Policy */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 font-[Crimson_Text]">
            Refund Policy
          </h2>

          <p className="text-(--theme-muted) mb-4 font-[system-ui] leading-relaxed">
            Once the returned product is received successfully and inspected,
            <strong className="text-(--theme-text)">
              {" "}Raven Fragrance (Legal Entity: ABHISHEK SURESH AMBRE)
            </strong>{" "}
            will initiate the refund instantly to your original payment method
            or another agreed refund method.
          </p>

          <p className="text-(--theme-muted) font-[system-ui] leading-relaxed">
            Refunds may take up to 7–10 business days to reflect, depending on
            your bank or payment provider.
          </p>
        </section>

        {/* Service-Based Orders */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 font-[Crimson_Text]">
            Refund & Cancellation for Service-Based Orders
          </h2>

          <p className="text-(--theme-muted) font-[system-ui] leading-relaxed">
            Due to the nature of digital or service-based transactions,
            <strong className="text-(--theme-text)"> no refund </strong>
            and
            <strong className="text-(--theme-text)"> no cancellation </strong>
            will be entertained once payment has been successfully made.
          </p>
        </section>

        {/* Cancellation Policy */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 font-[Crimson_Text]">
            Cancellation Policy
          </h2>

          <p className="text-(--theme-muted) mb-4 font-[system-ui] leading-relaxed">
            Orders can be cancelled within{" "}
            <strong className="text-(--theme-text)">24 hours</strong> of placing
            them. Once the order is processed or shipped after 24 hours, no
            cancellation requests will be entertained.
          </p>

          <p className="text-(--theme-muted) font-[system-ui] leading-relaxed">
            However, returns are still possible after delivery as per our return
            policy. To cancel an order, please contact us immediately at{" "}
            <span className="font-semibold text-(--theme-text)">
              contact@ravenfragrance.in
            </span>
            .
          </p>
        </section>

        {/* Contact Section */}
        <section className="mt-10 border-t border-(--theme-border) pt-6 text-center">
          <h3 className="text-xl font-semibold font-[Crimson_Text] mb-2">
            Need Help?
          </h3>

          <p className="text-(--theme-muted) font-[system-ui]">
            For any refund, cancellation, or delivery issues, contact us at:
          </p>

          <p className="mt-2 font-semibold text-(--theme-text)">
            contact@ravenfragrance.in
          </p>

          <p className="text-(--theme-muted) font-[system-ui]">
            WhatsApp: +91-8424832375
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
