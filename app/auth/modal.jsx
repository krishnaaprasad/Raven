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
        zIndex: 9999,
        background: "rgba(50, 39, 10, 0.16)", // luxury overlay
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
        {/* Close button inside */}
        <button
          className="login-auth-modal-close"
          onClick={onClose}
          aria-label="Close Modal"
          type="button"
          style={{
            position: "absolute",
            top: "4.7rem",
            right: "3rem",
            fontSize: "1.75rem",
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
              <LoginRegister />
            </div>
          </div>
  );
}
