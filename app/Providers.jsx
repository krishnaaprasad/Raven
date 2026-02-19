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
              background: 'var(--theme-bg)',
              color: 'var(--theme-text)',
              fontFamily: 'system-ui, sans-serif',
              border: '1px solid var(--theme-border)',
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
              fontSize: '14px',
              letterSpacing: '0.02em',
            },
            success: {
              style: {
                borderLeft: '4px solid var(--theme-text)',
              },
              iconTheme: {
                primary: 'var(--theme-text)',
                secondary: 'var(--theme-bg)',
              },
            },
            error: {
              style: {
                borderLeft: '4px solid #b84a3a',
              },
              iconTheme: {
                primary: '#b84a3a',
                secondary: 'var(--theme-bg)',
              },
            },
            duration: 3000,
          }}
        />

      </CartProvider>
    </SessionProvider>
  )
}
