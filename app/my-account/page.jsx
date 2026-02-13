"use client";

import { Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OrdersList from "@/components/OrdersList";
import OrderDetails from "@/components/OrderDetails";
import { Crimson_Text } from "next/font/google";

const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});
/* ============================================================
   WRAPPER COMPONENT (Suspense-safe)
============================================================ */
export default function Page() {
  return (
    <Suspense fallback={<p className="p-6 text-center">Loading Account...</p>}>
      <AccountPage />
    </Suspense>
  );
}

/* ============================================================
   MAIN ACCOUNT COMPONENT — Your existing logic
============================================================ */
function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // SAFE NOW inside Suspense
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "Account Info";

  const [activeTab, setActiveTab] = useState(defaultTab);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  /* Sync tab with URL */
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  /* Fetch user data */
  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
    if (session?.user) {
      const fetchUserInfo = async () => {
        const res = await fetch("/api/auth/get-user");
        const data = await res.json();
        setFormData({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          address: data.user.address,
        });
      };
      fetchUserInfo();
    }
  }, [session, status, router]);

  /* Handlers */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdateAccount = async () => {
    const pincodeMatch = formData.address.match(/\b\d{6}\b/);
    if (!pincodeMatch)
      return alert("Please include a valid 6-digit pincode");

    const res = await fetch("/api/auth/update-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    alert(data.message);
  };

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmNewPassword)
      return alert("Passwords do not match");

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    alert(data.message);
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
  };

  const handleLogout = () => signOut({ callbackUrl: "/" });

  /* ====================== UI ======================= */
  return (
    <div
      className="min-h-screen w-full bg-(--theme-bg) text-(--theme-text) flex flex-col items-center py-10 transition-colors duration-300"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      <div className="w-full max-w-5xl px-6 lg:px-10">
        <h1 className={`${crimson.className} text-3xl font-bold text-(--theme-text) tracking-tight mb-6`}>
          My Account
        </h1>

        {/* Tabs */}
        <div className="flex border-b border-(--theme-border) mb-6 space-x-6">
          {["Account Info", "Orders", "Change Password", "Logout"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() =>
                  tab === "Logout" ? handleLogout() : setActiveTab(tab)
                }
                className={`pb-3 pt-4 text-sm font-bold ${
                  activeTab === tab
                    ? "border-b-[3px] border-(--theme-text) text-(--theme-text)"
                    : "border-b-[3px] border-transparent text-(--theme-muted) hover:text-(--theme-text)"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {/* ====================== TAB CONTENT ======================= */}
        <div>
          {/* ACCOUNT INFO TAB */}
          {activeTab === "Account Info" && (
            <form className="max-w-lg">
              <h3 className={`${crimson.className} text-lg font-bold text-(--theme-text) px-2 pb-2`}>
                Account Information
              </h3>

              <div className="flex flex-col gap-4 px-2 py-3">
                {/* Name */}
                <label className="flex flex-col">
                  <span className="text-base font-medium text-(--theme-muted) pb-1">
                    Name
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full name"
                    className="rounded-xl border border-(--theme-border) bg-(--theme-bg) h-14 px-4 text-base focus:outline-none focus:border-(--theme-text)
focus:ring-1 focus:ring-(--theme-text)"
                  />
                </label>

                {/* Email */}
                <label className="flex flex-col">
                  <span className="text-base font-medium text-(--theme-muted) pb-1">
                    Email
                  </span>
                  <input
                    type="email"
                    name="email"
                    disabled
                    value={formData.email}
                    className="rounded-xl border border-(--theme-border) bg-(--theme-soft) h-14 px-4 text-base text-(--theme-muted) cursor-not-allowed"
                  />
                </label>

                {/* Phone */}
                <label className="flex flex-col">
                  <span className="text-base font-medium text-(--theme-muted) pb-1">
                    Phone Number
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    maxLength={10}
                    className="rounded-xl border border-(--theme-border) bg-(--theme-bg) h-14 px-4 text-base focus:outline-none focus:border-(--theme-text)
focus:ring-1 focus:ring-(--theme-text)"
                  />
                </label>

                {/* Address */}
                <label className="flex flex-col">
                  <span className="text-base font-medium text-(--theme-muted) pb-1">
                    Full Address (include pincode){" "}
                    <span className="text-red-500">*</span>
                  </span>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House No, Street, Area, City, Pincode"
                    rows={3}
                    className="rounded-xl border border-(--theme-border) bg-(--theme-bg) px-4 py-3 text-base focus:outline-none focus:border-(--theme-text)
focus:ring-1 focus:ring-(--theme-text) resize-none"
                  />
                </label>
              </div>

              <div className="px-2 py-4">
                <button
                  type="button"
                  onClick={handleUpdateAccount}
                  className="bg-(--theme-text) text-(--theme-bg) hover:opacity-90 font-bold rounded-xl h-10 px-6 text-sm tracking-wide transition-all"
                >
                  Update Details
                </button>
              </div>
            </form>
          )}

          {/* ================= ORDER DETAILS TAB (in-tab) ================= */}
          {activeTab === "Orders" && (
            <div className="text-(--theme-text) px-2 py-1">
              {!searchParams.get("orderId") && (
                <>
                  <h3 className="text-lg font-bold pb-2">Your Orders</h3>
                  <OrdersList />
                </>
              )}

              {searchParams.get("orderId") && (
                <OrderDetails orderId={searchParams.get("orderId")} />
              )}

            </div>
          )}
          
          {/* ================= CHANGE PASSWORD TAB ================= */}
          {activeTab === "Change Password" && (
            <div className="max-w-lg px-2 py-3">
              <h3 className="text-lg font-bold text-(--theme-muted) pb-3">
                Change Password
              </h3>

              <div className="flex flex-col gap-4">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      currentPassword: e.target.value,
                    })
                  }
                  className="rounded-xl border border-(--theme-border) bg-(--theme-bg) h-14 px-4 text-base focus:outline-none focus:border-(--theme-text)
focus:ring-1 focus:ring-(--theme-text)"
                />

                <input
                  type="password"
                  placeholder="New Password"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      newPassword: e.target.value,
                    })
                  }
                  className="rounded-xl border border-(--theme-border) bg-(--theme-bg) h-14 px-4 text-base focus:outline-none focus:border-(--theme-text)
focus:ring-1 focus:ring-(--theme-text)"
                />

                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={passwords.confirmNewPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirmNewPassword: e.target.value,
                    })
                  }
                  className="rounded-xl border border-(--theme-border) bg-(--theme-bg) h-14 px-4 text-base focus:outline-none focus:border-(--theme-text)
focus:ring-1 focus:ring-(--theme-text)"
                />

                <button
                  type="button"
                  onClick={handlePasswordChange}
                  className="bg-(--theme-text) text-(--theme-bg) hover:opacity-90 font-bold rounded-xl h-10 px-6 text-sm tracking-wide transition-all"
                >
                  Update Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
