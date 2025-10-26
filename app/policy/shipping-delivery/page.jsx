export const metadata = {
  title: "Shipping & Delivery Policy | Raven Fragrance",
  description:
    "Know how Raven Fragrance ships your orders, estimated delivery timelines, courier partners, and our handling process.",
};

export default function ShippingPolicyPage() {
  return (
    <section className="px-5 md:px-20 py-16 bg-[#f9f6f3] text-stone-700 leading-relaxed">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-14">
        <h1 className="text-4xl md:text-5xl font-serif text-[#b66f19] mb-6 text-center">
          Shipping & Delivery Policy
        </h1>
        <p className="text-sm text-gray-500 text-center mb-10">
          Last updated: October 2025
        </p>

        <p className="mb-8 text-[1.05rem] text-gray-600">
          At <strong>Raven Fragrance</strong>, we strive to deliver your orders promptly
          and with utmost care, maintaining the luxurious experience you expect
          from us.
        </p>

        {/* Order Processing */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">
            Order Processing Time
          </h2>
          <p className="text-gray-600">
            Orders are typically processed and shipped within{" "}
            <strong>24 hours</strong> of payment confirmation on working days
            (excluding Sundays and national holidays). During festive or high
            sale periods, processing time may extend up to 2–3 business days.
          </p>
        </section>

        {/* Delivery Time */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">
            Delivery Timeline
          </h2>
          <p className="text-gray-600">
            Estimated delivery timelines depend on the destination:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2 text-gray-600">
            <li>Metro Cities (India): 3–4 business days</li>
            <li>Other Serviceable Areas: 5–7 business days</li>
            <li>Remote / Rural Locations: 7–10 business days</li>
          </ul>
          <p className="mt-4 text-gray-600">
            Delivery times are estimates and may vary due to courier delays,
            weather, or unforeseen logistics challenges. We request your
            patience in such cases.
          </p>
        </section>

        {/* Courier Partners */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">
            Courier Partners
          </h2>
          <p className="text-gray-600">
            We collaborate with trusted courier partners such as{" "}
            <strong>BlueDart, Delhivery, DTDC, and India Post</strong> to ensure
            your orders reach you securely and on time.
          </p>
        </section>

        {/* Order Tracking */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">
            Order Tracking
          </h2>
          <p className="text-gray-600">
            Once your order is shipped, a tracking ID and courier details will
            be shared with you via email and/or SMS. You can track your shipment
            in real time using the provided tracking link.
          </p>
        </section>

        {/* Lost or Delayed Parcels */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">
            Lost or Delayed Parcels
          </h2>
          <p className="text-gray-600">
            In the rare event that your shipment is lost, delayed, or
            untraceable, please contact us immediately at{" "}
            <span className="text-[#ad563c] font-semibold">
              contact@ravenfragrance.in
            </span>{" "}
            or WhatsApp at{" "}
            <span className="text-[#ad563c] font-semibold">
              +91-8424832375
            </span>
            . Our support team will assist you in resolving the issue at the
            earliest.
          </p>
        </section>

        {/* Unexpected Delays & Disclaimer */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">
            Unexpected Delays & Disclaimer
          </h2>
          <p className="text-gray-600">
            At times, unavoidable logistics challenges or force majeure events
            may delay delivery. In such cases,{" "}
            <strong>
              Raven Fragrance (Legal Entity: ABHISHEK SURESH AMBRE)
            </strong>{" "}
            will not be held liable but will make every effort to ensure your
            product reaches you as soon as possible.
          </p>
          <p className="text-gray-600 mt-2">
            We also reserve the right to cancel orders that cannot be delivered
            due to service limitations or stock unavailability. In such
            scenarios, the full refund will be processed back to your source
            payment method.
          </p>
        </section>

        {/* Contact Info */}
        <section className="mt-10 border-t border-gray-200 pt-6 text-center">
          <h3 className="text-xl font-semibold text-[#c49939] mb-2">
            Need Assistance?
          </h3>
          <p className="text-gray-600">
            For queries related to shipping, delivery, or tracking, please
            contact:
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
