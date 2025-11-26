// components/PaymentStatusBadge.jsx

export default function PaymentStatusBadge({ status }) {
  const s = (status || "").toUpperCase();

  const map = {
    PAID: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    FAILED: "bg-red-100 text-red-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-[12px] font-semibold ${map[s] || "bg-gray-200 text-gray-700"}`}
    >
      {status}
    </span>
  );
}
