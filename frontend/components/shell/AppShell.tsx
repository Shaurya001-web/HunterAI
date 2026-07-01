"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, Sparkles, Zap, Upload, LogOut, ChevronUp } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";

const NAV = [
  { href: "/dashboard", label: "Dashboard",       icon: LayoutDashboard },
  { href: "/upload",    label: "Upload Resume",   icon: Upload },
  { href: "/profile",   label: "Profile",          icon: User },
  { href: "/recommendations", label: "Recommendations", icon: Sparkles },
];

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("hunter-theme") as "light" | "dark" | null;
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initial = stored ?? system;
    // Set theme in the next frame to avoid synchronous state update warning during effect lifecycle
    const timer = setTimeout(() => {
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggle = (t: "light" | "dark") => {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("hunter-theme", t);
  };

  return { theme, toggle };
}

export function AppShell({ children, title }: { children: React.ReactNode; title: string }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "??";

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <Link href="/" className="sidebar-logo" style={{ textDecoration: "none" }}>
          <div className="sidebar-logo-mark">
            <Zap size={13} color="white" />
          </div>
          <span className="sidebar-logo-text">HunterAI</span>
        </Link>

        <nav className="sidebar-nav">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={`nav-item ${active ? "active" : ""}`}>
                <Icon size={15} style={{ opacity: active ? 1 : 0.65, flexShrink: 0 }} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom" style={{ position: "relative" }}>
          {/* Theme toggle */}
          <div className="theme-toggle" style={{ alignSelf: "flex-start", marginBottom: 8 }}>
            <button
              className={`theme-btn ${theme === "light" ? "active" : ""}`}
              onClick={() => toggle("light")}
            >☀ Light</button>
            <button
              className={`theme-btn ${theme === "dark" ? "active" : ""}`}
              onClick={() => toggle("dark")}
            >🌙 Dark</button>
          </div>

          {/* User profile dropdown container */}
          {user ? (
            <div style={{ position: "relative" }}>
              {/* Dropup menu */}
              {menuOpen && (
                <div style={{
                  position: "absolute",
                  bottom: "100%",
                  left: 0,
                  right: 0,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "8px",
                  boxShadow: "var(--shadow-lift)",
                  zIndex: 60,
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--accent), #8b5cf6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, color: "white"
                    }}>
                      {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  {user.isGuest ? (
                    <button
                      onClick={() => { setMenuOpen(false); setIsAuthModalOpen(true); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        width: "100%",
                        padding: "8px",
                        borderRadius: "6px",
                        background: "linear-gradient(135deg, #6c5ce7, #8b5cf6)",
                        color: "white",
                        border: "none",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                        boxShadow: "0 2px 6px rgba(108, 92, 231, 0.2)",
                      }}
                    >
                      <Zap size={13} /> Sign In to Save
                    </button>
                  ) : (
                    <button
                      onClick={() => signOut()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        width: "100%",
                        padding: "8px",
                        borderRadius: "6px",
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        color: "#ff4d6d",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                        transition: "opacity 0.2s"
                      }}
                    >
                      <LogOut size={13} /> Sign Out
                    </button>
                  )}
                  <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
                </div>
              )}

              {/* Interactive trigger */}
              <div
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  background: menuOpen ? "var(--surface-2)" : "transparent",
                  cursor: "pointer",
                  userSelect: "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "var(--accent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: "white",
                    fontFamily: "var(--font-display)",
                    flexShrink: 0,
                  }}>{initials}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", fontFamily: "var(--font-body)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-body)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {user.email}
                    </div>
                  </div>
                </div>
                <ChevronUp size={13} color="var(--text-muted)" style={{ transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", marginLeft: 4 }} />
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      {/* Topbar */}
      <header className="topbar">
        <span className="topbar-title">{title}</span>
        <Link href="/upload" style={{
          display: "flex", alignItems: "center", gap: 6,
          textDecoration: "none", fontSize: 13, fontWeight: 500,
          color: "var(--text-secondary)", fontFamily: "var(--font-body)",
          padding: "6px 14px", borderRadius: 8,
          border: "0.5px solid var(--border)",
          background: "var(--surface)",
          transition: "all 0.15s",
        }}>
          <Upload size={13} /> Upload Resume
        </Link>
      </header>

      {/* Content */}
      <main className="page-content" style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: "900px", width: "100%" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
