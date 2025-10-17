"use client"
import { useState } from "react"
export default function AccountDetailsPage() {
  const [form, setForm] = useState({ name: "", email: "", passwordCurrent: "", passwordNew: "", passwordConfirm: "" })
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6 text-[#c49939]">Account Details</h2>
      <form className="bg-white rounded-xl shadow p-8 max-w-2xl space-y-6">
        <div>
          <label className="block font-semibold mb-1 text-[#ad563c]">Full name</label>
          <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="w-full px-3 py-3 border rounded" placeholder="Your full name" />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-[#ad563c]">Email address</label>
          <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="w-full px-3 py-3 border rounded" placeholder="user@email.com" />
        </div>
        <hr className="my-4" />
        <div className="font-semibold mb-1 text-[#ad563c]">Change password</div>
        <input placeholder="Current password" type="password" value={form.passwordCurrent} onChange={e=>setForm(f=>({...f,passwordCurrent:e.target.value}))} className="w-full px-3 py-3 border rounded mb-2" />
        <input placeholder="New password" type="password" value={form.passwordNew} onChange={e=>setForm(f=>({...f,passwordNew:e.target.value}))} className="w-full px-3 py-3 border rounded mb-2" />
        <input placeholder="Confirm new password" type="password" value={form.passwordConfirm} onChange={e=>setForm(f=>({...f,passwordConfirm:e.target.value}))} className="w-full px-3 py-3 border rounded mb-4" />
        <button className="w-full py-3 rounded-xl bg-[#ad563c] text-white font-bold hover:bg-[#c49939] transition">Save changes</button>
      </form>
    </section>
  )
}
