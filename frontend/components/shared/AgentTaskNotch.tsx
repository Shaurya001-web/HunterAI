"use client";

import { useEffect, useState } from "react";
import { Bot, Sparkles, FileText, Zap, ChevronUp } from "lucide-react";

export interface AgentTaskStats {
  resumesParsed: number;
  resumesTailored: number;
  matchesEvaluated: number;
  currentTask: string | null;
}

const STORAGE_KEY = "hunter_agent_task_stats_v2";

export function AgentTaskNotch() {
  const [stats, setStats] = useState<AgentTaskStats>({
    resumesParsed: 0,
    resumesTailored: 0,
    matchesEvaluated: 0,
    currentTask: null,
  });
  const [expanded, setExpanded] = useState(false);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    // Clear legacy mock key if present
    localStorage.removeItem("hunter_agent_task_stats");

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setStats(JSON.parse(saved));
      } catch (e) {}
    } else {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          resumesParsed: 0,
          resumesTailored: 0,
          matchesEvaluated: 0,
          currentTask: null,
        })
      );
    }

    const handleTaskEvent = (e: CustomEvent<{ taskType: string; label?: string }>) => {
      const { taskType, label } = e.detail;
      setPulsing(true);

      setStats((prev) => {
        const next = { ...prev, currentTask: label || "Processing task..." };
        if (taskType === "parse") next.resumesParsed += 1;
        if (taskType === "tailor") next.resumesTailored += 1;
        if (taskType === "match") next.matchesEvaluated += 1;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });

      setTimeout(() => {
        setStats((prev) => ({ ...prev, currentTask: null }));
        setPulsing(false);
      }, 3000);
    };

    window.addEventListener("agent-task" as any, handleTaskEvent);
    return () => window.removeEventListener("agent-task" as any, handleTaskEvent);
  }, []);

  const totalCompleted = stats.resumesParsed + stats.resumesTailored + stats.matchesEvaluated;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "auto",
        userSelect: "none"
      }}
    >
      {/* Expanded Popover Details - Light Glassmorphic Theme */}
      {expanded && (
        <div
          style={{
            marginBottom: "10px",
            background: "rgba(251, 251, 250, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(5, 5, 5, 0.12)",
            borderRadius: "20px",
            padding: "18px 22px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
            color: "#050505",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            minWidth: "320px",
            animation: "notchSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(5, 5, 5, 0.08)", paddingBottom: "10px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#050505", display: "flex", alignItems: "center", gap: "6px" }}>
              <Bot size={15} color="#050505" /> AI Agent Activity
            </span>
            <span style={{ fontSize: "11px", fontWeight: 600, background: "rgba(5, 5, 5, 0.06)", padding: "3px 9px", borderRadius: "10px", color: "#535351" }}>
              {totalCompleted} Tasks Run
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", textAlign: "center" }}>
            <div style={{ background: "rgba(5, 5, 5, 0.03)", border: "1px solid rgba(5, 5, 5, 0.06)", borderRadius: "14px", padding: "12px 8px" }}>
              <FileText size={16} color="#050505" style={{ margin: "0 auto 4px auto", opacity: 0.8 }} />
              <p style={{ fontSize: "20px", fontWeight: 800, margin: 0, fontFamily: "var(--font-display)", color: "#050505", letterSpacing: "-0.03em" }}>{stats.resumesParsed}</p>
              <p style={{ fontSize: "10.5px", fontWeight: 500, color: "#8f8f8d", margin: "2px 0 0" }}>Resumes Parsed</p>
            </div>

            <div style={{ background: "rgba(5, 5, 5, 0.03)", border: "1px solid rgba(5, 5, 5, 0.06)", borderRadius: "14px", padding: "12px 8px" }}>
              <Sparkles size={16} color="#050505" style={{ margin: "0 auto 4px auto", opacity: 0.8 }} />
              <p style={{ fontSize: "20px", fontWeight: 800, margin: 0, fontFamily: "var(--font-display)", color: "#050505", letterSpacing: "-0.03em" }}>{stats.resumesTailored}</p>
              <p style={{ fontSize: "10.5px", fontWeight: 500, color: "#8f8f8d", margin: "2px 0 0" }}>Tailored Resumes</p>
            </div>

            <div style={{ background: "rgba(5, 5, 5, 0.03)", border: "1px solid rgba(5, 5, 5, 0.06)", borderRadius: "14px", padding: "12px 8px" }}>
              <Zap size={16} color="#050505" style={{ margin: "0 auto 4px auto", opacity: 0.8 }} />
              <p style={{ fontSize: "20px", fontWeight: 800, margin: 0, fontFamily: "var(--font-display)", color: "#050505", letterSpacing: "-0.03em" }}>{stats.matchesEvaluated}</p>
              <p style={{ fontSize: "10.5px", fontWeight: 500, color: "#8f8f8d", margin: "2px 0 0" }}>Matches Scored</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Center Pill Notch */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "9px 18px",
          borderRadius: "9999px",
          background: "rgba(251, 251, 250, 0.92)",
          backdropFilter: "blur(20px)",
          border: pulsing ? "1.5px solid #050505" : "1px solid rgba(5, 5, 5, 0.12)",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)",
          color: "#050505",
          cursor: "pointer",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: expanded ? "scale(1.02)" : "scale(1)"
        }}
      >
        {/* Status Indicator Dot */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: stats.currentTask ? "#050505" : "#10B981",
              boxShadow: stats.currentTask ? "0 0 6px rgba(5,5,5,0.4)" : "0 0 6px rgba(16,185,129,0.5)"
            }}
          />
        </div>

        {/* Text Details */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontWeight: 600, color: "#050505" }}>
          {stats.currentTask ? (
            <span style={{ color: "#050505", display: "flex", alignItems: "center", gap: "6px" }}>
              <Zap size={13} color="#050505" /> {stats.currentTask}
            </span>
          ) : totalCompleted === 0 ? (
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#050505" }}>
              <Bot size={14} color="#050505" />
              <span>Agent Ready</span>
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#050505" }}>
              <Bot size={14} color="#050505" />
              <span>Agent Active</span>
              <span style={{ opacity: 0.25 }}>|</span>
              <span style={{ fontWeight: 700 }}>{stats.resumesParsed}</span> <span style={{ color: "#535351", fontWeight: 500 }}>Parsed</span>
              <span style={{ opacity: 0.25 }}>·</span>
              <span style={{ fontWeight: 700 }}>{stats.resumesTailored}</span> <span style={{ color: "#535351", fontWeight: 500 }}>Tailored</span>
            </span>
          )}
        </div>

        {/* Expand Indicator Chevron */}
        <ChevronUp
          size={14}
          color="#535351"
          style={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease"
          }}
        />
      </div>

      <style>{`
        @keyframes notchSlideUp {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

export function notifyAgentTask(taskType: "parse" | "tailor" | "match", label?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("agent-task", {
        detail: { taskType, label }
      })
    );
  }
}
