// Update pipeline for a bulk invoice: add `amount` (negative to reverse) to amountPaid and
// recompute paymentStatus from the NEW value — both in one atomic write.
export function applyPaymentPipeline(amount) {
  return [
    { $set: { amountPaid: { $add: ["$amountPaid", amount] } } },
    {
      $set: {
        paymentStatus: {
          $switch: {
            branches: [
              { case: { $gte: ["$amountPaid", "$totalAmount"] }, then: "received" },
              { case: { $gt: ["$amountPaid", 0] }, then: "partial" },
            ],
            default: "pending",
          },
        },
      },
    },
  ];
}
