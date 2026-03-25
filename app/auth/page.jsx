'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { Crimson_Text } from "next/font/google";

const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

import Link from 'next/link';

export default function LoginRegisterPage({ onClose, onLoginSuccess, verificationOnly = false }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [confirmationData, setConfirmationData] = useState(null);
  
  const otpInputRefs = useRef([]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setConfirmationData({
        verificationId: data.verificationId,
        authToken: data.authToken
      });
      setOtpSent(true);
      setResendTimer(30);
      setOtp(['', '', '', '']);

      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
  
    if (value && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedData.length === 4) {
      setOtp(pastedData.split(''));
      otpInputRefs.current[3]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 4) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!confirmationData) {
        throw new Error('Verification session lost. Please resend OTP.');
      }

      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: confirmationData.verificationId,
          authToken: confirmationData.authToken,
          otp: otpString,
          phoneNumber: phoneNumber
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Invalid OTP');

      // ✅ Handle verificationOnly mode (Change phone without logout)
      if (verificationOnly) {
        onLoginSuccess?.(phoneNumber);
        onClose?.();
        return;
      }

      // OTP is valid. Now sign in using NextAuth Credentials
      const result = await signIn('credentials', {
        redirect: false,
        phone: phoneNumber
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      onLoginSuccess?.(phoneNumber);
      onClose?.();
      
      // Force reload to update session state globally
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const modalAnimation = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      {...modalAnimation}
      className="flex items-center justify-center w-full px-4 sm:px-0"
    >
      <div
        className="relative max-w-md w-full bg-(--theme-bg) rounded-[24px] shadow-2xl overflow-hidden border border-(--theme-border) transition-all duration-300"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
      >
        {/* Header Decor */}
        <div className="h-2 bg-gradient-to-r from-(--theme-text) to-(--theme-muted) opacity-80" />

        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 text-(--theme-muted) hover:text-(--theme-text) transition-colors p-2 rounded-full hover:bg-(--theme-soft)"
          >
            <X size={20} />
          </button>
        )}

        <div className="px-8 pb-10 pt-10">
          <div className="text-center mb-10">
            <h2 className={`${crimson.className} text-[32px] font-bold text-(--theme-text) leading-tight mb-3`}>
              {otpSent ? 'Verify' : 'Welcome'}
            </h2>
            <div className="w-12 h-1 bg-(--theme-text) mx-auto mb-4 rounded-full" />
            <p className="text-(--theme-muted) text-[15px] max-w-[280px] mx-auto leading-relaxed font-medium">
              {!otpSent 
                ? "Enter your mobile number to get started."
                : `Enter the code we sent to +91 ${phoneNumber}`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!otpSent ? (
              <motion.div
                key="phone-entry"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <form className="space-y-6" onSubmit={handleSendOtp}>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.1em] font-bold text-(--theme-text) ml-1">
                      Mobile Number
                    </label>
                    <div className="flex items-center h-14 border-2 border-(--theme-border) rounded-2xl overflow-hidden focus-within:border-(--theme-text) focus-within:ring-0 transition-all bg-(--theme-bg)">
                      <div className="px-4 text-[16px] text-(--theme-muted) border-r border-(--theme-border) h-full flex items-center bg-(--theme-soft) font-bold">
                        +91
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoFocus
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10));
                          setError('');
                        }}
                        placeholder="Enter 10-digit number"
                        className="flex-1 h-full px-4 text-[17px] bg-transparent text-(--theme-text) outline-none font-medium tracking-wide"
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-[13px] font-bold text-center bg-red-50 py-2 rounded-lg border border-red-100"
                    >
                      {error}
                    </motion.p>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading || phoneNumber.length !== 10}
                    className="w-full h-14 font-extrabold text-[16px] rounded-2xl bg-(--theme-text) text-(--theme-bg) hover:opacity-95 transition-all shadow-md transform active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
                  >
                    {loading ? (
                       <span className="flex items-center justify-center gap-2">
                         <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                         </svg>
                         Processing...
                       </span>
                    ) : 'Generate OTP'}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-[11px] text-(--theme-muted)">
                    By continuing, you agree to our{' '}
                    <Link href="/policy/terms-conditions" className="text-(--theme-text) font-bold hover:underline">Terms</Link>
                    {' '}&{' '}
                    <Link href="/policy/privacy-policy" className="text-(--theme-text) font-bold hover:underline">Privacy Policy</Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp-entry"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                <form className="space-y-8" onSubmit={handleVerifyOtp}>
                  <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-14 h-16 text-center text-2xl font-black border-2 border-(--theme-border) rounded-2xl bg-(--theme-bg) text-(--theme-text) outline-none focus:border-(--theme-text) transition-all shadow-sm"
                      />
                    ))}
                  </div>

                  {error && (
                    <motion.p 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-[13px] font-bold text-center bg-red-50 py-2 rounded-lg border border-red-100"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otp.join('').length !== 4}
                    className="w-full h-14 font-extrabold text-[16px] rounded-2xl bg-(--theme-text) text-(--theme-bg) hover:opacity-95 transition-all shadow-md transform active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none uppercase tracking-widest"
                  >
                    {loading ? 'Verifying...' : 'Complete Login'}
                  </button>
                </form>

                <div className="mt-10 flex flex-col items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp(['', '', '', '']);
                      setError('');
                    }}
                    className="text-sm text-(--theme-muted) hover:text-(--theme-text) font-bold underline underline-offset-4 decoration-2 transition-all cursor-pointer"
                  >
                    Use different mobile
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={resendTimer > 0 || loading}
                    className="group text-[13px] text-(--theme-text) font-bold flex items-center gap-2 disabled:opacity-40"
                  >
                    <span>Didn't receive?</span>
                    <span className="text-(--theme-muted) group-hover:text-(--theme-text) transition-colors underline decoration-dotted decoration-2 underline-offset-4">
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP Now'}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

