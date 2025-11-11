'use client';

import { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/cartcontext';
import { useRouter } from 'next/navigation';
import { load } from '@cashfreepayments/cashfree-js';
import Image from 'next/image';
import Link from 'next/link';
import { FiHelpCircle, FiChevronDown } from 'react-icons/fi';
import { useForm, Controller } from 'react-hook-form';
import usePageMetadata from '../hooks/usePageMetadata';
import { useSession } from 'next-auth/react';
import AuthModal from '../auth/modal';
import { loadFailedOrderData } from '../context/cartcontext';

export default function CheckoutPage() {
  usePageMetadata(
    'Checkout - Raven Fragrance',
    'Complete your Raven Fragrance order by adding your shipping details and securely paying through Cashfree.'
  );

  const { cartItems } = useCart();
  // ✅ Restore failed cart if cartItems is empty but failedOrder exists
  useEffect(() => {
    if (!cartItems?.length) {
      const failed = localStorage.getItem("failedOrder");
      if (failed) {
        const parsed = JSON.parse(failed);
        if (parsed?.cartItems?.length) {
          localStorage.setItem(
            "cart",
            JSON.stringify({
              items: parsed.cartItems,
              expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
            })
          );
          window.dispatchEvent(new Event("storage")); // trigger CartContext reload
        }
      }
    }
  }, [cartItems]);

  const router = useRouter();
  const { data: session } = useSession();

  const [shipping, setShipping] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPhoneTip, setShowPhoneTip] = useState(false);
  const [showStateList, setShowStateList] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const tooltipRef = useRef(null);
  const stateDropdownRef = useRef(null);
  const fieldRefs = useRef({});
  const [saveAddress, setSaveAddress] = useState(true);
  const [hasUserEdited, setHasUserEdited] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    trigger,
    setValue,
    watch
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      pincode: '',
    },
  });
  
  // 🧠 Auto-save form data locally while typing
