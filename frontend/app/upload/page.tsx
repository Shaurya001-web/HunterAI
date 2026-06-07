"use client";

import { useState, useRef, DragEvent } from "react";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { AppShell } from "@/components/shell/AppShell";
import "../shell.css";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setStatus("idle");
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;
    if (dropped.type !== "application/pdf") {
      setStatus("error");
      setErrorMsg("Please upload a PDF file only.");
      return;
    }
    setFile(dropped);
    setStatus("idle");
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setStatus("idle");
    try {
      const data = await api.uploadResume(file);
      if (data.profile) {
        setStatus("success");
        if (data.profile.email) {
          localStorage.setItem("selectedProfileEmail", data.profile.email);
        }
      } else {
        throw new Error(data.message || "Failed to parse profile.");
      }
    } catch (err: unknown) {
      const error = err as Error;
      setStatus("error");
      setErrorMsg(error.message || "Upload failed. Make sure the backend is running at localhost:8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Upload Resume">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          position: "relative",
        }}
      >

      <div
        className="fade-up"
        style={{
          width: "100%",
          maxWidth: "480px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "26px",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: "6px",
            }}
          >
            Upload Resume
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Drop your PDF. We&apos;ll parse your skills and match you with top internships.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            padding: "28px",
          }}
        >
          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "rgba(0,214,143,0.1)",
                  border: "1px solid rgba(0,214,143,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <CheckCircle2 size={28} color="#00d68f" />
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                }}
              >
                Resume Parsed!
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "13.5px", marginBottom: "28px", lineHeight: 1.6 }}>
                Your profile has been created and skills extracted. Browse your matches now.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link
                  href="/recommendations"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "white",
                    padding: "13px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #6c5ce7, #8b5cf6)",
                    boxShadow: "0 4px 16px rgba(108,92,231,0.3)",
                  }}
                >
                  View Recommendations <ArrowRight size={15} />
                </Link>
                <Link
                  href="/profile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    textDecoration: "none",
                    fontWeight: 500,
                    fontSize: "13.5px",
                    color: "var(--text-secondary)",
                    padding: "11px",
                    borderRadius: "12px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                  }}
                >
                  View Profile
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragging ? "rgba(108,92,231,0.6)" : file ? "rgba(108,92,231,0.4)" : "var(--border-strong)"}`,
                  borderRadius: "14px",
                  padding: "40px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: dragging
                    ? "var(--accent-soft)"
                    : file
                    ? "rgba(108,92,231,0.05)"
                    : "var(--bg-elevated)",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                {file ? (
                  <>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        background: "var(--accent-soft)",
                        border: "1px solid var(--accent-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <FileText size={20} color="var(--accent)" />
                    </div>
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: "13.5px",
                        color: "var(--text-primary)",
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginBottom: "4px",
                      }}
                    >
                      {file.name}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "12px" }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB · PDF
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setStatus("idle");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        fontSize: "11px",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <X size={12} /> Remove
                    </button>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        background: "var(--bg-hover)",
                        border: "1px solid var(--border-strong)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <UploadCloud size={20} color="var(--text-muted)" />
                    </div>
                    <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", marginBottom: "4px", fontWeight: 500 }}>
                      <span style={{ color: "var(--accent)", fontWeight: 600 }}>Click to upload</span> or drag & drop
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>PDF only · max 5MB</p>
                  </>
                )}
              </div>

              {/* Error */}
              {status === "error" && (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                    background: "rgba(255,77,109,0.08)",
                    border: "1px solid rgba(255,77,109,0.2)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                  }}
                >
                  <AlertCircle size={15} color="#ff4d6d" style={{ flexShrink: 0, marginTop: "1px" }} />
                  <p style={{ fontSize: "12.5px", color: "#ff4d6d", lineHeight: 1.5 }}>{errorMsg}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!file || loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "13px",
                  borderRadius: "12px",
                  border: "none",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: !file || loading ? "not-allowed" : "pointer",
                  background:
                    !file || loading
                      ? "var(--bg-elevated)"
                      : "linear-gradient(135deg, #6c5ce7, #8b5cf6)",
                  color: !file || loading ? "var(--text-muted)" : "white",
                  boxShadow: !file || loading ? "none" : "0 4px 16px rgba(108,92,231,0.3)",
                  transition: "all 0.2s",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                    <span>Parsing with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Parse & Extract Profile</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Tips */}
        {status !== "success" && (
          <div
            className="fade-up fade-up-delay-2"
            style={{
              marginTop: "20px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "16px 20px",
            }}
          >
            <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Tips for best results
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                "Use a clean, text-based PDF resume",
                "Include a skills section for better matching",
                "Add project names and tech stacks used",
              ].map((tip) => (
                <div key={tip} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <CheckCircle2 size={12} color="#00d68f" />
                  <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      </div>
    </AppShell>
  );
}
