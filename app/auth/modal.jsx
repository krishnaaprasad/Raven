'use client'
import React from "react";
import LoginRegister from "./page";
import './LoginModal.css';

export default function AuthModal({ onClose }) {
    return (
        <div className="login-auth-modal-overlay" onClick={onClose}>
            <div className="login-auth-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="login-auth-modal-close" onClick={onClose} aria-label="Close Modal" type="button">
                    &times;
                </button>
                <LoginRegister />
            </div>
        </div>
    );
}
