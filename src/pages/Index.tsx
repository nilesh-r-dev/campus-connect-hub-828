import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Users, Video, Shield, Zap, Sparkles, Star } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();
        
        if (userRole) {
          const dashboardRole = userRole.role === 'admin' ? 'student' : userRole.role;
          navigate(`/${dashboardRole}-dashboard`, { replace: true });
        }
      }
    };

    checkAuthAndRedirect();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkAuthAndRedirect();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const features = [
    { icon: BookOpen, title: "Course Management", desc: "Complete course creation tools", detail: "Faculty can create subjects, add assignments, quizzes, notes, and video lectures", color: "primary", delay: "0.1s" },
    { icon: Users, title: "Student Portal", desc: "Access all course materials", detail: "Students can view subjects, submit assignments, take quizzes, and participate in forums", color: "secondary", delay: "0.2s" },
    { icon: Video, title: "Video Lectures", desc: "Rich multimedia content", detail: "Upload and watch video lectures with seamless integration", color: "accent", delay: "0.3s" },
    { icon: Shield, title: "Secure Storage", desc: "DigiLocker-style document mgmt", detail: "Store personal documents securely with role-based access control", color: "primary", delay: "0.4s" },
    { icon: Zap, title: "Real-time Grading", desc: "Instant feedback & assessment", detail: "Faculty can review submissions and provide grades with feedback", color: "secondary", delay: "0.5s" },
    { icon: GraduationCap, title: "Discussion Forums", desc: "Collaborative learning", detail: "Engage in subject-wise discussions with markdown support", color: "accent", delay: "0.6s" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
      {/* Floating background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20 animate-float-particle"
            style={{
              width: `${20 + i * 15}px`,
              height: `${20 + i * 15}px`,
              background: i % 2 === 0 ? 'hsl(262 83% 58%)' : 'hsl(199 89% 48%)',
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 animate-slide-right">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-primary rounded-full p-2 animate-glow-pulse">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Campus Connect
            </h1>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => navigate("/auth")} className="hover:scale-105 transition-all duration-300 hover:shadow-md">
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")} className="hover:scale-105 transition-all duration-300 animate-glow-pulse shadow-lg">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Sparkle badge */}
            <div className="flex justify-center animate-pop-in">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium">
                <Sparkles className="h-4 w-4 animate-spin-slow" />
                AI-Powered Learning Platform
                <Star className="h-4 w-4 animate-bounce-slow" />
              </span>
            </div>

            <h1
              className="text-5xl md:text-7xl font-black animate-fade-in"
              style={{
                background: 'linear-gradient(135deg, hsl(262 83% 58%), hsl(199 89% 48%), hsl(280 70% 60%), hsl(262 83% 58%))',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient-x 4s ease infinite, fade-in 0.8s ease-out',
              }}
            >
              Welcome to Campus Connect
            </h1>

            <p className="text-xl text-muted-foreground animate-fade-in max-w-2xl mx-auto" style={{ animationDelay: "0.2s" }}>
              A professional learning management platform connecting students and faculty with AI-powered tools
            </p>

            <div className="flex justify-center gap-4 pt-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="shadow-lg hover:scale-110 transition-all duration-300 animate-glow-pulse text-lg px-8"
              >
                Start Learning
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="hover:scale-110 transition-all duration-300 hover:shadow-md text-lg px-8"
              >
                I'm a Faculty
              </Button>
            </div>

            {/* Stats row */}
            <div className="flex justify-center gap-12 pt-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
              {[
                { value: "10K+", label: "Students" },
                { value: "500+", label: "Courses" },
                { value: "AI", label: "Powered" },
              ].map((stat, i) => (
                <div key={i} className="text-center group cursor-default">
                  <div className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">Platform Features</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card
                key={i}
                className={`group border-${f.color}/20 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 animate-fade-in overflow-hidden relative cursor-pointer`}
                style={{ animationDelay: f.delay }}
              >
                {/* Shimmer overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                
                <CardHeader>
                  <div className={`bg-${f.color}/10 rounded-full p-3 w-fit mb-2 group-hover:scale-125 group-hover:bg-${f.color}/20 transition-all duration-300`}>
                    <f.icon className={`h-6 w-6 text-${f.color}`} />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors duration-300">{f.title}</CardTitle>
                  <CardDescription>{f.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{f.detail}</p>
                </CardContent>

                {/* Bottom gradient bar */}
                <div className={`h-0.5 bg-gradient-to-r from-${f.color} to-transparent w-0 group-hover:w-full transition-all duration-500`} />
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in relative">
            <div className="absolute -inset-8 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-3xl blur-xl" />
            <div className="relative">
              <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Join Campus Connect today and experience a modern AI-powered learning platform
              </p>
              <div className="relative inline-block">
                <div className="absolute inset-0 rounded-lg animate-ripple bg-primary/30" />
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="relative shadow-lg hover:scale-110 transition-all duration-300 text-lg px-10 py-6 animate-glow-pulse"
                >
                  Create Your Account
                  <Sparkles className="ml-2 h-5 w-5 animate-spin-slow" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card/50 backdrop-blur-sm mt-10 relative z-10">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Campus Connect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
