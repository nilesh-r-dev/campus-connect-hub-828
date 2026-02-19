import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Video, MessageSquare, FolderOpen, Award, Bot, Briefcase, ClipboardList, FileQuestion, Newspaper, Sparkles } from "lucide-react";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { DashboardLayout } from "@/components/DashboardLayout";

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [enrolledSubjects, setEnrolledSubjects] = useState<any[]>([]);
  const navigate = useNavigate();

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

      if (roleData?.role !== "student") {
        navigate(`/${roleData?.role}-dashboard`);
        return;
      }

      setProfile(profileData);

      if (profileData) {
        const { data: enrollments } = await supabase
          .from("enrollments")
          .select("*, subjects(*, profiles!subjects_faculty_id_fkey(full_name))")
          .eq("student_id", profileData.id);

        setEnrolledSubjects(enrollments?.map(e => e.subjects) || []);
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
            <div className="absolute inset-2 animate-spin rounded-full border-4 border-secondary/20 border-t-secondary" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
          <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const quickAccessCards = [
    { icon: BookOpen, title: "My Subjects", desc: "Browse & enroll", color: "primary", action: () => navigate("/subjects"), label: "View", variant: "default" as const },
    { icon: Video, title: "Videos", desc: "Watch lectures", color: "secondary", action: () => navigate("/videos"), label: "Watch", variant: "secondary" as const },
    { icon: FileText, title: "Assignments", desc: "Submit work", color: "primary", action: () => navigate("/assignments"), label: "View", variant: "outline" as const },
    { icon: Award, title: "Grades", desc: "Track performance", color: "secondary", action: () => navigate("/grades"), label: "View", variant: "secondary" as const },
    { icon: FolderOpen, title: "Documents", desc: "Manage files", color: "primary", action: () => navigate("/documents"), label: "Manage", variant: "outline" as const },
    { icon: MessageSquare, title: "Forum", desc: "Discussions", color: "secondary", action: () => navigate("/forum"), label: "Join", variant: "secondary" as const },
    { icon: Newspaper, title: "Career News", desc: "Opportunities", color: "accent", action: () => navigate("/career-news"), label: "Browse", variant: "outline" as const },
  ];

  const aiCards = [
    { icon: Bot, title: "AI Tutor", desc: "Get instant help", colorClass: "from-purple-500/10 to-blue-500/10 border-purple-500/30", iconBg: "bg-purple-500/20", iconColor: "text-purple-600", btnClass: "border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white", action: () => navigate("/ai-tutor"), label: "Chat" },
    { icon: ClipboardList, title: "Exam Prep", desc: "Study strategies", colorClass: "from-green-500/10 to-teal-500/10 border-green-500/30", iconBg: "bg-green-500/20", iconColor: "text-green-600", btnClass: "border-green-500 text-green-600 hover:bg-green-500 hover:text-white", action: () => navigate("/exam-prep-chat"), label: "Prepare" },
    { icon: Briefcase, title: "Career Guide", desc: "Plan your future", colorClass: "from-orange-500/10 to-amber-500/10 border-orange-500/30", iconBg: "bg-orange-500/20", iconColor: "text-orange-600", btnClass: "border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white", action: () => navigate("/career-guidance-chat"), label: "Explore" },
    { icon: FileQuestion, title: "PYQ Helper", desc: "Past papers", colorClass: "from-pink-500/10 to-rose-500/10 border-pink-500/30", iconBg: "bg-pink-500/20", iconColor: "text-pink-600", btnClass: "border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white", action: () => navigate("/pyq-chat"), label: "Analyze" },
  ];

  return (
    <DashboardLayout userRole="student">
      <div className="p-6 bg-gradient-to-br from-primary/5 via-background to-secondary/5 min-h-full relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-bounce-slow" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative z-10">
          {/* Welcome Header */}
          <div className="mb-10 animate-slide-right">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-6 w-6 text-primary animate-spin-slow" />
              <h2
                className="text-3xl md:text-4xl font-black"
                style={{
                  background: 'linear-gradient(135deg, hsl(262 83% 58%), hsl(199 89% 48%), hsl(280 70% 60%))',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradient-x 3s ease infinite',
                }}
              >
                Welcome back, {profile?.full_name}!
              </h2>
            </div>
            <p className="text-muted-foreground text-lg ml-9">Access your courses, assignments, and AI resources</p>
          </div>

          {/* Enrolled Courses */}
          {enrolledSubjects.length > 0 && (
            <div className="mb-10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-primary">My Courses</span>
                <span className="h-0.5 flex-1 bg-gradient-to-r from-primary/50 to-transparent rounded"></span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolledSubjects.map((subject, i) => (
                  <Card
                    key={subject.id}
                    className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-400 cursor-pointer border-primary/20 relative overflow-hidden animate-pop-in"
                    style={{ animationDelay: `${i * 0.1}s` }}
                    onClick={() => navigate(`/course/${subject.id}`)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary w-0 group-hover:w-full transition-all duration-500" />
                    <CardHeader className="pb-2 relative">
                      <div className="bg-primary/10 rounded-full p-2 w-fit mb-2 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">{subject.title}</CardTitle>
                      <CardDescription className="text-sm">
                        By {subject.profiles?.full_name || "Unknown"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quick Access */}
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <span className="text-secondary">Quick Access</span>
            <span className="h-0.5 flex-1 bg-gradient-to-r from-secondary/50 to-transparent rounded"></span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
            {quickAccessCards.map((card, i) => (
              <Card
                key={i}
                className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-${card.color}/20 relative overflow-hidden animate-fade-in`}
                style={{ animationDelay: `${0.2 + i * 0.07}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-primary/3 group-hover:to-secondary/3 transition-all duration-500" />
                <div className={`absolute top-0 right-0 w-16 h-16 bg-${card.color}/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
                <CardHeader className="pb-2 relative">
                  <div className={`bg-${card.color}/10 rounded-full p-2 w-fit mb-2 group-hover:scale-125 group-hover:bg-${card.color}/20 transition-all duration-300`}>
                    <card.icon className={`h-5 w-5 text-${card.color}`} />
                  </div>
                  <CardTitle className="text-base group-hover:text-primary transition-colors duration-300">{card.title}</CardTitle>
                  <CardDescription className="text-sm">{card.desc}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 relative">
                  <Button size="sm" variant={card.variant} className="w-full hover:scale-105 transition-transform duration-200" onClick={card.action}>
                    {card.label}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Assistants */}
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <span
              style={{
                background: 'linear-gradient(135deg, hsl(280 70% 60%), hsl(320 70% 60%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              AI Assistants
            </span>
            <Sparkles className="h-5 w-5 text-purple-500 animate-spin-slow" />
            <span className="h-0.5 flex-1 bg-gradient-to-r from-purple-500/50 to-transparent rounded"></span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiCards.map((card, i) => (
              <Card
                key={i}
                className={`group hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-gradient-to-br ${card.colorClass} relative overflow-hidden animate-pop-in`}
                style={{ animationDelay: `${0.5 + i * 0.1}s` }}
              >
                {/* Animated glow ring */}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: 'inset 0 0 30px rgba(139, 92, 246, 0.1)' }} />
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20 group-hover:opacity-40 group-hover:scale-150 transition-all duration-500" style={{ background: 'radial-gradient(circle, currentColor, transparent)' }} />
                <CardHeader className="pb-2 relative">
                  <div className={`${card.iconBg} rounded-full p-2 w-fit mb-2 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300`}>
                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  <CardTitle className="text-base">{card.title}</CardTitle>
                  <CardDescription className="text-sm">{card.desc}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 relative">
                  <Button size="sm" variant="outline" className={`w-full ${card.btnClass} hover:scale-105 transition-all duration-200`} onClick={card.action}>
                    {card.label}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <ChatbotWidget />
    </DashboardLayout>
  );
};

export default StudentDashboard;
