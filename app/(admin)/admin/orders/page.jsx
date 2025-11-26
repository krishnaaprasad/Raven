// app/admin/orders/page.jsx
import OrdersClient from "./OrdersClient";

export const metadata = {
  title: "Orders - Raven Fragrance",
  description: "Admin — Orders list and management • Raven Fragrance",
};

export default function OrdersPage() {
  // This page intentionally only renders the main Orders client component
  return (
    <main className="p-0">
      <OrdersClient />
    </main>
  );
}
