'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../context/cartcontext';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { load } from '@cashfreepayments/cashfree-js';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const [shipping, setShipping] = useState('standard');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const shippingCharges = { standard: 50, express: 150, pickup: 0 };

  // Load failed order if exists
  useEffect(() => {
    const failedOrder = localStorage.getItem('failedOrder');
    if (failedOrder) {
      const parsed = JSON.parse(failedOrder);
      if (parsed.user) setUser(parsed.user);
      if (parsed.shipping) setShipping(parsed.shipping);
    }
  }, []);

  // Persist user & shipping
  useEffect(() => { localStorage.setItem('checkoutUser', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('checkoutShipping', JSON.stringify(shipping)); }, [shipping]);

  // Calculate total
  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(subtotal + shippingCharges[shipping]);
  }, [cartItems, shipping]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { firstName, lastName, email, phone, address1, city, state, pincode } = user;
    if (!firstName || !lastName || !email || !phone || !address1 || !city || !state || !pincode) {
      toast.error('Please fill all required fields!');
      return false;
    }
    if (!/^\d{10}$/.test(phone)) { toast.error('Phone must be 10 digits!'); return false; }
    if (!/^\d{6}$/.test(pincode)) { toast.error('Pincode must be 6 digits!'); return false; }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, cartItems, shipping, shippingCharge: shippingCharges[shipping], totalAmount: total }),
      });
      const data = await res.json();

      if (data.payment_session_id) {
        const mode = process.env.NEXT_PUBLIC_CASHFREE_ENV || 'sandbox';
        const cashfree = await load({ mode });
        await cashfree.checkout({ paymentSessionId: data.payment_session_id, redirectTarget: '_self' });
      } else {
        toast.error('Failed to create payment session');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    } finally { setLoading(false); }
  };

  if (!cartItems.length) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCF8F3] px-4">
      <h1 className="text-2xl font-bold text-[#8B6C3A]">Your cart is empty</h1>
    </div>
  );

  return (
    <section className="min-h-screen bg-[#FCF8F3] py-8 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Shipping Form */}
        <div className="bg-white rounded-2xl p-6 shadow border border-[#e6decf] flex flex-col gap-4">
          <h2 className="font-bold text-xl text-[#6B4B1E] mb-4">Shipping Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" name="firstName" placeholder="First Name" value={user.firstName} onChange={handleChange} className="border rounded px-3 py-2" />
            <input type="text" name="lastName" placeholder="Last Name" value={user.lastName} onChange={handleChange} className="border rounded px-3 py-2" />
          </div>
          <input type="email" name="email" placeholder="Email" value={user.email} onChange={handleChange} className="border rounded px-3 py-2" />
          <input type="text" name="phone" placeholder="Phone" value={user.phone} onChange={handleChange} className="border rounded px-3 py-2" />
          <input type="text" name="address1" placeholder="Address Line 1" value={user.address1} onChange={handleChange} className="border rounded px-3 py-2" />
          <input type="text" name="address2" placeholder="Address Line 2 (Optional)" value={user.address2} onChange={handleChange} className="border rounded px-3 py-2" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" name="city" placeholder="City" value={user.city} onChange={handleChange} className="border rounded px-3 py-2" />
            <input type="text" name="state" placeholder="State" value={user.state} onChange={handleChange} className="border rounded px-3 py-2" />
            <input type="text" name="pincode" placeholder="Pincode" value={user.pincode} onChange={handleChange} className="border rounded px-3 py-2" />
          </div>
          <h2 className="font-bold text-xl text-[#6B4B1E] mt-4">Shipping Method</h2>
          <div className="flex flex-col gap-2">
            {Object.keys(shippingCharges).map(key => (
              <label key={key} className="flex items-center gap-2">
                <input type="radio" value={key} checked={shipping === key} onChange={(e) => setShipping(e.target.value)} />
                {key.charAt(0).toUpperCase() + key.slice(1)} Delivery (₹{shippingCharges[key]})
              </label>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-6 shadow border border-[#e6decf] flex flex-col gap-4">
          <h2 className="font-bold text-xl text-[#6B4B1E] mb-4">Order Summary</h2>
          <div className="flex flex-col gap-2">
            {cartItems.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>{item.name} ({item.size}) x {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <hr className="border-[#e6decf] my-2" />
          <div className="flex justify-between"><span>Shipping</span><span>₹{shippingCharges[shipping]}</span></div>
          <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{total}</span></div>
          <button onClick={handlePayment} disabled={loading} className="mt-4 w-full py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition">
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </section>
  );
}
