"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/lib/actions/auth.action";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function LogoutButton() {
  const handleLogout = async () => {
    await logout();
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
