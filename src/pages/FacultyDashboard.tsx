import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, FileText, Video, MessageSquare, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FacultyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleData?.role !== "faculty") {
        navigate(`/${roleData?.role}-dashboard`);
        return;
      }

      setProfile(profileData);
      setRole(roleData?.role || "");
      setLoading(false);
    };

    checkAuth();
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-primary rounded-full p-2">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Campus Connect</h1>
              <p className="text-sm text-muted-foreground">Faculty Portal</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium">{profile?.full_name}</p>
              <p className="text-sm text-muted-foreground capitalize">{role}</p>
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, Professor {profile?.full_name}!</h2>
          <p className="text-muted-foreground">Manage your courses and student activities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-primary/20">
            <CardHeader>
              <div className="bg-primary/10 rounded-full p-3 w-fit mb-2">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Create and manage subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View all your courses and create new ones
              </p>
              <Button className="w-full" onClick={() => navigate("/subjects")}>Manage Courses</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-secondary/20">
            <CardHeader>
              <div className="bg-secondary/10 rounded-full p-3 w-fit mb-2">
                <FileText className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Assignments</CardTitle>
              <CardDescription>Create and grade work</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Create assignments and review submissions
              </p>
              <Button variant="secondary" className="w-full" onClick={() => navigate("/assignments")}>Manage Assignments</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-primary/20">
            <CardHeader>
              <div className="bg-primary/10 rounded-full p-3 w-fit mb-2">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Video Lectures</CardTitle>
              <CardDescription>Upload course content</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage video lectures and resources
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate("/videos")}>Manage Videos</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-secondary/20">
            <CardHeader>
              <div className="bg-secondary/10 rounded-full p-3 w-fit mb-2">
                <MessageSquare className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Discussion Forum</CardTitle>
              <CardDescription>Moderate discussions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Engage with students and answer questions
              </p>
              <Button variant="secondary" className="w-full" onClick={() => navigate("/forum")}>View Forum</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FacultyDashboard;