"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  // DropdownMenu,
} from "@/components/ui/sidebar";
import { auth } from "@/firebaseConfig";
import {
  Calendar,
  Home,
  UsersRound,
  Building2,
  User2,
  ChevronUp,
  CircleUserRound,
  ShieldUser,
  DoorOpen,
  MessageCircle,
  MessageCircleQuestionMark,
} from "lucide-react";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export function AppSidebar() {
  const user = auth.currentUser?.displayName
  const pathname = usePathname();
  const router = useRouter();
  // menu items
  const items = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Orders", icon: UsersRound, href: "/orders" },
    
  ];

  // const supportItems = [
  //   { label: "Feedback", icon: MessageCircle, href: "/dashboard/feedback" },
  //   {
  //     label: "Support",
  //     icon: MessageCircleQuestionMark,
  //     href: "/dashboard/support",
  //   },
  // ];
  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      className="border-r border-slate-300 bg-slate-50"
    >
      {/* SIDEBAR HEADER */}
      <SidebarHeader />
      {/* <SidebarTrigger /> */}
      {/* </SidebarHeader> */}
      {/* SIDEBAR CONTENT */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase font-semibold text-slate-900">
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items
                // .filter(item => item.roles.includes(userRole!))
                .map((item, i) => {
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuButton>
                        <a href={item.href} className="font-bold flex gap-2">
                          <item.icon className="text-slate-500" />
                          <span className="text-slate-500">{item.label}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
      </SidebarContent>
      {/* SIDEBAR FOOTER */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <SidebarMenuButton className="text-slate-500">
                  <User2 /> {user || "User"}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                {/* <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem> */}
                <DropdownMenuItem
                  onClick={() => {
                    auth.signOut();
                    router.push("/auth/login");
                  }}
                  className='text-slate-500'
                >
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
