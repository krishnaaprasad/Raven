export const metadata = {
  title: "Refund & Cancellation Policy | Raven Fragrance",
  description:
    "Read Raven Fragrance’s refund, return, and cancellation policy. Understand how returns and refunds are processed for your purchases.",
};

export default function RefundCancellationPolicyPage() {
  return (
    <section className="px-5 md:px-20 py-16 bg-[#f9f6f3] text-stone-700 leading-relaxed">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-14">
        <h1 className="text-4xl md:text-5xl font-serif text-[#b66f19] mb-6 text-center">
          Refund & Cancellation Policy
        </h1>
        <p className="text-sm text-gray-500 text-center mb-10">
          Last updated: October 2025
        </p>

        <p className="mb-8 text-[1.05rem] text-gray-600">
          At <strong>Raven Fragrance</strong>, customer satisfaction is our top
          priority. Please read our refund, return, and cancellation policy
          carefully before making a purchase.
        </p>

        {/* Return Policy */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">
            Return Policy
          </h2>
          <p className="text-gray-600 mb-4">
            Products must be returned to us within <strong>7 days</strong> from
            the date of delivery. All returns must be unused, with all tags
            intact, and in their original packaging, along with the courier
            receipt, invoice, and any other related documents.
          </p>
          <p className="text-gray-600">
            To initiate a return, please contact us via email at{" "}
            <span className="text-[#ad563c] font-semibold">
              contact@ravenfragrance.in
            </span>{" "}
            or WhatsApp at{" "}
            <span className="text-[#ad563c] font-semibold">
              +91-8424832375
            </span>
            . Once your request is reviewed, we’ll share the return instructions.
          </p>
        </section>

        {/* Refund Policy */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">
            Refund Policy
          </h2>
          <p className="text-gray-600 mb-4">
            Once the returned product is received successfully and inspected,
            <strong> Raven Fragrance (Legal Entity: ABHISHEK SURESH AMBRE)</strong>{" "}
            will initiate the refund instantly to your original payment method
            or another agreed refund method.
          </p>
          <p className="text-gray-600">
            Refunds may take up to 7–10 business days to reflect, depending on
            your bank or payment provider.
          </p>
        </section>

        {/* Refund & Cancellation for Service Providers */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">
            Refund & Cancellation for Service-Based Orders
          </h2>
          <p className="text-gray-600">
            Due to the nature of digital or service-based transactions,{" "}
            <strong>no refund</strong> and <strong>no cancellation</strong> will
            be entertained once payment has been successfully made.
          </p>
        </section>

        {/* Cancellation Policy */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">
            Cancellation Policy
          </h2>
          <p className="text-gray-600 mb-4">
            Orders can be cancelled within <strong>24 hours</strong> of placing
            them. Once the order is processed or shipped after 24 hours, no
            cancellation requests will be entertained.
          </p>
          <p className="text-gray-600">
            However, returns are still possible after delivery as per our return
            policy. To cancel an order, please contact us immediately at{" "}
            <span className="text-[#ad563c] font-semibold">
              contact@ravenfragrance.in
            </span>
            .
          </p>
        </section>

        {/* Shipping & Delivery Policy */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">
            Shipping & Delivery Policy
          </h2>
          <p className="text-gray-600 mb-4">
            <strong>Raven Fragrance</strong> ships to almost all locations
            across India. Orders placed are shipped within <strong>24 hours</strong>{" "}
            on all working days (excluding Sundays and national holidays).
          </p>
          <p className="text-gray-600 mb-4">
            For metro cities, delivery typically takes 3–4 business days after
            shipping. For remote areas, delivery may take 7–10 business days,
            depending on the courier partner.
          </p>
          <p className="text-gray-600">
            In rare cases, delivery may be delayed due to unforeseen logistical
            challenges. <strong>Raven Fragrance (ABHISHEK SURESH AMBRE)</strong>{" "}
            is not liable for such delays but will ensure continuous support. We
            also reserve the right to cancel any order that cannot be fulfilled
            due to logistics or inventory issues, and issue a full refund to the
            source account.
          </p>
        </section>

        {/* Contact Info */}
        <section className="mt-10 border-t border-gray-200 pt-6 text-center">
          <h3 className="text-xl font-semibold text-[#c49939] mb-2">
            Need Help?
          </h3>
          <p className="text-gray-600">
            For any refund, cancellation, or delivery issues, contact us at:
          </p>
          <p className="mt-2 text-[#ad563c] font-semibold">
            contact@ravenfragrance.in
          </p>
          <p className="text-gray-600">WhatsApp: +91-8424832375</p>
          <p className="text-gray-600 mt-2">
            Legal Entity Name:{" "}
            <span className="text-[#B4933A] font-medium">
              ABHISHEK SURESH AMBRE
            </span>
          </p>
        </section>
      </div>
    </section>
  );
}
