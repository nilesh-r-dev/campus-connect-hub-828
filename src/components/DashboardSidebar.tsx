import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  BookOpen,
  Video,
  FileText,
  MessageSquare,
  User,
  LogOut,
  ClipboardList,
  Award,
  Briefcase,
  Brain,
  Newspaper,
  HelpCircle,
  FileQuestion,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  userRole: "student" | "faculty";
  profile: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    bio?: string | null;
    college_id?: string | null;
  } | null;
  onProfileClick: () => void;
  onLogout: () => void;
}

const studentMenuItems = [
  { title: "Dashboard", url: "/student-dashboard", icon: GraduationCap },
  { title: "My Subjects", url: "/subjects", icon: BookOpen },
  { title: "Videos", url: "/videos", icon: Video },
  { title: "Assignments", url: "/assignments", icon: FileText },
  { title: "Grades", url: "/grades", icon: Award },
  { title: "Documents", url: "/documents", icon: Upload },
  { title: "Forum", url: "/forum", icon: MessageSquare },
  { title: "AI Tutor", url: "/ai-tutor", icon: Brain },
  { title: "Exam Prep", url: "/exam-prep-chat", icon: ClipboardList },
  { title: "Career Guidance", url: "/career-guidance-chat", icon: Briefcase },
  { title: "PYQ Helper", url: "/pyq-chat", icon: FileQuestion },
  { title: "Career News", url: "/career-news", icon: Newspaper },
];

const facultyMenuItems = [
  { title: "Dashboard", url: "/faculty-dashboard", icon: GraduationCap },
  { title: "My Courses", url: "/subjects", icon: BookOpen },
  { title: "Video Lectures", url: "/faculty/videos", icon: Video },
  { title: "Quizzes", url: "/faculty/quizzes", icon: ClipboardList },
  { title: "Assignments", url: "/faculty/assignments", icon: FileText },
  { title: "Certificates", url: "/faculty/certificates", icon: Award },
  { title: "Forum", url: "/forum", icon: MessageSquare },
  { title: "Career News", url: "/career-news", icon: Briefcase },
];

export function DashboardSidebar({ userRole, profile, onProfileClick, onLogout }: DashboardSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = userRole === "student" ? studentMenuItems : facultyMenuItems;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-full p-2">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg">Campus Connect</h1>
              <p className="text-xs text-muted-foreground capitalize">{userRole} Portal</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      tooltip={item.title}
                      className={cn(
                        "cursor-pointer",
                        isActive && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3",
              collapsed && "justify-center px-2"
            )}
            onClick={onProfileClick}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {profile?.full_name ? getInitials(profile.full_name) : "U"}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium truncate max-w-[120px]">
                  {profile?.full_name || "User"}
                </span>
                <span className="text-xs text-muted-foreground">View Profile</span>
              </div>
            )}
          </Button>
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            className={cn(
              "w-full text-destructive hover:text-destructive hover:bg-destructive/10",
              !collapsed && "justify-start gap-3"
            )}
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
