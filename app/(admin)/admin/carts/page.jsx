"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Calendar, ChevronDown, X, ShoppingCart, Users } from "lucide-react";

const PAGE_SIZE = 10;

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState([]);
  const [stats, setStats] = useState({
    totalCarts: 0,
    guestCarts: 0,
    registeredCarts: 0,
  });

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const [typeOpen, setTypeOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const [selectedCart, setSelectedCart] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest(".dropdown-type") && !e.target.closest(".dropdown-date")) {
        setTypeOpen(false);
        setDateOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams({
          page,
          limit: PAGE_SIZE,
          search,
          type,
          dateRange,
        });

        const res = await fetch(`/api/admin/carts?${params.toString()}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        setCarts(data.carts);
        setTotal(data.total);
        setPages(data.pages);
        setStats(data.stats);
      } catch (err) {
        console.error("Error loading carts:", err);
      }
    }

    load();
  }, [page, search, type, dateRange]);

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <main className="font-[Manrope,sans-serif] text-[#1b180d] space-y-6 min-h-screen">

      <h1 className="text-2xl font-bold">Abandoned Carts</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<ShoppingCart size={22} />} label="Total Carts" value={stats.totalCarts} />
        <StatCard icon={<Users size={22} />} label="Guest Carts" value={stats.guestCarts} />
        <StatCard icon={<Users size={22} />} label="Registered Carts" value={stats.registeredCarts} />
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-wrap items-center gap-3">
        
        <div className="flex items-center h-11 w-full md:flex-1 rounded-lg border border-[#e7e1cf] bg-white">
          <span className="px-3 text-gray-500">
            <Search size={18} />
          </span>
          <input
            className="flex-1 h-full text-sm outline-none"
            placeholder="Search by name, email or session…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {search && (
            <button className="px-3 text-gray-400" onClick={() => setSearch("")}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* TYPE */}
        <div className="relative dropdown-type">
          <button
            className="flex items-center gap-2 h-11 px-4 rounded-lg border border-[#e7e1cf] bg-white text-sm"
            onClick={() => {
              setTypeOpen(!typeOpen);
              setDateOpen(false);
            }}
          >
            <Filter size={16} />
            <span>User Type: {type === "all" ? "All" : type === "guest" ? "Guest" : "Registered"}</span>
            <ChevronDown size={14} />
          </button>

          {typeOpen && (
            <div className="absolute mt-2 left-0 w-44 bg-white shadow-lg border border-[#e7e1cf] rounded-lg z-20">
              <DropdownItem label="All" active={type === "all"} onClick={() => setType("all")} />
              <DropdownItem label="Guest" active={type === "guest"} onClick={() => setType("guest")} />
              <DropdownItem label="Registered" active={type === "registered"} onClick={() => setType("registered")} />
            </div>
          )}
        </div>

        {/* DATE */}
        <div className="relative dropdown-date">
          <button
            className="flex items-center gap-2 h-11 px-4 rounded-lg border border-[#e7e1cf] bg-white text-sm"
            onClick={() => {
              setDateOpen(!dateOpen);
              setTypeOpen(false);
            }}
          >
            <Calendar size={16} />
            <span>{dateRange === "all" ? "Date Range" : dateRange === "7" ? "Last 7 Days" : "Last 30 Days"}</span>
            <ChevronDown size={14} />
          </button>

          {dateOpen && (
            <div className="absolute mt-2 left-0 w-44 bg-white shadow-lg border border-[#e7e1cf] rounded-lg z-20">
              <DropdownItem label="All Time" active={dateRange === "all"} onClick={() => setDateRange("all")} />
              <DropdownItem label="Last 7 Days" active={dateRange === "7"} onClick={() => setDateRange("7")} />
              <DropdownItem label="Last 30 Days" active={dateRange === "30"} onClick={() => setDateRange("30")} />
            </div>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border border-[#e7e1cf] overflow-hidden bg-white overflow-x-auto">
        <table className="min-w-[800px] w-full text-sm divide-y divide-[#e7e1cf]">
          <thead className="bg-[#f5f1e6]">
            <tr>
              <th className="py-3 pl-4 text-left font-semibold">User</th>
              <th className="px-3 text-left font-semibold">Items</th>
              <th className="px-3 text-left font-semibold">Total Value</th>
              <th className="px-3 text-left font-semibold">Last Updated</th>
              <th></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#e7e1cf] bg-[#fcfbf8]">
            {carts.map((c) => (
              <tr key={c._id}>
                <td className="py-4 pl-4">
                  <p className="font-medium">{c.userId ? c.userId.name : `Guest-${c.sessionId.slice(0, 6)}`}</p>
                  <p className="text-xs text-gray-500">{c.userId ? c.userId.email : "Guest User"}</p>
                </td>

                <td className="px-3">{c.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                <td className="px-3 font-semibold">₹{c.items.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString("en-IN")}</td>
                <td className="px-3">{new Date(c.updatedAt).toLocaleString()}</td>

                <td className="pr-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedCart(c);
                      setDrawerOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#e7e1cf] text-xs hover:bg-[#f5f1e6]"
                  >
                    View Cart
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 text-sm">
          <p>
            Showing <b>{from}</b> to <b>{to}</b> of <b>{total}</b> results
          </p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 border border-[#e7e1cf] rounded disabled:opacity-40">
              Previous
            </button>
            <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 border border-[#e7e1cf] rounded disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </div>

      {drawerOpen && (
        <CartDrawer
          cart={selectedCart}
          onClose={() => setDrawerOpen(false)}
          onConvert={() => setOrderModalOpen(true)}
        />
      )}

      {orderModalOpen && (
      <ConvertToOrderModal 
        cart={selectedCart} 
        onClose={() => setOrderModalOpen(false)} 
      />
    )}

    </main>
  );
}

/* COMPONENTS */
function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-xl p-5 border border-[#e7e1cf] bg-[#fcfbf8] flex gap-3 items-center">
      {icon}
      <div>
        <p className="text-xs text-gray-600">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function DropdownItem({ label, active, onClick }) {
  return (
    <button
      className={`w-full text-left px-3 py-2 text-xs rounded-md hover:bg-[#f4efe0] ${
        active ? "font-semibold bg-[#f4efe0]" : ""
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}


function ConvertToOrderModal({ cart, onClose }) {
  if (!cart) return null;

  const [form, setForm] = useState({
    name: cart?.userId?.name || "",
    email: cart?.userId?.email || "",
    phone: cart?.userId?.phone || "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
  });


  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const err = {};
    if (!form.name.trim()) err.name = "Required";
    if (!form.email.trim()) err.email = "Required";
    if (!form.phone.trim()) err.phone = "Required";
    if (!form.address1.trim()) err.address1 = "Required";
    if (!form.city.trim()) err.city = "Required";
    if (!form.state.trim()) err.state = "Required";
    if (!form.pincode.trim()) err.pincode = "Required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const res = await fetch(`/api/admin/carts/${cart._id}/convert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });

    const data = await res.json();
    if (data.success) {
      alert("Order Created Successfully");
      localStorage.removeItem("raven_cart");  // clear guest cart
      sessionStorage.removeItem("raven_cart"); // extra safety


      // 🟡 CLEAR LOCAL STORAGE FOR GUEST
      if (data.isGuest) {
        localStorage.removeItem("raven_cart");
        localStorage.removeItem("sessionId");
      }

      // 🟡 CLEAR REGISTERED USER CART CONTEXT
      window.dispatchEvent(new Event("clear-cart"));

      onClose();
      location.reload();
    } else {
          alert("Failed: " + data.message);
        }
      };

  const inputClass = "border border-[#e7e1cf] rounded-md p-2 w-full text-sm";

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[9999]" onClick={onClose}></div>

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
        bg-white p-6 rounded-xl w-[92vw] sm:w-[450px] z-[10000] space-y-4">

        <h2 className="text-lg font-semibold">Convert to Order</h2>

        {["name","email","phone","address1","city","state","pincode"].map((field) => (
          <div key={field}>
            <input
              name={field}
              placeholder={field.replace(/\b\w/g, c => c.toUpperCase())}
              className={`${inputClass} ${errors[field] ? "border-red-500" : ""}`}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            />
            {errors[field] && <p className="text-red-600 text-xs">{errors[field]}</p>}
          </div>
        ))}

        <input
          name="address2"
          placeholder="Address Line 2 (Optional)"
          className={inputClass}
          value={form.address2}
          onChange={(e) => setForm({ ...form, address2: e.target.value })}
        />

        <div className="flex gap-2">
          <button className="w-1/2 py-1 rounded-lg border" onClick={onClose}>Cancel</button>
          <button className="w-1/2 py-1 rounded-lg bg-[#b28c34] text-white font-semibold" onClick={handleSubmit}>
            Create Order
          </button>
        </div>
      </div>
    </>
  );
}


