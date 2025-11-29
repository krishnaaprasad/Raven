// app/(admin)/admin/products/[id]/edit/page.jsx
import EditProductClient from "./EditProductClient";

export const metadata = {
  title: "Edit Product - Raven Fragrance",
  description: "Edit an existing product in the Raven Fragrance catalog.",
};

export default async function EditProductPage(props) {
  const { id } = await props.params;
  return <EditProductClient productId={id} />;
}

