"use client";

import * as React from "react";
import {
  GalleryVerticalEnd,
  Settings2,
  Users,
  Home,
  Wrench,
  ShoppingCart,
  FileText,
  File,
  BarChart3,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { useIsAdmin } from "@/hooks/use-is-admin";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Cosden Solutions",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      adminOnly: true,
    },
    {
      title: "Customers",
      url: "/customers",
      icon: Users,
      adminOnly: true,
    },
    {
      title: "Services",
      url: "/services",
      icon: Wrench,
      adminOnly: true,
    },
    {
      title: "Invoices",
      url: "/invoices",
      icon: FileText,
      adminOnly: true,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: File,
      adminOnly: false,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isAdmin = useIsAdmin();

  // Filter navigation items based on admin status
  const filteredNavMain = data.navMain.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
