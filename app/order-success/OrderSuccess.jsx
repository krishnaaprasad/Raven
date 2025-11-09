'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '../context/cartcontext';
import { useSession } from 'next-auth/react';

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
              <h2 className="text-[20px] md:text-[22px] font-bold tracking-tight">
                Order #{orderData._id}
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
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-8 border-t border-[#e7e1cf] pt-6 flex justify-end">
                <div className="w-full max-w-xs space-y-3 text-sm">
                  <div className="flex justify-between text-[#6b6654]">
                    <span>Subtotal</span>
                    <span className="text-[#1b180d]">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-[#6b6654]">
                    <span>Shipping ({orderData.deliveryType})</span>
                    <span className="text-[#1b180d]">
                      {shipping ? `₹${shipping}` : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#1b180d] font-bold border-t border-[#e7e1cf] pt-3 mt-2">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping / Payment Info */}
            <div className="border-t border-[#e7e1cf] p-6 md:p-8 grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-base font-bold">Shipping Address</h3>
                <p className="mt-2 text-[#6b6654] leading-relaxed">
                  {orderData.userName}
                  <br />
                  {orderData.address}
                  <br />
                  India
                </p>
              </div>
              <div>
                <h3 className="text-base font-bold">Payment Method</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-10 h-6 bg-gray-200 rounded border border-[#e7e1cf] flex items-center justify-center">
                      <span className="text-xs font-mono text-[#6b6654]">
                        {orderData?.paymentGateway || 'Cashfree'}
                      </span>
                    </div>
                    <p className="text-[#6b6654] text-sm">
                      {orderData?.paymentDetails
                        ? orderData.paymentDetails
                        : `Ref ID: ${referenceId}`}
                    </p>
                  </div>
              </div>
            </div>

            {/* Centered Actions */}
            <div className="border-t border-[#e7e1cf] p-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
              <Link
                href="/"
                className="bg-[#eebd2b] text-black font-semibold py-2.5 px-6 rounded-lg hover:opacity-90 transition"
              >
                Continue Shopping
              </Link>

              <button
                onClick={handlePrint}
                className="text-[#6b6654] hover:text-[#1b180d] font-medium transition"
              >
                Print Receipt
              </button>

              {session?.user && (
                <Link
                  href="/my-account"
                  className="text-[#6b6654] hover:text-[#1b180d] font-medium transition"
                >
                  View Order History
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Delivery note */}
        {isSuccess && (
          <p className="text-center text-sm text-[#6b6654] mt-8">
            Your order is expected to be delivered within 5–7 business days. You’ll
            receive a tracking link via email once it ships.
          </p>
        )}

        {!isSuccess && (
          <div className="text-center mt-8">
            <Link
              href="/checkout"
              className="inline-block bg-red-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-600 transition"
            >
              Try Again
            </Link>
          </div>
        )}
      </main>
    </section>
  );
}
