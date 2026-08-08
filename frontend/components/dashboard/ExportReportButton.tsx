"use client";

import { useState } from "react";
import { Download, FileText, X, LoaderCircle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { Profile, JobMatch } from "@/types";

type ExportFormat = "pdf" | "csv" | "html";

const formats: { id: ExportFormat; label: string; description: string }[] = [
  { id: "pdf", label: "PDF", description: "Premium multi-page printable report" },
  { id: "csv", label: "CSV", description: "Structured data for spreadsheets" },
  { id: "html", label: "HTML", description: "Standalone responsive web report" },
];

interface ExportReportButtonProps {
  profile?: Profile | null;
  matches?: JobMatch[];
  collapsed?: boolean;
}

export default function ExportReportButton({ profile, matches, collapsed }: ExportReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  const generate = async () => {
    setGenerating(true);
    setMessage("");
    try {
      const blob = await api.exportCareerReport(format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hunter-ai-career-intelligence-report.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage("Your report is ready and has been downloaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to generate report.");
    } finally {
      setGenerating(false);
    }
  };

  const profileReady = Boolean(profile?.email || profile?.name);
  const matchCount = matches?.length ?? 0;

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        id="export-career-report-btn"
        onClick={() => { setOpen(true); setMessage(""); }}
        className="nav-item"
        title={collapsed ? "Export Report" : undefined}
        style={{
          border: "none",
          background: "transparent",
          width: "100%",
          textAlign: "left",
          display: "flex",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <FileText size={18} style={{ opacity: 0.65, flexShrink: 0 }} />
        {!collapsed && <span>Export Report</span>}
      </button>

      {/* Modal */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Export Career Intelligence Report"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 150,
            background: "rgba(12,16,38,.54)",
            backdropFilter: "blur(7px)",
            padding: "20px",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "510px",
              background: "#fff",
              borderRadius: "22px",
              padding: "28px",
              boxShadow: "0 24px 70px rgba(8,10,30,.34)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
              <div>
                <p style={{ margin: 0, color: "#5b5ce2", fontWeight: 800, letterSpacing: ".1em", fontSize: "11px" }}>
                  HUNTER AI
                </p>
                <h2 style={{ color: "#172033", fontSize: "22px", lineHeight: 1.15, margin: "7px 0" }}>
                  Export Career Intelligence Report
                </h2>
                <p style={{ color: "#667085", fontSize: "13px", margin: 0 }}>
                  Uses saved Hunter AI analyses only. No AI is rerun.
                </p>
              </div>
              <button
                aria-label="Close"
                type="button"
                onClick={() => setOpen(false)}
                style={{ border: "none", background: "transparent", color: "#667085", cursor: "pointer", height: "fit-content" }}
              >
                <X />
              </button>
            </div>

            {/* Profile context pill */}
            {(profileReady || matchCount > 0) && (
              <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {profileReady && (
                  <span style={{ fontSize: "12px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "3px 10px", borderRadius: "20px", fontWeight: 600 }}>
                    ✓ Profile ready
                  </span>
                )}
                {matchCount > 0 && (
                  <span style={{ fontSize: "12px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "3px 10px", borderRadius: "20px", fontWeight: 600 }}>
                    ✓ {matchCount} job match{matchCount !== 1 ? "es" : ""} available
                  </span>
                )}
              </div>
            )}

            {/* Format picker */}
            <fieldset style={{ border: 0, padding: 0, margin: "24px 0" }}>
              <legend style={{ color: "#344054", fontWeight: 800, fontSize: "13px", marginBottom: "10px" }}>
                Choose format
              </legend>
              {formats.map((item) => (
                <label
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "13px",
                    border: `1px solid ${format === item.id ? "#5b5ce2" : "#e4e7ec"}`,
                    borderRadius: "11px",
                    marginTop: "9px",
                    cursor: "pointer",
                    background: format === item.id ? "#f6f6ff" : "#fff",
                  }}
                >
                  <input
                    type="radio"
                    name="format"
                    value={item.id}
                    checked={format === item.id}
                    onChange={() => setFormat(item.id)}
                  />
                  <span>
                    <b style={{ color: "#172033", fontSize: "14px" }}>{item.label}</b>
                    <span style={{ display: "block", color: "#667085", fontSize: "12px", marginTop: "1px" }}>
                      {item.description}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>

            {/* Status message */}
            {message && (
              <p
                role="status"
                style={{
                  margin: "0 0 15px",
                  color: message.startsWith("Your") ? "#067647" : "#b42318",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                {message.startsWith("Your") && <CheckCircle2 size={16} />}
                {message}
              </p>
            )}

            {/* Generate button */}
            <button
              type="button"
              id="export-generate-report-btn"
              onClick={generate}
              disabled={generating}
              style={{
                width: "100%",
                border: 0,
                borderRadius: "11px",
                background: generating ? "#a4a4dc" : "#24256b",
                color: "#fff",
                padding: "13px",
                fontWeight: 800,
                cursor: generating ? "wait" : "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
              }}
            >
              {generating ? (
                <>
                  <LoaderCircle size={17} style={{ animation: "spin 1s linear infinite" }} />
                  Generating report…
                </>
              ) : (
                <>
                  <Download size={17} />
                  Generate Report
                </>
              )}
            </button>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      )}
    </>
  );
}
