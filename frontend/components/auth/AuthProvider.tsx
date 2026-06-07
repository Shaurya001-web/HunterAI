"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { api } from "@/lib/api";
import { Zap, ShieldCheck } from "lucide-react";

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.setToken(token);
  }, [token]);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Local development mock mode
      const savedUser = localStorage.getItem("mock_auth_user");
      const timer = setTimeout(() => {
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          const t = `mock_token:${parsed.id}:${parsed.email}:${parsed.name}`;
          setToken(t);
          api.setToken(t);
        }
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    // Supabase auth subscription
    const getSession = async () => {
      const { data: { session } } = await supabase!.auth.getSession();
      if (session) {
        setToken(session.access_token);
        api.setToken(session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "",
        });
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setToken(session.access_token);
        api.setToken(session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "",
        });
      } else {
        setToken(null);
        api.setToken(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthError("");
    setAuthLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session && data.user) {
          setToken(data.session.access_token);
          api.setToken(data.session.access_token);
          setUser({
            id: data.user.id,
            email: data.user.email ?? "",
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split("@")[0] || "",
          });
        }
      } else {
        // Mock login
        const mockUser = {
          id: `mock_user_${email.replace(/[^a-zA-Z0-9]/g, "")}`,
          email,
          name: email.split("@")[0],
        };
        const t = `mock_token:${mockUser.id}:${mockUser.email}:${mockUser.name}`;
        setUser(mockUser);
        setToken(t);
        api.setToken(t);
        localStorage.setItem("mock_auth_user", JSON.stringify(mockUser));
      }
    } catch (err: unknown) {
      const error = err as Error;
      setAuthError(error.message || "Failed to sign in");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthError("");
    setAuthLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase!.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split("@")[0],
            }
          }
        });
        if (error) throw error;
        if (data.session && data.user) {
          setToken(data.session.access_token);
          api.setToken(data.session.access_token);
          setUser({
            id: data.user.id,
            email: data.user.email ?? "",
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split("@")[0] || "",
          });
        } else {
          setAuthError("Verification email sent! Please check your inbox.");
        }
      } else {
        // Mock sign up
        const mockUser = {
          id: `mock_user_${email.replace(/[^a-zA-Z0-9]/g, "")}`,
          email,
          name: email.split("@")[0],
        };
        const t = `mock_token:${mockUser.id}:${mockUser.email}:${mockUser.name}`;
        setUser(mockUser);
        setToken(t);
        api.setToken(t);
        localStorage.setItem("mock_auth_user", JSON.stringify(mockUser));
      }
    } catch (err: unknown) {
      const error = err as Error;
      setAuthError(error.message || "Failed to sign up");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleMockSandbox = () => {
    const mockUser = {
      id: "mock_user_shaurya",
      email: "mishrashaurya2008@gmail.com",
      name: "Shaurya Mishra",
    };
    const t = `mock_token:${mockUser.id}:${mockUser.email}:${mockUser.name}`;
    setUser(mockUser);
    setToken(t);
    api.setToken(t);
    localStorage.setItem("mock_auth_user", JSON.stringify(mockUser));
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase!.auth.signOut();
      api.setToken(null);
    } else {
      localStorage.removeItem("mock_auth_user");
      setUser(null);
      setToken(null);
      api.setToken(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--background)" }}>
        <div style={{ width: 44, height: 44, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--background)",
        padding: "24px"
      }}>
        {/* Mock mode banner */}
        {!isSupabaseConfigured && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(13,148,136,0.08)",
            border: "1px solid rgba(13,148,136,0.22)",
            borderRadius: "20px",
            padding: "8px 16px",
            fontSize: "12.5px",
            color: "var(--accent-cyan)",
            marginBottom: "32px",
            fontWeight: 500,
            maxWidth: "420px",
            textAlign: "center"
          }}>
            <ShieldCheck size={16} />
            <span>Developer Sandbox Mode active. Enter details to test locally.</span>
          </div>
        )}

        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "400px",
          padding: "40px",
          boxShadow: "var(--shadow-md)"
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "32px" }}>
            <div style={{ width: 28, height: 28, background: "var(--accent)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={14} color="white" />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700 }}>HunterAI</span>
          </div>

          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", color: "var(--text-primary)", textAlign: "center", marginBottom: "8px", fontWeight: 700 }}>
            {isSignUp ? "Create your account" : "Welcome back"}
          </h2>
          <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", textAlign: "center", marginBottom: "28px" }}>
            {isSignUp ? "Get started searching for internships" : "Sign in to check your recommendations"}
          </p>

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid var(--border)",
                  outline: "none",
                  fontSize: "14px",
                  background: "var(--surface)",
                  color: "var(--text-primary)"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid var(--border)",
                  outline: "none",
                  fontSize: "14px",
                  background: "var(--surface)",
                  color: "var(--text-primary)"
                }}
              />
            </div>

            {authError && (
              <p style={{ color: "#ff4d6d", fontSize: "12.5px", textAlign: "center", marginTop: "4px" }}>
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #6c5ce7, #8b5cf6)",
                color: "white",
                border: "none",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                marginTop: "8px",
                transition: "opacity 0.2s"
              }}
            >
              {authLoading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          {/* Toggle login/signup */}
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center", marginTop: "24px" }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setAuthError(""); }}
              style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 600, cursor: "pointer", padding: 0 }}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>

          {/* Guest/Sandbox entry button */}
          {!isSupabaseConfigured && (
            <div style={{ borderTop: "1px solid var(--border)", marginTop: "24px", paddingTop: "20px" }}>
              <button
                onClick={handleMockSandbox}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  background: "var(--surface-2)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Enter Developer Sandbox (Demo User)
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
