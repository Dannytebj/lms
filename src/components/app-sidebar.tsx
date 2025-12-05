import { Settings, Book, User, Users, Home } from "lucide-react";
import { Role } from "@/generated/prisma/enums";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LogoutButton } from "@/components/logout-button";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
  },
  {
    title: "Users",
    url: "/dashboard/admin",
    icon: Users,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    title: "Courses",
    url: "/dashboard/admin/courses",
    icon: Book,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
];

interface AppSidebarProps {
  userRole?: Role;
}

export function AppSidebar({ userRole = "USER" }: AppSidebarProps) {
  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <LogoutButton />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
