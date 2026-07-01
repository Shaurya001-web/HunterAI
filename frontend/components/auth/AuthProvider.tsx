"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { api } from "@/lib/api";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  authError: string;
  authLoading: boolean;
  setAuthError: (err: string) => void;
  signIn: (email: string, pass: string) => Promise<boolean>;
  signUp: (email: string, pass: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  enterSandboxMode: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  authError: "",
  authLoading: false,
  setAuthError: () => {},
  signIn: async () => false,
  signUp: async () => false,
  signOut: async () => {},
  enterSandboxMode: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    api.setToken(token);
  }, [token]);

  // Load guest user or saved auth user on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // Check if real user is saved
      const savedUser = localStorage.getItem("mock_auth_user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          const t = `mock_token:${parsed.id}:${parsed.email}:${parsed.name}`;
          setToken(t);
          api.setToken(t);
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem("mock_auth_user");
        }
      }

      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase!.auth.getSession();
        if (session) {
          const t = session.access_token;
          setToken(t);
          api.setToken(t);
          const parsedUser = {
            id: session.user.id,
            email: session.user.email ?? "",
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "",
            isGuest: false
          };
          setUser(parsedUser);
          setLoading(false);
          return;
        }
      }

      // Default: load or generate Guest session
      let guestId = localStorage.getItem("guest_user_id");
      if (!guestId) {
        guestId = "guest_" + Math.random().toString(36).substring(2, 11);
        localStorage.setItem("guest_user_id", guestId);
      }
      const guestUser = {
        id: guestId,
        email: `${guestId}@hunterai.local`,
        name: "Guest User",
        isGuest: true
      };
      const guestToken = `mock_token:${guestUser.id}:${guestUser.email}:${guestUser.name}`;
      setUser(guestUser);
      setToken(guestToken);
      api.setToken(guestToken);
      setLoading(false);
    };

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          const t = session.access_token;
          setToken(t);
          api.setToken(t);
          const parsedUser = {
            id: session.user.id,
            email: session.user.email ?? "",
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "",
            isGuest: false
          };
          setUser(parsedUser);
          
          // Migrate guest profile if exists
          const guestId = localStorage.getItem("guest_user_id");
          if (guestId && guestId !== parsedUser.id) {
            try {
              await api.migrateProfile(guestId);
              localStorage.removeItem("guest_user_id");
            } catch (err) {
              console.error("Migration error:", err);
            }
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const signIn = async (email: string, pass: string): Promise<boolean> => {
    if (!email || !pass) return false;
    setAuthError("");
    setAuthLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase!.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        if (data.session && data.user) {
          const t = data.session.access_token;
          setToken(t);
          api.setToken(t);
          const newUser = {
            id: data.user.id,
            email: data.user.email ?? "",
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split("@")[0] || "",
            isGuest: false
          };
          setUser(newUser);
          
          // Migrate profile
          const guestId = localStorage.getItem("guest_user_id");
          if (guestId && guestId !== newUser.id) {
            try { await api.migrateProfile(guestId); localStorage.removeItem("guest_user_id"); } catch {}
          }
          return true;
        }
      } else {
        // Mock login
        const newUser = {
          id: `mock_user_${email.replace(/[^a-zA-Z0-9]/g, "")}`,
          email,
          name: email.split("@")[0],
          isGuest: false
        };
        const t = `mock_token:${newUser.id}:${newUser.email}:${newUser.name}`;
        setUser(newUser);
        setToken(t);
        api.setToken(t);
        localStorage.setItem("mock_auth_user", JSON.stringify(newUser));

        // Migrate profile
        const guestId = localStorage.getItem("guest_user_id");
        if (guestId && guestId !== newUser.id) {
          try { await api.migrateProfile(guestId); localStorage.removeItem("guest_user_id"); } catch {}
        }
        return true;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to sign in";
      setAuthError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
    return false;
  };

  const signUp = async (email: string, pass: string): Promise<boolean> => {
    if (!email || !pass) return false;
    setAuthError("");
    setAuthLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase!.auth.signUp({
          email,
          password: pass,
          options: {
            data: {
              name: email.split("@")[0],
            }
          }
        });
        if (error) throw error;
        if (data.session && data.user) {
          const t = data.session.access_token;
          setToken(t);
          api.setToken(t);
          const newUser = {
            id: data.user.id,
            email: data.user.email ?? "",
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split("@")[0] || "",
            isGuest: false
          };
          setUser(newUser);

          const guestId = localStorage.getItem("guest_user_id");
          if (guestId && guestId !== newUser.id) {
            try { await api.migrateProfile(guestId); localStorage.removeItem("guest_user_id"); } catch {}
          }
          return true;
        } else {
          setAuthError("Verification email sent! Please check your inbox.");
          return false;
        }
      } else {
        // Mock sign up
        const newUser = {
          id: `mock_user_${email.replace(/[^a-zA-Z0-9]/g, "")}`,
          email,
          name: email.split("@")[0],
          isGuest: false
        };
        const t = `mock_token:${newUser.id}:${newUser.email}:${newUser.name}`;
        setUser(newUser);
        setToken(t);
        api.setToken(t);
        localStorage.setItem("mock_auth_user", JSON.stringify(newUser));

        const guestId = localStorage.getItem("guest_user_id");
        if (guestId && guestId !== newUser.id) {
          try { await api.migrateProfile(guestId); localStorage.removeItem("guest_user_id"); } catch {}
        }
        return true;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to sign up";
      setAuthError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
    return false;
  };

  const enterSandboxMode = () => {
    const sandboxUser = {
      id: "mock_user_demo",
      email: "demo@hunterai.local",
      name: "Demo User",
      isGuest: false
    };
    const t = `mock_token:${sandboxUser.id}:${sandboxUser.email}:${sandboxUser.name}`;
    setUser(sandboxUser);
    setToken(t);
    api.setToken(t);
    localStorage.setItem("mock_auth_user", JSON.stringify(sandboxUser));

    const guestId = localStorage.getItem("guest_user_id");
    if (guestId && guestId !== sandboxUser.id) {
      api.migrateProfile(guestId).then(() => {
        localStorage.removeItem("guest_user_id");
      }).catch(() => {});
    }
  };

  const signOut = async () => {
    setLoading(true);
    if (isSupabaseConfigured) {
      await supabase!.auth.signOut();
    }
    localStorage.removeItem("mock_auth_user");
    
    // Clear token & regenerate guest session
    setUser(null);
    setToken(null);
    api.setToken(null);
    
    const guestId = "guest_" + Math.random().toString(36).substring(2, 11);
    localStorage.setItem("guest_user_id", guestId);
    
    const guestUser = {
      id: guestId,
      email: `${guestId}@hunterai.local`,
      name: "Guest User",
      isGuest: true
    };
    const guestToken = `mock_token:${guestUser.id}:${guestUser.email}:${guestUser.name}`;
    setUser(guestUser);
    setToken(guestToken);
    api.setToken(guestToken);
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg-base)" }}>
        <div style={{ width: 44, height: 44, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, authError, authLoading, setAuthError, signIn, signUp, signOut, enterSandboxMode }}>
      {children}
    </AuthContext.Provider>
  );
}
