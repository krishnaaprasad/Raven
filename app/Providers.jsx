'use client'

import { SessionProvider } from 'next-auth/react'
import { CartProvider } from './context/cartcontext'
import { Toaster } from 'react-hot-toast'

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fcfbf8',
            color: '#1b180d',
            fontFamily: 'Manrope, sans-serif',
            border: '1px solid #e7e1cf',
            borderLeft: '4px solid #eebd2b',
            borderRadius: '10px',
            padding: '10px 14px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#9a864c',
              secondary: '#fcfbf8',
            },
          },
          error: {
            iconTheme: {
              primary: '#b84a3a',
              secondary: '#fcfbf8',
            },
          },
          duration: 3000,
        }}
/>
      </CartProvider>
    </SessionProvider>
  )
}
