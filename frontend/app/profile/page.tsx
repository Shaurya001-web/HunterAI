"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Upload, ChevronDown } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Profile } from "@/types";
import { WordReveal } from "@/components/shared/WordReveal";
import { useReveal } from "@/components/shared/useReveal";
import { AppShell } from "@/components/shell/AppShell";
import "../shell.css";

/* ─── SKILL GROUP TYPES ───────────────────────────────────── */
const SKILL_GROUPS: Record<string, string[]> = {
  Backend: ["fastapi", "django", "flask", "express", "node", "rest", "api", "spring", "ruby", "rails", "graphql", "grpc"],
  "AI / ML": ["machine learning", "deep learning", "pytorch", "tensorflow", "scikit", "keras", "nlp", "huggingface", "langchain", "llm", "opencv", "pandas", "numpy"],
  Frontend: ["react", "vue", "angular", "next", "svelte", "html", "css", "tailwind", "typescript", "javascript", "webpack", "vite"],
  Databases: ["postgresql", "mysql", "mongodb", "redis", "sqlite", "oracle", "sql", "elasticsearch", "firebase", "supabase"],
  Tools: ["git", "docker", "kubernetes", "aws", "gcp", "azure", "linux", "ci/cd", "github", "gitlab", "terraform", "nginx"],
};

/* ─── SKILL MATCH HELPER ───────────────────────────────────── */
function matchSkillKeyword(skill: string, keyword: string): boolean {
  const s = skill.toLowerCase().trim();
  const k = keyword.toLowerCase().trim();
  
  if (k.length <= 4) {
    // For short words like api, rest, git, ml, nlp - do word boundary match
    const regex = new RegExp(`\\b${k}\\b`, 'i');
    return regex.test(s);
  }
  return s.includes(k);
}

function categorizeSkills(skills: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  const used = new Set<string>();

  for (const [group, keywords] of Object.entries(SKILL_GROUPS)) {
    const matched = skills.filter((s) =>
      keywords.some((k) => matchSkillKeyword(s, k))
    );
    if (matched.length > 0) {
      grouped[group] = matched;
      matched.forEach((s) => used.add(s));
    }
  }

  const other = skills.filter((s) => !used.has(s));
  if (other.length > 0) grouped["Other"] = other;

  return grouped;
}

function getProficiency(skillIndex: number, total: number): number {
  return Math.max(0.25, 1 - (skillIndex / Math.max(1, total - 1)) * 0.7);
}

/* ─── STRENGTH PILLS ─────────────────────────────────────── */
const STRENGTH_DEFS = [
  { label: "Backend",    keys: ["fastapi", "django", "flask", "node", "api"], dots: 5 },
  { label: "AI / ML",   keys: ["machine", "pytorch", "tensorflow", "nlp", "langchain"], dots: 5 },
  { label: "Frontend",  keys: ["react", "vue", "html", "css", "typescript"], dots: 5 },
];

function computeStrength(skills: string[], keys: string[], maxDots: number): number {
  const count = skills.filter((s) =>
    keys.some((k) => matchSkillKeyword(s, k))
  ).length;
  return Math.min(maxDots, Math.round((count / 3) * maxDots));
}

