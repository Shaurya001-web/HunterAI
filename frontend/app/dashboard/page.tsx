"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Profile, JobMatch } from "@/types";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { useReveal } from "@/components/shared/useReveal";
import { AppShell } from "@/components/shell/AppShell";
import "../shell.css";

/* ─── HELPERS ─────────────────────────────────────────────── */
function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function MiniBar({ pct, max, delay }: { pct: number; max: number; delay: number }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  const width = Math.min((pct / max) * 100, 100);
  return (
    <div
      style={{
        height: "100%",
        width: ready ? `${width}%` : "0%",
        background: "var(--accent)",
        borderRadius: 2,
        transition: "width 0.9s cubic-bezier(0.22,1,0.36,1)",
        opacity: 0.6,
      }}
    />
  );
}

/* ─── MATCH CARD LEFT BORDER ──────────────────────────────── */
function MatchCard({ match, index }: { match: JobMatch; index: number }) {
  const { ref, visible } = useReveal(100 + index * 80);
  const [hovered, setHovered] = useState(false);
  const borderOpacity = Math.max(0.2, match.score / 100);

  return (
    <div
      ref={ref}
      className={`reveal glass-panel glass-card-hover ${visible ? "visible" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderLeft: `4px solid rgba(108, 79, 224, ${borderOpacity})`,
        padding: 24,
        position: "relative",
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 11,
          fontWeight: 500,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.09em",
          marginBottom: 4,
        }}
      >
        {match.company || "Company"}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          {match.job_title}
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            color: "var(--accent)",
            letterSpacing: "-0.03em",
            flexShrink: 0,
            marginLeft: 16,
            lineHeight: 1,
          }}
        >
          {match.score}%
        </div>
      </div>

      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 12,
          color: "var(--text-muted)",
          marginBottom: 10,
        }}
      >
        {[match.stipend, match.location, match.duration]
          .filter(Boolean)
          .join(" · ") || "Details on application"}
      </div>

      <div
        style={{
          fontFamily: "var(--font-body)",
          fontStyle: "italic",
          fontSize: 12,
          color: "var(--text-secondary)",
          lineHeight: 1.5,
          marginBottom: 12,
        }}
      >
        {match.matched_skills?.length
          ? `Your ${match.matched_skills.slice(0, 2).join(" and ")} experience directly matches ${match.matched_skills.length} required skills.`
          : "AI analysis available after matching."}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {match.matched_skills?.slice(0, 3).map((s) => (
            <span
              key={s}
              className="skill-pill"
              style={{ borderLeftColor: "var(--accent)", fontSize: 11 }}
            >
              {s}
            </span>
          ))}
        </div>
        <span
          className="match-card-arrow"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateX(0)" : "translateX(-4px)",
          }}
        >
          View →
        </span>
      </div>
    </div>
  );
}

/* ─── ACTIVITY TIMELINE ───────────────────────────────────── */
function ActivityTimeline({ count }: { count: number }) {
  const { ref, visible } = useReveal(150);

  const events = [
    { label: "Recommendations generated", time: "2 min ago", latest: true },
    { label: `${count} matches scored`, time: "2 min ago", latest: false },
    { label: "Skills graph built", time: "4 min ago", latest: false },
    { label: "Projects analyzed", time: "4 min ago", latest: false },
    { label: "Resume parsed", time: "5 min ago", latest: false },
    { label: "Resume uploaded", time: "5 min ago", latest: false },
  ];

  return (
    <div ref={ref} className={`reveal ${visible ? "visible" : ""}`}>
      <div
        className="section-eyebrow"
        style={{ marginBottom: 20 }}
      >
        Activity
      </div>
      <div className="timeline">
        {events.map(({ label, time, latest }, i) => (
          <div
            key={i}
            className="timeline-item"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
              transition: `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${200 + (events.length - i) * 60}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${200 + (events.length - i) * 60}ms`,
            }}
          >
            <div
              className={`timeline-dot ${latest ? "timeline-dot-pulse" : ""}`}
              style={{ opacity: latest ? 1 : 0.45 }}
            />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: latest ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: latest ? 500 : 400,
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                color: "var(--text-muted)",
                flexShrink: 0,
              }}
            >
              {time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── EMPTY STATE ─────────────────────────────────────────── */
function EmptyState() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "80px 40px",
        maxWidth: 420,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 28,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
          marginBottom: 12,
          lineHeight: 1.2,
        }}
      >
        No resume yet.
      </div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--text-secondary)",
          lineHeight: 1.65,
          marginBottom: 28,
        }}
      >
        Upload your resume to unlock your personalized dashboard, skill analysis, and job recommendations.
      </div>
      <Link
        href="/upload"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          textDecoration: "none",
          fontFamily: "var(--font-body)",
          fontSize: 14,
          fontWeight: 500,
          color: "white",
          padding: "11px 24px",
          borderRadius: 8,
          background: "var(--accent)",
        }}
      >
        Upload Resume
      </Link>
    </div>
  );
}

/* ─── LOADING SKELETON ────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ width: 260, height: 36, background: "var(--surface-2)", borderRadius: 6, marginBottom: 8 }} />
          <div style={{ width: 140, height: 14, background: "var(--surface-2)", borderRadius: 4 }} />
        </div>
        <div style={{ width: 100, height: 26, background: "var(--surface-2)", borderRadius: 20 }} />
      </div>
      <div style={{ height: 52, background: "var(--surface-2)", borderRadius: 8 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ paddingLeft: i === 0 ? 0 : 32, paddingRight: 32 }}>
            <div style={{ width: 80, height: 44, background: "var(--surface-2)", borderRadius: 6, marginBottom: 8 }} />
            <div style={{ width: 60, height: 11, background: "var(--surface-2)", borderRadius: 4 }} />
          </div>
        ))}
      </div>
      {[0,1,2].map(i => (
        <div key={i} style={{ height: 140, background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "0 12px 12px 0", borderLeft: "3px solid var(--surface-2)" }} />
      ))}
    </div>
  );
}

/* ─── PAGE ─────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [noProfile, setNoProfile] = useState(false);
  const [error, setError] = useState("");

  const { ref: headerRef, visible: headerVisible } = useReveal(0);

  useEffect(() => {
    async function load() {
      try {
        const profiles = await api.getProfiles();
        if (!profiles?.length) { setNoProfile(true); setLoading(false); return; }
        const saved = localStorage.getItem("selectedProfileEmail");
        const p = profiles.find((x: Profile) => x.email === saved) || profiles[profiles.length - 1];
        setProfile(p);
        const m = await api.getMatches(p.email);
        setMatches(m || []);
      } catch (e: unknown) {
        const err = e as Error;
        setError(err.message || "Failed to load.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const avgScore = matches.length
    ? Math.round(matches.reduce((a, b) => a + b.score, 0) / matches.length)
    : 0;
  const skillCount = profile?.skills?.length ?? 0;
  const completion = profile
    ? Math.round(
        ([profile.skills?.length, profile.education?.length, profile.experience?.length, profile.projects?.length]
          .filter((v) => v && v > 0).length / 4) * 100
      )
    : 0;



  const topMatches = [...matches].sort((a, b) => b.score - a.score).slice(0, 3);
  const profileComplete = !noProfile && !!profile;

  return (
    <AppShell title="Dashboard">
      {loading ? (
        <DashboardSkeleton />
      ) : noProfile ? (
        <EmptyState />
      ) : error ? (
        <div style={{
          padding: "40px",
          background: "rgba(180,83,9,0.06)",
          borderRadius: 12,
          border: "0.5px solid rgba(180,83,9,0.2)",
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--accent-amber)",
        }}>
          {error}
        </div>
      ) : (
        <>
          {/* Zone 1 — Glass Hero Welcome */}
          <div
            ref={headerRef}
            className={`reveal glass-panel ${headerVisible ? "visible" : ""}`}
            style={{ padding: "40px 48px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <div>
              <h1 className="welcome-name" style={{ marginBottom: 8 }}>
                {getTimeOfDay()},{" "}
                <em>{profile?.name?.split(" ")[0] ?? "there"}.</em>
              </h1>
              <p className="welcome-date" style={{ color: "var(--text-secondary)", fontSize: 14 }}>{formatDate()}</p>
            </div>
            <div>
              <span className={profileComplete ? "badge badge-cyan" : "badge badge-amber"} style={{ padding: "8px 16px", fontSize: 13 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "currentColor",
                  display: "inline-block",
                }} />
                {profileComplete ? "Profile Complete" : "Action Needed"}
              </span>
            </div>
          </div>

          {/* Zone 2 — Unified Stat Strip */}
          <div className="glass-panel" style={{ display: "flex", padding: "0", marginBottom: 64, overflow: "hidden" }}>
             {[
               { label: "Jobs Matched", value: matches.length, suffix: "", color: "var(--accent)" },
               { label: "Skills Parsed", value: skillCount, suffix: "", color: "var(--text-primary)" },
               { label: "Match Strength", value: avgScore, suffix: "%", color: "var(--text-primary)" },
               { label: "Profile %", value: completion, suffix: "%", color: "var(--text-primary)" },
             ].map(({ label, value, suffix, color }, i) => (
               <div key={label} style={{ flex: 1, padding: "24px 32px", borderRight: i < 3 ? "1px solid var(--border)" : "none" }}>
                 <div className="metric-number" style={{ color }}>
                   <AnimatedCounter target={value} suffix={suffix} delay={200 + i * 100} duration={800} color={color} />
                 </div>
                 <div className="metric-label">{label}</div>
                 <div style={{ marginTop: 12, height: 4, background: "var(--bg-elevated)", borderRadius: 2, overflow: "hidden" }}>
                   <MiniBar pct={value} max={100} delay={300 + i * 100} />
                 </div>
               </div>
             ))}
          </div>

          {/* Zones 3 + 4 — Main Content & Sidebar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 280px", /* Dominant matches, slim sidebar */
              gap: 64,
              alignItems: "flex-start",
            }}
            className="profile-grid"
          >
            {/* Zone 3 — Top Matches (Hero Content) */}
            <div>
              <div className="section-heading" style={{ fontSize: 32, marginBottom: 32 }}>Top Matches</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {topMatches.length === 0 ? (
                  <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    color: "var(--text-muted)",
                    fontStyle: "italic",
                    background: "var(--bg-elevated)",
                    padding: 24,
                    borderRadius: 16,
                    border: "1px dashed var(--border-strong)"
                  }}>
                    No matches yet. Upload a resume to get started.
                  </p>
                ) : (
                  topMatches.map((m, i) => (
                    <MatchCard key={i} match={m} index={i} />
                  ))
                )}
              </div>
              {matches.length > 3 && (
                <div style={{ marginTop: 32 }}>
                  <Link href="/recommendations" className="link-text" style={{ fontSize: 14, fontWeight: 500 }}>
                    See all {matches.length} matches →
                  </Link>
                </div>
              )}
            </div>

            {/* Zone 4 — Secondary Sidebar */}
            <div style={{ position: "sticky", top: 100 }}>
              <ActivityTimeline count={matches.length} />
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
