"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Profile } from "@/types";
import { AppShell } from "@/components/shell/AppShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { User, Mail, Calendar, Linkedin, Github, Globe, Save, Trash2, PlusCircle, CheckCircle } from "lucide-react";
import "../shell.css";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [username, setUsername] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  
  // Custom links state
  const [customLinks, setCustomLinks] = useState<{ label: string; url: string }[]>([]);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await api.getProfile();
        setProfile(data);
        setUsername(data.username || "");
        
        // Parse URLs
        const urls = data.urls || {};
        setLinkedin(urls.linkedin || "");
        setGithub(urls.github || "");
        setPortfolio(urls.portfolio || "");

        // Filter other URLs to custom links list
        const knownKeys = ["linkedin", "github", "portfolio"];
        const custom = Object.entries(urls)
          .filter(([key, _]) => !knownKeys.includes(key))
          .map(([key, val]) => ({ label: key, url: val as string }));
        setCustomLinks(custom);
      } catch (err) {
        console.error("Failed to fetch profile details:", err);
        setError("Unable to load profile data.");
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

  const handleAddCustomLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    setCustomLinks([...customLinks, { label: newLinkLabel.trim().toLowerCase(), url: newLinkUrl.trim() }]);
    setNewLinkLabel("");
    setNewLinkUrl("");
  };

  const handleRemoveCustomLink = (index: number) => {
    setCustomLinks(customLinks.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username cannot be empty.");
      return;
    }

    setSaveLoading(true);
    setSaveSuccess(false);
    setError("");

    try {
      // Build URLs payload
      const urls: Record<string, string> = {};
      if (linkedin.trim()) urls.linkedin = linkedin.trim();
      if (github.trim()) urls.github = github.trim();
      if (portfolio.trim()) urls.portfolio = portfolio.trim();
      
      customLinks.forEach((link) => {
        if (link.label && link.url) {
          urls[link.label] = link.url;
        }
      });

      // Update via auth provider (updates Cognito/Supabase auth metadata & saves profile)
      await updateProfile(username.trim());

      // Save complete profile via API
      const updated = await api.saveProfile({
        username: username.trim(),
        urls,
      });

      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving profile details:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

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

  return (
    <AppShell>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        {/* Page Heading */}
        <div style={{ marginBottom: "36px" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
            Profile settings
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "40px", letterSpacing: "-0.03em", marginTop: "8px", color: "var(--text-primary)" }}>
            Customize your <em>identity</em>
          </h1>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <div style={{ width: "32px", height: "32px", border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: "grid", gridTemplateColumns: "1fr", gap: "28px" }}>
            {/* General Info Card */}
            <div className="glass-panel" style={{ padding: "32px" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                <User size={18} color="var(--accent)" /> General Information
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "8px" }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      height: "44px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-strong)",
                      borderRadius: "10px",
                      color: "var(--text-primary)",
                      padding: "0 14px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    placeholder="Enter your username"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginTop: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ background: "var(--bg-base)", padding: "10px", borderRadius: "10px", display: "flex" }}>
                      <Mail size={16} color="var(--text-secondary)" />
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Email</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--text-secondary)" }}>{profile?.email || user?.email}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ background: "var(--bg-base)", padding: "10px", borderRadius: "10px", display: "flex" }}>
                      <Calendar size={16} color="var(--text-secondary)" />
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Joined</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--text-secondary)" }}>{joinDate}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social / Portfolio Links Card */}
            <div className="glass-panel" style={{ padding: "32px" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Globe size={18} color="var(--accent)" /> Social & Portfolio Links
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
                {/* LinkedIn */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "8px" }}>
                    <Linkedin size={14} /> LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    style={{
                      width: "100%",
                      height: "44px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-strong)",
                      borderRadius: "10px",
                      color: "var(--text-primary)",
                      padding: "0 14px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                {/* GitHub */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "8px" }}>
                    <Github size={14} /> GitHub URL
                  </label>
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    style={{
                      width: "100%",
                      height: "44px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-strong)",
                      borderRadius: "10px",
                      color: "var(--text-primary)",
                      padding: "0 14px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    placeholder="https://github.com/username"
                  />
                </div>

                {/* Portfolio */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "8px" }}>
                    <Globe size={14} /> Portfolio Website URL
                  </label>
                  <input
                    type="url"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    style={{
                      width: "100%",
                      height: "44px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-strong)",
                      borderRadius: "10px",
                      color: "var(--text-primary)",
                      padding: "0 14px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                {/* Custom Links Section */}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px", marginTop: "10px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "14px" }}>
                    Custom URL Links
                  </label>

                  {customLinks.map((link, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ flex: 1, display: "flex", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px" }}>
                        <span style={{ fontWeight: 600, textTransform: "capitalize", color: "var(--text-muted)", marginRight: "12px", width: "80px", borderRight: "1px solid var(--border)", paddingRight: "10px" }}>{link.label}</span>
                        <span style={{ color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link.url}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomLink(idx)}
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", padding: "8px", borderRadius: "8px" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {/* Add New Custom Link Fields */}
                  <div style={{ display: "grid", gridTemplateColumns: "130px 1fr auto", gap: "12px", alignItems: "center", marginTop: "16px" }}>
                    <input
                      type="text"
                      placeholder="Label (e.g. twitter)"
                      value={newLinkLabel}
                      onChange={(e) => setNewLinkLabel(e.target.value)}
                      style={{
                        height: "38px",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                        padding: "0 10px",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                    <input
                      type="url"
                      placeholder="URL (https://...)"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      style={{
                        height: "38px",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                        padding: "0 10px",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomLink}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        height: "38px",
                        padding: "0 14px",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 500,
                      }}
                    >
                      <PlusCircle size={15} /> Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error and Success Notifications */}
            {error && (
              <div style={{ padding: "14px 20px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "14px" }}>
                {error}
              </div>
            )}

            {saveSuccess && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 20px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px", color: "#10b981", fontSize: "14px" }}>
                <CheckCircle size={16} /> Changes saved successfully!
              </div>
            )}

            {/* Submit Button */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={saveLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 28px",
                  background: "var(--accent)",
                  color: "white",
                  border: "none",
                  borderRadius: "24px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: saveLoading ? 0.7 : 1,
                  boxShadow: "0 8px 24px rgba(108, 79, 224, 0.25)",
                }}
              >
                <Save size={16} /> {saveLoading ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </AppShell>
  );
}
