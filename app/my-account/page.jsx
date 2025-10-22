'use client';
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("Account Info");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
    if (session?.user) {
      const fetchUserInfo = async () => {
        try {
          const res = await fetch("/api/auth/get-user");
          if (!res.ok) throw new Error("Failed to fetch user info");
          const data = await res.json();
          setFormData({ name: data.user.name, email: data.user.email, phone: data.user.phone, address: data.user.address });
        } catch (err) {
          console.error(err);
        }
      };
      fetchUserInfo();
    }
  }, [session, status, router]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdateAccount = async () => {
    const pincodeMatch = formData.address.match(/\b\d{6}\b/);
    if (!pincodeMatch) { alert("Please include a valid 6-digit pincode"); return; }
    try {
      const res = await fetch("/api/auth/update-account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      alert(data.message);
    } catch (err) { alert(err.message); }
  };

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmNewPassword) { alert("Passwords do not match"); return; }
    try {
      const res = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      alert(data.message);
      setPasswords({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) { alert(err.message); }
  };

  const handleLogout = () => signOut({ callbackUrl: "/" });

  return (
    <div className="min-h-screen w-full bg-[#fcfbf8] flex flex-col items-center py-10" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
      <div className="w-full max-w-5xl px-6 lg:px-10">
        <h1 className="text-3xl font-bold text-[#1b180d] tracking-tight mb-6">My Account</h1>

        <div className="flex border-b border-[#e7e1cf] mb-6 space-x-6">
          {["Account Info", "Orders", "Change Password", "Logout"].map((tab) => (
            <button key={tab} onClick={() => { if (tab === "Logout") handleLogout(); else setActiveTab(tab); }}
              className={`pb-3 pt-4 text-sm font-bold ${activeTab===tab?"border-b-[3px] border-[#f0c542] text-[#1b180d]":"border-b-[3px] border-transparent text-[#9a864c] hover:text-[#1b180d]"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab==="Account Info" && (
            <form className="max-w-lg">
              <h3 className="text-lg font-bold text-[#1b180d] px-2 pb-2">Account Information</h3>
              <div className="flex flex-col gap-4 px-2 py-3">
                <label className="flex flex-col"><span className="text-base font-medium text-[#1b180d] pb-1">Name</span>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full name" className="rounded-xl border border-[#e7e1cf] bg-[#fcfbf8] h-14 px-4 text-base focus:outline-none focus:border-[#f0c542]"/>
                </label>

                <label className="flex flex-col"><span className="text-base font-medium text-[#1b180d] pb-1">Email</span>
                  <input type="email" name="email" disabled value={formData.email} className="rounded-xl border border-[#e7e1cf] bg-[#f7f6f2] h-14 px-4 text-base text-[#9a864c] cursor-not-allowed"/>
                </label>

                <label className="flex flex-col"><span className="text-base font-medium text-[#1b180d] pb-1">Phone Number</span>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number" maxLength={10} className="rounded-xl border border-[#e7e1cf] bg-[#fcfbf8] h-14 px-4 text-base focus:outline-none focus:border-[#f0c542]"/>
                </label>

                <label className="flex flex-col"><span className="text-base font-medium text-[#1b180d] pb-1">Full Address (include pincode) <span className="text-red-500">*</span></span>
                  <textarea name="address" value={formData.address} onChange={handleChange} placeholder="House No, Street, Area, City, Pincode" rows={3} className="rounded-xl border border-[#e7e1cf] bg-[#fcfbf8] px-4 py-3 text-base focus:outline-none focus:border-[#f0c542] resize-none"/>
                </label>
              </div>
              <div className="px-2 py-4">
                <button type="button" onClick={handleUpdateAccount} className="bg-[#f0c542] hover:bg-[#e4b92e] text-[#1b180d] font-bold rounded-xl h-10 px-6 text-sm tracking-wide transition-all">Update Details</button>
              </div>
            </form>
          )}

          {activeTab==="Orders" && (<div className="text-[#1b180d] px-2 py-3"><h3 className="text-lg font-bold pb-2">Your Orders</h3><p>You have no orders yet.</p></div>)}

          {activeTab==="Change Password" && (
            <div className="max-w-lg px-2 py-3">
              <h3 className="text-lg font-bold text-[#1b180d] pb-3">Change Password</h3>
              <div className="flex flex-col gap-4">
                <input type="password" placeholder="Current Password" value={passwords.currentPassword} onChange={(e)=>setPasswords({...passwords,currentPassword:e.target.value})} className="rounded-xl border border-[#e7e1cf] bg-[#fcfbf8] h-14 px-4 text-base focus:outline-none focus:border-[#f0c542]"/>
                <input type="password" placeholder="New Password" value={passwords.newPassword} onChange={(e)=>setPasswords({...passwords,newPassword:e.target.value})} className="rounded-xl border border-[#e7e1cf] bg-[#fcfbf8] h-14 px-4 text-base focus:outline-none focus:border-[#f0c542]"/>
                <input type="password" placeholder="Confirm New Password" value={passwords.confirmNewPassword} onChange={(e)=>setPasswords({...passwords,confirmNewPassword:e.target.value})} className="rounded-xl border border-[#e7e1cf] bg-[#fcfbf8] h-14 px-4 text-base focus:outline-none focus:border-[#f0c542]"/>
                <button type="button" onClick={handlePasswordChange} className="bg-[#f0c542] hover:bg-[#e4b92e] text-[#1b180d] font-bold rounded-xl h-10 px-6 text-sm tracking-wide transition-all">Update Password</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
