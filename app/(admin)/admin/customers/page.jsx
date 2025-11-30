import CustomersClient from "./CustomersClient";

export const metadata = {
  title: "Customer Management - Raven Fragrance Admin",
  description: "View and manage Raven Fragrance customers",
};

export default function CustomersPage() {
  return <CustomersClient />;
}
