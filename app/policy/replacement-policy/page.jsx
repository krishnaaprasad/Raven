export const metadata = {
  title: "Store Replacement Policy | Raven Fragrance",
  description: "Learn about Raven Fragrance's replacement policy for damaged or defective products.",
};

export default function ReplacementPolicyPage() {
  return (
    <section className="px-5 md:px-20 py-16 bg-[#f9f6f3] text-stone-700 leading-relaxed">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-14">
        <h1 className="text-4xl md:text-5xl font-serif text-[#b66f19] mb-6 text-center">
          Store Replacement Policy
        </h1>
        <p className="text-sm text-gray-500 text-center mb-10">Last updated: October 2025</p>

        <p className="mb-8 text-[1.05rem] text-gray-600">
          At Raven Fragrance, we take pride in our quality and care in packaging. However, if your order arrives damaged or defective, we’re here to help.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">Eligibility for Replacement</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Replacements are accepted only for items that are damaged or defective upon delivery.</li>
            <li>You must notify us within 7 days of receiving your order.</li>
            <li>To be eligible, items must be unused, in original packaging, and accompanied by proof of purchase and photo/video evidence showing the damage.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">Non-Replaceable Items</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Replacements are not accepted for personal preferences, wrong purchase, or a change of mind.</li>
            <li>Used products are ineligible for replacement due to hygiene concerns.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">Replacement Process</h2>
          <p>Once your claim is approved, we will offer a free replacement at no additional cost. If the item is unavailable, alternatives will be discussed.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">How to Initiate a Replacement</h2>
          <p>
            Please email us at <span className="text-[#ad563c] font-semibold">support@ravenfragrance.in</span> or message on WhatsApp <span className="text-[#ad563c] font-semibold">+91-XXXXXXXXXX</span> with:  
          </p>
          <ol className="list-decimal pl-6 space-y-2 mt-2">
            <li>Your order number</li>
            <li>Description of the issue</li>
            <li>Clear photos or videos of the damaged item</li>
          </ol>
          <p className="mt-4">Our team will expedite your request with next steps.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-[#c49939] mb-4">Additional Notes</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Please keep all original packaging until the replacement process is complete.</li>
            <li>Shipping costs for eligible replacements will be covered by Raven Fragrance.</li>
            <li>Replacement delivery usually takes 7-14 business days after approval.</li>
          </ul>
        </section>
      </div>
    </section>
  );
}
