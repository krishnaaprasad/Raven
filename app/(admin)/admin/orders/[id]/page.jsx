// app/(admin)/admin/orders/[id]/page.jsx
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import OrderDetailsClient from "./OrderDetailsClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Details - Raven Fragrance Admin",
  description: "View and manage individual order details",
};

async function getOrder(id) {
  await connectToDatabase();
  const doc = await Order.findById(id)
    .populate("userId", "name email phone isGuest role")
    .lean();

  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc));
}

export default async function AdminOrderDetailsPage({ params }) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) return notFound();

  return (
    <main className="p-0">
      <OrderDetailsClient orderFromServer={order} />
    </main>
  );
}
