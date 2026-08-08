"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { RecruiterShell } from "@/components/shell/RecruiterShell";
import { AgentTaskNotch } from "@/components/shared/AgentTaskNotch";
import { useAuth } from "@/components/auth/AuthProvider";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isLanding = pathname === "/";

  if (isLanding) {
    return (
      <>
        {children}
        <AgentTaskNotch />
      </>
    );
  }

  const isRecruiterPath = pathname.startsWith("/recruiter/") || pathname === "/recruiter";

  if (isRecruiterPath) {
    return (
      <RecruiterShell>
        {children}
        <AgentTaskNotch />
      </RecruiterShell>
    );
  }

  if (user?.role === "recruiter" && !pathname.startsWith("/direct-jobs")) {
    return (
      <RecruiterShell>
        {children}
        <AgentTaskNotch />
      </RecruiterShell>
    );
  }

  return (
    <AppShell>
      {children}
      <AgentTaskNotch />
    </AppShell>
  );
}
