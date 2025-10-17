export default function OrdersPage() {
  const orders = [
    { id: "ORD1003", date: "2025-10-16", status: "Completed", total: "₹799", items: 1 },
    { id: "ORD1002", date: "2025-09-29", status: "Completed", total: "₹799", items: 1 },
  ]

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-8 text-[#c49939]">Your Orders</h2>
      {!orders.length ? (
        <div className="text-stone-600">No orders yet. Discover your favorite fragrance!</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border shadow bg-white">
          <table className="min-w-full text-stone-900">
            <thead>
              <tr className="bg-[#fff7e3]">
                <th className="p-4 font-semibold">Order #</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t text-center">
                  <td className="p-4">{o.id}</td>
                  <td className="p-4">{o.date}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${o.status === "Completed" ? "bg-[#ffedb7] text-[#b99121]" : "bg-red-50 text-red-500"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4">{o.total} ({o.items} item)</td>
                  <td className="p-4">
                    <button className="px-4 py-1 rounded-lg bg-[#ad563c] text-white font-semibold hover:bg-[#c49939]">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