function CartDrawer({ cart, onClose, onConvert }) {
  const total = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]" onClick={onClose} />

      <div className="fixed top-0 right-0 w-[92vw] sm:w-[420px] h-screen bg-white z-[1000] shadow-2xl border-l border-[#e7e1cf] flex flex-col">

        <div className="p-4 border-b bg-[#fcfbf8] flex justify-between items-center">
          <h3 className="text-lg font-semibold">Shopping Cart Details</h3>
          <button className="text-3xl" onClick={onClose}>&times;</button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          <p className="text-sm font-medium">
            User: <span className="font-semibold">{cart.userId ? cart.userId.name : `Guest-${cart.sessionId.slice(0, 6)}`}</span>
          </p>

          <p className="text-xs text-gray-500 mb-4">Last Updated: {new Date(cart.updatedAt).toLocaleString()}</p>

          <div className="space-y-4">
            {cart.items.map((item, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-14 h-14 bg-cover bg-center rounded-lg border" style={{ backgroundImage: `url(${item.image})` }} />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-[#b28c34]">Qty: {item.quantity}</p>
                  <p className="text-xs text-[#b28c34]">Size: {item.size}</p>
                </div>
                <p className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 border-t bg-[#fcfbf8] space-y-3">
          <div className="flex justify-between">
            <span className="font-bold text-base">Total:</span>
            <span className="font-bold text-base">₹{total.toLocaleString("en-IN")}</span>
          </div>

          <button
            className="w-full py-2 rounded-md bg-[#b28c34] text-white text-sm font-semibold"
            onClick={() => {
              onClose();         // close drawer
              onConvert();       // open modal
            }}
          >
            Convert to Order
          </button>

          <button
            className="w-full py-3 rounded-lg border border-[#e7e1cf] text-sm"
            onClick={async () => {
            console.log("Deleting cart with ID:", cart._id);  // Debug
            const res = await fetch(`/api/admin/carts/${cart._id}`, { method: "DELETE" });
            const data = await res.json();
            localStorage.removeItem("raven_cart");
            sessionStorage.removeItem("raven_cart");


            if (data.success) {
              alert("Cart Deleted");
              onClose();
              location.reload();
            } else {
              alert("Failed: " + data.message);
            }
          }}
          >
            Delete Cart
          </button>
        </div>

      </div>
    </>
  );
}