function StrengthPill({ label, filled, total }: { label: string; filled: number; total: number }) {
  return (
    <div className="strength-pill">
      <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)" }}>
        {label}
      </span>
      <div className="strength-dots">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="strength-dot"
            style={{
              background: i < filled ? "var(--accent)" : "var(--border-strong)",
              opacity: i < filled ? 1 : 0.4,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── AI SUMMARY BLOCK ────────────────────────────────────── */
function AiSummaryBlock({ profile }: { profile: Profile }) {
  const [regen, setRegen] = useState(false);

  const summaryText = (() => {
    const candidateName = profile.name?.split(" ")[0] ?? "This candidate";
    const skills = profile.skills?.slice(0, 4) ?? [];
    const projCount = profile.projects?.length ?? 0;
    const topSkills = skills.slice(0, 2).join(" and ") || "technical tools";
    const hasML = skills.some(s => s.toLowerCase().includes("machine") || s.toLowerCase().includes("ml") || s.toLowerCase().includes("pytorch"));
    const hasBackend = skills.some(s => s.toLowerCase().includes("api") || s.toLowerCase().includes("fastapi") || s.toLowerCase().includes("django"));

    const pronoun = candidateName === "This candidate" ? "They" : candidateName;
    const displays = candidateName === "This candidate" ? "demonstrate" : "demonstrates";

    if (hasML && hasBackend) {
      return `${candidateName} is a strong backend and machine learning candidate with demonstrated depth in ${topSkills}. Across ${projCount || "multiple"} shipped projects, ${pronoun.toLowerCase() === "they" ? "they show" : `${pronoun} shows`} clear evidence of production-grade thinking and applied research experience. Particularly well-suited for roles at the intersection of systems engineering and applied AI.`;
    } else if (hasML) {
      return `${candidateName} is an applied machine learning candidate with solid foundations in ${topSkills}. ${projCount > 0 ? `${projCount} project${projCount > 1 ? "s" : ""} ${displays} hands-on modelling experience` : "Research and implementation experience"} — positioned for ML engineering and data science roles. Skill depth increases meaningfully with deployment and systems exposure.`;
    } else {
      return `${candidateName} is a technically versatile candidate with experience in ${topSkills}. ${projCount > 0 ? `${projCount} project${projCount > 1 ? "s" : ""} reflect end-to-end product thinking` : "Portfolio reflects consistent technical output"} and cross-functional capability. Well-suited for software engineering and full-stack roles requiring rapid adaptation.`;
    }
  })();

  return (
    <div>
      <div className="section-eyebrow" style={{ marginBottom: 12 }}>AI summary</div>
      <p className="ai-summary-text">
        <WordReveal text={summaryText} delay={200} />
      </p>
      <button
        onClick={() => setRegen(!regen)}
        style={{
          marginTop: 14,
          background: "none",
          border: "none",
          fontFamily: "var(--font-body)",
          fontSize: 12,
          color: "var(--accent)",
          cursor: "pointer",
          padding: 0,
          textDecoration: "underline",
          textUnderlineOffset: 3,
        }}
      >
        Regenerate
      </button>
    </div>
  );
}

/* ─── SKILL GROUP SECTION ─────────────────────────────────── */
function SkillGroups({ skills }: { skills: string[] }) {
  const { ref, visible } = useReveal(100);
  const grouped = categorizeSkills(skills);

  return (
    <div ref={ref} className={`reveal ${visible ? "visible" : ""}`}>
      <div className="section-heading">Skills</div>
      {Object.entries(grouped).map(([group, groupSkills], gi) => (
        <div key={group} className="skill-group">
          <div className="skill-group-label">{group}</div>
          <div className="skill-group-pills">
            {groupSkills.map((skill, si) => {
              const origIdx = skills.indexOf(skill);
              const prof = getProficiency(origIdx, skills.length);
              const isTop = si < 3 && gi === 0;
              return (
                <span
                  key={skill}
                  className={`skill-pill ${isTop ? "skill-pill-lg" : ""}`}
                  style={{
                    borderLeftColor: `rgba(108,79,224,${prof})`,
                    animationDelay: `${gi * 150 + si * 30}ms`,
                  }}
                >
                  {skill}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── PROJECT BLOCK ───────────────────────────────────────── */
interface ProjectType {
  title?: string;
  name?: string;
  description?: string | string[];
  technologies?: string[];
  tech?: string[];
  techs?: string[];
}

function ProjectBlock({ proj, index, totalMatches }: {
  proj: ProjectType;
  index: number;
  totalMatches: number;
}) {
  const { ref, visible } = useReveal(index * 120);

  const title = proj.title || proj.name || "Unnamed Project";
  const rawDescription = proj.description || "";
  const description = Array.isArray(rawDescription)
    ? rawDescription.join(" ")
    : rawDescription;
  const technologies = proj.technologies || proj.tech || proj.techs || [];

  return (
    <div ref={ref} className={`reveal project-block ${visible ? "visible" : ""}`}>
      <div className="project-title">{title}</div>
      {description && (
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          marginBottom: 8,
        }}>
          {description}
        </p>
      )}
      {technologies?.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          {technologies.map((t: string) => (
            <span
              key={t}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                padding: "3px 8px",
                borderRadius: 4,
                background: "var(--surface-2)",
                color: "var(--text-muted)",
                border: "0.5px solid var(--border)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}
      {totalMatches > 0 && (
        <span style={{
          fontFamily: "var(--font-body)",
          fontSize: 11,
          color: "var(--accent-cyan)",
          fontStyle: "italic",
        }}>
          Relevant to {Math.min(totalMatches, 3)} match{totalMatches !== 1 ? "es" : ""} ↗
        </span>
      )}
    </div>
  );
}

/* ─── EDU / EXP COLUMNS ───────────────────────────────────── */
function EduExpSection({ profile }: { profile: Profile }) {
  const { ref, visible } = useReveal(200);
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "visible" : ""}`}
      style={{
        borderTop: "0.5px solid var(--border)",
        paddingTop: 40,
        marginTop: 40,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 48,
      }}
    >
      {/* Education */}
      <div>
        <div className="section-eyebrow">Education</div>
        {profile.education?.length ? (
          profile.education.map((item, i) => {
            const rawEdu = item as Record<string, unknown>;
            const institution = (rawEdu.institution || rawEdu.school || rawEdu.university || "Unknown Institution") as string;
            const degree = (rawEdu.degree || rawEdu.course || rawEdu.program || "Degree") as string;
            const year = (rawEdu.year || rawEdu.date || rawEdu.dates || rawEdu.yearOfPassing || "") as string;
            return (
              <div key={i} className="entry-row">
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    marginBottom: 2,
                  }}>
                    {institution}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                  }}>
                    {degree}
                  </div>
                </div>
                {year && (
                  <span style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    flexShrink: 0,
                  }}>
                    {year}
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
            No education listed.
          </p>
        )}
      </div>

      {/* Experience */}
      <div>
        <div className="section-eyebrow">Experience</div>
        {profile.experience?.length ? (
          profile.experience.map((item, i) => {
            const rawExp = item as Record<string, unknown>;
            const company = (rawExp.company || rawExp.organization || rawExp.employer || "Unknown Company") as string;
            const role = (rawExp.role || rawExp.title || rawExp.designation || "Role") as string;
            const duration = (rawExp.duration || rawExp.date || rawExp.dates || rawExp.period || "") as string;
            return (
              <div key={i} className="entry-row">
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    marginBottom: 2,
                  }}>
                    {company}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                  }}>
                    {role}
                  </div>
                </div>
                {duration && (
                  <span style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    flexShrink: 0,
                  }}>
                    {duration}
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
            No experience listed.
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── LOADING SKELETON ────────────────────────────────────── */
function ProfileSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ display: "flex", gap: 40, paddingBottom: 40, borderBottom: "0.5px solid var(--border)" }}>
        <div style={{ flex: "0 0 240px" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--surface-2)", marginBottom: 16 }} />
          <div style={{ width: 180, height: 32, background: "var(--surface-2)", borderRadius: 6, marginBottom: 8 }} />
          <div style={{ width: 140, height: 14, background: "var(--surface-2)", borderRadius: 4, marginBottom: 16 }} />
          <div style={{ display: "flex", gap: 6 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 80, height: 26, background: "var(--surface-2)", borderRadius: 20 }} />)}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ width: 60, height: 11, background: "var(--surface-2)", borderRadius: 4, marginBottom: 14 }} />
          {[100, 90, 80].map((w, i) => (
            <div key={i} style={{ width: `${w}%`, height: 14, background: "var(--surface-2)", borderRadius: 4, marginBottom: 10 }} />
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "55fr 45fr", gap: 48 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[0,1,2].map(i => <div key={i} style={{ height: 100, background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 8 }} />)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {[0,1].map(i => <div key={i} style={{ height: 130, background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 8 }} />)}
        </div>
      </div>
    </div>
  );
}

/* ─── NO PROFILE STATE ────────────────────────────────────── */
function NoProfileState() {
  return (
    <div style={{ textAlign: "center", padding: "80px 40px", maxWidth: 420, margin: "0 auto" }}>
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: 28,
        color: "var(--text-primary)",
        letterSpacing: "-0.02em",
        marginBottom: 12,
        lineHeight: 1.2,
      }}>
        No profile found.
      </div>
      <div style={{
        fontFamily: "var(--font-body)",
        fontSize: 14,
        color: "var(--text-secondary)",
        lineHeight: 1.65,
        marginBottom: 28,
      }}>
        Upload your resume PDF and our AI will extract your skills, projects, and experience to build a comprehensive talent profile.
      </div>
      <Link
        href="/upload"
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          textDecoration: "none",
          fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500,
          color: "white", padding: "11px 24px", borderRadius: 8,
          background: "var(--accent)",
        }}
      >
        <Upload size={14} /> Upload Resume
      </Link>
    </div>
  );
}

/* ─── PAGE ─────────────────────────────────────────────────── */
export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [matchCount] = useState(3);

  const { ref: heroRef, visible: heroVisible } = useReveal(0);

  const fetchProfiles = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getProfiles();
      setAllProfiles(data || []);
      if (data?.length > 0) {
        const saved = localStorage.getItem("selectedProfileEmail");
        const matched = data.find((p: Profile) => p.email === saved);
        const selected = matched || data[data.length - 1];
        setProfile(selected);
        localStorage.setItem("selectedProfileEmail", selected.email);
      }
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfiles();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const initials = profile?.name
    ? profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "—";

  const firstName = profile?.name?.split(" ")[0] ?? "";

  const strengths = STRENGTH_DEFS.map(({ label, keys, dots }) => ({
    label,
    filled: profile ? computeStrength(profile.skills || [], keys, dots) : 0,
    total: dots,
  }));

  return (
    <AppShell title="Profile">
      {loading ? (
        <ProfileSkeleton />
      ) : error ? (
        <div style={{
          padding: "32px",
          background: "rgba(180,83,9,0.06)",
          borderRadius: 12,
          border: "0.5px solid rgba(180,83,9,0.2)",
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--accent-amber)",
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}>
          {error}
          <button
            onClick={fetchProfiles}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "none", border: "0.5px solid var(--border)",
              borderRadius: 6, padding: "5px 12px",
              fontFamily: "var(--font-body)", fontSize: 12,
              color: "var(--text-secondary)", cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      ) : !profile ? (
        <NoProfileState />
      ) : (
        <>
          {/* Toolbar */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginBottom: 32,
          }}>
            {allProfiles.length > 1 && (
              <div style={{
                position: "relative",
                background: "var(--surface)",
                border: "0.5px solid var(--border)",
                borderRadius: 8,
              }}>
                <select
                  value={profile.email}
                  onChange={(e) => {
                    const sel = allProfiles.find((p) => p.email === e.target.value);
                    if (sel) { setProfile(sel); localStorage.setItem("selectedProfileEmail", sel.email); }
                  }}
                  style={{
                    background: "transparent", border: "none", outline: "none",
                    padding: "7px 32px 7px 12px",
                    fontSize: 13, color: "var(--text-primary)",
                    cursor: "pointer", fontFamily: "var(--font-body)",
                    appearance: "none",
                  }}
                >
                  {allProfiles.map((p, i) => (
                    <option key={i} value={p.email}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown size={13} color="var(--text-muted)" style={{
                  position: "absolute", right: 10, top: "50%",
                  transform: "translateY(-50%)", pointerEvents: "none",
                }} />
              </div>
            )}
            <button
              onClick={fetchProfiles}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "var(--surface)", border: "0.5px solid var(--border)",
                borderRadius: 8, padding: "7px 14px",
                fontFamily: "var(--font-body)", fontSize: 13,
                color: "var(--text-secondary)", cursor: "pointer",
              }}
            >
              <RefreshCw size={13} /> Refresh
            </button>
            <Link href="/upload" style={{
              display: "flex", alignItems: "center", gap: 5,
              textDecoration: "none",
              fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
              color: "white", padding: "7px 16px", borderRadius: 8,
              background: "var(--accent)",
            }}>
              <Upload size={13} /> Upload New
            </Link>
          </div>

          {/* Zone 1 — Profile Hero */}
          <div
            ref={heroRef}
            className={`reveal profile-hero ${heroVisible ? "visible" : ""}`}
            style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 48 }}
          >
            {/* Left side */}
            <div style={{ width: 240, flexShrink: 0 }}>
              {/* Avatar */}
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent), var(--accent-cyan))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400,
                color: "white", marginBottom: 16,
              }}>
                {initials}
              </div>

              {/* Name */}
              <h1 style={{
                fontFamily: "var(--font-display)",
                fontSize: 30,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "var(--text-primary)",
                marginBottom: 6,
              }}>
                {firstName ? (
                  <>
                    <em>{firstName}</em>
                    {profile.name?.slice(firstName.length)}
                  </>
                ) : (
                  profile.name || "Profile"
                )}
              </h1>

              {/* Role line */}
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--text-muted)",
                marginBottom: 20,
                lineHeight: 1.4,
              }}>
                {profile.experience?.[0]
                  ? `${profile.experience[0].role || ((profile.experience[0] as Record<string, unknown>).title as string) || "Software Engineer"} · Open to work`
                  : profile.education?.[0]
                  ? `${profile.education[0].institution || ((profile.education[0] as Record<string, unknown>).school as string) || ((profile.education[0] as Record<string, unknown>).university as string) || "Student"} · Open to work`
                  : "Open to opportunities"}
              </p>

              {/* Contact */}
              {profile.email && (
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginBottom: 4,
                }}>
                  {profile.email}
                </p>
              )}

              {/* Strength pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
                {strengths.filter(s => s.filled > 0).map((s) => (
                  <StrengthPill key={s.label} label={s.label} filled={s.filled} total={s.total} />
                ))}
              </div>
            </div>

            {/* Right side — AI Summary */}
            <AiSummaryBlock profile={profile} />
          </div>

          {/* Zones 2 + 3 — Skills | Projects */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "55fr 45fr",
              gap: 56,
              marginBottom: 0,
            }}
            className="profile-grid"
          >
            {/* Zone 2 — Skills by group */}
            {profile.skills?.length ? (
              <SkillGroups skills={profile.skills} />
            ) : (
              <div>
                <div className="section-heading">Skills</div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
                  No skills parsed from this resume.
                </p>
              </div>
            )}

            {/* Zone 3 — Projects */}
            <div>
              <div className="section-heading">Projects</div>
              {profile.projects?.length ? (
                profile.projects.map((proj, i) => (
                  <ProjectBlock
                    key={i}
                    proj={proj}
                    index={i}
                    totalMatches={i < 2 ? matchCount : 0}
                  />
                ))
              ) : (
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  color: "var(--text-muted)",
                  fontStyle: "italic",
                }}>
                  No projects listed.
                </p>
              )}
            </div>
          </div>

          {/* Zone 4 — Education & Experience */}
          <EduExpSection profile={profile} />
        </>
      )}
    </AppShell>
  );
}
