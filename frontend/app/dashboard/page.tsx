"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Profile } from "@/types";
import { AppShell } from "@/components/shell/AppShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { User, Mail, Calendar, Linkedin, Github, Globe, ExternalLink, Edit2 } from "lucide-react";
import "../shell.css";

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await api.getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Could not load profile. Please verify your connection.");
      } finally {
        setLoading(false);
      }
    };

    if (user && !user.isGuest) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const urlsList = profile?.urls ? Object.entries(profile.urls).filter(([_, val]) => !!val) : [];

  const getUrlIcon = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes("linkedin")) return <Linkedin size={18} className="text-blue-400" />;
    if (k.includes("github")) return <Github size={18} className="text-gray-400" />;
    return <Globe size={18} className="text-teal-400" />;
  };

  return (
    <AppShell>
      <div className="dashboard-content" style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: "36px" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
            {getTimeOfDay()}, developer
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "40px", letterSpacing: "-0.03em", marginTop: "8px", color: "var(--text-primary)" }}>
            Welcome back, <em>{profile?.username || user?.username || "Guest User"}</em>
          </h1>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <div style={{ width: "32px", height: "32px", border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          </div>
        ) : error ? (
          <div className="glass-panel" style={{ padding: "24px", textAlign: "center", border: "1px solid rgba(220, 38, 38, 0.2)" }}>
            <p style={{ color: "#ef4444" }}>{error}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "28px" }}>
            {/* Overview Card */}
            <div className="glass-panel" style={{ padding: "32px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "24px", right: "24px" }}>
                <Link
                  href="/profile"
                  className="focusable"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: 500,
                    textDecoration: "none",
                    color: "var(--text-primary)",
                  }}
                >
                  <Edit2 size={13} /> Edit Profile
                </Link>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px" }}>
                <div style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--accent), var(--accent-cyan))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-display)", fontSize: "24px", color: "white"
                }}>
                  {(profile?.username || user?.username || "?")[0].toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "22px", margin: 0 }}>
                    {profile?.username || user?.username || "Guest User"}
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                    ID: {profile?.user_id || user?.id || "local-sandbox-guest"}
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ background: "var(--bg-elevated)", padding: "10px", borderRadius: "10px", display: "flex" }}>
                    <Mail size={16} color="var(--text-secondary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Email</div>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>{profile?.email || user?.email}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ background: "var(--bg-elevated)", padding: "10px", borderRadius: "10px", display: "flex" }}>
                    <Calendar size={16} color="var(--text-secondary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Joined</div>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>{joinDate}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Links and URLs Card */}
            <div className="glass-panel" style={{ padding: "32px" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Globe size={18} color="var(--accent)" /> Saved Portfolios & Links
              </h3>

              {urlsList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", border: "1px dashed var(--border)", borderRadius: "12px" }}>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "0 0 16px 0" }}>
                    You haven't added any profile links or URLs yet.
                  </p>
                  <Link
                    href="/profile"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "8px 20px",
                      background: "var(--accent)",
                      color: "white",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Add Links Now
                  </Link>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                  {urlsList.map(([key, value]) => (
                    <a
                      key={key}
                      href={value.startsWith("http") ? value : `https://${value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-card-hover"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        textDecoration: "none",
                        color: "var(--text-primary)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {getUrlIcon(key)}
                        <span style={{ fontSize: "14px", fontWeight: 600, textTransform: "capitalize" }}>{key}</span>
                      </div>
                      <ExternalLink size={14} color="var(--text-muted)" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </AppShell>
  );
}
