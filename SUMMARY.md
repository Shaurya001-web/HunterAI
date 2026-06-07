# Internship Hunter AI - Project Summary 🎯

This document serves as a complete summary of the work, enhancements, and fixes completed across both the FastAPI backend and Next.js frontend of the Internship Hunter AI project, including the exact source code of all modified frontend components.

---

## 🛠️ Work Accomplished

### 1. System & Port Configuration
* **Port Conflict Resolutions:** Identified and terminated active zombie python processes occupying port `8000` to allow the FastAPI application to launch smoothly without `Address already in use` errors.
* **Service Startup Verification:** Started and verified both development servers:
  * **Backend API:** Running on `http://127.0.0.1:8000`
  * **Frontend Client:** Running on `http://localhost:3000`

---

### 2. Backend Enhancements
* **Internshala Scraper Updated ([internshala_scraper.py](file:///Users/shaurya001/Downloads/Shaurya/Machine%20Learning/Internship_proj/backend/scrapers/internshala_scraper.py)):**
  * Added logic to scrape the **duration** of internships directly from listing card selectors (scanning `row-1-item` divs inside `detail-row-1`).
  * Repopulated the listings database by scraping 10 real-time python developer internships and saving them into [jobs.json](file:///Users/shaurya001/Downloads/Shaurya/Machine%20Learning/Internship_proj/backend/data/jobs.json).
* **Job Matching Engine Updated ([matching_engine.py](file:///Users/shaurya001/Downloads/Shaurya/Machine%20Learning/Internship_proj/backend/engine/matching_engine.py)):**
  * Updated the `rank_jobs` function to return comprehensive metadata parameters (including `company`, `location`, `stipend`, `url`, `duration`) alongside computed match percentages.
* **Support for Multiple Profiles ([matches_router.py](file:///Users/shaurya001/Downloads/Shaurya/Machine%20Learning/Internship_proj/backend/routes/matches_router.py)):**
  * Updated the `/matches` API route to accept a `email: str` query parameter. This allows matching results to be computed dynamically against any profile in the database, instead of always defaulting to the latest one.

---

### 3. Frontend Enhancements & Premium Redesign
* **Light Theme Implementation:**
  * Modified the core HTML layout in [layout.tsx](file:///Users/shaurya001/Downloads/Shaurya/Machine%20Learning/Internship_proj/frontend/src/app/layout.tsx) to remove the default `dark` class, moving the app to a clean light layout (`bg-slate-50` body, `bg-white` header and footer).
  * Upgraded the site logo to use a premium, vibrant text gradient styling.
* **Landing Page Upgraded ([page.tsx](file:///Users/shaurya001/Downloads/Shaurya/Machine%20Learning/Internship_proj/frontend/src/app/page.tsx)):**
  * Removed the `Powered by Gemini 2.5 Flash` badge from the landing hero section.
  * Styled feature cards to align with the new light theme, incorporating clean borders and subtle card shadows.
* **Resume Upload Page Updated ([upload/page.tsx](file:///Users/shaurya001/Downloads/Shaurya/Machine%20Learning/Internship_proj/frontend/src/app/upload/page.tsx)):**
  * Redesigned progress blocks, drag-and-drop input container, and call-to-actions for a modern light look.
* **Profile Page & Profile Selector ([profile/page.tsx](file:///Users/shaurya001/Downloads/Shaurya/Machine%20Learning/Internship_proj/frontend/src/app/profile/page.tsx)):**
  * Redesigned user information display blocks (Experience, Projects, Education, and Skills Matrix).
  * Added a dropdown selector at the top to allow switching the active profile.
* **Recommendations page & Apply Links ([recommendations/page.tsx](file:///Users/shaurya001/Downloads/Shaurya/Machine%20Learning/Internship_proj/frontend/src/app/recommendations/page.tsx)):**
  * Incorporated the **Active Profile Selector** dropdown which re-runs matches against the selected profile in real-time.
  * Rendered cards dynamically using parsed values instead of hardcoded fields (displaying actual Company names, Stipends, Locations, and Durations).
  * Styled matching parameters (e.g. green pill badges for matched skills, red pill badges for missing skills).
  * Changed the **Apply on Internshala** button to link directly to the target external application URL.

---

## 💻 Frontend Source Code

### 1. Root Layout Code ([layout.tsx](file:///Users/shaurya001/Downloads/Shaurya/Machine%20Learning/Internship_proj/frontend/src/app/layout.tsx))
```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Internship Hunter AI 🎯",
  description: "AI-Powered Internship & Job Matching Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {/* Modern Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Internship Hunter AI
              </span>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                MVP
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="flex items-center space-x-1 sm:space-x-4">
              <Link
                href="/upload"
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg transition hover:bg-slate-100/80"
              >
                Upload Resume
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg transition hover:bg-slate-100/80"
              >
                Profile
              </Link>
              <Link
                href="/recommendations"
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg transition hover:bg-slate-100/80"
              >
                Recommendations
              </Link>
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
          © {new Date().getFullYear()} Internship Hunter AI. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
```

### 2. Landing Page Code ([page.tsx](file:///Users/shaurya001/Downloads/Shaurya/Machine%20Learning/Internship_proj/frontend/src/app/page.tsx))
```tsx
import Link from "next/link";
import { UploadCloud, Sparkles, Target, Zap, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col justify-center overflow-hidden bg-slate-50">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] rounded-full bg-fuchsia-600/5 blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
          Find Your Perfect Internship,{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Powered by AI
          </span>
        </h1>

        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your resume PDF and let our matching engine compare your skills with actual scraped job postings to recommend the best matches, highlight missing skills, and rank jobs by score.
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/upload"
            className="group flex items-center space-x-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <UploadCloud className="w-5 h-5 text-indigo-100 group-hover:scale-110 transition-transform" />
            <span>Upload Resume Now</span>
          </Link>
          <Link
            href="/recommendations"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition px-5 py-3 rounded-lg border border-slate-200 hover:bg-slate-100 bg-white shadow-sm"
          >
            Browse Recommendations
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 border-t border-slate-200 mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-4 border border-indigo-100">
              <Zap className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Resume Parsing</h3>
            <p className="text-sm text-slate-600">
              Extracts and structures skills, projects, and education from PDF resumes using state-of-the-art AI parsing.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-fuchsia-50 flex items-center justify-center mb-4 border border-fuchsia-100">
              <Target className="w-5 h-5 text-fuchsia-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Scored Matching</h3>
            <p className="text-sm text-slate-600">
              Calculates direct match percentages and identifies exact missing skills relative to internship requirements.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center mb-4 border border-violet-100">
              <ShieldCheck className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Direct Job Matches</h3>
            <p className="text-sm text-slate-600">
              Pulls and indexes real-time listings to rank opportunities descending by compatibility score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3. Resume Upload Page Code ([upload/page.tsx](file:///Users/shaurya001/Downloads/Shaurya/Machine%20Learning/Internship_proj/frontend/src/app/upload/page.tsx))
```tsx
"use client";

import { useState, useRef, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Loader2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus("idle");
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setStatus("idle");
      } else {
        setStatus("error");
        setErrorMsg("Please upload a PDF file only.");
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setStatus("idle");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/file/upload/resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const responseData = await res.json();
      if (responseData.profile) {
        setStatus("success");
      } else {
        throw new Error(responseData.message || "Failed to parse profile.");
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "Failed to upload or parse resume. Please verify the API is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 relative bg-slate-50">
      {/* Background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 relative z-10 shadow-xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center sm:text-left">
          Upload Your Resume
        </h2>
        <p className="text-sm text-slate-600 mb-6 text-center sm:text-left">
          Drop your PDF resume below. We will extract your skills and projects to match you with top internship roles.
        </p>

        {status === "success" ? (
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/25 mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Resume Parsed Successfully!</h3>
            <p className="text-sm text-slate-600 mb-6 max-w-sm">
              Your profile has been created and your skills extracted. Ready to browse matching internships?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Link
                href="/profile"
                className="flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-semibold px-5 py-3 rounded-xl border border-slate-200 transition"
              >
                View Profile
              </Link>
              <Link
                href="/recommendations"
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-5 py-3 rounded-xl transition shadow-lg shadow-indigo-600/15"
              >
                <span>View Recommendations</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUploadSubmit} className="space-y-6">
            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                file
                  ? "border-indigo-500/60 bg-indigo-50/20"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              
              {file ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-3 border border-indigo-500/20">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 max-w-xs truncate mb-1">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                  </p>
                  <span className="text-xs text-indigo-600 mt-3 hover:underline">
                    Change file
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3 border border-slate-200">
                    <UploadCloud className="w-6 h-6 text-slate-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    <span className="text-indigo-600 hover:underline">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-500">PDF files only (max. 5MB)</p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {status === "error" && (
              <div className="flex items-start space-x-3 bg-rose-50 border border-rose-100 rounded-xl p-4 text-rose-800">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs">{errorMsg}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file || loading}
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all ${
                !file || loading
                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/15"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                  <span>AI Parsing Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Submit & Extract Profile</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
```

### 4. Profile Page Code ([profile/page.tsx](file:///Users/shaurya001/Downloads/Shaurya/Machine%20Learning/Internship_proj/frontend/src/app/profile/page.tsx))
```tsx
"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, BookOpen, Cpu, Briefcase, FileCode2, Loader2, RefreshCw, Upload, Users } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:8000/profiles");
      if (!res.ok) {
        throw new Error("Failed to load profiles");
      }
      const data = await res.json();
      setAllProfiles(data || []);
      
      if (data && data.length > 0) {
        const savedEmail = localStorage.getItem("selectedProfileEmail");
        const matched = data.find((p: any) => p.email === savedEmail);
        if (matched) {
          setProfile(matched);
        } else {
          setProfile(data[data.length - 1]);
          localStorage.setItem("selectedProfileEmail", data[data.length - 1].email);
        }
      } else {
        setProfile(null);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch profile details. Ensure the FastAPI backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 text-sm font-medium">Loading profiles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 text-rose-800 shadow-sm">
            <p className="text-sm font-semibold mb-4">{error}</p>
            <button
              onClick={fetchProfile}
              className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-4 py-2 rounded-xl transition border border-slate-200 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center py-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md">
            <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">No Profile Found</h3>
            <p className="text-sm text-slate-500 mb-6">
              You haven't uploaded any resumes yet. Let's parse one now to build your profile automatically.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-5 py-3 rounded-xl transition shadow-lg shadow-indigo-600/15"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Resume</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 py-10">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Selector & Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-indigo-600" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active Profile:</span>
              <select
                value={profile.email}
                onChange={(e) => {
                  const selected = allProfiles.find(p => p.email === e.target.value);
                  if (selected) {
                    setProfile(selected);
                    localStorage.setItem("selectedProfileEmail", selected.email);
                  }
                }}
                className="bg-slate-50 text-sm font-bold text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 cursor-pointer"
              >
                {allProfiles.map((p, idx) => (
                  <option key={idx} value={p.email}>
                    {p.name} ({p.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={fetchProfile}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <Link
              href="/upload"
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/15"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New Profile</span>
            </Link>
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 flex items-center gap-6 shadow-md relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center font-extrabold text-2xl text-white shadow-lg shadow-indigo-500/20 shrink-0">
            {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile.name || "User Profile"}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1.5 text-xs text-slate-300">
              {profile.email && (
                <div className="flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-violet-400" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Skills */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 h-fit space-y-6 shadow-sm">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-800">Skills Matrix</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg px-2.5 py-1 text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400">No skills parsed.</span>
              )}
            </div>
          </div>

          {/* Right Column - Experience, Projects, Education */}
          <div className="lg:col-span-2 space-y-8">
            {/* Projects */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <FileCode2 className="w-5 h-5 text-fuchsia-600" />
                <h2 className="text-lg font-bold text-slate-800">Projects</h2>
              </div>
              <div className="space-y-4">
                {profile.projects && profile.projects.length > 0 ? (
                  profile.projects.map((project: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-2"
                    >
                      <h3 className="text-sm font-bold text-slate-800">
                        {project.title || "Project Details"}
                      </h3>
                      {project.description && (
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {project.description}
                        </p>
                      )}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {project.technologies.map((tech: string, tIdx: number) => (
                            <span
                              key={tIdx}
                              className="bg-fuchsia-50 text-fuchsia-700 rounded px-2 py-0.5 text-[10px] font-semibold border border-fuchsia-100"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">No projects listed.</span>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <BookOpen className="w-5 h-5 text-pink-600" />
                <h2 className="text-lg font-bold text-slate-800">Education</h2>
              </div>
              <div className="space-y-4">
                {profile.education && profile.education.length > 0 ? (
                  profile.education.map((edu: any, idx: number) => (
                    <div key={idx} className="flex flex-col space-y-1 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <h3 className="text-sm font-bold text-slate-800">
                        {edu.degree || "Degree"}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {edu.institution || "Institution"}
                      </p>
                      {edu.year && (
                        <span className="text-[10px] text-slate-400 font-semibold mt-1">
                          {edu.year}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">No education entries listed.</span>
                )}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-800">Work Experience</h2>
              </div>
              <div className="space-y-4">
                {profile.experience && profile.experience.length > 0 ? (
                  profile.experience.map((exp: any, idx: number) => (
                    <div key={idx} className="flex flex-col space-y-1 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <h3 className="text-sm font-bold text-slate-800">
                        {exp.role || "Role"}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {exp.company || "Company"}
                      </p>
                      {exp.duration && (
                        <span className="text-[10px] text-slate-400 font-semibold mt-1">
                          {exp.duration}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">No work experience listed.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 5. Recommendations Page Code ([recommendations/page.tsx](file:///Users/shaurya001/Downloads/Shaurya/Machine%20Learning/Internship_proj/frontend/src/app/recommendations/page.tsx))
```tsx
"use client";

import { useEffect, useState } from "react";
import { Search, MapPin, DollarSign, Target, CheckCircle2, AlertCircle, Loader2, RefreshCw, Upload, ExternalLink, Calendar, Users } from "lucide-react";
import Link from "next/link";

export default function RecommendationsPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [minMatchScore, setMinMatchScore] = useState(0);

  const fetchMatches = async (email: string) => {
    setLoading(true);
    setError("");
    try {
      const url = email 
        ? `http://127.0.0.1:8000/matches?email=${encodeURIComponent(email)}` 
        : "http://127.0.0.1:8000/matches";
      const res = await fetch(url);
      if (res.status === 400) {
        setMatches([]);
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to load matches");
      }
      const data = await res.json();
      setMatches(data || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to calculate matches. Please make sure the FastAPI backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const loadProfilesAndMatches = async () => {
    setLoading(true);
    setError("");
    try {
      const pRes = await fetch("http://127.0.0.1:8000/profiles");
      if (!pRes.ok) {
        throw new Error("Failed to load profiles");
      }
      const pData = await pRes.json();
      setProfiles(pData || []);
      
      if (pData && pData.length > 0) {
        const savedEmail = localStorage.getItem("selectedProfileEmail");
        const matched = pData.find((p: any) => p.email === savedEmail);
        const emailToUse = matched ? matched.email : pData[pData.length - 1].email;
        setSelectedEmail(emailToUse);
        localStorage.setItem("selectedProfileEmail", emailToUse);
        await fetchMatches(emailToUse);
      } else {
        setMatches([]);
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to initialize matches. Please verify the FastAPI backend is running.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfilesAndMatches();
  }, []);

  const handleProfileChange = async (email: string) => {
    setSelectedEmail(email);
    localStorage.setItem("selectedProfileEmail", email);
    await fetchMatches(email);
  };

  const filteredMatches = matches.filter((match) => {
    if (match.score < minMatchScore) return false;
    
    const titleMatch = match.job_title?.toLowerCase().includes(searchQuery.toLowerCase());
    const companyMatch = match.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchedSkillsMatch = match.matched_skills?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (searchQuery && !titleMatch && !companyMatch && !matchedSkillsMatch) return false;
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 text-sm font-medium">Matching jobs against your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 text-rose-800 shadow-sm">
            <p className="text-sm font-semibold mb-4">{error}</p>
            <button
              onClick={loadProfilesAndMatches}
              className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-4 py-2 rounded-xl transition border border-slate-200 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center py-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md">
            <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">No Profile Uploaded</h3>
            <p className="text-sm text-slate-500 mb-6">
              We need your parsed resume to calculate matches. Please upload your resume first.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-5 py-3 rounded-xl transition shadow-lg shadow-indigo-600/15"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Resume</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 py-10">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Recommended Opportunities</h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Based on the comparison of your skills against parsed job descriptions, ranked by score.
            </p>
          </div>
          
          <div className="flex items-center space-x-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm shrink-0">
            <Users className="w-5 h-5 text-indigo-600" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Matching Against:</span>
              <select
                value={selectedEmail}
                onChange={(e) => handleProfileChange(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-800 outline-none pr-6 cursor-pointer"
              >
                {profiles.map((p, idx) => (
                  <option key={idx} value={p.email}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row gap-6 items-center shadow-sm">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by role, company, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Min Score:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                className="accent-indigo-600 w-full sm:w-32 bg-slate-200 rounded-lg cursor-pointer h-1.5"
              />
              <span className="text-xs font-bold text-slate-700 w-8">{minMatchScore}%</span>
            </div>

            <button
              onClick={() => {
                setSearchQuery("");
                setMinMatchScore(0);
              }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition whitespace-nowrap"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl shadow-sm">
            <p className="text-sm text-slate-400 font-medium">No jobs match your selected filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMatches.map((match: any, idx: number) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-lg rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">
                        {match.job_title}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        {match.company || "Unknown Company"}
                      </p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full border text-xs font-extrabold shrink-0 flex items-center space-x-1.5 ${
                      match.score >= 70
                        ? "bg-emerald-55 text-emerald-700 border-emerald-200"
                        : match.score >= 40
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "bg-rose-50 border-rose-200 text-rose-700"
                    }`}>
                      <span>{match.score}% Match</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-xs text-slate-500 font-semibold">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{match.location || "Remote"}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-3.5 h-3.5 text-fuchsia-500" />
                      <span>{match.stipend || "Negotiable Stipend"}</span>
                    </div>
                    {match.duration && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-pink-500" />
                        <span>{match.duration}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 mb-6">
                    {match.matched_skills && match.matched_skills.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-1 text-xs text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Matched Skills ({match.matched_skills.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {match.matched_skills.map((skill: string, sIdx: number) => (
                            <span
                              key={sIdx}
                              className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-2 py-0.5 text-[10px] font-semibold"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {match.missing_skills && match.missing_skills.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-1 text-xs text-rose-700 font-bold">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Missing Skills ({match.missing_skills.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {match.missing_skills.map((skill: string, sIdx: number) => (
                            <span
                              key={sIdx}
                              className="bg-rose-50 text-rose-700 border border-rose-100 rounded px-2 py-0.5 text-[10px] font-semibold"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-auto">
                  {match.url ? (
                    <a
                      href={match.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-2.5 rounded-xl transition shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
                    >
                      <span>Apply on Internshala</span>
                      <ExternalLink className="w-3.5 h-3.5 text-white" />
                    </a>
                  ) : (
                    <button
                      className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl border border-slate-200 transition"
                      onClick={() => alert("Apply feature is part of upcoming application tracker!")}
                    >
                      <span>Quick Apply</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```
