"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, Sparkles, Upload, LogOut, Bookmark, Bot } from "lucide-react";
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut, updateProfile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.name) {
      setNameInput(user.name);
    }
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen]);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSaveStatus("saving");
    const success = await updateProfile(nameInput.trim());
    if (success) {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    } else {
      setSaveStatus("idle");
    }
  };

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
                <div style={{ position: "relative" }} ref={dropdownRef}>
                  {menuOpen && (
                    <div style={{
                      position: "absolute",
                      top: "125%",
                      right: 0,
                      width: "250px",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-strong)",
                      borderRadius: "16px",
                      padding: "16px",
                      boxShadow: "0 16px 36px rgba(12, 22, 24, 0.12)",
                      zIndex: 60,
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px"
                    }}>
                      {/* Name Editing Section */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</span>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            style={{
                              flex: 1,
                              height: "32px",
                              borderRadius: "8px",
                              border: "1px solid var(--border)",
                              background: "var(--bg-base)",
                              color: "var(--text-primary)",
                              padding: "0 8px",
                              fontSize: "12.5px",
                              outline: "none"
                            }}
                          />
                          <button
                            onClick={handleSaveName}
                            disabled={saveStatus === "saving"}
                            style={{
                              padding: "0 10px",
                              borderRadius: "8px",
                              background: "var(--text-primary)",
                              color: "var(--bg-surface)",
                              border: "none",
                              fontSize: "11px",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "opacity 0.2s"
                            }}
                          >
                            {saveStatus === "saving" ? "..." : saveStatus === "saved" ? "✓" : "Save"}
                          </button>
                        </div>
                      </div>

                      {/* User ID Section */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>User ID</span>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "var(--bg-elevated)",
                          borderRadius: "8px",
                          padding: "6px 8px",
                          border: "1px solid var(--border)"
                        }}>
                          <span style={{
                            fontSize: "11.5px",
                            fontFamily: "monospace",
                            color: "var(--text-secondary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "160px"
                          }}>
                            {user.id}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(user.id);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "10px",
                              color: copied ? "var(--accent)" : "var(--text-muted)",
                              padding: 0
                            }}
                          >
                            {copied ? "copied" : "copy"}
                          </button>
                        </div>
                      </div>

                      <div style={{ height: "1px", background: "var(--border)" }} />

                      {/* Sign Out Button */}
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          signOut();
                        }}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "10px",
                          background: "var(--rose-soft, #FFF0F2)",
                          color: "var(--rose, #E63946)",
                          border: "1px solid var(--rose-border, #FFD2D7)",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          width: "100%",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "var(--rose)";
                          (e.currentTarget as HTMLElement).style.color = "white";
                          (e.currentTarget as HTMLElement).style.borderColor = "var(--rose)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "var(--rose-soft, #FFF0F2)";
                          (e.currentTarget as HTMLElement).style.color = "var(--rose, #E63946)";
                          (e.currentTarget as HTMLElement).style.borderColor = "var(--rose-border, #FFD2D7)";
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                  
                  <div
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "var(--bg-elevated)",
                      border: menuOpen ? "1px solid var(--text-primary)" : "1px solid var(--border-strong)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--text-primary)",
                      cursor: "pointer", userSelect: "none",
                      transition: "all 0.2s"
                    }}
                  >
                    <User size={18} style={{ opacity: 0.8 }} />
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
