'use client'
import React, { useRef } from "react";
import { FaGooglePlusG, FaFacebookF } from "react-icons/fa";
import './LoginModal.css';

function SocialIcons() {
    return (
        <div className="login-social-icons">
            <a href="#" className="icon"><FaGooglePlusG size={22} /></a>
            <a href="#" className="icon"><FaFacebookF size={22} /></a>
        </div>
    );
}

function SignUpForm() {
    return (
        <div className="login-form-container login-sign-up">
            <form>
                <h1>Create Account</h1>
                <SocialIcons />
                <span>or use your email for registration</span>
                <input type="text" placeholder="Name" required />
                <input type="email" placeholder="Email" required />
                <input type="password" placeholder="Password" required />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}

function SignInForm() {
    return (
        <div className="login-form-container login-sign-in">
            <form>
                <h1>Sign In</h1>
                <SocialIcons />
                <span>or use your email password</span>
                <input type="email" placeholder="Email" required />
                <input type="password" placeholder="Password" required />
                <a href="#">Forget Your Password?</a>
                <button type="submit">Sign In</button>
            </form>
        </div>
    );
}

function TogglePanel({ onSignIn, onSignUp }) {
    return (
        <div className="login-toggle-container">
            <div className="login-toggle">
                <div className="login-toggle-panel login-toggle-left">
                    <h1>Welcome Back!</h1>
                    <p>Enter your personal details to use all of site features</p>
                    <button onClick={onSignIn}>Sign In</button>
                </div>
                <div className="login-toggle-panel login-toggle-right">
                    <h1>Hello, Friend!</h1>
                    <p>Register with your personal details to use all of site features</p>
                    <button onClick={onSignUp}>Sign Up</button>
                </div>
            </div>
        </div>
    );
}

export default function LoginRegister() {
    const containerRef = useRef(null);

    const handleSignUp = (e) => {
        e.preventDefault();
        if (containerRef.current) {
            containerRef.current.classList.add('active');
        }
    };

    const handleSignIn = (e) => {
        e.preventDefault();
        if (containerRef.current) {
            containerRef.current.classList.remove('active');
        }
    };

    return (
        <div className="login-container" ref={containerRef}>
            <SignUpForm />
            <SignInForm />
            <TogglePanel onSignIn={handleSignIn} onSignUp={handleSignUp} />
        </div>
    );
}
