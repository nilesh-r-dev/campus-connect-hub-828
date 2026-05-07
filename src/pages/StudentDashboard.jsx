import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen, FileText, Video, MessageSquare, FolderOpen, Award,
  ClipboardList, Briefcase, FileQuestion, Newspaper, Sparkles,
  Clock, TrendingUp, CheckCircle2, AlertCircle, ArrowRight, Zap
} from "lucide-react";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { DashboardLayout } from "@/components/DashboardLayout";

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [stats, setStats] = useState({ subjects: 0, pending: 0, completed: 0, videos: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

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
        navigate(`/${roleData?.role === "admin" ? "student" : roleData?.role}-dashboard`);
        return;
      }

      setProfile(profileData);

      if (profileData) {
        // Enrolled subjects
        const { data: enrollments } = await supabase
          .from("enrollments")
          .select("*, subjects(*, profiles!subjects_faculty_id_fkey(full_name))")
          .eq("student_id", profileData.id);
        const subjects = enrollments?.map(e => e.subjects) || [];
        setEnrolledSubjects(subjects);

        // Assignments for enrolled subjects
        const subjectIds = subjects.map(s => s.id);
        if (subjectIds.length > 0) {
          const { data: assignments } = await supabase
            .from("assignments")
            .select("*, subjects(title)")
            .in("subject_id", subjectIds)
            .order("created_at", { ascending: false });

          // Check which assignments have submissions
          const { data: submissions } = await supabase
            .from("submissions")
            .select("assignment_id, status, created_at")
            .eq("student_id", profileData.id);

          const submittedIds = new Set((submissions || []).map(s => s.assignment_id));
          const pending = (assignments || []).filter(a => !submittedIds.has(a.id));
          setPendingAssignments(pending.slice(0, 3));
          setRecentSubmissions((submissions || []).slice(0, 3));

          setStats({
            subjects: subjects.length,
            pending: pending.length,
            completed: (submissions || []).filter(s => s.status === "graded").length,
            videos: 0,
          });
        } else {
          setStats({ subjects: 0, pending: 0, completed: 0, videos: 0 });
        }
      }
      setLoading(false);
    };
    loadDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
          </div>
          <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const quickCards = [
    { icon: BookOpen, title: "Subjects", desc: "Browse & enroll", color: "bg-primary/10 text-primary", path: "/subjects" },
    { icon: Video, title: "Videos", desc: "Watch lectures", color: "bg-secondary/10 text-secondary", path: "/videos" },
    { icon: FileText, title: "Assignments", desc: "Submit work", color: "bg-primary/10 text-primary", path: "/assignments" },
    { icon: Award, title: "Grades", desc: "Track performance", color: "bg-secondary/10 text-secondary", path: "/grades" },
    { icon: FolderOpen, title: "Documents", desc: "Manage files", color: "bg-accent/10 text-accent-foreground", path: "/documents" },
    { icon: MessageSquare, title: "Forum", desc: "Discussions", color: "bg-primary/10 text-primary", path: "/forum" },
  ];

  const aiTools = [
    { icon: ClipboardList, title: "Exam Prep", desc: "AI study strategies", color: "border-green-500/30", iconBg: "bg-green-500/15", iconColor: "text-green-600", path: "/exam-prep-chat" },
    { icon: Briefcase, title: "Career Guide", desc: "Plan your future", color: "border-orange-500/30", iconBg: "bg-orange-500/15", iconColor: "text-orange-600", path: "/career-guidance-chat" },
    { icon: FileQuestion, title: "PYQ Helper", desc: "Past paper analysis", color: "border-pink-500/30", iconBg: "bg-pink-500/15", iconColor: "text-pink-600", path: "/pyq-chat" },
    { icon: Newspaper, title: "Career News", desc: "Opportunities", color: "border-cyan-500/30", iconBg: "bg-cyan-500/15", iconColor: "text-cyan-600", path: "/career-news" },
  ];

  return (
    <DashboardLayout userRole="student">
      <div className="p-6 lg:p-8 min-h-full">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-elegant">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
                Welcome back, {profile?.full_name || "Student"}
              </h1>
              <p className="text-sm text-muted-foreground">Here's what's happening in your learning journey</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                <BookOpen className="h-3.5 w-3.5" /> Subjects
              </div>
              <CardTitle className="text-3xl font-display font-bold">{stats.subjects}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Enrolled courses</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-secondary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                <AlertCircle className="h-3.5 w-3.5" /> Pending
              </div>
              <CardTitle className="text-3xl font-display font-bold">{stats.pending}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Assignments due</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-green-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Completed
              </div>
              <CardTitle className="text-3xl font-display font-bold">{stats.completed}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Graded submissions</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-accent/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                <TrendingUp className="h-3.5 w-3.5" /> Progress
              </div>
              <CardTitle className="text-3xl font-display font-bold">
                {stats.subjects > 0 ? Math.round((stats.completed / (stats.pending + stats.completed || 1)) * 100) : 0}%
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Progress value={stats.subjects > 0 ? (stats.completed / (stats.pending + stats.completed || 1)) * 100 : 0} className="h-1.5" />
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Courses */}
            {enrolledSubjects.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-lg flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" /> My Courses
                  </h3>
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/subjects")}>
                    View all <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {enrolledSubjects.map((subject) => (
                    <Card
                      key={subject.id}
                      className="group cursor-pointer border-2 border-foreground/10 hover:border-primary/30 hover:shadow-card transition-all duration-300"
                      onClick={() => navigate(`/course/${subject.id}`)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className={`w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <BookOpen className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        </div>
                        <CardTitle className="text-base mt-2 group-hover:text-primary transition-colors">{subject.title}</CardTitle>
                        <CardDescription className="text-xs">By {subject.profiles?.full_name || "Faculty"}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>In progress</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Access */}
            <div>
              <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-secondary" /> Quick Access
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quickCards.map((card, i) => (
                  <Card
                    key={i}
                    className="group cursor-pointer border-2 border-foreground/10 hover:shadow-card hover:-translate-y-1 transition-all duration-200"
                    onClick={() => navigate(card.path)}
                  >
                    <CardHeader className="pb-3">
                      <div className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                        <card.icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-sm">{card.title}</CardTitle>
                      <CardDescription className="text-xs">{card.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Side Column */}
          <div className="space-y-6">
            {/* Pending Assignments */}
            <Card className="border-2 border-foreground/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-display font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-secondary" /> Pending Work
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {pendingAssignments.length > 0 ? pendingAssignments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => navigate(`/assignments`)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.subjects?.title || "Subject"}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    All caught up!
                  </div>
                )}
                {pendingAssignments.length > 0 && (
                  <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => navigate("/assignments")}>
                    View all assignments <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* AI Assistants */}
            <div>
              <h3 className="font-display font-bold text-sm flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-purple-500" /> AI Tools
              </h3>
              <div className="space-y-2">
                {aiTools.map((tool, i) => (
                  <Card
                    key={i}
                    className={`group cursor-pointer border ${tool.color} hover:shadow-card transition-all duration-200`}
                    onClick={() => navigate(tool.path)}
                  >
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${tool.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                          <tool.icon className={`h-4 w-4 ${tool.iconColor}`} />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{tool.title}</CardTitle>
                          <CardDescription className="text-xs">{tool.desc}</CardDescription>
                        </div>
                        <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChatbotWidget />
    </DashboardLayout>
  );
};

export default StudentDashboard;
