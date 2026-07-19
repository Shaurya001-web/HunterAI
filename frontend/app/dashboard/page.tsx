"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Profile } from "@/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { Mail, Calendar, Linkedin, Github, Globe, ExternalLink, Edit2 } from "lucide-react";

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
    if (k.includes("linkedin")) return <Linkedin size={18} className="text-blue-500" />;
    if (k.includes("github")) return <Github size={18} className="text-gray-800" />;
    return <Globe size={18} className="text-stone-600" />;
  };

  return (
    <>
      <div className="dashboard-content fade-up" style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Welcome Section */}
        <div className="welcome-header" style={{ flexDirection: "column", gap: "8px", marginBottom: "36px" }}>
          <p className="section-eyebrow" style={{ margin: 0 }}>
            {getTimeOfDay()}, developer
          </p>
          <h1 className="welcome-name">
            Welcome back, <em>{profile?.username || user?.username || "Guest User"}</em>
          </h1>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <div style={{ width: "32px", height: "32px", border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          </div>
        ) : error ? (
          <div className="glass-panel" style={{ padding: "32px", textAlign: "center", border: "1px solid rgba(239, 68, 68, 0.2)", background: "rgba(239, 68, 68, 0.04)" }}>
            <p style={{ color: "var(--rose)", fontWeight: 600, fontSize: "15px" }}>{error}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "28px" }}>
            {/* Overview Card */}
            <div className="glass-panel" style={{ padding: "32px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "24px", right: "24px" }}>
                <Link
                  href="/profile"
                  className="focusable dashboard-btn-secondary"
                >
                  <Edit2 size={13} /> Edit Profile
                </Link>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px" }}>
                <div style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--accent), var(--text-muted))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-display)", fontSize: "24px", color: "white",
                  boxShadow: "0 8px 20px rgba(5, 5, 5, 0.15)"
                }}>
                  {(profile?.username || user?.username || "?")[0].toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "22px", margin: 0, fontWeight: 700 }}>
                    {profile?.username || user?.username || "Guest User"}
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "6px 0 0 0" }}>
                    ID: <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", background: "rgba(5, 5, 5, 0.05)", padding: "2px 6px", borderRadius: "4px" }}>{profile?.user_id || user?.id || "local-sandbox-guest"}</span>
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ background: "rgba(5, 5, 5, 0.05)", padding: "10px", borderRadius: "10px", display: "flex" }}>
                    <Mail size={16} color="var(--text-secondary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em" }}>Email</div>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>{profile?.email || user?.email}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ background: "rgba(5, 5, 5, 0.05)", padding: "10px", borderRadius: "10px", display: "flex" }}>
                    <Calendar size={16} color="var(--text-secondary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em" }}>Joined</div>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>{joinDate}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Links and URLs Card */}
            <div className="glass-panel" style={{ padding: "32px" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 700 }}>
                <Globe size={18} color="var(--text-primary)" /> Saved Portfolios & Links
              </h3>

              {urlsList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", border: "1px dashed var(--border-strong)", borderRadius: "16px", background: "rgba(5, 5, 5, 0.02)" }}>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "0 0 16px 0" }}>
                    You haven't added any profile links or URLs yet.
                  </p>
                  <Link
                    href="/profile"
                    className="dashboard-btn-primary"
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
                        background: "rgba(251, 251, 250, 0.66)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        textDecoration: "none",
                        color: "var(--text-primary)",
                        transition: "all 0.2s ease"
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
    </>
  );
}
