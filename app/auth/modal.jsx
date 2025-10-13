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
        backdropFilter: "blur(2px)"
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
            top: 18,
            right: 24,
            fontSize: "2rem",
            color: "#b28c34",
            background: "#fff8e7",
            border: "none",
            borderRadius: "50%",
            width: 33,
            height: 33,
            boxShadow: "0 2px 8px #b28c3444",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s"
          }}
        >
          &times;
        </button>
        <LoginRegister />
      </div>
    </div>
  );
}
