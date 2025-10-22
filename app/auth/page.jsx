// app/login/page.jsx
'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';

const primary = '#ecab13';
const textMuted = '#8d8d8d';

export default function LoginRegisterPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [direction, setDirection] = useState('right');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });
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
      const result = await signIn('credentials', { redirect: false, email, password });
      if (result?.error) {
        setError(result.error);
      } else {
        // success
        window.location.href = '/my-account';
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    initial: (dir) => ({ x: dir === 'left' ? '100%' : '-100%', opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir === 'left' ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-transparent" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative" style={{ borderRadius: '28px', boxShadow: '0 8px 40px rgba(0,0,0,.08)' }}>
        {/* Left form */}
        <div className="relative w-full md:w-1/2 flex items-center justify-center" style={{ minHeight: '530px', overflow: 'hidden' }}>
          <AnimatePresence mode="wait" custom={direction}>
            {isRegistering ? (
              <motion.div key="register" custom={direction} variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.28, ease: 'easeInOut' }} className="absolute inset-0 flex flex-col justify-center px-10 py-12 bg-white">
                <h2 className="text-3xl font-bold text-stone-900 mb-2">Create Account</h2>
                <p className="text-base mb-6" style={{ color: textMuted }}>Let’s get you started.</p>

                <form className="space-y-5" onSubmit={handleRegister}>
                  <input id="name" value={formData.name} onChange={handleChange} type="text" placeholder="Full Name" className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 font-medium" style={{ backgroundColor: '#f7f7f7', borderColor: '#efefef' }} />
                  <input id="email" value={formData.email} onChange={handleChange} type="email" placeholder="Email" className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 font-medium" style={{ backgroundColor: '#f7f7f7', borderColor: '#efefef' }} />
                  <div className="grid grid-cols-2 gap-3">
                    <input id="password" value={formData.password} onChange={handleChange} type="password" placeholder="Password" className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 font-medium" style={{ backgroundColor: '#f7f7f7', borderColor: '#efefef' }} />
                    <input id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" placeholder="Confirm" className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 font-medium" style={{ backgroundColor: '#f7f7f7', borderColor: '#efefef' }} />
                  </div>

                  {error && <p className="text-red-600 text-sm font-medium mt-1">{error}</p>}

                  <button type="submit" disabled={loading} className="w-full font-bold py-3 px-4 rounded-lg mt-2" style={{ backgroundColor: primary, color: '#191919', fontWeight: 700, fontSize: '1.1rem', boxShadow: '0 2px 18px rgba(236,171,19, 0.12)' }}>
                    {loading ? 'Processing...' : 'Register'}
                  </button>
                </form>

                <p className="text-center text-sm mt-5" style={{ color: textMuted }}>
                  Already have an account?{' '}
                  <button onClick={() => handleSwitch(false)} className="font-medium hover:underline" style={{ color: primary }}>Sign in</button>
                </p>
              </motion.div>
            ) : (
              <motion.div key="login" custom={direction} variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.28, ease: 'easeInOut' }} className="absolute inset-0 flex flex-col justify-center px-10 py-12 bg-white">
                <h2 className="text-3xl font-bold text-stone-900 mb-2">Welcome Back</h2>
                <p className="text-base mb-8" style={{ color: textMuted }}>Please enter your details to sign in.</p>

                <form className="space-y-5" onSubmit={handleLogin}>
                  <input id="email" value={formData.email} onChange={handleChange} type="email" placeholder="Email" className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 font-medium" style={{ backgroundColor: '#f7f7f7', borderColor: '#efefef' }} />
                  <div className="relative">
                    <input id="password" value={formData.password} onChange={handleChange} type={showPassword ? 'text' : 'password'} placeholder="Password" className="w-full border rounded-lg p-3 pr-10 focus:ring-2 focus:ring-yellow-400 font-medium" style={{ backgroundColor: '#f7f7f7', borderColor: '#efefef' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>

                  {error && <p className="text-red-600 text-sm font-medium mt-1">{error}</p>}

                  <button type="submit" disabled={loading} className="w-full font-bold py-3 px-4 rounded-lg" style={{ backgroundColor: primary, color: '#191919', fontWeight: 700, fontSize: '1.1rem', boxShadow: '0 2px 18px rgba(236,171,19, 0.12)' }}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                <p className="text-center text-sm mt-6" style={{ color: textMuted }}>
                  Don’t have an account?{' '}
                  <button onClick={() => handleSwitch(true)} className="font-medium hover:underline" style={{ color: primary }}>Sign up</button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right illustration (keep as-is) */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#d6b89f', borderTopRightRadius: '28px', borderBottomRightRadius: '28px' }}>
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6Ow4IRvq4OiRafWKRRFYaefMFiX9E41gJmXbQU-tr6KkRAkadAWDzKjqTFVVr1uIsw84qy-AG1pjo5SkhIGL7LzqKflG3NZsaY2n0As_uoB9_2TQijhoPRLzD68BjOlGma0eajNJMXx5YivP9Hsh9XyYBp0RsRg9EhqIuzTb6w-M1Rv7SZYnBogd24jSj1xnjYCX2qVCe6xIwzBE4w_UtHWRVEUBY8vznalfNPjuUdC-6k6TmmxYBlHzY77IJfP2vsEmya5nFm5k" alt="Aroma illustration" className="w-full h-full object-cover rounded-r-2xl" style={{ filter: 'brightness(95%) contrast(102%)' }} />
          <div className="absolute inset-0 bg-black/30 rounded-r-2xl" style={{ backdropFilter: 'blur(0.5px)' }}></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-white text-4xl font-extrabold drop-shadow-lg mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>REBEL</h1>
            <p className="text-white/90 text-lg font-medium drop-shadow" style={{ fontFamily: 'Manrope, sans-serif' }}>Experience the essence of luxury.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
