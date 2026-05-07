import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen, FileText, Video, MessageSquare, Briefcase, ClipboardList,
  Award, Users, TrendingUp, ArrowRight, Sparkles, Zap, CheckCircle2,
  AlertCircle, BarChart3
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

const FacultyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [mySubjects, setMySubjects] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [stats, setStats] = useState({ subjects: 0, students: 0, assignments: 0, submissions: 0 });
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

      if (roleData?.role !== "faculty") {
        const dashboardRole = roleData?.role === "admin" ? "student" : roleData?.role;
        navigate(`/${dashboardRole}-dashboard`);
        return;
      }

      setProfile(profileData);

      if (profileData) {
        // Subjects taught by this faculty
        const { data: subjects } = await supabase
          .from("subjects")
          .select("*, profiles(full_name)")
          .eq("faculty_id", profileData.id)
          .order("created_at", { ascending: false });
        const subjectList = subjects || [];
        setMySubjects(subjectList);

        const subjectIds = subjectList.map(s => s.id);

        // Students enrolled in these subjects
        let studentCount = 0;
        if (subjectIds.length > 0) {
          const { count } = await supabase
            .from("enrollments")
            .select("*", { count: "exact", head: true })
            .in("subject_id", subjectIds);
          studentCount = count || 0;

          // Assignments
          const { data: assignments } = await supabase
            .from("assignments")
            .select("*, subjects(title)")
            .in("subject_id", subjectIds)
            .order("created_at", { ascending: false })
            .limit(3);
          setRecentAssignments(assignments || []);

          // Total submissions
          const { count: subCount } = await supabase
            .from("submissions")
            .select("*", { count: "exact", head: true })
            .in("assignment_id", (assignments || []).map(a => a.id));

          setStats({
            subjects: subjectList.length,
            students: studentCount,
            assignments: assignments?.length || 0,
            submissions: subCount || 0,
          });
        } else {
          setStats({ subjects: 0, students: 0, assignments: 0, submissions: 0 });
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const managementCards = [
    { icon: BookOpen, title: "My Courses", desc: "Create & manage subjects", color: "bg-primary/10 text-primary", path: "/subjects" },
    { icon: Video, title: "Video Lectures", desc: "Upload & organize", color: "bg-secondary/10 text-secondary", path: "/faculty/videos" },
    { icon: ClipboardList, title: "Quizzes", desc: "Create assessments", color: "bg-accent/10 text-accent-foreground", path: "/faculty/quizzes" },
    { icon: FileText, title: "Assignments", desc: "Upload & review", color: "bg-primary/10 text-primary", path: "/faculty/assignments" },
    { icon: Award, title: "Certificates", desc: "Issue completions", color: "bg-secondary/10 text-secondary", path: "/faculty/certificates" },
    { icon: MessageSquare, title: "Forum", desc: "Engage & moderate", color: "bg-accent/10 text-accent-foreground", path: "/forum" },
  ];

  return (
    <DashboardLayout userRole="faculty">
      <div className="p-6 lg:p-8 min-h-full">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl gradient-secondary flex items-center justify-center shadow-elegant">
              <Sparkles className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
                Welcome, {profile?.full_name || "Professor"}
              </h1>
              <p className="text-sm text-muted-foreground">Manage your courses and student activities</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                <BookOpen className="h-3.5 w-3.5" /> Courses
              </div>
              <CardTitle className="text-3xl font-display font-bold">{stats.subjects}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Subjects you teach</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-secondary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                <Users className="h-3.5 w-3.5" /> Students
              </div>
              <CardTitle className="text-3xl font-display font-bold">{stats.students}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Total enrolled</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-green-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                <FileText className="h-3.5 w-3.5" /> Assignments
              </div>
              <CardTitle className="text-3xl font-display font-bold">{stats.assignments}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Created by you</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-accent/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                <BarChart3 className="h-3.5 w-3.5" /> Submissions
              </div>
              <CardTitle className="text-3xl font-display font-bold">{stats.submissions}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Student submissions</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Courses */}
            {mySubjects.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-lg flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" /> My Courses
                  </h3>
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/subjects")}>
                    Manage all <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {mySubjects.map((subject) => (
                    <Card
                      key={subject.id}
                      className="group cursor-pointer border-2 border-foreground/10 hover:border-primary/30 hover:shadow-card transition-all duration-300"
                      onClick={() => navigate(`/course/${subject.id}`)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BookOpen className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        </div>
                        <CardTitle className="text-base mt-2 group-hover:text-primary transition-colors">{subject.title}</CardTitle>
                        <CardDescription className="text-xs">{subject.code || "No code"}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{subject.enrollment_count || 0} students</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Management Grid */}
            <div>
              <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-secondary" /> Management Tools
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {managementCards.map((card, i) => (
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
            {/* Recent Assignments */}
            <Card className="border-2 border-foreground/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-display font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-secondary" /> Recent Assignments
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {recentAssignments.length > 0 ? recentAssignments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => navigate("/faculty/assignments")}
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
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No assignments yet
                  </div>
                )}
                {recentAssignments.length > 0 && (
                  <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => navigate("/faculty/assignments")}>
                    View all <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Career News */}
            <Card
              className="group cursor-pointer border-2 border-accent/20 hover:shadow-card transition-all"
              onClick={() => navigate("/career-news")}
            >
              <CardHeader className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Briefcase className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm">Career News</CardTitle>
                    <CardDescription className="text-xs">Post opportunities for students</CardDescription>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;