useEffect(() => {
  const subscription = watch((value, { name }) => {
    // Only save if user has started typing
    if (!hasUserEdited) return;

    // Debounce: wait until user pauses typing for 800ms
    const handler = setTimeout(() => {
      const nonEmptyData = Object.fromEntries(
        Object.entries(value).filter(([_, v]) => v && v.trim() !== "")
      );

      // Only update localStorage if something actually changed
      const current = localStorage.getItem("checkoutUser");
      const parsed = current ? JSON.parse(current) : {};
      const isSame = JSON.stringify(parsed) === JSON.stringify(nonEmptyData);
      if (!isSame && Object.keys(nonEmptyData).length > 0) {
        localStorage.setItem("checkoutUser", JSON.stringify(nonEmptyData));
        // ✅ Don’t trigger any reactivity that causes re-render
      }
    }, 800);

    return () => clearTimeout(handler);
  });

  return () => subscription.unsubscribe();
}, [watch, hasUserEdited]);



  const shippingCharges = { standard: 50, express: 120, pickup: 0 };
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + (shippingCharges[shipping] || 0);

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
    'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
    'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  // Prefill user data
  useEffect(() => {
    const prefillData = async () => {
      // 1️⃣ First, check failedOrder (highest priority)
      const failedOrderData = loadFailedOrderData();
      if (failedOrderData && Object.keys(failedOrderData).length) {
        console.log("Restoring from failed order data:", failedOrderData);
        Object.entries(failedOrderData).forEach(([key, value]) => {
          if (value) setValue(key, value);
        });
        localStorage.removeItem("failedOrder");
        return;
      }

      // 2️⃣ Next, try saved checkoutUser (manual typed data)
      const savedCheckoutData = localStorage.getItem("checkoutUser");
      if (savedCheckoutData) {
        const parsed = JSON.parse(savedCheckoutData);
        if (Object.keys(parsed).length > 0) {
          console.log("Restoring from saved checkoutUser data:", parsed);
          Object.entries(parsed).forEach(([key, value]) => {
            if (value) setValue(key, value);
          });
          return;
        }
      }

      // 3️⃣ Finally, try DB (only if user logged in)
      if (session?.user?.email && !hasUserEdited) {
        try {
          const res = await fetch("/api/user/me");
          const data = await res.json();
          if (data?.email) {
            const [first, ...rest] = (data.name || "").split(" ");
            setValue("email", data.email || "");
            setValue("firstName", first || "");
            setValue("lastName", rest.join(" ") || "");
            setValue("phone", data.phone || "");
            setValue("address1", data.address1 || "");
            setValue("address2", data.address2 || "");
            setValue("city", data.city || "");
            setValue("state", data.state || "");
            setValue("pincode", data.pincode || "");
            console.log("Restored from DB /api/user/me");
          }
        } catch {
          console.warn("Could not load user data");
        }
      }
    };

    prefillData();
  }, [session, setValue, hasUserEdited]);



  // Close phone tooltip & state dropdown on outside click
  useEffect(() => {
  const handleClickOutside = (e) => {
    // Only close if tooltip is open and click is *not* on the icon or tooltip
    if (
      tooltipRef.current &&
      !tooltipRef.current.contains(e.target)
    ) {
      setShowPhoneTip(false);
    }

    if (
      stateDropdownRef.current &&
      !stateDropdownRef.current.contains(e.target)
    ) {
      setShowStateList(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

  // Scroll to first error
  const scrollToError = () => {
    const firstError = Object.keys(errors)[0];
    if (firstError && fieldRefs.current[firstError]) {
      fieldRefs.current[firstError].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      fieldRefs.current[firstError].focus();
    }
  };

  // Payment handler
  const handlePayment = async (formData) => {
    setLoading(true);
    try {
      localStorage.setItem('checkoutUser', JSON.stringify(formData));
      localStorage.setItem('cart', JSON.stringify({
        items: cartItems,
        expiry: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      })); // ✅ cart data
      localStorage.setItem('shipping', shipping); // ✅ selected shipping
      localStorage.setItem('shippingCharge', shippingCharges[shipping]); // ✅ cost

      if (session?.user?.email && saveAddress) {
        await fetch('/api/user/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cartItems: cartItems.map(item => ({
            name: item.name,
            size: item.size,
            price: item.price,
            quantity: item.quantity,
            image: item.image, // ✅ ensure image is included
            slug: item.slug,   // optional for linking later
          })),
          shipping,
          shippingCharge: shippingCharges[shipping],
          totalAmount: total,
        }),
      });

      const data = await res.json();
      if (data.payment_session_id) {
         // ✅ Save full order data for success page
        localStorage.setItem(
          'orderPreview',
          JSON.stringify({
            cartItems,
            shipping,
            shippingCharge: shippingCharges[shipping],
            totalAmount: total,
            user: formData,
          })
        );
        const mode = process.env.NEXT_PUBLIC_CASHFREE_ENV || 'sandbox';
        const cashfree = await load({ mode });
        await cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          redirectTarget: '_self',
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Floating Input
  const FloatingInput = ({ name, label, type = 'text', inputMode, maxLength, rules }) => (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur, value } }) => {
        const hasError = Boolean(errors[name]);
        const hasValue = value?.trim() !== '';
        const isPhone = name === 'phone';

        const handleChange = (e) => {
          let val = e.target.value;
          if (name === 'phone') val = val.replace(/[^0-9]/g, '').slice(0, 10);
          if (name === 'pincode') val = val.replace(/[^0-9]/g, '').slice(0, 6);
          setHasUserEdited(true); // ✅ Mark as user started typing
          onChange(val);
        };

        return (
          <div ref={(el) => (fieldRefs.current[name] = el)} className="relative mb-5 w-[95%] max-w-[640px]">
            <input
              type={type}
              inputMode={inputMode}
              maxLength={maxLength}
              value={value}
              onChange={handleChange}
              onBlur={() => {
                if (name !== "address1") trigger(name);
              }}

              placeholder=" "
              className={`peer w-full h-[44px] px-4 pr-10 text-[15px] text-[#1b180d] bg-[#fcfbf8] rounded-md border outline-none transition-all
                ${
                  hasError
                    ? 'border-red-500'
                    : 'border-[#e7e1cf] focus:border-[#b28c34] focus:ring-1 focus:ring-[#b28c34]'
                }`}
            />
            <label
              className={`absolute left-4 text-[#9a864c] bg-[#fcfbf8] px-1 transition-all duration-300 pointer-events-none
                ${
                  hasValue
                    ? '-top-2 text-xs font-medium'
                    : 'top-2.5 text-[15px] peer-focus:-top-2 peer-focus:text-xs'
                }`}
            >
              {label}
            </label>

          {/* ✅ Reliable phone tooltip */}
          {isPhone && (
            <div ref={tooltipRef} className="absolute right-3 top-[10px] z-[9999]">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Tooltip toggled!"); // ✅ Debug check
                  setShowPhoneTip((prev) => !prev);
                }}
                className="text-[#9a864c] hover:text-[#1b180d] focus:outline-none"
              >
                <FiHelpCircle size={18} />
              </button>

              {showPhoneTip && (
                <div
                  className="absolute left-[-240px] top-[-6px] bg-white border border-[#e7e1cf] text-[#1b180d] text-xs rounded-md shadow-lg p-2 w-[220px] animate-fadeIn"
                  style={{
                    zIndex: 999999,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  In case we need to contact you about your order.
                </div>
              )}
            </div>
          )}
            {hasError && <p className="mt-1 text-xs text-red-600">{errors[name].message}</p>}

            <style jsx>{`
              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: translateY(-4px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .animate-fadeIn {
                animation: fadeIn 0.25s ease-in-out;
              }
              .tooltip-box {
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
              }
            `}</style>
          </div>
        );
      }}
    />
  );

  if (!cartItems.length)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf8]">
        <h1 className="text-lg font-semibold text-[#9a864c]">Your cart is empty</h1>
      </div>
    );


  return (
    <>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      <main className="min-h-screen bg-[#fcfbf8] text-[#1b180d] font-[Manrope,sans-serif] px-4 sm:px-6 lg:px-10 py-10">
        <form
          onSubmit={handleSubmit(handlePayment, scrollToError)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10 max-w-6xl mx-auto"
        >
          {/* Left Form Section */}
          <section className="lg:col-span-7">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[24px] font-bold">Shipping Information</h2>
              {!session ? (
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="text-[15px] text-[#b28c34] hover:text-[#1b180d] underline font-medium transition"
                >
                  Sign In
                </button>
              ) : (
                <p className="text-[14px] text-[#1b180d]">Hi, {session.user.name?.split(' ')[0]}</p>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <FloatingInput name="email" label="Email Address" type="email" rules={{
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
              }} />
              <FloatingInput name="firstName" label="First Name" rules={{ required: 'First name is required' }} />
              <FloatingInput name="lastName" label="Last Name" rules={{ required: 'Last name is required' }} />
              <FloatingInput name="phone" label="Phone Number" inputMode="numeric" rules={{
                required: 'Phone number is required',
                pattern: { value: /^\d{10}$/, message: 'Phone must be 10 digits' },
              }} />
              <FloatingInput name="address1" label="Street Address" rules={{ required: 'Street address is required' }} />
              <FloatingInput name="address2" label="Apartment, suite, etc. (Optional)" />
              <FloatingInput name="city" label="City" rules={{ required: 'City is required' }} />
              {/* ✅ SEARCHABLE STATE DROPDOWN */}
              <Controller
                name="state"
                control={control}
                rules={{ required: '' }}
                render={({ field }) => {
                  const filteredStates = indianStates.filter((s) =>
                    s.toLowerCase().includes(stateSearch.toLowerCase())
                  );

                  return (
                    <div ref={stateDropdownRef} className="relative mb-5 w-[95%] max-w-[640px]">
                      <div
                        onClick={() => setShowStateList(!showStateList)}
                        className={`flex justify-between items-center h-[44px] px-4 border rounded-md bg-[#fcfbf8] cursor-pointer ${
                          errors.state
                            ? 'border-red-500'
                            : 'border-[#e7e1cf] hover:border-[#b28c34]'
                        }`}
                      >
                        <span
                          className={`text-[15px] ${
                            field.value ? 'text-[#1b180d]' : 'text-[#9a864c]'
                          }`}
                        >
                          {field.value || 'Select State / Territory'}
                        </span>
                        <FiChevronDown
                          className={`text-[#9a864c] transition-transform ${
                            showStateList ? 'rotate-180' : ''
                          }`}
                        />
                      </div>

                      {showStateList && (
                        <div className="absolute z-20 mt-1 w-full bg-white border border-[#e7e1cf] rounded-lg shadow-lg max-h-56 overflow-y-auto">
                          <input
                            type="text"
                            value={stateSearch}
                            onChange={(e) => setStateSearch(e.target.value)}
                            placeholder="Search state..."
                            className="w-full p-2 border-b text-sm outline-none"
                          />
                          {filteredStates.map((s) => (
                            <div
                              key={s}
                              onClick={() => {
                                field.onChange(s);
                                setShowStateList(false);
                                setStateSearch('');
                              }}
                              className="px-4 py-2 text-sm hover:bg-[#fff9e5] cursor-pointer text-[#1b180d]"
                            >
                              {s}
                            </div>
                          ))}
                          {filteredStates.length === 0 && (
                            <p className="p-3 text-sm text-gray-400 text-center">
                              No results found
                            </p>
                          )}
                        </div>
                      )}
                      {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state.message}</p>}
                    </div>
                  );
                }}
              />
              <FloatingInput name="pincode" label="PIN Code" inputMode="numeric" rules={{
                required: 'Pincode is required',
                pattern: { value: /^\d{6}$/, message: 'Pincode must be 6 digits' },
              }} />

              {/* Save Address Checkbox */}
              {session && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={saveAddress}
                    onChange={() => setSaveAddress(!saveAddress)}
                    className="accent-[#b28c34] h-4 w-4"
                  />
                  <label htmlFor="saveAddress" className="text-[14px] text-[#1b180d]">
                    Save this address for future orders
                  </label>
                </div>
              )}

              {/* Country */}
              <div className="relative mb-4 w-[95%] max-w-[640px]">
                <input
                  value="India"
                  readOnly
                  className="w-full h-[44px] px-4 border rounded-md bg-[#f7f4ec] text-[15px] border-[#e7e1cf] cursor-not-allowed"
                />
                <span className="absolute -top-2 left-4 bg-[#fcfbf8] px-1 text-xs text-[#9a864c] font-medium">
                  Country
                </span>
              </div>

              {/* Shipping Method */}
              <div className="w-[95%] max-w-[640px]">
                <h3 className="text-[17px] font-bold mb-3">Shipping Method</h3>
                <div className="space-y-3">
                  {Object.entries({
                    standard: ['Standard Shipping', 'Estimated 5–7 business days', 50],
                    express: ['Express Shipping', 'Estimated 2–3 business days', 120],
                    pickup: ['Self Pick-Up', 'Collect from our Raven Boutique', 0],
                  }).map(([key, [title, desc, price]]) => (
                    <label
                      key={key}
                      className={`flex justify-between items-center p-3 border rounded-md cursor-pointer transition-all duration-200
                        ${shipping === key ? 'border-[#b28c34] bg-[#fff9e5]' : 'border-[#e7e1cf] hover:bg-[#fffaf0] hover:border-[#b28c34]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={shipping === key}
                          onChange={() => setShipping(key)}
                          className="accent-[#b28c34] h-4 w-4"
                        />
                        <div>
                          <p className="font-semibold text-[15px] text-[#1b180d]">{title}</p>
                          <p className="text-xs text-[#9a864c]">{desc}</p>
                        </div>
                      </div>
                      <p className="font-medium text-[14px] text-[#1b180d]">₹{price}.00</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Return to Cart */}
              <div className="mt-5">
                <Link href="/Cart" className="text-sm text-[#9a864c] underline hover:text-[#1b180d] transition">
                  ← Return to Cart
                </Link>
              </div>
            </div>
          </section>

          {/* RIGHT ORDER SUMMARY */}
          <aside className="lg:col-span-5 border border-[#e7e1cf] rounded-lg p-6 bg-white shadow-sm h-fit sticky top-10">
            <h3 className="text-[20px] font-bold mb-4">Order Summary</h3>
            <div className="space-y-4">
              {cartItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="relative">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={65}
                      height={65}
                      className="rounded-md border border-[#e7e1cf] object-cover"
                      unoptimized
                    />
                    <span className="absolute -top-2 -right-2 bg-[#ddad1b] text-white text-[12px] font-semibold px-1 rounded-full">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-medium text-[#1b180d] font-serif">{item.name}</p>
                    <p className="text-xs text-[#9a864c]">{item.size}</p>
                  </div>
                  <p className="text-[15px] font-semibold text-[#1b180d]">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="my-4 border-t border-[#e7e1cf]" />
            <div className="text-[15px] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#9a864c]">Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9a864c]">Shipping</span>
                <span>₹{shippingCharges[shipping]}</span>
              </div>
            </div>
            <div className="my-4 border-t border-[#e7e1cf]" />
            <div className="flex justify-between items-center text-[16px] font-bold">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-2.5 bg-[#eebd2b] text-[#1b180d] text-[15px] font-semibold rounded-md hover:bg-[#d8a91a] transition disabled:opacity-60"
            >
              {loading ? 'Processing…' : 'Continue to Payment'}
            </button>
          </aside>
        </form>
      </main>
    </>
  );
}
