'use client'
import React from "react";
import LoginRegister from "./page"; // path to your login/register page

export default function AuthModal({ onClose }) {
  return (
    <div
      className="login-auth-modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(1px)"
      }}
    >
      <div
        className="login-auth-modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          background: "transparent", // <--- REMOVE the white!
          borderRadius: "26px",
          boxShadow: "none", // <--- REMOVE any shadow if user design already has it
          maxWidth: 850,
          width: "100%",
          margin: "0 auto",
          padding: 0,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "visible"
        }}
      >
        {/* Close Button (safe-positioned inside modal box) */}
      <div
        className="absolute top-0 right-0 p-3"
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          width: '100%',
          pointerEvents: 'none', // ensures only button captures clicks
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close Modal"
          type="button"
          style={{
            position: 'relative',
            top: 'env(safe-area-inset-top, 0)', // ✅ safe for iOS notch
            marginTop: '0.25rem',
            marginRight: '0.25rem',
            fontSize: '1.75rem',
            color: '#B28C34',
            background: '#FFF8E7',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            boxShadow: '0 2px 10px rgba(178,140,52,0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.25s ease',
            pointerEvents: 'auto', // re-enable click for button itself
            zIndex: 100,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f6eacb')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#FFF8E7')}
        >
          &times;
        </button>
      </div>
      <LoginRegister />
      </div>
    </div>
  );
}
