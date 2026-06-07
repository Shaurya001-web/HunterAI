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

/* ─── INSIGHT STRIP ───────────────────────────────────────── */
function InsightStrip({
  count,
  topSkill,
  gap,
}: {
  count: number;
  topSkill: string;
  gap: string;
}) {
  const { ref, visible } = useReveal(300);
  return (
    <div ref={ref} className={`reveal insight-strip ${visible ? "visible" : ""}`} style={{ marginBottom: 32 }}>
      <div className="insight-fragment">
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            color: "var(--accent)",
            letterSpacing: "-0.03em",
          }}
        >
          {count}
        </span>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          new matches found
        </span>
      </div>
      <div className="insight-divider" />
      <div className="insight-fragment">
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          Strongest area:
        </span>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-primary)",
          }}
        >
          {topSkill || "—"}
        </span>
      </div>
      <div className="insight-divider" />
      <div className="insight-fragment">
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          Gap to close:
        </span>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--accent-cyan)",
          }}
        >
          {gap || "—"}
        </span>
      </div>
    </div>
  );
}

/* ─── METRICS ROW ─────────────────────────────────────────── */
function MetricsRow({
  matched,
  skills,
  strength,
  completion,
}: {
  matched: number;
  skills: number;
  strength: number;
  completion: number;
}) {
  const { ref, visible } = useReveal(550);
  return (
    <div ref={ref} className={`reveal ${visible ? "visible" : ""}`} style={{ marginBottom: 48 }}>
      <div className="metrics-row">
        {[
          { label: "Jobs Matched", value: matched, suffix: "", color: "var(--accent)", primary: true },
          { label: "Skills Parsed", value: skills, suffix: "", color: "var(--text-primary)", primary: false },
          { label: "Match Strength", value: strength, suffix: "%", color: "var(--text-primary)", primary: false },
          { label: "Profile Complete", value: completion, suffix: "%", color: "var(--text-primary)", primary: false },
        ].map(({ label, value, suffix, color }, i) => (
          <div key={label} className="metric-block" style={{ paddingLeft: i === 0 ? 0 : 32 }}>
            <div className="metric-number">
              {visible && (
                <AnimatedCounter
                  target={value}
                  suffix={suffix}
                  delay={600 + i * 120}
                  duration={800}
                  color={color}
                />
              )}
            </div>
            <div className="metric-label">{label}</div>
            <div
              style={{
                marginTop: 10,
                height: 2,
                background: "var(--surface-2)",
                borderRadius: 2,
                overflow: "hidden",
                width: "60%",
              }}
            >
              <MiniBar pct={value} max={100} delay={900 + i * 120} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
      className={`reveal match-card ${visible ? "visible" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderLeft: `3px solid rgba(108,79,224,${borderOpacity})`,
        borderRadius: "0 12px 12px 0",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? "var(--shadow-lift)" : "none",
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

  const topSkillArea = matches.length && profile?.skills?.length
    ? (() => {
        const ml = ["Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "scikit-learn", "NLP"];
        const backend = ["FastAPI", "Django", "Flask", "Node.js", "REST APIs", "PostgreSQL"];
        const mlCount = (profile.skills || []).filter(s => ml.some(k => s.toLowerCase().includes(k.toLowerCase()))).length;
        const beCount = (profile.skills || []).filter(s => backend.some(k => s.toLowerCase().includes(k.toLowerCase()))).length;
        return mlCount >= beCount ? "Machine Learning" : "Backend Development";
      })()
    : profile?.skills?.[0] ?? "—";

  const gapSkill = matches.length
    ? (() => {
        const missing = matches.flatMap(m => m.missing_skills || []);
        const freq: Record<string, number> = {};
        missing.forEach(s => { freq[s] = (freq[s] || 0) + 1; });
        return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
      })()
    : "—";

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
          {/* Zone 1 — Welcome Header */}
          <div
            ref={headerRef}
            className={`reveal welcome-header ${headerVisible ? "visible" : ""}`}
          >
            <div>
              <h1 className="welcome-name">
                {getTimeOfDay()},{" "}
                <em>{profile?.name?.split(" ")[0] ?? "there"}.</em>
              </h1>
              <p className="welcome-date">{formatDate()}</p>
            </div>
            <div>
              <span className={profileComplete ? "badge badge-cyan" : "badge badge-amber"}>
                <span style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: "currentColor",
                  display: "inline-block",
                }} />
                {profileComplete ? "Profile complete" : "Action needed"}
              </span>
            </div>
          </div>

          {/* Zone 2 — AI Insight Strip */}
          <InsightStrip
            count={matches.length}
            topSkill={topSkillArea}
            gap={gapSkill}
          />

          {/* Zone 3 — Metrics Row */}
          <MetricsRow
            matched={matches.length}
            skills={skillCount}
            strength={avgScore}
            completion={completion}
          />

          {/* Zones 4 + 5 — Two column */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "3fr 2fr",
              gap: 48,
              alignItems: "flex-start",
            }}
            className="profile-grid"
          >
            {/* Zone 4 — Top Matches */}
            <div>
              <div className="section-heading">Top matches</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {topMatches.length === 0 ? (
                  <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    color: "var(--text-muted)",
                    fontStyle: "italic",
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
                <div style={{ marginTop: 20 }}>
                  <Link href="/recommendations" className="link-text">
                    See all {matches.length} matches →
                  </Link>
                </div>
              )}
            </div>

            {/* Zone 5 — Activity Timeline */}
            <ActivityTimeline count={matches.length} />
          </div>
        </>
      )}
    </AppShell>
  );
}
