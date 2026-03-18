'use client';
import { Crimson_Text } from "next/font/google";
import { useEffect, useRef, useState, useCallback } from 'react';
import { useCart } from '../context/cartcontext';
import { useRouter } from 'next/navigation';
import { load } from '@cashfreepayments/cashfree-js';
import Image from 'next/image';
import Link from 'next/link';
import { FiHelpCircle, FiChevronDown } from 'react-icons/fi';
import { UserIcon } from '@heroicons/react/24/outline';
import { useForm, Controller } from 'react-hook-form';
import usePageMetadata from '../hooks/usePageMetadata';
import { useSession, signOut } from 'next-auth/react';
import { loadFailedOrderData } from '../context/cartcontext';
import { event } from "@/lib/ga";
import dynamic from 'next/dynamic';

const AuthModal = dynamic(() => import('@/app/auth/modal'), {
  ssr: false,
  loading: () => null,
});

const formatAmount = (amount) => {
  if (!amount || isNaN(amount)) return "0.00";
  return parseFloat(amount).toFixed(2);
};

const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

// ✅ Region pincode validation (Mumbai: 400, Sangli: 416)
const ALLOWED_PINCODE_PREFIXES = ['400', '416'];
const isValidPincodeRegion = (pincode) => {
  return pincode && /^\d{6}$/.test(pincode) && ALLOWED_PINCODE_PREFIXES.some(prefix => pincode.startsWith(prefix));
};

