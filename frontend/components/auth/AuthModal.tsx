"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import { Zap, X, ShieldCheck, Mail, Lock } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { authError, authLoading, signIn, signUp, enterSandboxMode, setAuthError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      setAuthError("");
      setEmail("");
      setPassword("");
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen, setAuthError]);

  // Click outside dialog handler
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    
    // Check if click was on the backdrop
    if (e.target === dialog) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    if (isSignUp) {
      success = await signUp(email, password);
    } else {
      success = await signIn(email, password);
    }
    if (success) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      onClose={onClose}
      style={{
        border: "none",
        background: "transparent",
        padding: 0,
        outline: "none",
        maxWidth: "400px",
        width: "90%",
      }}
    >
      <div
        style={{
          background: "var(--bg-surface)",
          backdropFilter: "blur(24px)",
          border: "1px solid var(--border-strong)",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
          color: "var(--text-primary)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "var(--bg-hover)",
            border: "1px solid var(--border)",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-secondary)",
            transition: "all 0.2s",
          }}
        >
          <X size={16} />
        </button>

        {/* Sandbox banner if not supabase */}
        {!isSupabaseConfigured && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--accent-soft)",
              border: "1px solid var(--accent-border)",
              borderRadius: "12px",
              padding: "8px 12px",
              fontSize: "12px",
              color: "var(--accent)",
              fontWeight: 500,
            }}
          >
            <ShieldCheck size={14} style={{ flexShrink: 0 }} />
            <span>Developer Sandbox Active</span>
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              background: "var(--accent)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 16px var(--accent-soft)",
            }}
          >
            <Zap size={20} color="white" />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 800, marginBottom: "6px" }}>
            {isSignUp ? "Create an account" : "Welcome back"}
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            {isSignUp ? "Sign up to track and save your matches" : "Sign in to access your saved internships"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base"
                style={{ paddingLeft: "38px" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base"
                style={{ paddingLeft: "38px" }}
              />
            </div>
          </div>

          {authError && (
            <p style={{ color: "var(--rose)", fontSize: "12.5px", textAlign: "center", lineHeight: 1.4 }}>
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="btn-primary"
            style={{
              padding: "12px",
              marginTop: "8px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {authLoading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Toggle */}
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center", marginTop: "4px" }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setAuthError(""); }}
            style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 600, cursor: "pointer", padding: 0 }}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>

        {/* Mock Sandbox Helper */}
        {!isSupabaseConfigured && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
            <button
              onClick={() => {
                enterSandboxMode();
                onClose();
              }}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "12px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <ShieldCheck size={14} />
              Use Developer Sandbox Account
            </button>
          </div>
        )}
      </div>

      <style>{`
        dialog::backdrop {
          background-color: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(8px);
        }
      `}</style>
    </dialog>
  );
}
