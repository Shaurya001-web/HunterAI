"use client";

import { useState } from "react";
import { Download, FileText, X, LoaderCircle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

type ExportFormat = "pdf" | "csv" | "html";
const formats: { id: ExportFormat; label: string; description: string }[] = [
  { id: "pdf", label: "PDF", description: "Premium multi-page printable report" },
  { id: "csv", label: "CSV", description: "Structured data for spreadsheets" },
  { id: "html", label: "HTML", description: "Standalone responsive web report" },
];

export default function ExportReportButton() {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const generate = async () => {
    setGenerating(true); setMessage("");
    try {
      const blob = await api.exportCareerReport(format);
      const url = URL.createObjectURL(blob); const link = document.createElement("a");
      link.href = url; link.download = `hunter-ai-career-intelligence-report.${format}`;
      document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
      setMessage("Your report is ready and has been downloaded.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to generate report."); }
    finally { setGenerating(false); }
  };
  return <>
    <button type="button" onClick={() => { setOpen(true); setMessage(""); }} style={{ border: "none", cursor: "pointer", borderRadius: "14px", padding: "18px 20px", background: "linear-gradient(135deg, #24256b, #5b5ce2)", color: "#fff", textAlign: "left", display: "flex", gap: "13px", alignItems: "center", boxShadow: "0 10px 24px rgba(71,72,190,.25)" }}><span style={{ background: "rgba(255,255,255,.16)", padding: "10px", borderRadius: "11px", display: "grid" }}><FileText size={20} /></span><span><span style={{ display: "block", fontSize: "14px", fontWeight: 800 }}>Export Career Intelligence Report</span><span style={{ display: "block", marginTop: "3px", fontSize: "12px", opacity: .8 }}>PDF, CSV, or printable HTML</span></span></button>
    {open && <div role="dialog" aria-modal="true" aria-label="Export Career Intelligence Report" onClick={() => !generating && setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(12,16,38,.54)", backdropFilter: "blur(7px)", padding: "20px", display: "grid", placeItems: "center" }}><div onClick={(event) => event.stopPropagation()} style={{ width: "100%", maxWidth: "510px", background: "#fff", borderRadius: "22px", padding: "28px", boxShadow: "0 24px 70px rgba(8,10,30,.34)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}><div><p style={{ margin: 0, color: "#5b5ce2", fontWeight: 800, letterSpacing: ".1em", fontSize: "11px" }}>HUNTER AI</p><h2 style={{ color: "#172033", fontSize: "24px", lineHeight: 1.15, margin: "7px 0" }}>Export Career Intelligence Report</h2><p style={{ color: "#667085", fontSize: "13px", margin: 0 }}>Uses saved Hunter AI analyses only. No AI is run.</p></div><button aria-label="Close" type="button" disabled={generating} onClick={() => setOpen(false)} style={{ border: "none", background: "transparent", color: "#667085", cursor: "pointer", height: "fit-content" }}><X /></button></div><fieldset style={{ border: 0, padding: 0, margin: "24px 0" }}><legend style={{ color: "#344054", fontWeight: 800, fontSize: "13px", marginBottom: "10px" }}>Choose format</legend>{formats.map((item) => <label key={item.id} style={{ display: "flex", gap: "12px", padding: "13px", border: `1px solid ${format === item.id ? "#5b5ce2" : "#e4e7ec"}`, borderRadius: "11px", marginTop: "9px", cursor: "pointer", background: format === item.id ? "#f6f6ff" : "#fff" }}><input type="radio" name="format" value={item.id} checked={format === item.id} onChange={() => setFormat(item.id)} /><span><b style={{ color: "#172033", fontSize: "14px" }}>{item.label}</b><span style={{ display: "block", color: "#667085", fontSize: "12px", marginTop: "1px" }}>{item.description}</span></span></label>)}</fieldset>{message && <p role="status" style={{ margin: "0 0 15px", color: message.startsWith("Your") ? "#067647" : "#b42318", fontSize: "13px", display: "flex", alignItems: "center", gap: "7px" }}>{message.startsWith("Your") && <CheckCircle2 size={16} />}{message}</p>}<button type="button" onClick={generate} disabled={generating} style={{ width: "100%", border: 0, borderRadius: "11px", background: generating ? "#a4a4dc" : "#24256b", color: "#fff", padding: "13px", fontWeight: 800, cursor: generating ? "wait" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>{generating ? <><LoaderCircle size={17} className="export-spin" /> Generating report…</> : <><Download size={17} /> Generate Report</>}</button></div></div>}
  </>;
}
