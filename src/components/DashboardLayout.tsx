import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ProfileSheet } from "@/components/ProfileSheet";
import { useToast } from "@/hooks/use-toast";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: "student" | "faculty";
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const [profile, setProfile] = useState<{
    id: string;
    full_name: string;
    avatar_url?: string | null;
    bio?: string | null;
    college_id?: string | null;
  } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, bio, college_id")
      .eq("user_id", session.user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar
          userRole={userRole}
          profile={profile}
          onProfileClick={() => setProfileOpen(true)}
          onLogout={handleLogout}
        />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <SidebarTrigger className="-ml-1">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <div className="flex-1" />
          </header>
          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
      <ProfileSheet
        open={profileOpen}
        onOpenChange={setProfileOpen}
        profile={profile}
        userRole={userRole}
        onProfileUpdate={loadProfile}
      />
    </SidebarProvider>
  );
}
