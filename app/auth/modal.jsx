'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LoginRegister from './page';

export default function AuthModal({ onClose, onLoginSuccess, verificationOnly = false }) {
  const { data: session, status } = useSession();

  // ✅ Auto-close when logged in successfully (Only if NOT in verification mode)
  useEffect(() => {
    if (!verificationOnly && status === 'authenticated' && session?.user) {
      onClose?.();
    }
  }, [status, session, onClose, verificationOnly]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md mx-auto px-3 sm:px-0">
        <LoginRegister 
          onClose={onClose} 
          onLoginSuccess={onLoginSuccess} 
          verificationOnly={verificationOnly}
        />
      </div>
    </div>
  );
}