export default function CheckoutClient() {
  const mode = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("mode")
    : null;

  usePageMetadata(
    'Checkout - Raven Fragrance',
    'Complete your Raven Fragrance order by adding your shipping details and securely paying through Cashfree.'
  );

  const { cartItems: cartContextItems } = useCart();
  const [checkoutItems, setCheckoutItems] = useState([]);

  useEffect(() => {
    if (mode === "buynow") {
      const item = JSON.parse(sessionStorage.getItem("buyNowItem"));
      if (item) {
        setCheckoutItems([item]);
        return;
      }
    }
    setCheckoutItems(cartContextItems);
  }, [mode, cartContextItems]);

  // 🔥 GA4: Track begin_checkout
  useEffect(() => {
    if (!checkoutItems?.length) return;
    event({
      action: "begin_checkout",
      params: {
        currency: "INR",
        value: checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
        items: checkoutItems.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
          item_variant: item.size,
        })),
      },
    });
  }, [checkoutItems]);

  // ✅ Restore failed cart if cartItems is empty
  useEffect(() => {
    if (!cartContextItems?.length) {
      const failed = localStorage.getItem('failedOrder');
      if (failed) {
        const parsed = JSON.parse(failed);
        if (parsed?.cartItems?.length) {
          localStorage.setItem(
            'cart',
            JSON.stringify({
              items: parsed.cartItems,
              expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
            })
          );
          window.dispatchEvent(new Event('storage'));
        }
      }
    }
  }, [cartContextItems]);

  const router = useRouter();
  const { data: session, status } = useSession();

  // ========== UI STATES ==========
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' or 'verify_only'
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [isPhoneOverridden, setIsPhoneOverridden] = useState(false);
  // ========== FORM STATES ==========
  const [shipping, setShipping] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [showPhoneTip, setShowPhoneTip] = useState(false);
  const [showStateList, setShowStateList] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const tooltipRef = useRef(null);
  const stateDropdownRef = useRef(null);
  const fieldRefs = useRef({});
  const [saveAddress, setSaveAddress] = useState(true);
  const [hasUserEdited, setHasUserEdited] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    trigger,
    setValue,
    watch,
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

  // ✅ Auto-save locally (debounced)
  useEffect(() => {
    const subscription = watch((value) => {
      if (!hasUserEdited) return;
      clearTimeout(window._checkoutSaveTimer);
      window._checkoutSaveTimer = setTimeout(() => {
        const nonEmptyData = Object.fromEntries(
          Object.entries(value).filter(([_, v]) => v && v.trim() !== '')
        );
        localStorage.setItem('checkoutUser', JSON.stringify(nonEmptyData));
      }, 800);
    });
    return () => subscription.unsubscribe();
  }, [watch, hasUserEdited]);

  const shippingCharges = { standard: 50, express: 120, pickup: 0 };
  const subtotal = checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingAmount = shippingCharges[shipping] || 0;
  const discountAmount = couponData?.discount || 0;
  const total = Math.max(subtotal + shippingAmount - discountAmount, 0);

  const handleRemoveCoupon = () => {
    setCouponData(null);
    setCouponCode("");
    setCouponError("");
  };

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

  useEffect(() => {
    if (couponData) {
      handleApplyCoupon();
    }
  }, [subtotal]);

  // ========== PREFILL LOGIC ==========
  useEffect(() => {
    // If user is logged in AND they haven't manually overridden the phone, use session phone
    if (session?.user?.phone && !isPhoneOverridden) {
      setVerifiedPhone(session.user.phone);
      setValue('phone', session.user.phone, { shouldDirty: false });

      // Automatically fetch user data if session is active
      const fetchUserData = async () => {
        try {
          const fetchRes = await fetch('/api/user/by-phone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: session.user.phone }),
          });
          const userData = await fetchRes.json();
          if (userData.exists) {
            if (userData.email) setValue('email', userData.email, { shouldDirty: false });
            if (userData.firstName) setValue('firstName', userData.firstName, { shouldDirty: false });
            if (userData.lastName) setValue('lastName', userData.lastName, { shouldDirty: false });
            if (userData.address1) setValue('address1', userData.address1, { shouldDirty: false });
            if (userData.address2) setValue('address2', userData.address2, { shouldDirty: false });
            if (userData.city) setValue('city', userData.city, { shouldDirty: false });
            if (userData.state) setValue('state', userData.state, { shouldDirty: false });
            if (userData.pincode) setValue('pincode', userData.pincode, { shouldDirty: false });
          }
        } catch (err) {
          console.warn('Prefill error:', err);
        }
      };
      fetchUserData();
    } else if (status === 'unauthenticated' && !session) {
      // Auto-open modal if not logged in
      setShowAuthModal(true);
    }

    // Original prefill logic (modified to remove currentStep dependency)
    if (hasUserEdited) return; // Only prefill if user hasn't started editing

    let hasPrefilled = false;

    // 1️⃣ Failed order
    const failedOrderData = loadFailedOrderData();
    if (failedOrderData && Object.keys(failedOrderData).length) {
      Object.entries(failedOrderData).forEach(([key, value]) => {
        if (value && key !== 'phone') setValue(key, value, { shouldDirty: false });
      });
      localStorage.removeItem('failedOrder');
      hasPrefilled = true;
      return;
    }

    // 2️⃣ Local saved data
    const savedCheckoutData = localStorage.getItem('checkoutUser');
    if (savedCheckoutData) {
      const parsed = JSON.parse(savedCheckoutData);
      if (Object.keys(parsed).length > 0) {
        Object.entries(parsed).forEach(([key, value]) => {
          if (value && key !== 'phone') setValue(key, value, { shouldDirty: false });
        });
        hasPrefilled = true;
        return;
      }
    }

    // 3️⃣ DB user data (if logged in via NextAuth or verified OTP)
    const fetchPhone = session?.user?.phone || verifiedPhone;
    if (fetchPhone && !hasPrefilled) { // Only fetch if not already prefilled by local data
      const loadDBData = async () => {
        try {
          const fetchRes = await fetch('/api/user/by-phone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: fetchPhone }),
          });
          const data = await fetchRes.json();
          if (data?.exists) {
            if (data.email) setValue('email', data.email, { shouldDirty: false });
            if (data.firstName) setValue('firstName', data.firstName, { shouldDirty: false });
            if (data.lastName) setValue('lastName', data.lastName, { shouldDirty: false });
            if (data.address1) setValue('address1', data.address1, { shouldDirty: false });
            if (data.address2) setValue('address2', data.address2, { shouldDirty: false });
            if (data.city) setValue('city', data.city, { shouldDirty: false });
            if (data.state) setValue('state', data.state, { shouldDirty: false });
            if (data.pincode) setValue('pincode', data.pincode, { shouldDirty: false });
          }
        } catch (err) {
          console.warn('Could not load user data:', err);
        }
      };
      loadDBData();
    }
    if (status !== 'loading' && (status === 'unauthenticated' || (status === 'authenticated' && session))) {
      setIsInitialized(true);
    }
  }, [session, setValue, hasUserEdited, verifiedPhone, status, isPhoneOverridden]); // Added status/overridden to dependencies

  // ✅ Close tooltip/dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target))
        setShowPhoneTip(false);
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(e.target))
        setShowStateList(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToError = () => {
    const firstError = Object.keys(errors)[0];
    if (firstError && fieldRefs.current[firstError]) {
      fieldRefs.current[firstError].scrollIntoView({ behavior: 'smooth', block: 'center' });
      fieldRefs.current[firstError].focus();
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartTotal: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.message);
        setCouponData(null);
      } else {
        setCouponData({ ...data, code: couponCode.toUpperCase() });
        setCouponError("");
      }
    } catch (err) {
      setCouponError("Something went wrong");
    } finally {
      setApplyingCoupon(false);
    }
  };

  // ✅ Payment handler
  const handlePayment = async (formData) => {
    // Validate pincode before proceeding
    if (!isValidPincodeRegion(formData.pincode)) {
      setPincodeError('We are currently delivering only in Mumbai and Sangli. We will soon start service in your area — stay tuned!');
      if (fieldRefs.current['pincode']) {
        fieldRefs.current['pincode'].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setPincodeError('');
    setLoading(true);

    try {
      // Include the verified phone number
      const fullFormData = { ...formData, phone: verifiedPhone };

      localStorage.setItem('checkoutUser', JSON.stringify(fullFormData));
      localStorage.setItem(
        'cart',
        JSON.stringify({
          items: checkoutItems,
          expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
        })
      );
      localStorage.setItem('shipping', shipping);
      localStorage.setItem('shippingCharge', shippingCharges[shipping]);

      // Save user data to database
      if (saveAddress) {
        try {
          await fetch('/api/user/save-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fullFormData),
          });
        } catch (saveErr) {
          console.warn('Could not save user data:', saveErr);
        }
      }

      // Also update if logged in via NextAuth
      if (session?.user?.email && saveAddress) {
        await fetch('/api/user/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullFormData),
        });
      }

      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fullFormData,
          cartItems: checkoutItems.map((item) => ({
            name: item.name,
            size: item.size,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            slug: item.slug,
          })),
          shipping,
          shippingCharge: shippingCharges[shipping],
          totalAmount: total,
          couponCode: couponData?.code || null,
          discount: discountAmount,
        }),
      });

      const data = await res.json();
      if (data.payment_session_id) {
        localStorage.setItem(
          'orderPreview',
          JSON.stringify({
            checkoutItems,
            shipping,
            shippingCharge: shippingCharges[shipping],
            totalAmount: total,
            user: fullFormData,
          })
        );
        const cashfreeMode = process.env.NEXT_PUBLIC_CASHFREE_ENV || 'sandbox';
        const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.ravenfragrance.in";
        const cashfree = await load({ mode: cashfreeMode });
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

  // ✅ Floating Input
  const FloatingInput = ({ name, label, type = 'text', inputMode, maxLength, rules, helperText }) => (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value } }) => {
        const hasError = Boolean(errors[name]);
        const hasValue = value?.trim() !== '';

        const handleChange = (e) => {
          let val = e.target.value;
          if (name === 'pincode') {
            val = val.replace(/[^0-9]/g, '').slice(0, 6);
            // Live pincode validation
            if (val.length === 6) {
              if (!isMumbaiPincode(val)) {
                setPincodeError('We are currently delivering only in Mumbai. We will soon start service in your area — stay tuned!');
              } else {
                setPincodeError('');
              }
            } else {
              setPincodeError('');
            }
          }
          setHasUserEdited(true);
          onChange(val);
        };

        return (
          <div ref={(el) => (fieldRefs.current[name] = el)} className="relative mb-5 w-[95%] max-w-[640px]">
            <input
              type={type}
              inputMode={inputMode}
              maxLength={maxLength}
              value={value ?? ''}
              onChange={handleChange}
              placeholder=" "
              autoComplete="off"
              className={`peer w-full h-11 px-4 pr-10 text-[15px] text-(--theme-text) bg-(--theme-bg) rounded-md border outline-none transition-all
                ${hasError || (name === 'pincode' && pincodeError)
                  ? 'border-red-500'
                  : 'border-(--theme-border) focus:border-(--theme-text) focus:ring-1 focus:ring-(--theme-text)'
                }`}
            />
            <label
              className={`absolute left-4 text-(--theme-muted) bg-(--theme-bg) px-1 transition-all duration-300 pointer-events-none
                ${hasValue
                  ? '-top-2 text-xs font-medium'
                  : 'top-2.5 text-[15px] peer-focus:-top-2 peer-focus:text-xs'
                }`}
            >
              {label}
            </label>
            {helperText && (
              <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                <FiHelpCircle size={12} className="flex-shrink-0" />
                {helperText}
              </p>
            )}
            {hasError && <p className="mt-1 text-xs text-red-600">{errors[name].message}</p>}
            {name === 'pincode' && pincodeError && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-xs text-amber-700 font-medium">📍 {pincodeError}</p>
              </div>
            )}
          </div>
        );
      }}
    />
  );

  if (!checkoutItems.length)
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--theme-bg)">
        <h1 className="text-lg font-semibold text-(--theme-muted)">Your cart is empty</h1>
      </div>
    );

  // ========== LOADING & AUTHENTICATION GUARD ==========
  // We stay in loading state until session status is fully determined to prevent flashing the wrong screen
  if (!isInitialized || status === 'loading') {
    return (
      <main className="min-h-screen bg-(--theme-bg) flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-(--theme-soft) border-t-(--theme-text) rounded-full animate-spin"></div>
      </main>
    );
  }

  // Only show the auth guard if we are DEFINITELY unauthenticated
  if (!session) {
    return (
      <main className="min-h-screen bg-(--theme-bg) flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-(--theme-soft) rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <UserIcon className="h-10 w-10 text-(--theme-text)" />
          </div>
          <h2 className={`${crimson.className} text-[32px] font-bold text-(--theme-text) mb-4`}>
            Checkout Securely
          </h2>
          <p className="text-(--theme-muted) text-[16px] mb-10 leading-relaxed">
            Please verify your mobile number to continue with your purchase.
            This ensures your order is safely linked to your account.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full h-14 bg-(--theme-text) text-(--theme-bg) rounded-2xl font-bold text-[17px] hover:opacity-95 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
          >
            Log in / Sign up via SMS
          </button>

          <div className="mt-8">
            <Link href="/Cart" className="text-sm font-bold text-(--theme-muted) hover:text-(--theme-text) transition-colors underline underline-offset-4 tracking-wide">
              ← Return to Shopping Bag
            </Link>
          </div>
        </div>

        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
      </main>
    );
  }

  // ========== STEP 2: ADDRESS & PAYMENT ==========
  return (
    <>
      <main className="min-h-screen bg-(--theme-bg) text-(--theme-text) font-sans px-4 sm:px-6 lg:px-10 py-10 transition-colors duration-300">
        {/* Steps indicator */}
        {/* Removed step indicator as per new logic */}

        <form
          onSubmit={handleSubmit(handlePayment, scrollToError)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10 max-w-6xl mx-auto"
        >
          {/* LEFT SIDE */}
          <section className="lg:col-span-7">
            {/* Verified phone badge */}
            <div className="mb-6 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <span className="text-green-600 text-lg">✓</span>
              <div>
                <p className="text-sm font-medium text-green-700">Mobile Verified</p>
                <p className="text-xs text-green-600">+91 {verifiedPhone}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('verify_only'); // Enable verification-only mode (No logout)
                  setShowAuthModal(true);
                }}
                className="ml-auto text-xs text-(--theme-muted) underline hover:text-(--theme-text) transition cursor-pointer"
              >
                Change
              </button>
            </div>

            <div className="flex items-center justify-between mb-8">
              <h2 className={`${crimson.className} text-[24px] font-bold text-(--theme-text)`}>Shipping Information</h2>
              {session && (
                <p className="text-[14px] text-(--theme-text)">Hi, {session.user.name?.split(' ')[0]}</p>
              )}
            </div>

            <div className="space-y-4">
              <FloatingInput
                name="email"
                label="Email Address"
                type="email"
                helperText="Please type your correct email — your invoice and order confirmation will be sent here"
                rules={{
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                }}
              />
              <FloatingInput name="firstName" label="First Name" rules={{ required: 'First name is required' }} />
              <FloatingInput name="lastName" label="Last Name" rules={{ required: 'Last name is required' }} />
              <FloatingInput name="address1" label="Street Address" rules={{ required: 'Street address is required' }} />
              <FloatingInput name="address2" label="Apartment, suite, etc. (Optional)" />
              <FloatingInput name="city" label="City" rules={{ required: 'City is required' }} />

              {/* STATE DROPDOWN */}
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
                        className={`flex justify-between items-center h-11 px-4 border rounded-md bg-(--theme-bg) cursor-pointer ${errors.state
                            ? 'border-red-500'
                            : 'border-(--theme-border) hover:border-(--theme-text)'
                          }`}
                      >
                        <span
                          className={`text-[15px] ${field.value ? 'text-(--theme-text)' : 'text-(--theme-muted)'
                            }`}
                        >
                          {field.value || 'Select State / Territory'}
                        </span>
                        <FiChevronDown
                          className={`text-(--theme-muted) transition-transform ${showStateList ? 'rotate-180' : ''
                            }`}
                        />
                      </div>

                      {showStateList && (
                        <div className="absolute z-20 mt-1 w-full bg-(--theme-bg) border border-(--theme-border) rounded-lg shadow-lg max-h-56 overflow-y-auto">
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
                              className="px-4 py-2 text-sm hover:bg-(--theme-soft) cursor-pointer text-(--theme-text)"
                            >
                              {s}
                            </div>
                          ))}
                          {filteredStates.length === 0 && (
                            <p className="p-3 text-sm text-gray-400 text-center">No results found</p>
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

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="saveAddress"
                  checked={saveAddress}
                  onChange={() => setSaveAddress(!saveAddress)}
                  className="accent-black dark:accent-white h-4 w-4"
                />
                <label htmlFor="saveAddress" className="text-[14px] text-(--theme-text)">
                  Save this address for future orders
                </label>
              </div>

              <div className="relative mb-4 w-[95%] max-w-[640px]">
                <input
                  value="India"
                  readOnly
                  className="w-full h-11 px-4 border rounded-md bg-(--theme-bg) text-[15px] border-(--theme-border) cursor-not-allowed"
                />
                <span className="absolute -top-2 left-4 bg-(--theme-bg) px-1 text-xs text-(--theme-muted) font-medium">
                  Country
                </span>
              </div>

              {/* SHIPPING */}
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
                      className={`flex justify-between items-center p-3 border rounded-md cursor-pointer transition-all duration-200 ${shipping === key
                          ? 'border-(--theme-text) bg-(--theme-soft)'
                          : 'border-(--theme-border) hover:bg-(--theme-soft) hover:border-(--theme-text)'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={shipping === key}
                          onChange={() => setShipping(key)}
                          className="accent-black dark:accent-white h-4 w-4"
                        />
                        <div>
                          <p className="font-semibold text-[15px] text-(--theme-text)">{title}</p>
                          <p className="text-xs text-(--theme-muted)">{desc}</p>
                        </div>
                      </div>
                      <p className="font-medium text-[14px] text-(--theme-text)">₹{price}.00</p>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <Link href="/Cart" className="text-sm text-(--theme-muted) underline hover:text-(--theme-text) transition">
                  ← Return to Cart
                </Link>
              </div>
            </div>
          </section>

          {/* RIGHT SUMMARY */}
          <aside className="lg:col-span-5 border border-(--theme-border) rounded-lg p-6 bg-(--theme-bg) shadow-sm h-fit sticky top-10">
            <h3 className="text-[20px] font-bold mb-4">Order Summary</h3>
            <div className="space-y-4">
              {checkoutItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="relative">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={65}
                      height={65}
                      className="rounded-md border border-(--theme-border) object-cover"
                      unoptimized
                    />
                    <span className="absolute -top-2 -right-2 bg-(--theme-text) text-(--theme-bg) text-[12px] font-semibold px-1 rounded-full">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-medium text-(--theme-text) font-serif">{item.name}</p>
                    <p className="text-xs text-(--theme-muted)">{item.size} ml</p>
                    <p className="text-xs text-(--theme-muted)">Qty × {item.quantity}</p>
                  </div>
                  <p className="text-[15px] font-semibold text-(--theme-text)">
                    ₹{formatAmount(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* COUPON SECTION */}
            <div className="mt-6">
              {!couponData ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Discount code"
                    className="flex-1 h-10 px-3 border border-(--theme-border) rounded-md text-sm bg-(--theme-bg) focus:border-(--theme-text) outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon}
                    className="px-4 text-sm font-medium bg-(--theme-text) text-(--theme-bg) rounded-md hover:opacity-90 disabled:opacity-60"
                  >
                    {applyingCoupon ? "Applying..." : "Apply"}
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-green-50 border border-green-200 px-3 py-2 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-green-700">
                      {couponData.code} Applied
                    </p>
                    <p className="text-xs text-green-600">
                      You saved ₹{formatAmount(couponData.discount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-500 underline cursor-pointer hover:text-red-700 transition"
                  >
                    Remove
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-red-600 text-xs mt-2">{couponError}</p>
              )}
            </div>

            <div className="my-4 border-t border-(--theme-border)" />
            <div className="text-[15px] space-y-1">
              <div className="flex justify-between">
                <span className="text-(--theme-muted)">Subtotal</span>
                <span>₹{formatAmount(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex text-[15px] justify-between">
                  <span className="text-(--theme-muted)">Discount ({couponData?.code})</span>
                  <span>- ₹{formatAmount(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-(--theme-muted)">Shipping</span>
                <span>₹{formatAmount(shippingCharges[shipping])}</span>
              </div>
            </div>
            <div className="my-4 border-t border-(--theme-border)" />
            <div className="flex justify-between items-center text-[16px] font-bold">
              <span>Total</span>
              <span>₹{formatAmount(total)}</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-(--theme-text) text-(--theme-bg) text-[16px] font-bold rounded-xl hover:opacity-95 transition-all shadow-md mt-6 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Securely Processing...
                </span>
              ) : 'Proceed to Payment'}
            </button>

            <div className="mt-6 text-center">
              <p className="text-[11px] text-(--theme-muted) leading-relaxed">
                By placing this order, you agree to Raven Fragrance's{' '}
                <Link href="/policy/terms-conditions" className="text-(--theme-text) font-bold hover:underline">Terms of Service</Link>
                {' '}&{' '}
                <Link href="/policy/privacy-policy" className="text-(--theme-text) font-bold hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </aside>
        </form>
      </main>

      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            setAuthModalMode('login'); // Reset mode on close
          }}
          onLoginSuccess={(phone) => {
            setVerifiedPhone(phone); // Update the verified phone for this order
            setIsPhoneOverridden(true); // Flag that we are using a custom number for this order
            setShowAuthModal(false);
            setAuthModalMode('login'); // Reset
          }}
          verificationOnly={authModalMode === 'verify_only'}
        />
      )}
    </>
  );
}