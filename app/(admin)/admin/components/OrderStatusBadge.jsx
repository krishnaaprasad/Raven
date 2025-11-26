// components/OrderStatusBadge.jsx

export default function OrderStatusBadge({ status }) {
  const s = (status || "").toUpperCase();

  const map = {
    "PAYMENT AWAITING": "bg-[#ffe9c6] text-[#946200]",
    PROCESSING: "bg-[#fff4b8] text-[#735f00]",
    SHIPPED: "bg-[#cfe6ff] text-[#004c8f]",
    "OUT FOR DELIVERY": "bg-[#e2ffe2] text-[#006b2e]",
    DELIVERED: "bg-[#d1ffcf] text-[#0a7f13]",
    CANCELLED: "bg-[#ffd1d1] text-[#7e0b0b]",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full font-semibold text-[12px] ${map[s] || "bg-[#eee] text-[#444]"}`}
    >
      {status}
    </span>
  );
}
