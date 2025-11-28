// /app/(admin)/admin/products/add/page.jsx
import AddProductClient from "./AddProductClient";

export const metadata = {
  title: "Add Product - Raven Fragrance Admin",
  description: "Add a new perfume to the Raven Fragrance catalogue.",
};

export default function AddProductPage() {
  return (
    <main className="min-h-screen bg-[#fcfbf8] px-0 py-0 md:px-0 md:py-0 lg:px-0 lg:py-0">
      <AddProductClient />
    </main>
  );
}
