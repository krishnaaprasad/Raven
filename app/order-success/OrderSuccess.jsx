'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '../context/cartcontext';
import { useSession } from 'next-auth/react';
import { CreditCard, Banknote, Wallet } from "lucide-react";

const formatAmount = (amount) => {
  if (!amount || isNaN(amount)) return "0.00";
  return parseFloat(amount).toFixed(2);
};

export default function OrderSuccess() {
  const { data: session } = useSession();
  const { clearCart } = useCart();

  const [status, setStatus] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [referenceId, setReferenceId] = useState('');
  const hasFetched = useRef(false);

  useEffect(() => {
    const run = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      const params = new URLSearchParams(window.location.search);
      const orderId = params.get('orderId');
      const cfOrderId = params.get('cfOrderId');

      if (!orderId || !cfOrderId) {
        setStatus('failed');
        return;
      }

      try {
        const verifyRes = await fetch(`/api/payment/verify?orderId=${orderId}&cfOrderId=${cfOrderId}`);
        const verifyData = await verifyRes.json();

        const orderRes = await fetch(`/api/order/${orderId}`);
        const orderJson = await orderRes.json();

        if (verifyData.success && orderJson.success) {
          setStatus('success');
          setOrderData(orderJson.order);
          setReferenceId(verifyData.referenceId || 'N/A');
          clearCart();
        } else {
          setStatus('failed');
        }
      } catch (e) {
        console.error('Order success load error:', e);
        setStatus('failed');
      }
    };

    run();
  }, [clearCart]);

  if (!status)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf8] text-[#9a864c] text-lg font-medium animate-pulse">
        Verifying your payment...
      </div>
    );

  const isSuccess = status === 'success';
  const items = orderData?.cartItems || [];
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = orderData?.shippingCharge || 0;
  const total = subtotal + shipping;

  const handlePrint = () => window.print();

  return (
    <section className="bg-[#fcfbf8] min-h-screen font-[Manrope,sans-serif] text-[#1b180d]">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-[32px] md:text-5xl font-bold leading-tight tracking-tight">
            {isSuccess ? 'Thank you for your order!' : 'Payment Failed'}
          </h1>
          <p className="text-[#6b6654] text-base md:text-lg mt-3">
            {isSuccess
              ? 'Your confirmation and order details have been sent to your email.'
              : 'We couldn’t process your payment. Please try again.'}
          </p>
        </div>

        {/* Order Card */}
        {orderData && (
          <div className="max-w-4xl mx-auto mt-10 bg-white rounded-xl border border-[#e7e1cf] shadow-sm">
            <div className="p-6 md:p-8">
              <h2 className="text-[22px] font-bold leading-tight tracking-tight">
                Order #{orderData.customOrderId || orderData._id}
              </h2>
            </div>

            {/* Items */}
            <div className="border-t border-[#e7e1cf] p-6 md:p-8">
              <div className="space-y-4">
                {items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-18 h-18 rounded-lg border border-[#e7e1cf] bg-center bg-cover shrink-0"
                        style={{
                          backgroundImage: item.image
                            ? `url(${item.image})`
                            : `url("/placeholder.png")`,
                        }}
                      />
                      <div className="flex flex-col justify-center pt-1">
                        <p className="text-base font-medium">{item.name}</p>
                        <p className="text-sm text-[#6b6654]">
                          {item.size} | Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-base font-medium">
                      ₹{formatAmount(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-8 border-t border-[#e7e1cf] pt-6 flex justify-end">
                <div className="w-full max-w-xs space-y-3 text-sm">
                  <div className="flex justify-between text-[#6b6654]">
                    <span>Subtotal</span>
                    <span className="text-[#1b180d]">₹{formatAmount(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#6b6654]">
                    <span>Shipping ({orderData.deliveryType})</span>
                    <span className="text-[#1b180d]">
                      {shipping ? `₹${formatAmount(shipping)}` : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#1b180d] text-base font-bold border-t border-[#e7e1cf] pt-3 mt-2">
                    <span>Total</span>
                    <span>₹{formatAmount(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping / Payment Info */}
            <div className="border-t border-[#e7e5e1] p-6 md:p-8 grid md:grid-cols-2 gap-8">
              {/* SHIPPING */}
              <div>
                <h3 className="text-base font-bold text-[#1b180d]">Shipping Address</h3>
                <p className="mt-3 text-[#6b6654] text-[15px] leading-relaxed">
                  <span className="block font-medium text-[#1b180d]">{orderData.userName}</span>
                  <span className="block">
                    {[orderData.addressDetails?.address1, orderData.addressDetails?.address2]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                  <span className="block">
                    {[orderData.addressDetails?.city, orderData.addressDetails?.state, orderData.addressDetails?.pincode]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                  <span className="block">India</span>
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold">Payment Method</h3>
                <div className="mt-3 flex items-start gap-3">
                  {orderData.paymentMethod?.includes("UPI") && (
                    <Banknote size={18} className="text-[#b28c34] mt-0.5" />
                  )}
                  {orderData.paymentMethod?.includes("NetBanking") && (
                    <Wallet size={18} className="text-[#b28c34] mt-0.5" />
                  )}
                  {(orderData.paymentMethod?.includes("VISA") ||
                    orderData.paymentMethod?.includes("CARD")) && (
                    <CreditCard size={18} className="text-[#b28c34] mt-0.5" />
                  )}

                  <div>
                    <p className="text-[#1b180d] font-medium text-[15px] leading-snug">
                      {orderData.paymentMethod || "Cashfree"}
                    </p>
                    <p className="text-[#6b6654] text-sm mt-1">Ref ID: {referenceId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Elegant Action Buttons Section */}
            <div className="max-w-4xl mx-auto mt-10 text-center print:hidden">
              {isSuccess ? (
                <>
                  {/* Responsive Button Group */}
                  <div className="flex flex-col items-center gap-3 sm:gap-4 md:flex-row md:justify-center md:items-center md:gap-5">
                    {/* Continue Shopping */}
                    <Link
                      href="/"
                      className="bg-[#eebd2b] text-[#1b180d] font-semibold py-2 px-6 rounded-md hover:bg-[#d8a91a] transition-all duration-200 text-sm sm:text-[15px] shadow-sm w-[75%] sm:w-auto"
                    >
                      Continue Shopping
                    </Link>

                    {/* Sub-buttons (Print + Order History) */}
                    <div className="flex justify-center gap-3 w-[75%] sm:w-auto">
                      {/* Print Receipt */}
                      <button
                        onClick={() => window.print()}
                        className="flex-1 sm:flex-none border border-[#b28c34] text-[#1b180d] font-medium py-2 px-4 rounded-md hover:bg-[#fcf8ef] hover:border-[#9a864c] transition-all duration-200 text-sm sm:text-[15px]"
                      >
                        Print Receipt
                      </button>

                      {/* View Order History — only if logged in */}
                      {session && (
                        <Link
                          href="/my-account"
                          className="flex-1 sm:flex-none border border-[#b28c34] text-[#1b180d] font-medium py-2 px-4 rounded-md hover:bg-[#fcf8ef] hover:border-[#9a864c] transition-all duration-200 text-sm sm:text-[15px]"
                        >
                          View Order History
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <p className="text-xs sm:text-sm text-[#6b6654] mt-6 leading-relaxed max-w-md mx-auto mb-5">
                    Your order is expected to be delivered within 5–7 business days.
                    You’ll receive a tracking link via email once it ships.
                  </p>
                </>
              ) : (
                <Link
                  href="/checkout"
                  className="inline-block bg-red-500 text-white font-semibold py-2.5 px-6 rounded-md hover:bg-red-600 transition-all duration-200 text-sm sm:text-base"
                >
                  Try Again
                </Link>
              )}
            </div>
                      </div>
                    )}
                  </main>
                </section>
              );
            }
