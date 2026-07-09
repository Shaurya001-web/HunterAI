"use client";

import React, { useEffect, useRef } from "react";
import { useAuth } from "./AuthProvider";
import { Zap, X, ShieldCheck, Chrome } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { authError, authLoading, enterSandboxMode, setAuthError } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      setTimeout(() => {
        setAuthError("");
      }, 0);
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
    
    if (e.target === dialog) {
      onClose();
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
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
            Welcome to HunterAI
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Sign in to track your matches and automate applications
          </p>
        </div>

        {authError && (
          <p style={{ color: "var(--rose)", fontSize: "12.5px", textAlign: "center", lineHeight: 1.4 }}>
            {authError}
          </p>
        )}

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={authLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 shadow-sm"
        >
          <Chrome className="h-5 w-5 text-indigo-600" />
          Continue with Google
        </button>

        {/* Mock Sandbox Helper */}
        {!isSupabaseConfigured && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "16px" }}>
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
