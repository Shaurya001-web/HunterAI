"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import {
  Building,
  UploadCloud,
  Search,
  MapPin,
  DollarSign,
  CheckCircle2,
  XCircle,
  Briefcase,
  X,
  FileText,
  Sparkles,
  ArrowRight
} from "lucide-react";

function DirectJobsContent() {
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("jobId");

  const [openings, setOpenings] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  
  // Application Modal state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appSuccess, setAppSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobList, apps] = await Promise.all([
        api.browseJobPostings({ keyword, location, remote_only: remoteOnly }).catch(() => []),
        api.getMyApplications().catch(() => []),
      ]);
      setOpenings(jobList || []);
      setMyApplications(apps || []);

      if (initialJobId && jobList.length > 0) {
        const found = jobList.find((j: any) => String(j.id) === String(initialJobId));
        if (found) {
          setSelectedJob(found);
        }
      }
    } catch (e) {
      console.error("Failed to load recruiter job openings", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [initialJobId]);

  const handleOpenJobModal = (job: any) => {
    setSelectedJob(job);
    setResumeFile(null);
    setAppSuccess(false);
    setErrorMsg("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
        setErrorMsg("Please upload a PDF document (.pdf)");
        return;
      }
      setResumeFile(f);
      setErrorMsg("");
    }
  };

  const handleApplyWithResume = async () => {
    if (!selectedJob) return;
    setErrorMsg("");
    setSubmittingApp(true);

    try {
      // 1. If candidate uploaded a new resume PDF, upload & parse
      if (resumeFile) {
        setUploadingResume(true);
        await api.uploadResume(resumeFile);
        setUploadingResume(false);
      }

      // 2. Submit application for this job posting
      await api.applyToJob(selectedJob.id);

      setAppSuccess(true);
      const updatedApps = await api.getMyApplications().catch(() => []);
      setMyApplications(updatedApps);

      setTimeout(() => {
        setSelectedJob(null);
        setAppSuccess(false);
        setResumeFile(null);
      }, 1500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setSubmittingApp(false);
      setUploadingResume(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "50px" }}>
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(13, 148, 136, 0.06) 100%)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: "20px", padding: "28px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", padding: "3px 10px", borderRadius: "6px", background: "#10B981", color: "#ffffff", letterSpacing: "0.05em" }}>
            Direct Hiring
          </span>
          <span style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: 600 }}>
            {openings.length} Active Listing{openings.length !== 1 ? "s" : ""}
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)", margin: 0 }}>
          Direct Recruiter Openings 💼
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "6px", maxWidth: "600px" }}>
          Browse verified job openings posted by companies hiring directly on HunterAI. Click any job to inspect details, upload your resume, and submit directly to the recruiter.
        </p>
      </div>

      {/* Filter Bar */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", background: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: "16px", padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "200px", background: "var(--bg-base)", border: "1px solid var(--border)", borderRadius: "10px", padding: "8px 12px" }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by job title or company..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ background: "none", border: "none", outline: "none", color: "var(--text-primary)", fontSize: "13.5px", width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "180px", background: "var(--bg-base)", border: "1px solid var(--border)", borderRadius: "10px", padding: "8px 12px" }}>
          <MapPin size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Filter location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ background: "none", border: "none", outline: "none", color: "var(--text-primary)", fontSize: "13.5px", width: "100%" }}
          />
        </div>

        <button
          onClick={() => setRemoteOnly(!remoteOnly)}
          style={{
            padding: "9px 14px",
            borderRadius: "10px",
            border: remoteOnly ? "2px solid #10B981" : "1px solid var(--border)",
            background: remoteOnly ? "rgba(16, 185, 129, 0.15)" : "var(--bg-base)",
            color: remoteOnly ? "#10B981" : "var(--text-secondary)",
            fontWeight: 600,
            fontSize: "13px",
            cursor: "pointer"
          }}
        >
          🌐 Remote Only
        </button>

        <button
          onClick={loadData}
          style={{
            padding: "9px 18px",
            borderRadius: "10px",
            background: "var(--text-primary)",
            color: "var(--bg-surface)",
            fontWeight: 600,
            fontSize: "13px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Search
        </button>
      </div>

      {/* Main Grid: Job Listings */}
      {loading ? (
        <p style={{ fontSize: "14px", color: "var(--text-muted)", padding: "20px 0" }}>Loading job openings...</p>
      ) : openings.length === 0 ? (
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: "20px", padding: "48px 24px", textAlign: "center" }}>
          <Briefcase size={40} color="var(--text-muted)" style={{ margin: "0 auto 12px auto", opacity: 0.5 }} />
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>No recruiter openings found</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            Try broadening your search keywords or clear filters.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "18px" }}>
          {openings.map((job) => {
            const myApp = myApplications.find((a: any) => a.job_posting_id === job.id);

            return (
              <div
                key={job.id}
                onClick={() => handleOpenJobModal(job)}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.02)"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                    <div>
                      <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                        {job.title}
                      </h2>
                      <p style={{ fontSize: "13px", color: "#10B981", fontWeight: 600, margin: "2px 0 0" }}>
                        {job.company}
                      </p>
                    </div>

                    {/* Status badge */}
                    {myApp && (
                      <span
                        style={{
                          fontSize: "10.5px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: myApp.status === "shortlisted"
                            ? "rgba(16, 185, 129, 0.15)"
                            : myApp.status === "rejected"
                            ? "rgba(239, 68, 68, 0.15)"
                            : "rgba(59, 130, 246, 0.15)",
                          color: myApp.status === "shortlisted"
                            ? "#10B981"
                            : myApp.status === "rejected"
                            ? "#EF4444"
                            : "#3B82F6",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {myApp.status === "shortlisted" ? "✓ Accepted" : myApp.status === "rejected" ? "✕ Rejected" : "Applied"}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "8px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {job.description}
                  </p>
                </div>

                <div>
                  {/* Meta pill badges */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                    {job.location && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={13} color="var(--text-muted)" /> {job.location}
                      </span>
                    )}
                    {job.salary_range && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <DollarSign size={13} color="var(--text-muted)" /> {job.salary_range}
                      </span>
                    )}
                    {job.is_remote && <span>🌐 Remote</span>}
                  </div>

                  {/* Required Skills tags */}
                  {job.skills_required?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "14px" }}>
                      {job.skills_required.slice(0, 4).map((sk: string, idx: number) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "2px 6px",
                            borderRadius: "5px",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border)",
                            color: "var(--text-secondary)"
                          }}
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Apply / View Details Action button */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#10B981", display: "flex", alignItems: "center", gap: "4px" }}>
                      View Details & Upload Resume <ArrowRight size={13} />
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {job.applicant_count || 0} applicant{job.applicant_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application & Resume Upload Modal */}
      {selectedJob && (
        <div
          onClick={() => setSelectedJob(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(12, 22, 24, 0.5)",
            backdropFilter: "blur(8px)",
            zIndex: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-strong)",
              borderRadius: "24px",
              padding: "32px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              position: "relative"
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedJob(null)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)"
              }}
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", padding: "3px 8px", borderRadius: "6px", background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
                Direct Recruiter Job Opening
              </span>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", margin: "8px 0 2px" }}>
                {selectedJob.title}
              </h2>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#10B981", margin: 0 }}>
                {selectedJob.company} {selectedJob.location ? `· ${selectedJob.location}` : ""} {selectedJob.is_remote ? "🌐 Remote" : ""}
              </p>
            </div>

            {/* Salary & Details */}
            {selectedJob.salary_range && (
              <div style={{ background: "var(--bg-base)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "var(--text-primary)", fontWeight: 600 }}>
                💰 Compensation: {selectedJob.salary_range}
              </div>
            )}

            {/* Full Description */}
            <div>
              <h4 style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                Job Description
              </h4>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>
                {selectedJob.description}
              </p>
            </div>

            {/* Required Skills */}
            {selectedJob.skills_required?.length > 0 && (
              <div>
                <h4 style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                  Required Skills
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selectedJob.skills_required.map((sk: string, i: number) => (
                    <span key={i} style={{ fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "6px", background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resume Upload Dropzone */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "18px" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <FileText size={16} color="#10B981" /> Upload Your Resume (PDF)
              </h4>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed var(--border-strong)",
                  borderRadius: "14px",
                  padding: "20px",
                  textAlign: "center",
                  background: resumeFile ? "rgba(16, 185, 129, 0.08)" : "var(--bg-base)",
                  borderColor: resumeFile ? "#10B981" : "var(--border-strong)",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {resumeFile ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#10B981", fontWeight: 600, fontSize: "13.5px" }}>
                    <CheckCircle2 size={18} />
                    <span>Selected: {resumeFile.name}</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <UploadCloud size={28} color="#10B981" />
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                      Click to browse or drag & drop PDF resume
                    </p>
                    <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: 0 }}>
                      Attach your tailored PDF resume to submit directly to recruiter.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {errorMsg && (
              <p style={{ color: "#EF4444", fontSize: "13px", margin: 0 }}>{errorMsg}</p>
            )}

            {/* Apply Action Button */}
            <button
              type="button"
              onClick={handleApplyWithResume}
              disabled={submittingApp || appSuccess}
              style={{
                padding: "14px",
                borderRadius: "12px",
                background: "#10B981",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "14.5px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)"
              }}
            >
              {appSuccess ? (
                <>
                  <CheckCircle2 size={18} /> Application & Resume Submitted to Recruiter!
                </>
              ) : submittingApp ? (
                uploadingResume ? "Uploading Resume..." : "Submitting Application..."
              ) : (
                <>
                  <Sparkles size={18} /> Submit Application with Resume
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CandidateRecruiterJobsPage() {
  return (
    <Suspense fallback={<p style={{ padding: "20px", color: "var(--text-muted)" }}>Loading direct jobs...</p>}>
      <DirectJobsContent />
    </Suspense>
  );
}
