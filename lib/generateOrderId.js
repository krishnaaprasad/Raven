import { OrderCounter } from "@/models/Order";

export async function generateSequentialOrderIdFromItems(cartItems) {
  // India date (server is UTC — orders before 5:30 AM IST used to get yesterday's date)
  const istNow = new Date(Date.now() + 330 * 60 * 1000);
  const datePart = istNow.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  let prefix = "ORD";
  if (cartItems?.length === 1) {
    const first = cartItems[0];
    prefix =
      first?.slug?.substring(0, 3).toUpperCase() ||
      first?.name?.substring(0, 3).toUpperCase() ||
      "ORD";
  }

  const today = datePart;

  const counter = await OrderCounter.findOneAndUpdate(
    { prefix, date: today },
    {
      $inc: { seq: 1 },
      $setOnInsert: { date: today },
    },
    { upsert: true, new: true }
  );

  const seq = String(counter.seq).padStart(3, "0");
  return `${prefix}${datePart}${seq}`;
}
