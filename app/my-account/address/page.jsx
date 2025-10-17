"use client"
import { useState } from "react"

export default function AddressPage() {
  const [billing, setBilling] = useState({ name:"", address:"", city:"", state:"", zip:"", country:"", phone:"" })
  const [shipping, setShipping] = useState({ name:"", address:"", city:"", state:"", zip:"", country:"", phone:"" })
  const [sameAsBilling, setSameAsBilling] = useState(false)

  const syncShipping = () => setShipping(billing)

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6 text-[#c49939]">Addresses</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 bg-white rounded-xl shadow p-7">
          <h3 className="font-bold text-lg mb-2 text-[#ad563c]">Billing Address</h3>
          <input className="mb-3 p-3 border rounded w-full" placeholder="Full Name" value={billing.name} onChange={e => setBilling({ ...billing, name: e.target.value })} />
          <input className="mb-3 p-3 border rounded w-full" placeholder="Address" value={billing.address} onChange={e => setBilling({ ...billing, address: e.target.value })} />
          <input className="mb-3 p-3 border rounded w-full" placeholder="City" value={billing.city} onChange={e => setBilling({ ...billing, city: e.target.value })} />
          <input className="mb-3 p-3 border rounded w-full" placeholder="State" value={billing.state} onChange={e => setBilling({ ...billing, state: e.target.value })} />
          <input className="mb-3 p-3 border rounded w-full" placeholder="Zip Code" value={billing.zip} onChange={e => setBilling({ ...billing, zip: e.target.value })} />
          <input className="mb-3 p-3 border rounded w-full" placeholder="Country" value={billing.country} onChange={e => setBilling({ ...billing, country: e.target.value })} />
          <input className="mb-3 p-3 border rounded w-full" placeholder="Phone" value={billing.phone} onChange={e => setBilling({ ...billing, phone: e.target.value })} />
        </div>
        <div className="flex-1 bg-white rounded-xl shadow p-7">
          <label className="mb-3 flex items-center">
            <input type="checkbox" checked={sameAsBilling} onChange={e => { setSameAsBilling(e.target.checked); if (e.target.checked) syncShipping(); }} />
            <span className="ml-3 text-[#ad563c] font-semibold">Shipping same as billing</span>
          </label>
          {!sameAsBilling && (
            <>
              <h3 className="font-bold text-lg mb-2 text-[#ad563c]">Shipping Address</h3>
              <input className="mb-3 p-3 border rounded w-full" placeholder="Full Name" value={shipping.name} onChange={e => setShipping({ ...shipping, name: e.target.value })} />
              <input className="mb-3 p-3 border rounded w-full" placeholder="Address" value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })} />
              {/* Add other shipping inputs similarly */}
            </>
          )}
        </div>
      </div>
      <button className="mt-6 px-7 py-3 rounded-xl font-semibold bg-[#f9be40] text-[#222] shadow hover:bg-[#ffd27f]">Save Addresses</button>
    </section>
  )
}
