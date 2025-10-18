export const metadata = {
  title: "Shipping & Delivery Policy | Raven Fragrance",
  description: "Know how Raven Fragrance ships your orders, estimated delivery times and courier partners.",
};

export default function ShippingPolicyPage() {
  return (
    <section className="px-5 md:px-20 py-16 bg-[#f9f6f3] text-stone-700 leading-relaxed">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-14">
        <h1 className="text-4xl md:text-5xl font-serif text-[#b66f19] mb-6 text-center">
          Shipping & Delivery Policy
        </h1>

        <p className="mb-8 text-[1.05rem] text-gray-600">
          At Raven Fragrance, we strive to deliver your orders promptly and with utmost care, maintaining the luxury experience you expect.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">Order Processing Time</h2>
          <p>
            Orders are processed within 1-2 business days of payment confirmation. Processing times may be longer during peak sale periods or public holidays.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">Delivery Time</h2>
          <p>
            Estimated delivery times vary by location:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Within India: 3-7 business days</li>
            <li>International: 7-14 business days (subject to customs processing)</li>
          </ul>
          <p className="mt-4">
            Shipping times are estimates and may be affected by factors outside our control, including courier delays and customs clearance.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">Courier Partners</h2>
          <p>
            We work with trusted courier partners such as BlueDart, Delhivery, and FedEx to ensure your package reaches you securely and on time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">Order Tracking</h2>
          <p>
            Once your order ships, you will receive a tracking ID via email or SMS allowing you to monitor your shipment’s status.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">Lost or Delayed Parcels</h2>
          <p>
            In case of lost or significantly delayed shipments, please contact our support team promptly at <span className="text-[#ad563c] font-semibold">support@ravenfragrance.in</span> or WhatsApp +91-XXXXXXXXXX so we can assist you.
          </p>
        </section>
      </div>
    </section>
  )
}
