"use client";

import type React from "react";

import { AppSidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Navbar />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
