"use client";

import { Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OrdersList from "@/components/OrdersList";
import OrderDetails from "@/components/OrderDetails";
import { Crimson_Text } from "next/font/google";
import { FiChevronDown } from "react-icons/fi";

const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

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
   MAIN ACCOUNT COMPONENT
============================================================ */
function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "Account Info";

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [showStateList, setShowStateList] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const stateDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
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
        try {
          const res = await fetch("/api/auth/get-user");
          const data = await res.json();
          if (data.user) {
            setFormData({
              name: data.user.name || "",
              email: data.user.email || "",
              phone: data.user.phone || "",
              address1: data.user.address1 || "",
              address2: data.user.address2 || "",
              city: data.user.city || "",
              state: data.user.state || "",
              pincode: data.user.pincode || "",
            });
          }
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      };
      fetchUserInfo();
    }
  }, [session, status, router]);

  /* Handlers */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdateAccount = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/update-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      alert("Account information updated successfully!");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(e.target))
        setShowStateList(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => signOut({ callbackUrl: "/" });

  /* ====================== UI ======================= */
  return (
    <div
      className="min-h-screen w-full bg-(--theme-bg) text-(--theme-text) flex flex-col items-center py-10 transition-colors duration-300"
      style={{ fontFamily: 'Manrope, sans-serif' }}
    >
      <div className="w-full max-w-5xl px-6 lg:px-10">
        <h1 className={`${crimson.className} text-3xl font-bold text-(--theme-text) tracking-tight mb-6`}>
          My Account
        </h1>

        {/* Tabs */}
        <div className="flex border-b border-(--theme-border) mb-6 space-x-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {["Account Info", "Orders", "Logout"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() =>
                  tab === "Logout" ? handleLogout() : setActiveTab(tab)
                }
                className={`pb-3 pt-4 text-sm font-bold transition-all ${
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
          {activeTab === "Account Info" && (
            <div className="max-w-2xl">
              <h3 className={`${crimson.className} text-xl font-bold text-(--theme-text) mb-6`}>
                Personal & Shipping Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-(--theme-muted)">Full Name</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="rounded-lg border border-(--theme-border) bg-(--theme-bg) h-12 px-4 text-[15px] focus:outline-none focus:border-(--theme-text) focus:ring-1 focus:ring-(--theme-text)"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-(--theme-muted)">Email Address</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email for order updates"
                    className="rounded-lg border border-(--theme-border) bg-(--theme-bg) h-12 px-4 text-[15px] focus:outline-none focus:border-(--theme-text) focus:ring-1 focus:ring-(--theme-text)"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-(--theme-muted)">Phone Number</span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    disabled
                    className="rounded-lg border border-(--theme-border) bg-(--theme-soft) h-12 px-4 text-[15px] text-(--theme-muted) cursor-not-allowed"
                  />
                </div>

                {/* Pincode */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-(--theme-muted)">Pincode</span>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className="rounded-lg border border-(--theme-border) bg-(--theme-bg) h-12 px-4 text-[15px] focus:outline-none focus:border-(--theme-text) focus:ring-1 focus:ring-(--theme-text)"
                  />
                </div>

                {/* Address 1 */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <span className="text-sm font-semibold text-(--theme-muted)">Street Address / House No.</span>
                  <input
                    type="text"
                    name="address1"
                    value={formData.address1}
                    onChange={handleChange}
                    placeholder="House No, Building, Street"
                    className="rounded-lg border border-(--theme-border) bg-(--theme-bg) h-12 px-4 text-[15px] focus:outline-none focus:border-(--theme-text) focus:ring-1 focus:ring-(--theme-text)"
                  />
                </div>

                {/* Address 2 */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <span className="text-sm font-semibold text-(--theme-muted)">Apartment, suite, etc. (Optional)</span>
                  <input
                    type="text"
                    name="address2"
                    value={formData.address2}
                    onChange={handleChange}
                    placeholder="Landmark, Area, etc."
                    className="rounded-lg border border-(--theme-border) bg-(--theme-bg) h-12 px-4 text-[15px] focus:outline-none focus:border-(--theme-text) focus:ring-1 focus:ring-(--theme-text)"
                  />
                </div>

                {/* City */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-(--theme-muted)">City</span>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="rounded-lg border border-(--theme-border) bg-(--theme-bg) h-12 px-4 text-[15px] focus:outline-none focus:border-(--theme-text) focus:ring-1 focus:ring-(--theme-text)"
                  />
                </div>

                {/* State */}
                <div className="flex flex-col gap-1.5 relative" ref={stateDropdownRef}>
                  <span className="text-sm font-semibold text-(--theme-muted)">State</span>
                  <div
                    onClick={() => setShowStateList(!showStateList)}
                    className="flex justify-between items-center h-12 px-4 border border-(--theme-border) rounded-lg bg-(--theme-bg) cursor-pointer hover:border-(--theme-text)"
                  >
                    <span className={`text-[15px] ${formData.state ? 'text-(--theme-text)' : 'text-(--theme-muted)'}`}>
                      {formData.state || "Select State"}
                    </span>
                    <FiChevronDown className={`transition-transform ${showStateList ? 'rotate-180' : ''}`} />
                  </div>
                  {showStateList && (
                    <div className="absolute z-10 top-full mt-1 w-full bg-(--theme-bg) border border-(--theme-border) rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      <div className="p-2 sticky top-0 bg-(--theme-bg) border-b">
                        <input
                          type="text"
                          placeholder="Search state..."
                          value={stateSearch}
                          onChange={(e) => setStateSearch(e.target.value)}
                          className="w-full h-9 px-3 text-sm rounded bg-(--theme-soft) outline-none"
                        />
                      </div>
                      {indianStates.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase())).map(state => (
                        <div
                          key={state}
                          onClick={() => {
                            setFormData({...formData, state});
                            setShowStateList(false);
                          }}
                          className="px-4 py-2.5 text-sm hover:bg-(--theme-soft) cursor-pointer"
                        >
                          {state}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleUpdateAccount}
                  disabled={loading}
                  className="bg-(--theme-text) text-(--theme-bg) hover:opacity-90 font-bold rounded-lg h-12 px-8 text-[15px] shadow-sm transition-all disabled:opacity-50"
                >
                  {loading ? "Saving Changes..." : "Save Details"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "Orders" && (
            <div className="text-(--theme-text)">
              {!searchParams.get("orderId") ? (
                <>
                  <h3 className={`${crimson.className} text-xl font-bold mb-4`}>Your Orders</h3>
                  <OrdersList />
                </>
              ) : (
                <OrderDetails orderId={searchParams.get("orderId")} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
