// AuthModal.jsx
'use client';
import LoginRegister from "./page";

export default function AuthModal({ onClose }) {
  return (
    // Center the login/register component with transparent background
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none backdrop-blur-xs"
      style={{ background: 'transparent' }}
    >
      <div 
        className="bg-transparent relative pointer-events-auto w-full max-w-md"
      >
        <LoginRegister onClose={onClose} />
      </div>
    </div>
  );
}
