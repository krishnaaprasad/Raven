'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LoginRegister from './page';

export default function AuthModal({ onClose }) {
  const { data: session, status } = useSession();

  // ✅ Auto close modal when user logs in
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      onClose?.(); // Close modal
      // ✅ Refresh checkout page so prefill happens instantly
      window.location.reload();
    }
  }, [status, session, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      style={{ background: 'rgba(0,0,0,0.2)' }}
    >
      <div className="bg-transparent relative pointer-events-auto w-full max-w-md">
        <LoginRegister onClose={onClose} />
      </div>
    </div>
  );
}
