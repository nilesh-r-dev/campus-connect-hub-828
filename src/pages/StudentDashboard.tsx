import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Video, MessageSquare, FolderOpen, Award, Bot, Briefcase, ClipboardList, FileQuestion, Newspaper } from "lucide-react";
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole="student">
      <div className="p-6 bg-gradient-to-br from-primary/5 via-background to-secondary/5 min-h-full relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative z-10">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome back, {profile?.full_name}!
            </h2>
            <p className="text-muted-foreground text-lg">Access your courses, assignments, and resources</p>
          </div>

          {enrolledSubjects.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-primary">My Courses</span>
                <span className="h-0.5 flex-1 bg-gradient-to-r from-primary/50 to-transparent rounded"></span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolledSubjects.map((subject) => (
                  <Card 
                    key={subject.id} 
                    className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-primary/20"
                    onClick={() => navigate(`/course/${subject.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="bg-primary/10 rounded-full p-2 w-fit mb-2 group-hover:bg-primary/20 transition-colors">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{subject.title}</CardTitle>
                      <CardDescription className="text-sm">
                        By {subject.profiles?.full_name || "Unknown"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-secondary">Quick Access</span>
            <span className="h-0.5 flex-1 bg-gradient-to-r from-secondary/50 to-transparent rounded"></span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-primary/20">
              <CardHeader className="pb-2">
                <div className="bg-primary/10 rounded-full p-2 w-fit mb-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">My Subjects</CardTitle>
                <CardDescription className="text-sm">Browse & enroll</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button size="sm" className="w-full" onClick={() => navigate("/subjects")}>View</Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-secondary/20">
              <CardHeader className="pb-2">
                <div className="bg-secondary/10 rounded-full p-2 w-fit mb-2">
                  <Video className="h-5 w-5 text-secondary" />
                </div>
                <CardTitle className="text-base">Videos</CardTitle>
                <CardDescription className="text-sm">Watch lectures</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button size="sm" variant="secondary" className="w-full" onClick={() => navigate("/videos")}>Watch</Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-primary/20">
              <CardHeader className="pb-2">
                <div className="bg-primary/10 rounded-full p-2 w-fit mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Assignments</CardTitle>
                <CardDescription className="text-sm">Submit work</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button size="sm" variant="outline" className="w-full" onClick={() => navigate("/assignments")}>View</Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-secondary/20">
              <CardHeader className="pb-2">
                <div className="bg-secondary/10 rounded-full p-2 w-fit mb-2">
                  <Award className="h-5 w-5 text-secondary" />
                </div>
                <CardTitle className="text-base">Grades</CardTitle>
                <CardDescription className="text-sm">Track performance</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button size="sm" variant="secondary" className="w-full" onClick={() => navigate("/grades")}>View</Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-primary/20">
              <CardHeader className="pb-2">
                <div className="bg-primary/10 rounded-full p-2 w-fit mb-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Documents</CardTitle>
                <CardDescription className="text-sm">Manage files</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button size="sm" variant="outline" className="w-full" onClick={() => navigate("/documents")}>Manage</Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-secondary/20">
              <CardHeader className="pb-2">
                <div className="bg-secondary/10 rounded-full p-2 w-fit mb-2">
                  <MessageSquare className="h-5 w-5 text-secondary" />
                </div>
                <CardTitle className="text-base">Forum</CardTitle>
                <CardDescription className="text-sm">Discussions</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button size="sm" variant="secondary" className="w-full" onClick={() => navigate("/forum")}>Join</Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-accent/30">
              <CardHeader className="pb-2">
                <div className="bg-accent/10 rounded-full p-2 w-fit mb-2">
                  <Newspaper className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="text-base">Career News</CardTitle>
                <CardDescription className="text-sm">Opportunities</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button size="sm" variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground" onClick={() => navigate("/career-news")}>Browse</Button>
              </CardContent>
            </Card>
          </div>

          {/* AI Features Section */}
          <h3 className="text-xl font-semibold mt-10 mb-4 flex items-center gap-2">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">AI Assistants</span>
            <span className="h-0.5 flex-1 bg-gradient-to-r from-purple-500/50 to-transparent rounded"></span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
              <CardHeader className="pb-2">
                <div className="bg-purple-500/20 rounded-full p-2 w-fit mb-2">
                  <Bot className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-base">AI Tutor</CardTitle>
                <CardDescription className="text-sm">Get instant help</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button size="sm" variant="outline" className="w-full border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white" onClick={() => navigate("/ai-tutor")}>Chat</Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/30">
              <CardHeader className="pb-2">
                <div className="bg-green-500/20 rounded-full p-2 w-fit mb-2">
                  <ClipboardList className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-base">Exam Prep</CardTitle>
                <CardDescription className="text-sm">Study strategies</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button size="sm" variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-500 hover:text-white" onClick={() => navigate("/exam-prep-chat")}>Prepare</Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/30">
              <CardHeader className="pb-2">
                <div className="bg-orange-500/20 rounded-full p-2 w-fit mb-2">
                  <Briefcase className="h-5 w-5 text-orange-600" />
                </div>
                <CardTitle className="text-base">Career Guide</CardTitle>
                <CardDescription className="text-sm">Plan your future</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button size="sm" variant="outline" className="w-full border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white" onClick={() => navigate("/career-guidance-chat")}>Explore</Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/30">
              <CardHeader className="pb-2">
                <div className="bg-pink-500/20 rounded-full p-2 w-fit mb-2">
                  <FileQuestion className="h-5 w-5 text-pink-600" />
                </div>
                <CardTitle className="text-base">PYQ Helper</CardTitle>
                <CardDescription className="text-sm">Past papers</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button size="sm" variant="outline" className="w-full border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white" onClick={() => navigate("/pyq-chat")}>Analyze</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ChatbotWidget />
    </DashboardLayout>
  );
};

export default StudentDashboard;
