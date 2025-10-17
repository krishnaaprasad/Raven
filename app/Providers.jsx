'use client'

import { SessionProvider } from 'next-auth/react'
import { CartProvider } from './context/cartcontext'
import { Toaster } from 'react-hot-toast'

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <Toaster position="top-right" reverseOrder={false} />
      </CartProvider>
    </SessionProvider>
  )
}
