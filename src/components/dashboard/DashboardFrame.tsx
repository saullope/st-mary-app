"use client";

import { useState, type ReactNode } from "react";
import { SidebarDashboard } from "./SidebarDashboard";
import { SIDEBAR_COLLAPSED_COOKIE, SIDEBAR_WIDTH } from "./sidebarPreference";

interface DashboardFrameProps {
  defaultCollapsed: boolean;
  navbar: ReactNode;
  children: ReactNode;
}

/** Sidebar plus the content column, whose left margin follows the sidebar width. */
export function DashboardFrame({ defaultCollapsed, navbar, children }: DashboardFrameProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COLLAPSED_COOKIE}=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <>
      <SidebarDashboard collapsed={collapsed} onToggle={toggle} />
      <div
        style={{
          marginLeft: collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded,
          position: "relative",
          zIndex: 1,
          transition: "margin-left 0.3s ease",
        }}
      >
        {navbar}
        <div style={{ marginLeft: "20px", padding: "20px" }}>{children}</div>
      </div>
    </>
  );
}
