import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, FileText, Video, MessageSquare, FolderOpen, LogOut, Award, Bot, Briefcase, FileSearch } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatbotWidget } from "@/components/ChatbotWidget";

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState<string>("");
  const [enrolledSubjects, setEnrolledSubjects] = useState<any[]>([]);
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

      if (roleData?.role !== "student") {
        navigate(`/${roleData?.role}-dashboard`);
        return;
      }

      setProfile(profileData);
      setRole(roleData?.role || "");

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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background via-40% to-secondary/10 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <header className="border-b bg-card/80 shadow-lg sticky top-0 z-50 backdrop-blur-md animate-slide-up">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary to-accent rounded-full p-2 hover:scale-110 hover:rotate-12 transition-all duration-300 shadow-lg">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Campus Connect</h1>
              <p className="text-sm text-muted-foreground">Student Portal</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium">{profile?.full_name}</p>
              <p className="text-sm text-muted-foreground capitalize">{role}</p>
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout} className="hover:scale-110 hover:rotate-12 transition-all duration-300 border-primary/20">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
            Welcome back, {profile?.full_name}!
          </h2>
          <p className="text-muted-foreground text-lg">Access your courses, assignments, and resources</p>
        </div>

        {enrolledSubjects.length > 0 && (
          <div className="mb-12 animate-scale-in" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">My Courses</span>
              <span className="h-1 flex-1 bg-gradient-to-r from-primary/50 to-transparent rounded"></span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledSubjects.map((subject, index) => (
                <Card 
                  key={subject.id} 
                  className="group hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer border-primary/30 bg-card/50 backdrop-blur-sm animate-fade-in overflow-hidden relative"
                  onClick={() => navigate(`/course/${subject.id}`)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="relative">
                    <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-3 w-fit mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <BookOpen className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors duration-300">{subject.title}</CardTitle>
                    <CardDescription>
                      By {subject.profiles?.full_name || "Unknown"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-sm text-muted-foreground">
                      {subject.description || "No description"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <h3 className="text-2xl font-semibold mb-6 animate-fade-in flex items-center gap-2" style={{ animationDelay: "0.2s" }}>
          <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Quick Access</span>
          <span className="h-1 flex-1 bg-gradient-to-r from-secondary/50 to-transparent rounded"></span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer border-primary/30 bg-card/50 backdrop-blur-sm animate-slide-up overflow-hidden relative" style={{ animationDelay: "0.3s" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <div className="bg-gradient-to-br from-primary to-primary-glow rounded-2xl p-3 w-fit mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">My Subjects</CardTitle>
              <CardDescription>View and join available courses</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm text-muted-foreground mb-4">
                Access all your enrolled subjects and browse new ones
              </p>
              <Button className="w-full shadow-lg hover:shadow-xl transition-shadow group-hover:scale-105" onClick={() => navigate("/subjects")}>View Subjects</Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer border-accent/30 bg-card/50 backdrop-blur-sm animate-slide-up overflow-hidden relative" style={{ animationDelay: "0.4s" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <div className="bg-gradient-to-br from-accent to-accent-glow rounded-2xl p-3 w-fit mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Award className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle className="group-hover:text-accent transition-colors">My Grades</CardTitle>
              <CardDescription>Track your performance</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm text-muted-foreground mb-4">
                View grades from assignments and quizzes
              </p>
              <Button variant="outline" className="w-full border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground shadow-lg hover:shadow-xl transition-all group-hover:scale-105" onClick={() => navigate("/grades")}>
                View Grades
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer border-secondary/30 bg-card/50 backdrop-blur-sm animate-slide-up overflow-hidden relative" style={{ animationDelay: "0.5s" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <div className="bg-gradient-to-br from-secondary to-secondary-glow rounded-2xl p-3 w-fit mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <FileText className="h-6 w-6 text-secondary-foreground" />
              </div>
              <CardTitle className="group-hover:text-secondary transition-colors">Assignments</CardTitle>
              <CardDescription>Submit and track your work</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm text-muted-foreground mb-4">
                View pending assignments and submission deadlines
              </p>
              <Button variant="secondary" className="w-full shadow-lg hover:shadow-xl transition-shadow group-hover:scale-105" onClick={() => navigate("/assignments")}>View Assignments</Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer border-accent/30 bg-card/50 backdrop-blur-sm animate-slide-up overflow-hidden relative" style={{ animationDelay: "0.6s" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <div className="bg-gradient-to-br from-accent to-accent-glow rounded-2xl p-3 w-fit mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Video className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle className="group-hover:text-accent transition-colors">Video Lectures</CardTitle>
              <CardDescription>Watch recorded sessions</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm text-muted-foreground mb-4">
                Access video lectures and study materials
              </p>
              <Button variant="outline" className="w-full border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground shadow-lg hover:shadow-xl transition-all group-hover:scale-105" onClick={() => navigate("/videos")}>
                Watch Videos
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer border-primary/30 bg-card/50 backdrop-blur-sm animate-slide-up overflow-hidden relative" style={{ animationDelay: "0.7s" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <div className="bg-gradient-to-br from-primary to-primary-glow rounded-2xl p-3 w-fit mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <MessageSquare className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">Discussion Forum</CardTitle>
              <CardDescription>Engage with peers</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm text-muted-foreground mb-4">
                Participate in course discussions and Q&A
              </p>
              <Button variant="outline" className="w-full border-primary/50 hover:bg-primary hover:text-primary-foreground shadow-lg hover:shadow-xl transition-all group-hover:scale-105" onClick={() => navigate("/forum")}>Join Discussion</Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer border-secondary/30 bg-card/50 backdrop-blur-sm animate-slide-up overflow-hidden relative" style={{ animationDelay: "0.8s" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <div className="bg-gradient-to-br from-secondary to-secondary-glow rounded-2xl p-3 w-fit mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <FolderOpen className="h-6 w-6 text-secondary-foreground" />
              </div>
              <CardTitle className="group-hover:text-secondary transition-colors">My Documents</CardTitle>
              <CardDescription>Secure personal storage</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm text-muted-foreground mb-4">
                Store and manage your important documents
              </p>
              <Button variant="secondary" className="w-full shadow-lg hover:shadow-xl transition-shadow group-hover:scale-105" onClick={() => navigate("/documents")}>View Documents</Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer bg-gradient-to-br from-primary/20 to-accent/20 border-primary/40 backdrop-blur-sm animate-slide-up overflow-hidden relative" style={{ animationDelay: "0.9s" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <div className="bg-gradient-to-br from-primary via-accent to-primary-glow rounded-2xl p-3 w-fit mb-3 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-pulse-glow">
                <Bot className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AI Tutor</CardTitle>
              <CardDescription>Exam prep & career guidance</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm text-muted-foreground mb-4">
                Get help with exams and career questions
              </p>
              <Button className="w-full shadow-xl hover:shadow-2xl transition-all group-hover:scale-105 bg-gradient-to-r from-primary to-accent" onClick={() => navigate("/ai-tutor")}>Chat with AI</Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer bg-gradient-to-br from-accent/20 to-secondary/20 border-accent/40 backdrop-blur-sm animate-slide-up overflow-hidden relative" style={{ animationDelay: "1s" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <div className="bg-gradient-to-br from-accent via-secondary to-accent-glow rounded-2xl p-3 w-fit mb-3 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Briefcase className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">Career News</CardTitle>
              <CardDescription>Internships & opportunities</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm text-muted-foreground mb-4">
                Get real-time career and internship updates
              </p>
              <Button variant="outline" className="w-full border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground shadow-lg hover:shadow-xl transition-all group-hover:scale-105" onClick={() => navigate("/career-news")}>View Updates</Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer bg-gradient-to-br from-secondary/20 to-primary/20 border-secondary/40 backdrop-blur-sm animate-slide-up overflow-hidden relative" style={{ animationDelay: "1.1s" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <div className="bg-gradient-to-br from-secondary via-primary to-secondary-glow rounded-2xl p-3 w-fit mb-3 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <FileSearch className="h-6 w-6 text-secondary-foreground" />
              </div>
              <CardTitle className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Question Paper Analysis</CardTitle>
              <CardDescription>AI-powered exam insights</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm text-muted-foreground mb-4">
                Upload papers and get important questions
              </p>
              <Button variant="outline" className="w-full border-secondary/50 text-secondary hover:bg-secondary hover:text-secondary-foreground shadow-lg hover:shadow-xl transition-all group-hover:scale-105" onClick={() => navigate("/question-paper-analysis")}>Analyze Papers</Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer bg-gradient-to-br from-primary/20 to-accent/20 border-primary/40 backdrop-blur-sm animate-slide-up overflow-hidden relative" style={{ animationDelay: "1.2s" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <div className="bg-gradient-to-br from-primary via-accent to-primary-glow rounded-2xl p-3 w-fit mb-3 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Exam Prep Chat</CardTitle>
              <CardDescription>Personalized study strategies</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm text-muted-foreground mb-4">
                Get study plans and exam preparation tips
              </p>
              <Button className="w-full shadow-xl hover:shadow-2xl transition-all group-hover:scale-105 bg-gradient-to-r from-primary to-accent" onClick={() => navigate("/exam-prep-chat")}>Start Chat</Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer bg-gradient-to-br from-accent/20 to-secondary/20 border-accent/40 backdrop-blur-sm animate-slide-up overflow-hidden relative" style={{ animationDelay: "1.3s" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <div className="bg-gradient-to-br from-accent via-secondary to-accent-glow rounded-2xl p-3 w-fit mb-3 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Briefcase className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">Career Guidance</CardTitle>
              <CardDescription>Expert career counseling</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm text-muted-foreground mb-4">
                Get personalized career advice and planning
              </p>
              <Button variant="outline" className="w-full border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground shadow-lg hover:shadow-xl transition-all group-hover:scale-105" onClick={() => navigate("/career-guidance-chat")}>Get Advice</Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer bg-gradient-to-br from-secondary/20 to-primary/20 border-secondary/40 backdrop-blur-sm animate-slide-up overflow-hidden relative" style={{ animationDelay: "1.4s" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <div className="bg-gradient-to-br from-secondary via-primary to-secondary-glow rounded-2xl p-3 w-fit mb-3 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <FileText className="h-6 w-6 text-secondary-foreground" />
              </div>
              <CardTitle className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Previous Year Questions</CardTitle>
              <CardDescription>Pattern analysis & solutions</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-sm text-muted-foreground mb-4">
                Analyze question patterns and get solutions
              </p>
              <Button variant="outline" className="w-full border-secondary/50 text-secondary hover:bg-secondary hover:text-secondary-foreground shadow-lg hover:shadow-xl transition-all group-hover:scale-105" onClick={() => navigate("/pyq-chat")}>Start Analysis</Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <ChatbotWidget />
    </div>
  );
};

export default StudentDashboard;