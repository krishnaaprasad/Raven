'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LoginRegister from './page';

export default function AuthModal({ onClose }) {
  const { data: session, status } = useSession();

  // ✅ Auto-close when logged in successfully
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      onClose?.();
      window.location.reload(); // refresh to update session UI
    }
  }, [status, session, onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md mx-auto px-3 sm:px-0">
        <LoginRegister onClose={onClose} />
      </div>
    </div>
  );
}
