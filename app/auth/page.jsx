'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, X } from 'lucide-react';
import { signIn } from 'next-auth/react';

import { Crimson_Text } from "next/font/google";

const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});


export default function LoginRegisterPage({ onClose, onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [direction, setDirection] = useState('right');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.id]: e.target.value });

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSwitch = (registering) => {
    setDirection(registering ? 'left' : 'right');
    setIsRegistering(registering);
    setError('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { name, email, password, confirmPassword } = formData;
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');
      alert('✅ Registration successful! Please login.');
      handleSwitch(false);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { email, password } = formData;
    if (!email || !password) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email address.');
      setLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        onLoginSuccess?.(email);
        onClose?.();
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    await signIn('google', {
      redirect: false,
      callbackUrl: window.location.href,
    });
  };

  const slideVariants = {
    initial: (dir) => ({ x: dir === 'left' ? '100%' : '-100%', opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir === 'left' ? '-100%' : '100%', opacity: 0 }),
  };

  const modalAnimation = {
    initial: { opacity: 0, y: 40, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: 40, scale: 0.98, transition: { duration: 0.25, ease: 'easeIn' } },
  };

  const GoogleButton = ({ label }) => (
    <button
      type="button"
      onClick={handleGoogle}
      className="w-full flex items-center justify-center gap-3 py-2 px-4 rounded-lg border border-(--theme-border) bg-(--theme-bg) text-(--theme-text) font-medium hover:bg-(--theme-soft) transition duration-150 mb-2 cursor-pointer"
    >
      <img
        src="https://www.svgrepo.com/show/355037/google.svg"
        alt="Google"
        className="w-5 h-5 rounded-full"
      />
      <span className="text-base font-medium">{label}</span>
    </button>
  );

  return (
    <motion.div
      {...modalAnimation}
      className="flex items-center justify-center w-full h-full px-3 sm:px-4"
      style={{
        fontFamily: 'Manrope, sans-serif',
        minHeight: '540px',
        maxHeight: '90vh',
      }}
    >
      <div
        className="relative max-w-sm w-full bg-(--theme-bg) rounded-2xl shadow-xl overflow-hidden border border-(--theme-border) transition-colors duration-300"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,.08)' }}
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-50 text-(--theme-bg) bg-(--theme-text)
            rounded-full w-8 h-8 flex items-center justify-center
            hover:opacity-90 transition-all duration-200"

          >
            <X size={18} />
          </button>
        )}

        {/* Forms */}
        <div className="relative w-full flex items-center justify-center min-h-[520px]">
          <AnimatePresence mode="wait" custom={direction}>
            {isRegistering ? (
              <motion.div
                key="register"
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0 flex flex-col justify-center px-5 py-8 bg-(--theme-bg)"
              >
                <h2 className={`${crimson.className} text-2xl font-bold text-(--theme-text) mb-1 text-center`}>

                  Create Account
                </h2>
                <p className="text-base mb-5 text-center text-(--theme-muted)">
                  Let’s get you started.
                </p>
                <GoogleButton label="Sign up with Google" />
                <p className="text-sm text-gray-400 mb-3 text-center">
                  or use email registration
                </p>

                <form className="space-y-5" onSubmit={handleRegister}>
                  <input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="Full Name"
                    className="w-full border rounded-lg p-3 bg-(--theme-bg) border-(--theme-border) text-(--theme-text) focus:ring-1 focus:ring-(--theme-text) focus:border-(--theme-text) outline-none font-medium transition"                  />
                  <input
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Email"
                    className="w-full border rounded-lg p-3 bg-(--theme-bg) border-(--theme-border) text-(--theme-text) focus:ring-1 focus:ring-(--theme-text) focus:border-(--theme-text) outline-none font-medium transition"                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      type="password"
                      placeholder="Password"
                      className="border rounded-lg p-3 bg-(--theme-bg) border-(--theme-border) focus:ring-1 focus:ring-(--theme-text) font-medium"
                    />
                    <input
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      type="password"
                      placeholder="Confirm"
                      className="border rounded-lg p-3 bg-(--theme-bg) border-(--theme-border) focus:ring-1 focus:ring-(--theme-text) font-medium"
                    />
                  </div>
                  {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full font-bold py-3 rounded-lg mt-2 bg-(--theme-text) text-(--theme-bg) hover:opacity-90 shadow-md cursor-pointer"
                  >
                    {loading ? 'Processing...' : 'Register'}
                  </button>
                </form>

                <p className="text-center text-sm mt-5 text-(--theme-muted)">
                  Already have an account?{' '}
                  <button
                    onClick={() => handleSwitch(false)}
                    className="font-medium hover:underline text-(--theme-text) cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="login"
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0 flex flex-col justify-center px-5 py-8 bg-(--theme-bg)"
              >
                <h2 className={`${crimson.className} text-2xl font-bold text-(--theme-text) mb-1 text-center`}>
                  Welcome Back
                </h2>
                <p className="text-base mb-5 text-center text-(--theme-muted)">
                  Please enter your details to sign in.
                </p>
                <GoogleButton label="Sign in with Google" />
                <p className="text-sm text-gray-400 mb-3 text-center">
                  or with email and password
                </p>

                <form className="space-y-5" onSubmit={handleLogin}>
                  <input
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Email"
                    className="w-full border rounded-lg p-3 bg-(--theme-bg) border-(--theme-border) text-(--theme-text) focus:ring-1 focus:ring-(--theme-text) focus:border-(--theme-text) outline-none font-medium transition"                  />
                  <div className="relative">
                    <input
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      className="w-full border rounded-lg p-3 pr-10 bg-(--theme-bg) border-(--theme-border) focus:ring-1 focus:ring-(--theme-text) font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-(--theme-muted)"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full font-bold py-3 rounded-lg bg-(--theme-text) text-(--theme-bg) hover:opacity-90 shadow-md cursor-pointer"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                <p className="text-center text-sm mt-6 text-(--theme-muted)">
                  Don’t have an account?{' '}
                  <button
                    onClick={() => handleSwitch(true)}
                    className="font-medium hover:underline text-(--theme-text) cursor-pointer"
                  >
                    Sign up
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
