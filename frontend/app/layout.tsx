import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";
import "./shell.css";

export const metadata: Metadata = {
  title: "Internship Hunter AI",
  description: "AI-Powered Internship & Job Matching Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
