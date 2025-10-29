'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, X } from 'lucide-react';
import { signIn } from 'next-auth/react';

const primary = '#ecab13';
const textMuted = '#8d8d8d';

export default function LoginRegisterPage({ onClose }) {
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
        window.location.href = '/';
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google sign-in handler
  const handleGoogle = async () => {
    await signIn('google', { callbackUrl: '/' });
  };

  const slideVariants = {
    initial: (dir) => ({ x: dir === 'left' ? '100%' : '-100%', opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir === 'left' ? '-100%' : '100%', opacity: 0 }),
  };

  const GoogleButton = ({ label }) => (
    <button
      type="button"
      onClick={handleGoogle}
      className="w-full flex items-center justify-center gap-3 py-2 px-4 rounded-lg border border-gray-200 bg-white font-semibold text-[#3b3b3b] shadow hover:shadow-md transition duration-150 mb-2"
      style={{ marginTop: 4 }}
    >
      <img
        src="https://www.svgrepo.com/show/355037/google.svg"
        alt="Google"
        className="w-5 h-5"
        style={{ background: 'white', borderRadius: '50%' }}
      />
      <span className="text-base font-medium">{label}</span>
    </button>
  );

  return (
    <div
      className="flex items-center justify-center px-3 bg-transparent text-center"
      style={{
        fontFamily: 'Manrope, sans-serif',
        minHeight: '540px',
      }}
    >
      <div
        className="max-w-sm w-full bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
        style={{
          borderRadius: '20px',
          boxShadow: '0 8px 40px rgba(0,0,0,.08)',
        }}
      >
        {/* Close button (only when onClose prop exists) */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3.5 right-2.5 md:top-3.5 md:right-2.5
            text-[#000000] bg-[#dba015] border-none
            rounded-full w-8 h-8 md:w-9 md:h-9 flex items-center justify-center
            shadow-[0_2px_8px_rgba(178,140,52,0.25)]
            cursor-pointer transition-all duration-200
            hover:bg-[#bb9433]
            z-20"
           
          >
            <X size={18} />
          </button>
        )}

        <div
          className="relative w-full flex items-center justify-center"
          style={{ minHeight: '520px', overflow: 'hidden' }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            {isRegistering ? (
              <motion.div
                key="register"
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                className="absolute inset-0 flex flex-col justify-center px-4 py-8 bg-white"
              >
                <h2 className="text-2xl font-bold text-stone-900 mb-1 text-center">
                  Create Account
                </h2>
                <p
                  className="text-base mb-5 text-center"
                  style={{ color: textMuted }}
                >
                  Let’s get you started.
                </p>
                <GoogleButton label="Sign up with Google" />
                <p className="text-sm text-gray-400 mb-2">
                  or use email registration
                </p>
                <form className="space-y-5" onSubmit={handleRegister}>
                  <input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="Full Name"
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 font-medium"
                    style={{
                      backgroundColor: '#f7f7f7',
                      borderColor: '#efefef',
                    }}
                  />
                  <input
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Email"
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 font-medium"
                    style={{
                      backgroundColor: '#f7f7f7',
                      borderColor: '#efefef',
                    }}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      type="password"
                      placeholder="Password"
                      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 font-medium"
                      style={{
                        backgroundColor: '#f7f7f7',
                        borderColor: '#efefef',
                      }}
                    />
                    <input
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      type="password"
                      placeholder="Confirm"
                      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 font-medium"
                      style={{
                        backgroundColor: '#f7f7f7',
                        borderColor: '#efefef',
                      }}
                    />
                  </div>
                  {error && (
                    <p className="text-red-600 text-sm font-medium mt-1">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full font-bold py-3 px-4 rounded-lg mt-2"
                    style={{
                      backgroundColor: primary,
                      color: '#191919',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      boxShadow: '0 2px 18px rgba(236,171,19, 0.12)',
                    }}
                  >
                    {loading ? 'Processing...' : 'Register'}
                  </button>
                </form>
                <p
                  className="text-center text-sm mt-5"
                  style={{ color: textMuted }}
                >
                  Already have an account?{' '}
                  <button
                    onClick={() => handleSwitch(false)}
                    className="font-medium hover:underline"
                    style={{ color: primary }}
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
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                className="absolute inset-0 flex flex-col justify-center px-4 py-8 bg-white"
              >
                <h2 className="text-2xl font-bold text-stone-900 mb-2 text-center">
                  Welcome Back
                </h2>
                <p
                  className="text-base mb-5 text-center"
                  style={{ color: textMuted }}
                >
                  Please enter your details to sign in.
                </p>
                <GoogleButton label="Sign in with Google" />
                <p className="text-sm text-gray-400 mb-2">Or with email and password</p>
                <form className="space-y-5" onSubmit={handleLogin}>
                  <input
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Email"
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 font-medium"
                    style={{
                      backgroundColor: '#f7f7f7',
                      borderColor: '#efefef',
                    }}
                  />
                  <div className="relative">
                    <input
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      className="w-full border rounded-lg p-3 pr-10 focus:ring-2 focus:ring-yellow-400 font-medium"
                      style={{
                        backgroundColor: '#f7f7f7',
                        borderColor: '#efefef',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {error && (
                    <p className="text-red-600 text-sm font-medium mt-1">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full font-bold py-3 px-4 rounded-lg"
                    style={{
                      backgroundColor: primary,
                      color: '#191919',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      boxShadow: '0 2px 18px rgba(236,171,19, 0.12)',
                    }}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
                <p
                  className="text-center text-sm mt-6"
                  style={{ color: textMuted }}
                >
                  Don’t have an account?{' '}
                  <button
                    onClick={() => handleSwitch(true)}
                    className="font-medium hover:underline"
                    style={{ color: primary }}
                  >
                    Sign up
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
