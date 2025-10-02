"use client";

import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ChefHat, ClipboardList, LayoutDashboard } from "lucide-react";
import { useClerk } from "@clerk/clerk-react";

const mainNavItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/orders", label: "Orders", icon: ClipboardList },
  { path: "/menu", label: "Menu", icon: ClipboardList },
  { path: "/cuisine", label: "Cuisine", icon: ChefHat },
];

function SidebarNavItem({
  path,
  label,
  icon: Icon,
}: {
  path: string;
  label: string;
  icon: React.ElementType;
}) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(path);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
        <NavLink to={path}>
          <Icon className="h-4 w-4" />
          <span className="text-xs">{label}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// Sidebar component
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const { signOut } = useClerk();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-center gap-2 py-2">
          <div
            className={cn(
              "transition-opacity duration-200",
              state === "collapsed" && "opacity-0"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <h1 className="text-3xl font-bold text-black font-qwigley">
                  ZIPP
                </h1>
                <h1 className="text-2xl font-bold text-yellow-500 font-qwigley mt-4">
                  Dine
                </h1>
              </div>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavItems.map((item) => (
                <SidebarNavItem key={item.path} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button onClick={() => signOut()}>Logout</Button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
