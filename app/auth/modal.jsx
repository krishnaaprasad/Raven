'use client'
import React from "react";
import LoginRegister from "./page"; // path to your login/register page

export default function AuthModal({ onClose }) {
  return (
      <div
        className="login-auth-modal-overlay"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        onTouchStart={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(50, 39, 10, 0.16)", // luxury overlay
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          backdropFilter: "blur(1px)",
          WebkitBackdropFilter: "blur(1px)", // Safari support
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
        <button
        className="login-auth-modal-close"
        onClick={onClose}
        aria-label="Close Modal"
        type="button"
        style={{
          position: "absolute",
          top: "2.5rem",         // default for desktop
          right: "2.5rem",       // default for desktop
          fontSize: "1.5rem",
          color: "#B28C34",
          background: "#FFF8E7",
          border: "none",
          borderRadius: "50%",
          width: "2.25rem",
          height: "2.25rem",
          boxShadow: "0 2px 8px rgba(178,140,52,0.25)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease-in-out",
          zIndex: 100,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f5e9ca";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#FFF8E7";
        }}
      >
        &times;
      </button>
      <style jsx global>{`
        @media (max-width: 600px) {
          .login-auth-modal-close {
            top: 7.5rem !important;
            right: 1.6rem !important;
            width: 1.9rem !important;
            height: 1.9rem !important;
            font-size: 1.8rem !important;
          }
        }
      `}</style>

      <LoginRegister />
      </div>
    </div>
  );
}
