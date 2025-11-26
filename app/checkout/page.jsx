// 🚫 Do NOT add "use client" here (server component)
// 🚫 Do NOT import useSearchParams

import CheckoutClient from "./CheckoutClient";

// SERVER WRAPPER
export default function CheckoutPage() {
  // Computed safely WITHOUT useSearchParams()
  const mode = null; // Always null on server (expected)

  return <CheckoutClient mode={mode} />;
}
