'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const primary = '#ecab13'
const textMuted = '#8d8d8d'

export default function LoginRegisterPage() {
  const [isRegistering, setIsRegistering] = useState(false)
  const [direction, setDirection] = useState('right')

  const handleSwitch = (registering) => {
    setDirection(registering ? 'left' : 'right')
    setIsRegistering(registering)
  }

  const slideVariants = {
    initial: (dir) => ({
      x: dir === 'left' ? '100%' : '-100%',
      opacity: 0,
    }),
    animate: { x: 0, opacity: 1 },
    exit: (dir) => ({
      x: dir === 'left' ? '-100%' : '100%',
      opacity: 0,
    }),
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-transparent"
      style={{ fontFamily: 'Manrope, sans-serif' }}
    >
      <div
        className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative"
        style={{
          borderRadius: '28px',
          boxShadow: '0 8px 40px rgba(0,0,0,.08)',
        }}
      >
        {/* ===== Left Side: Forms ===== */}
        <div
          className="relative w-full md:w-1/2 flex items-center justify-center"
          style={{ minHeight: '530px', overflow: 'hidden' }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            {isRegistering ? (
              // ===== REGISTER FORM =====
              <motion.div
                key="register"
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0 flex flex-col justify-center px-10 py-12 bg-white"
              >
                <h2 className="text-3xl font-bold text-stone-900 mb-2">
                  Create Account
                </h2>
                <p className="text-base mb-8" style={{ color: textMuted }}>
                  Let’s get you started.
                </p>

                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="register-name"
                    >
                      Full Name
                    </label>
                    <input
                      id="register-name"
                      type="text"
                      className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
                      style={{
                        backgroundColor: '#f7f7f7',
                        borderColor: '#efefef',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="register-email"
                    >
                      Email
                    </label>
                    <input
                      id="register-email"
                      type="email"
                      className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
                      style={{
                        backgroundColor: '#f7f7f7',
                        borderColor: '#efefef',
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="register-password"
                      >
                        Password
                      </label>
                      <input
                        id="register-password"
                        type="password"
                        className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
                        style={{
                          backgroundColor: '#f7f7f7',
                          borderColor: '#efefef',
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="confirm-password"
                      >
                        Confirm
                      </label>
                      <input
                        id="confirm-password"
                        type="password"
                        className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
                        style={{
                          backgroundColor: '#f7f7f7',
                          borderColor: '#efefef',
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full font-bold py-3 px-4 rounded-lg mt-1"
                    style={{
                      backgroundColor: primary,
                      color: '#191919',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      boxShadow: '0 2px 18px rgba(236,171,19, 0.12)',
                    }}
                  >
                    Register
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
              // ===== LOGIN FORM =====
              <motion.div
                key="login"
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0 flex flex-col justify-center px-10 py-12 bg-white"
              >
                <h2 className="text-3xl font-bold text-stone-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-base mb-8" style={{ color: textMuted }}>
                  Please enter your details to sign in.
                </p>

                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="login-email"
                    >
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
                      style={{
                        backgroundColor: '#f7f7f7',
                        borderColor: '#efefef',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="login-password"
                    >
                      Password
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
                      style={{
                        backgroundColor: '#f7f7f7',
                        borderColor: '#efefef',
                      }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <a
                      href="#"
                      className="text-sm hover:underline"
                      style={{ color: primary }}
                    >
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="w-full font-bold py-3 px-4 rounded-lg"
                    style={{
                      backgroundColor: primary,
                      color: '#191919',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      boxShadow: '0 2px 18px rgba(236,171,19, 0.12)',
                    }}
                  >
                    Sign In
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

        {/* ===== Right Side: Illustration ===== */}
        <div
        className="hidden md:flex md:w-1/2 items-center justify-center relative overflow-hidden"
        style={{
            backgroundColor: '#d6b89f', // soft elegant tan
            borderTopRightRadius: '28px',
            borderBottomRightRadius: '28px',
        }}
        >
        {/* Illustration Background */}
        <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6Ow4IRvq4OiRafWKRRFYaefMFiX9E41gJmXbQU-tr6KkRAkadAWDzKjqTFVVr1uIsw84qy-AG1pjo5SkhIGL7LzqKflG3NZsaY2n0As_uoB9_2TQijhoPRLzD68BjOlGma0eajNJMXx5YivP9Hsh9XyYBp0RsRg9EhqIuzTb6w-M1Rv7SZYnBogd24jSj1xnjYCX2qVCe6xIwzBE4w_UtHWRVEUBY8vznalfNPjuUdC-6k6TmmxYBlHzY77IJfP2vsEmya5nFm5k"
            alt="Aroma illustration"
            className="w-full h-full object-cover rounded-r-2xl"
            style={{
            filter: 'brightness(95%) contrast(102%)',
            }}
        />

        {/* Overlay for slight dim effect */}
        <div
            className="absolute inset-0 bg-black/30 rounded-r-2xl"
            style={{
            backdropFilter: 'blur(0.5px)',
            }}
        ></div>

        {/* Centered Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1
            className="text-white text-4xl font-extrabold drop-shadow-lg mb-2"
            style={{
                fontFamily: 'Manrope, sans-serif',
            }}
            >
            REBEL
            </h1>
            <p
            className="text-white/90 text-lg font-medium drop-shadow"
            style={{
                fontFamily: 'Manrope, sans-serif',
            }}
            >
            Experience the essence of luxury.
            </p>
        </div>
        </div>
      </div>
    </div>
  )
}
