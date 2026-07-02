"use client";

import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Upload,
  ExternalLink,
  Calendar,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  Bookmark,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Profile, JobMatch } from "@/types";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { AppShell } from "@/components/shell/AppShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import "../shell.css";

function renderJobTitle(title: string) {
  const highlightWords = ["intern", "internship", "developer", "dev", "engineer", "co-op", "coop", "associate"];
  const words = title.split(" ");
  return words.map((word, i) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9-]/g, "");
    const isHighlight = highlightWords.includes(cleanWord);
    
    if (isHighlight) {
      return (
        <em
          key={i}
          style={{
            fontStyle: "italic",
            color: "var(--accent)",
            fontWeight: 600,
            fontFamily: "var(--font-display)",
            marginRight: "4px",
          }}
        >
          {word}
        </em>
      );
    }
    return (
      <span key={i} style={{ marginRight: "4px" }}>
        {word}
      </span>
    );
  });
}

function JobCard({
  match,
  isSaved,
  onToggleSave,
}: {
  match: JobMatch;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const scoreColor =
    match.score >= 70 ? "#00d68f" : match.score >= 40 ? "#ffd166" : "#ff4d6d";

  return (
    <div
      className="glass-panel glass-card-hover"
      style={{
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {renderJobTitle(match.job_title)}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
              {match.company || "Unknown Company"}
            </span>
            {match.source && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  background:
                    match.source === "LinkedIn"
                      ? "rgba(10, 102, 194, 0.12)"
                      : match.source === "Wellfound"
                      ? "rgba(255, 0, 127, 0.12)"
                      : "rgba(0, 214, 143, 0.12)",
                  color:
                    match.source === "LinkedIn"
                      ? "#0a66c2"
                      : match.source === "Wellfound"
                      ? "#ff007f"
                      : "#00d68f",
                  border: `1px solid ${
                    match.source === "LinkedIn"
                      ? "rgba(10, 102, 194, 0.2)"
                      : match.source === "Wellfound"
                      ? "rgba(255, 0, 127, 0.2)"
                      : "rgba(0, 214, 143, 0.2)"
                  }`,
                }}
              >
                {match.source}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            style={{
              background: isSaved ? "var(--accent-light)" : "transparent",
              border: `1px solid ${isSaved ? "var(--accent-border)" : "var(--border)"}`,
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: isSaved ? "var(--accent)" : "var(--text-muted)",
              transition: "all 0.2s",
            }}
            title={isSaved ? "Unsave Internship" : "Save Internship"}
          >
            <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
          </button>
          <ScoreRing score={match.score} size={56} />
        </div>
      </div>

      {/* Meta info */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        {[
          { icon: <MapPin size={12} color="var(--accent)" />, text: match.location || "Remote" },
          { icon: <DollarSign size={12} color="#00d68f" />, text: match.stipend || "Negotiable" },
          ...(match.duration ? [{ icon: <Calendar size={12} color="#00b4d8" />, text: match.duration }] : []),
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "12px",
              color: "var(--text-secondary)",
              background: "var(--bg-elevated)",
              padding: "4px 10px",
              borderRadius: "20px",
              border: "1px solid var(--border)",
            }}
          >
            {item.icon}
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      {/* Suitability Assessment */}
      {match.suitability_assessment && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            background:
              match.suitability_level === "highly_suited"
                ? "rgba(0, 214, 143, 0.05)"
                : match.suitability_level === "partially_suited"
                ? "rgba(255, 209, 102, 0.05)"
                : "rgba(255, 77, 109, 0.05)",
            border: `1px solid ${
              match.suitability_level === "highly_suited"
                ? "rgba(0, 214, 143, 0.15)"
                : match.suitability_level === "partially_suited"
                ? "rgba(255, 209, 102, 0.15)"
                : "rgba(255, 77, 109, 0.15)"
            }`,
            fontSize: "12px",
            color:
              match.suitability_level === "highly_suited"
                ? "#00d68f"
                : match.suitability_level === "partially_suited"
                ? "#ffd166"
                : "#ff4d6d",
            lineHeight: 1.5,
          }}
        >
          {match.suitability_assessment}
        </div>
      )}

      {/* Relevant Projects */}
      {match.matched_projects && match.matched_projects.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px" }}>
            <Sparkles size={11} color="var(--accent)" />
            <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Matched Resume Projects ({match.matched_projects.length})
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {match.matched_projects.map((p, i) => (
              <span key={i} className="skill-pill skill-pill-neutral" style={{ fontSize: "10.5px" }}>{p}</span>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {match.matched_skills?.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "7px" }}>
              <CheckCircle2 size={12} color="#00d68f" />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#00d68f", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Matched Skills ({match.matched_skills.length})
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {match.matched_skills.map((s, i) => (
                <span key={i} className="skill-pill skill-pill-matched">{s}</span>
              ))}
            </div>
          </div>
        )}
        {match.missing_skills?.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "7px" }}>
              <AlertCircle size={12} color="#ff4d6d" />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#ff4d6d", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Missing Skills ({match.missing_skills.length})
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {match.missing_skills.map((s, i) => (
                <span key={i} className="skill-pill skill-pill-missing">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Apply button */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "auto" }}>
        {match.url ? (
          <a
            href={match.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "13.5px",
              color: "white",
              padding: "11px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #6c5ce7, #8b5cf6)",
              boxShadow: "0 2px 10px rgba(108,92,231,0.25)",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            Apply on {match.source || "Internshala"} <ExternalLink size={13} />
          </a>
        ) : (
          <button
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              width: "100%",
              fontWeight: 600,
              fontSize: "13.5px",
              color: "var(--text-secondary)",
              padding: "11px",
              borderRadius: "10px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            Quick Apply <ExternalLink size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const fetchMatches = async (email: string, keyword?: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getMatches(email, keyword);
      setMatches(data || []);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSaved = async () => {
    if (user) {
      try {
        const saved = await api.getSavedInternships();
        setSavedJobIds(saved.map((s: { id: number }) => s.id));
      } catch (e) {
        console.error("Failed to load saved jobs:", e);
      }
    }
  };

  const handleToggleSave = async (jobId: number) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const isCurrentlySaved = savedJobIds.includes(jobId);
    try {
      if (isCurrentlySaved) {
        await api.unsaveInternship(jobId);
        setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
      } else {
        await api.saveInternship(jobId);
        setSavedJobIds((prev) => [...prev, jobId]);
      }
    } catch (e) {
      console.error("Error toggling save:", e);
    }
  };

  const init = async () => {
    setLoading(true);
    setError("");
    try {
      const profs = await api.getProfiles();
      setProfiles(profs || []);
      if (profs?.length) {
        const saved = localStorage.getItem("selectedProfileEmail");
        const p = profs.find((x: Profile) => x.email === saved) || profs[profs.length - 1];
        setSelectedEmail(p.email);
        localStorage.setItem("selectedProfileEmail", p.email);
        await Promise.all([
          fetchMatches(p.email),
          fetchSaved()
        ]);
      } else {
        setLoading(false);
      }
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      init();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleProfileChange = async (email: string) => {
    setSelectedEmail(email);
    localStorage.setItem("selectedProfileEmail", email);
    await fetchMatches(email, searchQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMatches(selectedEmail, searchQuery);
  };

  const filtered = matches.filter((m) => {
    return m.score >= minScore;
  });

  if (profiles.length === 0 && !loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "40px" }}>
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "20px", padding: "52px 40px", textAlign: "center", maxWidth: "380px", boxShadow: "0 12px 32px rgba(0,0,0,0.06)" }}>
          <div style={{ width: "52px", height: "52px", background: "var(--accent-light)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Sparkles size={24} color="var(--accent)" />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", color: "var(--text-primary)", marginBottom: "8px" }}>No Profile Yet</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "28px", lineHeight: 1.6 }}>
            Upload your resume first to calculate personalized job matches.
          </p>
          <Link
            href="/upload"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none", fontWeight: 600, fontSize: "14px", color: "white", padding: "12px 24px", borderRadius: "12px", background: "var(--accent)" }}
          >
            <Upload size={15} /> Upload Resume
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AppShell title="Recommendations">
      {/* Subheader and profile selector */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "13.5px", fontWeight: 500 }}>
          {loading ? "Searching opportunities..." : `${filtered.length} matches found, evaluated against skills & projects`}
        </p>

        {/* Profile selector */}
        {profiles.length > 1 && (
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              position: "relative",
            }}
          >
            <select
              value={selectedEmail}
              onChange={(e) => handleProfileChange(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                padding: "9px 36px 9px 14px",
                fontSize: "13px",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                appearance: "none",
              }}
            >
              {profiles.map((p, i) => (
                <option key={i} value={p.email}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={14} color="var(--text-muted)" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>
        )}
      </div>

      {/* Search + Filter bar */}
      <div style={{ marginBottom: "32px" }}>
        <form
          onSubmit={handleSearchSubmit}
          className="glass-light"
          style={{
            padding: "16px 24px",
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
            borderRadius: 24,
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search ML, python, web dev..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base"
              style={{ paddingLeft: "36px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "10px 12px 10px 36px", width: "100%", fontSize: 14 }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "11px 20px" }}
          >
            <Search size={14} /> Search
          </button>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: showFilters ? "var(--accent-light)" : "var(--bg-surface)",
              border: showFilters ? "1px solid var(--accent)" : "1px solid var(--border)",
              borderRadius: "10px",
              padding: "10px 16px",
              color: showFilters ? "var(--accent)" : "var(--text-secondary)",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              transition: "all 0.15s",
            }}
          >
            <SlidersHorizontal size={14} /> Filters
          </button>

          <button
            type="button"
            onClick={() => { setSearchQuery(""); fetchMatches(selectedEmail, ""); setMinScore(0); }}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              padding: "8px 12px",
            }}
          >
            Reset
          </button>
        </form>
      </div>

      {/* Min score filter */}
      {showFilters && (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>Min match score:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            style={{ flex: 1, maxWidth: "200px", accentColor: "var(--accent)" }}
          />
          <span
            style={{
              fontSize: "13px",
              fontWeight: 800,
              fontFamily: "var(--font-body)",
              color: "var(--accent)",
              background: "var(--accent-light)",
              padding: "4px 12px",
              borderRadius: "8px",
              minWidth: "44px",
              textAlign: "center",
            }}
          >
            {minScore}%
          </span>
        </div>
      )}

      {/* Loading grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div
          style={{
            background: "rgba(255,77,109,0.08)",
            border: "1px solid rgba(255,77,109,0.2)",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#ff4d6d", fontSize: "13.5px", marginBottom: "16px" }}>{error}</p>
          <button
            onClick={() => fetchMatches(selectedEmail, searchQuery)}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 16px", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-body)" }}
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px dashed var(--border-strong)",
            borderRadius: "20px",
            padding: "80px 40px",
            textAlign: "center",
          }}
        >
          <Sparkles size={28} color="var(--text-muted)" style={{ margin: "0 auto 14px", display: "block" }} />
          <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: 500 }}>No jobs match your current filters.</p>
          <p style={{ color: "var(--text-muted)", fontSize: "12.5px", marginTop: "6px" }}>Try lowering the minimum score or clearing the search.</p>
        </div>
      ) : (
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}
        >
          {filtered.map((match, i) => (
            <JobCard
              key={i}
              match={match}
              isSaved={match.id ? savedJobIds.includes(match.id) : false}
              onToggleSave={() => match.id && handleToggleSave(match.id)}
            />
          ))}
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
      )}
    </AppShell>
  );
}
