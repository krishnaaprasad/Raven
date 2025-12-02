"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MoreVertical,
  Search,
  ChevronRight,
} from "lucide-react";

const ORDERS_PAGE_SIZE = 10;

export default function UserProfileClient({ userId }) {
  const [user, setUser] = useState(null);

  const [orders, setOrders] = useState([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPages, setOrdersPages] = useState(1);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersSearch, setOrdersSearch] = useState("");
  const [ordersSearchInput, setOrdersSearchInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [showBanModal, setShowBanModal] = useState(false);
  const [banLoading, setBanLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [dbCart, setDbCart] = useState([]);
  const [cartMeta, setCartMeta] = useState(null);


  // 🔁 Fetch user + orders
  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        if (!user) setLoading(true);
        else setLoadingOrders(true);

        const params = new URLSearchParams({
          orderPage: String(ordersPage),
          orderLimit: String(ORDERS_PAGE_SIZE),
          orderSearch: ordersSearch,
        });

        const res = await fetch(
          `/api/admin/customers/${userId}?` + params.toString()
        );
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Error");

        if (ignore) return;

        setUser(data.user);
        setOrders(data.orders || []);

        const cartRes = await fetch(`/api/admin/customers/${userId}/cart`);
        const cartData = await cartRes.json();

        setDbCart(cartData.cart?.items || []);
        setCartMeta({ mode: cartData.mode, lastUpdated: cartData.lastUpdated });

        const meta = data.ordersMeta || {};
        setOrdersTotal(meta.total || 0);
        setOrdersPages(meta.pages || 1);
      } catch (err) {
        console.error("User details load error:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
          setLoadingOrders(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [userId, ordersPage, ordersSearch]);

  const handleOrdersSearch = () => {
    setOrdersPage(1);
    setOrdersSearch(ordersSearchInput.trim());
  };

  const clearOrdersSearch = () => {
    setOrdersSearchInput("");
    setOrdersSearch("");
    setOrdersPage(1);
  };

  async function handleEditDetails(payload) {
    try {
      setEditLoading(true);
      const res = await fetch(`/api/admin/customers/${userId}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setUser(data.user);
      setShowEditModal(false);
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setEditLoading(false);
    }
  }

  useEffect(() => {
    async function loadCart() {
      try {
        const res = await fetch(`/api/admin/customers/${userId}/cart`);
        const data = await res.json();
        if (data.success) setDbCart(data.cart?.items || []);
      } catch (e) {
        console.log("Cart fetch error:", e);
      }
    }
    loadCart();
  }, [userId]);

  async function handleBanToggle() {
    if (!user) return;
    try {
      setBanLoading(true);
      const res = await fetch(`/api/admin/customers/${userId}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ban: !user.isBanned }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Error");
      setUser({ ...user, isBanned: !user.isBanned });
      console.log("Ban status updated:", data.message);
    } catch (err) {
      console.error("Ban toggle failed:", err);
    } finally {
      setBanLoading(false);
    }
  }

  if (loading && !user) {
    return (
      <div className="p-6 text-sm text-gray-500">Loading user details…</div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-sm text-red-600">
        User not found or failed to load.
      </div>
    );
  }

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "—";

  const lastLogin = user.lastLogin
    ? new Date(user.lastLogin).toLocaleString()
    : "—";

  const showingFrom =
    ordersTotal === 0 ? 0 : (ordersPage - 1) * ORDERS_PAGE_SIZE + 1;
  const showingTo = Math.min(ordersPage * ORDERS_PAGE_SIZE, ordersTotal);

  return (
    <div className="font-[Manrope,sans-serif] text-[#1b180d] bg-[#fcfbf8] min-h-screen">
      <div className="flex items-center gap-3 mb-3">
        <button onClick={() => history.back()} className="p-2 rounded-lg border border-[#e7e1cf] hover:bg-[#f4f0e6]">
            <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">User Profile</h1>
        </div>
      <main className="px-0 max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr_260px] gap-8">


        {/* LEFT COLUMN */}
        <aside className="lg:col-span-1 xl:col-span-1 flex flex-col gap-6">

          {/* Profile */}
          <div className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-xl p-6 text-center">
            <ProfileAvatar name={user.name} image={user.image} size={90} />
            <div className="mt-4 space-y-1">
              <p className="text-[22px] font-bold">{user.name}</p>
              <p className="text-sm text-[#9a864c] break-all">{user.email}</p>
              <p className="text-sm text-[#9a864c]">Joined: {joinedDate}</p>
            </div>
          </div>

          {/* User details */}
          <div className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">User Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <DetailRow label="Phone Number" value={user.phone || "—"} />
              <DetailRow
                label="User Status"
                value={
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      user.isBanned
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {user.isBanned ? "Banned" : "Active"}
                  </span>
                }
              />
              <DetailRow label="Last Login" value={lastLogin} />
              <DetailRow
  label="User ID"
  value={<span className="font-mono text-xs bg-[#f5f1e6] px-2 py-1 rounded break-all">{userId}</span>}
/>
              <DetailRow
                label="Shipping Address"
                full
                value={user.address || "—"}
              />
            </div>
          </div>

          {/* Admin actions */}
          <div className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Admin Actions</h3>
            <div className="flex flex-col gap-3">
              <button
                className="h-10 rounded-lg bg-[#e7e1cf] text-[#1b180d] text-sm font-semibold"
                onClick={() => setShowEditModal(true)}
              >
                Edit Details
              </button>
              <button className="h-10 rounded-lg bg-[#e7e1cf] text-[#1b180d] text-sm font-semibold">
                Reset Password
              </button>
              <hr className="border-[#e7e1cf]" />
              <button
                className="h-10 rounded-lg bg-red-600 text-white text-sm font-semibold"
                onClick={() => setShowBanModal(true)}
              >
                {user.isBanned ? "Unban User" : "Ban User"}
              </button>
            </div>
          </div>
        </aside>

        {/* CENTER: Orders */}
        <section className="lg:col-span-2 xl:col-span-2 bg-[#fcfbf8] border border-[#e7e1cf] rounded-xl p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
            <h3 className="text-lg font-bold whitespace-nowrap">Order History</h3>

            <div className="relative w-full sm:w-64">
              <Search
                size={18}
                className="absolute left-3 top-2.5 text-[#9a864c]"
              />
              <input
                className="w-full h-10 pl-9 pr-10 rounded-lg border border-[#e7e1cf] bg-white text-sm outline-none"
                placeholder="Search orders..."
                value={ordersSearchInput}
                onChange={(e) => setOrdersSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleOrdersSearch()}
              />
              {ordersSearchInput && (
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-xs text-gray-400"
                  onClick={clearOrdersSearch}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[#e7e1cf] bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-[#e7e1cf] bg-[#f5f1e6]">
                <tr>
                  <th className="p-3 text-left font-semibold">Order ID</th>
                  <th className="p-3 text-left font-semibold">Date</th>
                  <th className="p-3 text-right font-semibold">Total</th>
                  <th className="p-3 text-center font-semibold">Status</th>
                  <th className="p-3 text-right font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e1cf]">
                {loadingOrders ? (
                  <OrderSkeletonRows />
                ) : orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-6 text-center text-sm text-gray-500"
                    >
                      No orders found for this user.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o._id} className="hover:bg-[#fcfbf8]">
                      <td className="p-3">{o.customOrderId || "—"}</td>
                      <td className="p-3">
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="p-3 text-right">
                        ₹
                        {typeof o.totalAmount === "number"
                          ? o.totalAmount.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })
                          : "—"}
                      </td>
                      <td className="p-3 text-center">
                        <OrderStatusBadge status={o.order_status} />
                      </td>
                      <td className="p-3 text-right">
                        <Link href={`/admin/orders/${o._id}`}>
                          <button type="button">
                            <ChevronRight size={18} />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Orders pagination */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mt-4 text-xs sm:text-sm text-gray-600">
            <p>
              Showing <b>{showingFrom}</b> to <b>{showingTo}</b> of{" "}
              <b>{ordersTotal}</b> orders
            </p>
            <div className="flex gap-2">
              <button
                disabled={ordersPage <= 1}
                onClick={() => setOrdersPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-md border border-[#e7e1cf] disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={ordersPage >= ordersPages}
                onClick={() => setOrdersPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-md border border-[#e7e1cf] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT: Shopping cart placeholder */}
        <aside className="bg-[#fcfbf8] border border-[#e7e1cf] rounded-xl p-6 h-fit">
          <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Shopping Cart</h3>

          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            cartMeta?.mode === "guest"
              ? "bg-orange-100 text-orange-800"
              : "bg-emerald-100 text-emerald-800"
          }`}>
            {cartMeta?.mode === "guest" ? "Guest" : "Registered"}
          </span>
        </div>

        <p className="text-xs text-[#9a864c] mb-3">
          Last updated: {cartMeta?.lastUpdated ? new Date(cartMeta.lastUpdated).toLocaleString() : "—"}
        </p>

          {dbCart && dbCart.length > 0 ? (
            <div className="flex flex-col gap-4">
              {dbCart.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-lg bg-cover bg-center border border-[#e7e1cf]"
                    style={{ backgroundImage: `url(${item.image})` }}
                  ></div>
                  <div className="flex-grow">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-[#9a864c]">Qty: {item.quantity}</p>
                    <p className="text-xs text-[#9a864c]">Size: {item.size}</p>
                  </div>
                  <p className="font-semibold text-sm">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Cart Empty</p>
          )}
        </aside>
      </main>

      {/* Ban / Unban Modal */}
      {showBanModal && (
        <BanModal
          isBanned={!!user.isBanned}
          loading={banLoading}
          onClose={() => setShowBanModal(false)}
          onConfirm={async () => {
            await handleBanToggle();
            setShowBanModal(false);
          }}
        />
      )}

      {showEditModal && (
        <EditDetailsModal
          user={user}
          loading={editLoading}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditDetails}
        />
      )}
    </div>
  );
}

/********** Sub components **********/

function ProfileAvatar({ name, image, size = 90 }) {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`w-[${size}px] h-[${size}px] rounded-full object-cover mx-auto`}
      />
    );
  }

  const initials = name?.split(" ").map(n => n[0]).join("").toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold mx-auto"
      style={{
        width: size,
        height: size,
        backgroundColor: "#b28c34",
        color: "white",
        fontSize: size / 3,
      }}
    >
      {initials}
    </div>
  );
}


function DetailRow({ label, value, full }) {
  return (
    <div
      className={`flex flex-col gap-1 border-t border-[#e7e1cf] py-3 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <p className="text-xs text-[#9a864c]">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function OrderStatusBadge({ status }) {
  const normalized = (status || "").toUpperCase();

  let classes =
    "bg-gray-100 text-gray-700";
  if (normalized === "PAID") classes = "bg-emerald-100 text-emerald-700";
  if (normalized === "SHIPPED")
    classes = "bg-blue-100 text-blue-700";
  if (normalized === "DELIVERED")
    classes = "bg-green-100 text-green-700";
  if (normalized === "FAILED")
    classes = "bg-red-100 text-red-700";
  if (normalized === "CANCELLED")
    classes = "bg-red-200 text-red-700";
  if (normalized === "PENDING")
    classes = "bg-yellow-100 text-yellow-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${classes}`}>
      {normalized || "UNKNOWN"}
    </span>
  );
}

function OrderSkeletonRows() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <tr key={i}>
          <td className="p-3">
            <div className="h-4 w-24 bg-[#e7e1cf] animate-pulse rounded" />
          </td>
          <td className="p-3">
            <div className="h-4 w-20 bg-[#e7e1cf] animate-pulse rounded" />
          </td>
          <td className="p-3 text-right">
            <div className="h-4 w-16 ml-auto bg-[#e7e1cf] animate-pulse rounded" />
          </td>
          <td className="p-3 text-center">
            <div className="h-5 w-20 mx-auto bg-[#e7e1cf] animate-pulse rounded-full" />
          </td>
          <td className="p-3 text-right">
            <div className="h-4 w-4 ml-auto bg-[#e7e1cf] animate-pulse rounded-full" />
          </td>
        </tr>
      ))}
    </>
  );
}

function BanModal({ isBanned, loading, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-sm">
        <h2 className="font-bold text-lg mb-2 text-[#1b180d]">
          {isBanned ? "Unban user?" : "Ban user?"}
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          {isBanned
            ? "This will allow the user to login and place orders again."
            : "Are you sure you want to ban this user? They will not be able to login or place any new orders."}
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#e7e1cf] text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm disabled:opacity-50"
          >
            {loading
              ? isBanned
                ? "Unbanning..."
                : "Banning..."
              : isBanned
              ? "Unban"
              : "Ban"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditDetailsModal({ user, onClose, onSave, loading }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [address, setAddress] = useState(user.address || "");

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-[90%] max-w-md rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Edit User Details</h2>

        <div className="flex flex-col gap-3 mb-4">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Full Name"
            className="h-10 px-3 border border-[#e7e1cf] rounded-lg"
          />
          <input
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="Phone"
            maxLength="10"
            className="h-10 px-3 border border-[#e7e1cf] rounded-lg"
          />
          <textarea
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Address"
            className="h-20 px-3 border border-[#e7e1cf] rounded-lg"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 border border-[#e7e1cf] rounded-lg"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ name, phone, address })}
            disabled={loading}
            className="px-4 py-2 bg-[#b28c34] text-white rounded-lg disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

