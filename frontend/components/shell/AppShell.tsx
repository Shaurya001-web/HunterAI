"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, Sparkles, Zap, Upload, LogOut, ChevronUp, Bookmark, Bot } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";

const NAV = [
  { href: "/dashboard", label: "Dashboard",       icon: LayoutDashboard },
  { href: "/upload",    label: "Upload",          icon: Upload },
  { href: "/profile",   label: "Profile",          icon: User },
  { href: "/recommendations", label: "Matches", icon: Sparkles },
  { href: "/bookmarks", label: "Saved",           icon: Bookmark },
  { href: "/chat",      label: "AI Chat",         icon: Bot },
];

export function AppShell({ children, title }: { children: React.ReactNode; title: string }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "??";

  return (
    <div className="app-shell">
      {/* Floating Pill Sidebar */}
      <aside className="sidebar">
        <Link href="/" className="sidebar-logo" style={{ textDecoration: "none" }}>
          <div className="sidebar-logo-mark">
            <Sparkles size={20} color="white" />
          </div>
        </Link>

        <nav className="sidebar-nav">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={`nav-item ${active ? "active" : ""}`}>
                <Icon size={18} style={{ opacity: active ? 1 : 0.65 }} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          {/* Empty bottom space */}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Topbar */}
        <div className="topbar-wrapper">
          <header className={`topbar ${scrolled ? "scrolled" : ""}`}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link href="/" style={{ textDecoration: "none" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: "-0.01em", color: "var(--text-primary)" }}>
                  Hunter<em style={{ fontStyle: "italic", color: "var(--accent)" }}>AI</em>
                </div>
              </Link>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {user && !user.isGuest ? (
                <div style={{ position: "relative" }}>
                  {menuOpen && (
                    <div style={{
                      position: "absolute",
                      top: "120%",
                      right: 0,
                      width: "200px",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "16px",
                      padding: "16px",
                      boxShadow: "0 12px 32px rgba(0,0,0,0.06)",
                      zIndex: 60,
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            {user.name}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => signOut()}
                        style={{
                          padding: "8px", borderRadius: "8px", background: "var(--bg-elevated)", color: "var(--rose)",
                          border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer", width: "100%"
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                  
                  <div
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                      width: 44, height: 44, borderRadius: "22px",
                      background: "var(--accent-light)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, color: "var(--accent)",
                      fontFamily: "var(--font-display)",
                      cursor: "pointer", userSelect: "none",
                      border: menuOpen ? "1px solid var(--accent)" : "1px solid transparent",
                      transition: "border 0.2s"
                    }}
                  >
                    {initials}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 20px", borderRadius: "24px",
                    background: "var(--bg-elevated)", border: "1px solid var(--border)",
                    color: "var(--text-primary)", fontSize: 13, fontWeight: 600,
                    cursor: "pointer", fontFamily: "var(--font-body)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                  }}
                >
                  <LogOut size={14} style={{ transform: "rotate(180deg)" }} /> Sign In
                </button>
              )}
              <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            </div>
          </header>
        </div>

        {/* Scrollable Page Content */}
        <main className="page-content">
          <div style={{ maxWidth: "1000px", width: "100%", margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
