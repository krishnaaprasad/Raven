'use client'
import React from "react";
// Import the actual component, not a Next.js page file
import LoginRegister from "./page"; // make sure LoginRegister.jsx exists in the same folder
export default function AuthModal({ onClose = () => {} }) {
  return (
    <div
      className="login-auth-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(50, 39, 10, 0.16)", // luxury overlay
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(1px)"
      }}
      onClick={e => {
        // Only close if clicking directly on the overlay, not on children
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
  className="login-auth-modal-content"
  onClick={e => e.stopPropagation()}
  style={{
    // Transparent background - only handles overlay, not shape!
    background: "none",
    borderRadius: "26px",
    boxShadow: "none",
    maxWidth: 900,
    width: "100%",
    margin: "0 auto",
    padding: 0,
    position: "relative", // Needed, but real positioning is on the card!
    display: "flex",
    flexDirection: "column",
    overflow: "visible"
  }}
>
        {/* Responsive Close Button */}
        <button
          className="login-auth-modal-close"
          onClick={onClose}
          aria-label="Close Modal"
          type="button"
          style={{
            position: "absolute",
            top: "1.1rem",
            right: "1.1rem",
            fontSize: "1.5rem",
            color: "#b28c34",
            background: "#fff8e7",
            border: "none",
            borderRadius: "50%",
            width: "2.1rem",
            height: "2.1rem",
            boxShadow: "0 2px 8px rgba(178,140,52,0.22)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.22s",
            zIndex: 100,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#f5e9ca")}
          onMouseLeave={e => (e.currentTarget.style.background = "#fff8e7")}
        >
          &times;
        </button>
        <style jsx global>{`
          @media (max-width:600px){
            .login-auth-modal-close {
              top: 0.7rem !important;
              right: 0.7rem !important;
              font-size: 1.15rem !important;
              width: 1.7rem !important;
              height: 1.7rem !important;
            }
          }
        `}</style>
        <LoginRegister />
      </div>
    </div>
  );
}
