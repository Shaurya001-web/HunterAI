"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";


export default function Home() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [navRaised, setNavRaised] = useState(false);
  const skillCanvasRef = useRef<HTMLCanvasElement>(null);
  const miniGraphRef = useRef<HTMLCanvasElement>(null);

  // Monitor scroll to raise navbar
  useEffect(() => {
    const handleScroll = () => {
      setNavRaised(window.scrollY > 32);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 1. Skill Canvas Animation
  useEffect(() => {
    const canvas = skillCanvasRef.current;
    if (!canvas) return;

    let rotation = 0;
    let scrollProgress = 0;
    let animationFrameId: number;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth * dpr;
      canvas.height = 420 * dpr;
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    const skills = [
      "React",
      "TypeScript",
      "Systems Design",
      "Node.js",
      "Leadership",
      "Data Modeling",
      "CI/CD",
      "Product",
      "Python",
    ];

    const ease = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    const calcProgress = () => {
      const section = document.getElementById("skill-section");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const wh = window.innerHeight;
      const raw = (wh - rect.top) / (wh + rect.height * 0.6);
      scrollProgress = Math.max(0, Math.min(1, raw * 1.5));
    };

    window.addEventListener("scroll", calcProgress, { passive: true });
    calcProgress();

    const draw = () => {
      if (!ctx || !canvas) return;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const p = ease(scrollProgress);
      const cx = w * 0.5;
      const cy = h * 0.5;
      const orbitR = Math.min(w, h) * 0.32 * Math.min(1, p * 2.5);
      const coreR = 14 * Math.min(1, p * 3.5);
      const opacity = Math.max(0, (p - 0.05) * 1.4);
      const netOpacity = Math.max(0, (p - 0.6) * 3.5);

      // Core node
      if (coreR > 0) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.5);
        g.addColorStop(0, `rgba(184,164,245,${0.18 * opacity})`);
        g.addColorStop(1, "rgba(184,164,245,0)");
        ctx.beginPath();
        ctx.arc(cx, cy, coreR * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184,164,245,${opacity})`;
        ctx.fill();
      }

      // Orbit ring
      if (opacity > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(184,164,245,${0.08 * opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      const pts: { x: number; y: number }[] = [];
      skills.forEach((label, i) => {
        const angle = (i / skills.length) * Math.PI * 2 + rotation;
        const sx = cx + orbitR * Math.cos(angle);
        const sy = cy + orbitR * Math.sin(angle);
        pts.push({ x: sx, y: sy });

        if (opacity <= 0) return;

        // Spoke
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgba(184,164,245,${0.08 * opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Node halo
        const ng = ctx.createRadialGradient(sx, sy, 0, sx, sy, 10);
        ng.addColorStop(0, `rgba(184,164,245,${0.22 * opacity})`);
        ng.addColorStop(1, "rgba(184,164,245,0)");
        ctx.beginPath();
        ctx.arc(sx, sy, 10, 0, Math.PI * 2);
        ctx.fillStyle = ng;
        ctx.fill();

        // Node dot
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184,164,245,${opacity * 0.85})`;
        ctx.fill();

        // Label
        ctx.font = `300 12px 'DM Sans',sans-serif`;
        ctx.fillStyle = `rgba(255,255,255,${0.38 * opacity})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const lx = cx + (orbitR + 26) * Math.cos(angle);
        const ly = cy + (orbitR + 26) * Math.sin(angle);
        ctx.fillText(label, lx, ly);
      });

      // Network edges
      if (netOpacity > 0 && pts.length === skills.length) {
        [[0, 2], [1, 4], [2, 5], [3, 7], [4, 8], [0, 6], [1, 3]].forEach(
          ([a, b]) => {
            const pa = pts[a];
            const pb = pts[b];
            if (!pa || !pb) return;
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.strokeStyle = `rgba(13,148,136,${0.2 * netOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        );
      }

      rotation += 0.0018;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", calcProgress);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 2. Mini Graph Canvas Animation
  useEffect(() => {
    const canvas = miniGraphRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const nodes = [
      { x: 30, y: 64 },
      { x: 76, y: 28 },
      { x: 120, y: 64 },
      { x: 76, y: 100 },
      { x: 176, y: 36 },
      { x: 176, y: 92 },
      { x: 220, y: 64 },
    ];
    const edges = [
      [0, 1],
      [0, 3],
      [1, 2],
      [2, 3],
      [1, 4],
      [4, 6],
      [5, 6],
      [2, 5],
      [3, 5],
    ];
    let t = 0;
    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, 240, 128);
      edges.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(nodes[a].x, nodes[a].y);
        ctx.lineTo(nodes[b].x, nodes[b].y);
        ctx.strokeStyle = "rgba(108,79,224,0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      nodes.forEach((n, i) => {
        const pulse = 0.75 + 0.25 * Math.sin(t * 1.8 + i * 0.9);
        const r = 5 * pulse;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.2);
        g.addColorStop(0, `rgba(108,79,224,${0.22 * pulse})`);
        g.addColorStop(1, "rgba(108,79,224,0)");
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(108,79,224,${0.55 * pulse})`;
        ctx.fill();
      });
      t += 0.018;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // 3. Scroll Reveal Intersection Observer
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    // Word wrapper for scroll word reveal
    const wrapWords = (el: HTMLElement) => {
      if (el.dataset.wrapped) return;
      el.dataset.wrapped = "1";
      const nodes: { node: ChildNode; frag: DocumentFragment }[] = [];
      el.childNodes.forEach((node) => {
        if (node.nodeType === 3) {
          // text node
          const frag = document.createDocumentFragment();
          node.textContent?.split(/(\s+)/).forEach((part) => {
            if (!part.trim()) {
              frag.appendChild(document.createTextNode(part));
              return;
            }
            const s = document.createElement("span");
            s.className = "word";
            s.textContent = part;
            frag.appendChild(s);
          });
          nodes.push({ node, frag });
        } else if (node.nodeType === 1) {
          // element (e.g. <em>)
          const element = node as HTMLElement;
          const inner = element.textContent || "";
          element.innerHTML = inner
            .split(/(\s+)/)
            .map((p) => (p.trim() ? `<span class="word">${p}</span>` : p))
            .join("");
        }
      });
      nodes.forEach(({ node, frag }) => el.replaceChild(frag, node));
    };

    const swObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          wrapWords(el);
          el.classList.add("running");
          el.querySelectorAll(".word").forEach((w, i) => {
            setTimeout(() => w.classList.add("in"), 60 + i * 68);
          });
          swObs.unobserve(el);
        });
      },
      { threshold: 0.18 }
    );

    document.querySelectorAll(".sw").forEach((el) => swObs.observe(el));

    return () => {
      io.disconnect();
      swObs.disconnect();
    };
  }, []);

  const heroLines = [
    [
      { text: "Your", italic: false },
      { text: "resume,", italic: false },
      { text: "understood.", italic: false },
    ],
    [
      { text: "Your", italic: true },
      { text: "potential,", italic: true },
      { text: "matched.", italic: true },
    ]
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :root {
          --cream: #f7f6f3;
          --cream-2: #f0efe9;
          --cream-3: #e8e6df;
          --cream-4: #dddbd2;
          --ink: #0C1618;
          --ink-2: #111D1F;
          --ink-3: #162527;
          --ink-4: #192729;
          --ink-5: #1C2B2E;
          --purple: #588B8B;
          --purple-light: #6A9E9E;
          --purple-mid: #497B7B;
          --purple-dim: rgba(88,139,139,0.08);
          --cyan: #588B8B;
          --cyan-light: #6A9E9E;
          --white: #ffffff;
          --r-sm: 6px;
          --r-md: 12px;
          --r-lg: 20px;
          --r-xl: 28px;
          --ease: cubic-bezier(0.22, 1, 0.36, 1);
          --ease-spring: cubic-bezier(0.34, 1.36, 0.64, 1);
        }

        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--cream);
          color: var(--ink);
          overflow-x: hidden;
          line-height: 1.6;
        }

        /* ── SCROLL REVEAL ── */
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.9s var(--ease), transform 0.9s var(--ease);
        }
        .reveal.in {
          opacity: 1;
          transform: none;
        }
        .reveal.d1 { transition-delay: 0.08s; }
        .reveal.d2 { transition-delay: 0.16s; }
        .reveal.d3 { transition-delay: 0.24s; }
        .reveal.d4 { transition-delay: 0.32s; }

        /* Scroll word reveal */
        .sw .word {
          display: inline-block;
          opacity: 0;
          transform: translateY(14px);
          filter: blur(3px);
          transition: none;
        }
        .sw.running .word {
          transition: opacity 0.6s var(--ease), transform 0.6s var(--ease), filter 0.5s var(--ease);
        }
        .sw.running .word.in {
          opacity: 1;
          transform: none;
          filter: none;
        }

        /* Word in for Hero H1 */
        @keyframes wordIn {
          from { opacity: 0; transform: translateY(28px); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .hero-h1 .word {
          display: inline-block;
          margin-right: 0.22em;
          opacity: 0;
          animation: wordIn 0.8s both var(--ease);
          will-change: transform, opacity, filter;
        }
      `}</style>

      {/* NAV */}
      <nav
        id="nav"
        className={navRaised ? "raised" : ""}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          height: 60,
          padding: "0 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: navRaised ? "rgba(247,246,243,0.88)" : "transparent",
          backdropFilter: navRaised ? "blur(20px) saturate(160%)" : "none",
          WebkitBackdropFilter: navRaised ? "blur(20px) saturate(160%)" : "none",
          borderBottom: navRaised
            ? "0.5px solid rgba(24,24,26,0.07)"
            : "0.5px solid transparent",
          transition:
            "background 0.5s var(--ease), border-color 0.5s var(--ease)",
        }}
      >
        <div
          className="nav-logo"
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 19,
            letterSpacing: "-0.01em",
            color: "var(--ink)",
          }}
        >
          Hunter<em style={{ fontStyle: "italic", color: "var(--purple)" }}>AI</em>
        </div>
        <div className="nav-links" style={{ display: "flex", gap: 36 }}>
          <a
            href="#how"
            style={{
              fontSize: 13.5,
              fontWeight: 400,
              color: "var(--ink-3)",
              textDecoration: "none",
              transition: "color 0.2s",
              letterSpacing: "0.01em",
            }}
          >
            How it works
          </a>
          <a
            href="#features"
            style={{
              fontSize: 13.5,
              fontWeight: 400,
              color: "var(--ink-3)",
              textDecoration: "none",
              transition: "color 0.2s",
              letterSpacing: "0.01em",
            }}
          >
            Features
          </a>
          <a
            href="#proof"
            style={{
              fontSize: 13.5,
              fontWeight: 400,
              color: "var(--ink-3)",
              textDecoration: "none",
              transition: "color 0.2s",
              letterSpacing: "0.01em",
            }}
          >
            Stories
          </a>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {(!user || user.isGuest) ? (
            <>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "8px 18px",
                  background: "transparent",
                  color: "var(--ink)",
                  border: "1px solid var(--cream-4)",
                  borderRadius: 999,
                  cursor: "pointer",
                  transition: "opacity 0.2s, transform 0.2s",
                  letterSpacing: "0.01em",
                }}
              >
                Sign in
              </button>
              <Link href="/upload">
                <button
                  className="nav-pill"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "8px 22px",
                    background: "var(--ink)",
                    color: "var(--white)",
                    border: "none",
                    borderRadius: 999,
                    cursor: "pointer",
                    transition: "opacity 0.2s, transform 0.2s",
                    letterSpacing: "0.01em",
                  }}
                >
                  Get started
                </button>
              </Link>
            </>
          ) : (
            <Link href="/dashboard">
              <button
                className="nav-pill"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "8px 22px",
                  background: "var(--purple)",
                  color: "var(--white)",
                  border: "none",
                  borderRadius: 999,
                  cursor: "pointer",
                  transition: "opacity 0.2s, transform 0.2s",
                  letterSpacing: "0.01em",
                }}
              >
                Go to Dashboard
              </button>
            </Link>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section
        id="hero"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "100px 40px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="hero-noise"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: 256,
          }}
        />
        <div
          className="hero-glow"
          style={{
            position: "absolute",
            top: "-10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            height: "70%",
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(108,79,224,0.09) 0%, transparent 65%)",
          }}
        />



        <h1
          className="hero-h1"
          id="hero-h1"
          style={{
            fontFamily: "var(--font-display, 'Outfit', 'Inter', sans-serif)",
            fontSize: "clamp(37px, 5vw, 73px)",
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            wordSpacing: "0.05em",
            color: "var(--ink)",
            maxWidth: "100%",
            margin: "0 auto 32px",
            whiteSpace: "nowrap",
          }}
        >
          {heroLines.map((line, lineIdx) => {
            return (
              <span key={lineIdx} style={{ display: "block" }}>
                {line.map((wordObj, wordIdx) => {
                  // Calculate sequential delay:
                  // line 0: 0, 1, 2
                  // line 1: 3, 4, 5
                  const globalIdx = lineIdx * 3 + wordIdx;
                  const delay = (0.1 + globalIdx * 0.1).toFixed(2);
                  if (wordObj.italic) {
                    return (
                      <em
                        key={wordIdx}
                        className="word"
                        style={{
                          fontStyle: "italic",
                          color: "var(--purple)",
                          animationDelay: `${delay}s`,
                        }}
                      >
                        {wordObj.text}
                      </em>
                    );
                  }
                  return (
                    <span
                      key={wordIdx}
                      className="word"
                      style={{ animationDelay: `${delay}s` }}
                    >
                      {wordObj.text}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </h1>

        <p
          className="hero-sub"
          style={{
            fontSize: "clamp(16px,2vw,19px)",
            color: "var(--ink-3)",
            maxWidth: 480,
            margin: "0 auto 52px",
            fontWeight: 300,
            lineHeight: 1.65,
          }}
        >
          Upload your resume once. Our AI extracts every skill, maps your
          potential, and surfaces the roles that actually fit — across every
          platform, simultaneously.
        </p>

        <div
          className="hero-actions"
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 88,
          }}
        >
          <Link href="/upload">
            <button
              className="btn-dark"
              style={{
                fontSize: 15,
                fontWeight: 500,
                padding: "13px 30px",
                background: "var(--ink)",
                color: "var(--white)",
                border: "none",
                borderRadius: 999,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "opacity 0.2s, transform 0.25s var(--ease)",
              }}
            >
              Upload your resume
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M2 6.5h9M7 2l4.5 4.5L7 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Link>
          {(!user || user.isGuest) && (
            <button
              className="btn-ghost"
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                fontSize: 15,
                fontWeight: 500,
                padding: "13px 30px",
                background: "transparent",
                color: "var(--ink-2)",
                border: "0.5px solid var(--cream-4)",
                borderRadius: 999,
                cursor: "pointer",
                transition: "border-color 0.2s, color 0.2s",
              }}
            >
              Sign In
            </button>
          )}
          <button
            className="btn-ghost"
            onClick={() =>
              document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })
            }
            style={{
              fontSize: 15,
              fontWeight: 400,
              padding: "13px 30px",
              background: "transparent",
              color: "var(--ink-2)",
              border: "0.5px solid var(--cream-4)",
              borderRadius: 999,
              cursor: "pointer",
              transition: "border-color 0.2s, color 0.2s",
            }}
          >
            See how it works
          </button>
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>


      </section>

      <hr
        className="divider"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          border: "none",
          borderTop: "0.5px solid var(--cream-3)",
        }}
      />

      {/* HOW IT WORKS */}
      <div
        className="section"
        id="how"
        style={{
          padding: "112px 48px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <p className="eyebrow reveal" style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.11em",
          textTransform: "uppercase",
          color: "var(--ink-4)",
          marginBottom: 18,
        }}>Process</p>
        <h2
          className="how-heading sw reveal"
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(34px,4.5vw,52px)",
            fontWeight: 400,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            maxWidth: 520,
            marginBottom: 68,
          }}
        >
          Three steps to your <em>perfect</em> match
        </h2>
        <div
          className="steps-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            border: "0.5px solid var(--cream-3)",
            borderRadius: "var(--r-lg)",
            overflow: "hidden",
          }}
        >
          <div className="step reveal d1" style={{ padding: "44px 40px", background: "var(--white)", borderRight: "0.5px solid var(--cream-3)" }}>
            <div
              className="step-num"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 44,
                fontStyle: "italic",
                color: "var(--cream-4)",
                lineHeight: 1,
                marginBottom: 28,
              }}
            >
              01
            </div>
            <div
              className="step-title"
              style={{ fontSize: 16, fontWeight: 500, marginBottom: 10, letterSpacing: "-0.005em" }}
            >
              Upload once
            </div>
            <div style={{ fontSize: 13.5, color: "var(--ink-3)", lineHeight: 1.7 }}>
              Drop your resume in any format. PDF, Word, plain text — we handle them
              all. One upload is all it takes to begin.
            </div>
          </div>
          <div className="step reveal d2" style={{ padding: "44px 40px", background: "var(--white)", borderRight: "0.5px solid var(--cream-3)" }}>
            <div
              className="step-num"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 44,
                fontStyle: "italic",
                color: "var(--cream-4)",
                lineHeight: 1,
                marginBottom: 28,
              }}
            >
              02
            </div>
            <div
              className="step-title"
              style={{ fontSize: 16, fontWeight: 500, marginBottom: 10, letterSpacing: "-0.005em" }}
            >
              AI extracts context
            </div>
            <div style={{ fontSize: 13.5, color: "var(--ink-3)", lineHeight: 1.7 }}>
              Our model reads beyond keywords. It understands your trajectory, infers
              hidden strengths, and builds a complete skill graph from your experience.
            </div>
          </div>
          <div className="step reveal d3" style={{ padding: "44px 40px", background: "var(--white)" }}>
            <div
              className="step-num"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 44,
                fontStyle: "italic",
                color: "var(--cream-4)",
                lineHeight: 1,
                marginBottom: 28,
              }}
            >
              03
            </div>
            <div
              className="step-title"
              style={{ fontSize: 16, fontWeight: 500, marginBottom: 10, letterSpacing: "-0.005em" }}
            >
              Match everywhere
            </div>
            <div style={{ fontSize: 13.5, color: "var(--ink-3)", lineHeight: 1.7 }}>
              Your profile propagates across 340+ platforms simultaneously. Relevant
              roles find you — ranked by true fit, not keyword overlap.
            </div>
          </div>
        </div>
      </div>

      <hr
        className="divider"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          border: "none",
          borderTop: "0.5px solid var(--cream-3)",
        }}
      />

      {/* DARK BAND — Skill Extraction */}
      <div
        className="dark-band"
        id="skill-section"
        style={{ background: "var(--ink)", padding: "104px 0", position: "relative", overflow: "hidden" }}
      >
        <div className="dark-band-inner" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px" }}>
          <p
            className="dark-eyebrow reveal"
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.11em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)",
              marginBottom: 18,
            }}
          >
            Intelligence
          </p>
          <h2
            className="dark-heading sw reveal"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(34px,4.5vw,52px)",
              fontWeight: 400,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: "var(--white)",
              maxWidth: 560,
              marginBottom: 20,
            }}
          >
            Contextual <em>skill</em> extraction
          </h2>
          <p
            className="dark-sub reveal"
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.35)",
              maxWidth: 420,
              fontWeight: 300,
              marginBottom: 68,
            }}
          >
            Your resume holds more than you wrote. Watch our AI surface what matters.
          </p>
        </div>
        <canvas
          id="skill-canvas"
          ref={skillCanvasRef}
          style={{ width: "100%", height: 420, display: "block" }}
        />
        <div
          className="dark-thirds"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 32,
            marginTop: 56,
            padding: "0 48px",
            maxWidth: 1100,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <div className="reveal d1">
            <p
              className="dark-third-title"
              style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}
            >
              Deep reading
            </p>
            <p className="dark-third-body" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>
              Understands accomplishment language, not just job titles and keywords.
            </p>
          </div>
          <div className="reveal d2">
            <p
              className="dark-third-title"
              style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}
            >
              Trajectory inference
            </p>
            <p className="dark-third-body" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>
              Maps your career arc to predict where you&apos;re heading, not just where
              you&apos;ve been.
            </p>
          </div>
          <div className="reveal d3">
            <p
              className="dark-third-title"
              style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}
            >
              Latent skill detection
            </p>
            <p className="dark-third-body" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>
              Surfaces transferable skills you never thought to list on a resume.
            </p>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div
        className="section"
        id="features"
        style={{ padding: "112px 48px", maxWidth: 1100, margin: "0 auto" }}
      >
        <p className="eyebrow reveal" style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.11em",
          textTransform: "uppercase",
          color: "var(--ink-4)",
          marginBottom: 18,
        }}>Platform</p>
        <h2
          className="feat-heading sw reveal"
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(34px,4.5vw,52px)",
            fontWeight: 400,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            maxWidth: 580,
            marginBottom: 56,
          }}
        >
          Everything you need to land <em>faster</em>
        </h2>

        <div className="feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
          <div className="feat-card reveal d1" style={{ background: "var(--white)", border: "0.5px solid var(--cream-3)", borderRadius: "var(--r-lg)", padding: 36 }}>
            <div
              className="feat-icon"
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--r-sm)",
                background: "var(--cream-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                marginBottom: 24,
                color: "var(--ink-3)",
              }}
            >
              ◎
            </div>
            <div
              className="feat-title"
              style={{ fontSize: 16, fontWeight: 500, marginBottom: 8, letterSpacing: "-0.005em" }}
            >
              Universal profile
            </div>
            <div className="feat-body" style={{ fontSize: 13.5, color: "var(--ink-3)", lineHeight: 1.7 }}>
              One intelligent profile that speaks every platform&apos;s language. No more
              reformatting for LinkedIn, Indeed, Greenhouse, or Lever.
            </div>
            <div
              className="feat-pill"
              style={{
                display: "inline-block",
                marginTop: 18,
                fontSize: 10.5,
                fontWeight: 500,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: 999,
                background: "var(--purple-light)",
                color: "var(--purple)",
              }}
            >
              Core
            </div>
          </div>

          <div className="feat-card reveal d2" style={{ background: "var(--white)", border: "0.5px solid var(--cream-3)", borderRadius: "var(--r-lg)", padding: 36 }}>
            <div
              className="feat-icon"
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--r-sm)",
                background: "var(--cream-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                marginBottom: 24,
                color: "var(--ink-3)",
              }}
            >
              ⟐
            </div>
            <div
              className="feat-title"
              style={{ fontSize: 16, fontWeight: 500, marginBottom: 8, letterSpacing: "-0.005em" }}
            >
              Match scoring
            </div>
            <div className="feat-body" style={{ fontSize: 13.5, color: "var(--ink-3)", lineHeight: 1.7 }}>
              Every listing gets a match score built from 40+ signals — true role
              alignment and cultural fit, not keyword overlap.
            </div>
            <div
              className="feat-pill"
              style={{
                display: "inline-block",
                marginTop: 18,
                fontSize: 10.5,
                fontWeight: 500,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: 999,
                background: "var(--cyan-light)",
                color: "var(--cyan)",
              }}
            >
              AI-powered
            </div>
          </div>

          <div className="feat-card wide reveal d1" style={{ gridColumn: "span 2", background: "var(--white)", border: "0.5px solid var(--cream-3)", borderRadius: "var(--r-lg)", padding: 36 }}>
            <div className="wide-inner" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
              <div>
                <div
                  className="feat-icon"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--r-sm)",
                    background: "var(--cream-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    marginBottom: 24,
                    color: "var(--ink-3)",
                  }}
                >
                  ⬡
                </div>
                <div
                  className="feat-title"
                  style={{ fontSize: 16, fontWeight: 500, marginBottom: 8, letterSpacing: "-0.005em" }}
                >
                  Skill graph
                </div>
                <div className="feat-body" style={{ fontSize: 13.5, color: "var(--ink-3)", lineHeight: 1.7 }}>
                  A live, evolving knowledge graph of your professional identity. See
                  how your skills cluster, where they overlap, and which gaps are worth
                  closing for your target roles.
                </div>
                <div
                  className="feat-pill"
                  style={{
                    display: "inline-block",
                    marginTop: 18,
                    fontSize: 10.5,
                    fontWeight: 500,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "#fff3e0",
                    color: "#c47400",
                  }}
                >
                  New
                </div>
              </div>
              <div
                className="graph-preview"
                style={{
                  background: "var(--cream)",
                  borderRadius: "var(--r-md)",
                  height: 148,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <canvas id="mini-graph" ref={miniGraphRef} width="240" height="128" />
              </div>
            </div>
          </div>

          <div className="feat-card reveal d2" style={{ background: "var(--white)", border: "0.5px solid var(--cream-3)", borderRadius: "var(--r-lg)", padding: 36 }}>
            <div
              className="feat-icon"
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--r-sm)",
                background: "var(--cream-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                marginBottom: 24,
                color: "var(--ink-3)",
              }}
            >
              ↗
            </div>
            <div
              className="feat-title"
              style={{ fontSize: 16, fontWeight: 500, marginBottom: 8, letterSpacing: "-0.005em" }}
            >
              Auto-apply queue
            </div>
            <div className="feat-body" style={{ fontSize: 13.5, color: "var(--ink-3)", lineHeight: 1.7 }}>
              Set your criteria and pace. HunterAI applies intelligently — only to
              roles above your match threshold, with your preferred messaging.
            </div>
          </div>

          <div className="feat-card reveal d3" style={{ background: "var(--white)", border: "0.5px solid var(--cream-3)", borderRadius: "var(--r-lg)", padding: 36 }}>
            <div
              className="feat-icon"
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--r-sm)",
                background: "var(--cream-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                marginBottom: 24,
                color: "var(--ink-3)",
              }}
            >
              ◷
            </div>
            <div
              className="feat-title"
              style={{ fontSize: 16, fontWeight: 500, marginBottom: 8, letterSpacing: "-0.005em" }}
            >
              Real-time alerts
            </div>
            <div className="feat-body" style={{ fontSize: 13.5, color: "var(--ink-3)", lineHeight: 1.7 }}>
              The moment a fitting role appears, you hear about it first. Speed matters
              — top candidates apply within hours, not days.
            </div>
          </div>
        </div>
      </div>

      <hr
        className="divider"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          border: "none",
          borderTop: "0.5px solid var(--cream-3)",
        }}
      />

      {/* TESTIMONIALS */}
      <div className="proof-band" id="proof" style={{ background: "var(--cream-2)", padding: "100px 48px" }}>
        <div className="proof-inner" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p className="eyebrow reveal" style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.11em",
            textTransform: "uppercase",
            color: "var(--ink-4)",
            marginBottom: 18,
          }}>Stories</p>
          <h2
            className="proof-heading sw reveal"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(34px,4.5vw,52px)",
              fontWeight: 400,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              marginBottom: 0,
            }}
          >
            From people who <em>landed</em>
          </h2>
          <div className="testi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 52 }}>
            <div className="testi reveal d1" style={{ background: "var(--white)", border: "0.5px solid var(--cream-3)", borderRadius: "var(--r-lg)", padding: 32 }}>
              <p
                className="testi-quote"
                style={{ fontSize: 14, lineHeight: 1.75, color: "var(--ink-3)", marginBottom: 28 }}
              >
                &quot;I uploaded my resume on a Tuesday. By Thursday I had three
                first-round interviews at companies I&apos;d been trying to reach for
                months. The match quality is unlike anything I&apos;ve seen.&quot;
              </p>
              <div className="testi-author" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  className="testi-avatar"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,var(--purple) 0%,var(--cyan) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--white)",
                    flexShrink: 0,
                    letterSpacing: "0.04em",
                  }}
                >
                  SL
                </div>
                <div>
                  <div className="testi-name" style={{ fontSize: 13, fontWeight: 500, marginBottom: 1 }}>Sarah L.</div>
                  <div className="testi-role" style={{ fontSize: 12, color: "var(--ink-4)" }}>Product Manager → Stripe</div>
                </div>
              </div>
            </div>
            <div className="testi reveal d2" style={{ background: "var(--white)", border: "0.5px solid var(--cream-3)", borderRadius: "var(--r-lg)", padding: 32 }}>
              <p
                className="testi-quote"
                style={{ fontSize: 14, lineHeight: 1.75, color: "var(--ink-3)", marginBottom: 28 }}
              >
                &quot;HunterAI found a role that didn&apos;t even look right on paper but
                matched my actual trajectory perfectly. I wouldn&apos;t have applied on my
                own. I start in two weeks.&quot;
              </p>
              <div className="testi-author" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  className="testi-avatar"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,var(--purple) 0%,var(--cyan) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--white)",
                    flexShrink: 0,
                    letterSpacing: "0.04em",
                  }}
                >
                  MK
                </div>
                <div>
                  <div className="testi-name" style={{ fontSize: 13, fontWeight: 500, marginBottom: 1 }}>Marcus K.</div>
                  <div className="testi-role" style={{ fontSize: 12, color: "var(--ink-4)" }}>Backend Engineer → Vercel</div>
                </div>
              </div>
            </div>
            <div className="testi reveal d3" style={{ background: "var(--white)", border: "0.5px solid var(--cream-3)", borderRadius: "var(--r-lg)", padding: 32 }}>
              <p
                className="testi-quote"
                style={{ fontSize: 14, lineHeight: 1.75, color: "var(--ink-3)", marginBottom: 28 }}
              >
                &quot;The skill graph was revelatory. I didn&apos;t know I had a pattern that
                screamed &apos;growth lead&apos; until the AI surfaced it. Now I&apos;m six months
                into that exact role.&quot;
              </p>
              <div className="testi-author" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  className="testi-avatar"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,var(--purple) 0%,var(--cyan) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--white)",
                    flexShrink: 0,
                    letterSpacing: "0.04em",
                  }}
                >
                  AP
                </div>
                <div>
                  <div className="testi-name" style={{ fontSize: 13, fontWeight: 500, marginBottom: 1 }}>Anya P.</div>
                  <div className="testi-role" style={{ fontSize: 12, color: "var(--ink-4)" }}>Operations → Growth Lead, Linear</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <section
        id="cta"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          background: "var(--ink)",
          position: "relative",
          overflow: "hidden",
          padding: "100px 48px",
        }}
      >
        <div
          className="cta-ambient"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 60% 55% at 25% 40%, rgba(108,79,224,0.14) 0%, transparent 65%), radial-gradient(ellipse 50% 45% at 78% 62%, rgba(13,148,136,0.08) 0%, transparent 60%)",
          }}
        />
        <div
          className="cta-noise"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: 256,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <p
            className="cta-eyebrow reveal"
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.11em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.22)",
              marginBottom: 40,
            }}
          >
            Your next chapter
          </p>
          <h2
            className="cta-h2 sw reveal"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(52px,9vw,104px)",
              fontWeight: 400,
              lineHeight: 0.98,
              letterSpacing: "-0.03em",
              color: "var(--white)",
              marginBottom: 12,
            }}
          >
            Start your <em>journey.</em>
          </h2>
          <h3
            className="cta-h3 reveal"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(22px,3.5vw,40px)",
              fontWeight: 400,
              fontStyle: "italic",
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "-0.02em",
              marginBottom: 64,
            }}
          >
            Upload once. Match everywhere.
          </h3>
          <Link href="/upload">
            <button
              className="cta-btn reveal"
              style={{
                fontSize: 16,
                fontWeight: 500,
                padding: "16px 42px",
                background: "var(--white)",
                color: "var(--ink)",
                border: "none",
                borderRadius: 999,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                transition: "opacity 0.2s, transform 0.25s var(--ease), box-shadow 0.25s",
              }}
            >
              Upload your resume
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 7h10M7 2l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Link>
          <p
            className="cta-fine reveal d1"
            style={{ marginTop: 24, fontSize: 12.5, color: "rgba(255,255,255,0.2)" }}
          >
            Free to start · No credit card required · Results in under 60 seconds
          </p>
        </div>
      </section>

      <footer
        style={{
          background: "var(--ink)",
          borderTop: "0.5px solid rgba(255,255,255,0.05)",
          padding: "36px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          className="footer-logo"
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 16,
            color: "rgba(255,255,255,0.35)",
          }}
        >
          Hunter<em style={{ fontStyle: "italic", color: "rgba(184,164,245,0.6)" }}>AI</em>
        </div>
        <div
          className="footer-copy"
          style={{ fontSize: 12, color: "rgba(255,255,255,0.15)" }}
        >
          © 2025 HunterAI Inc. All rights reserved.
        </div>
      </footer>
    </>
  );
}
