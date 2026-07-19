"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
