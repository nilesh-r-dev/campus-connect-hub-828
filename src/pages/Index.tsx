import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, Video, Shield, Zap, ArrowRight, CheckCircle } from "lucide-react";

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
      if (event === 'SIGNED_IN' && session) checkAuthAndRedirect();
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const features = [
    { icon: BookOpen, title: "Course Management", desc: "Create and manage subjects, assignments, quizzes, and notes from a single dashboard." },
    { icon: Video, title: "Video Lectures", desc: "Upload and stream video lectures with seamless playback and progress tracking." },
    { icon: Users, title: "Student Portal", desc: "Access enrolled courses, submit assignments, and participate in subject discussions." },
    { icon: Shield, title: "Secure Documents", desc: "Store personal documents securely with role-based access and privacy controls." },
    { icon: Zap, title: "Instant Grading", desc: "Faculty can review submissions and provide structured feedback in real time." },
    { icon: GraduationCap, title: "Discussion Forum", desc: "Engage in focused, subject-wise academic discussions with markdown support." },
  ];

  const highlights = [
    "AI-powered tutoring and exam preparation",
    "Career guidance and news feed",
    "Previous year question paper analysis",
    "Real-time assignment submission tracking",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Subtle gradient backdrop */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, hsl(262 83% 58%), transparent)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, hsl(199 89% 48%), transparent)' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground tracking-tight">Campus Connect</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="text-muted-foreground hover:text-foreground">
              Sign in
            </Button>
            <Button size="sm" onClick={() => navigate("/auth")} className="gap-2">
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-24">
          <div className="max-w-3xl animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-8 animate-slide-up">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Learning Management Platform
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              A smarter way to{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                teach and learn
              </span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl animate-slide-up" style={{ animationDelay: "0.15s" }}>
              Campus Connect brings students and faculty together on a single platform — with AI-powered tools, structured course management, and real-time collaboration.
            </p>

            <div className="flex items-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button size="lg" onClick={() => navigate("/auth")} className="gap-2 px-6">
                Start for free <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="px-6">
                Faculty access
              </Button>
            </div>

            <ul className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              {highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="mb-14 animate-fade-in">
            <h2 className="text-2xl font-semibold tracking-tight mb-2">Everything you need</h2>
            <p className="text-muted-foreground">Built for both students and faculty, with purpose-built tools for every stage of learning.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
            {features.map((f, i) => (
              <div
                key={i}
                className="group bg-background p-6 hover:bg-muted/40 transition-colors duration-200 animate-fade-in cursor-default"
                style={{ animationDelay: `${0.05 * i}s` }}
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors duration-200">
                  <f.icon className="h-4.5 w-4.5 text-primary" style={{ width: '1.1rem', height: '1.1rem' }} />
                </div>
                <h3 className="font-medium text-foreground mb-2 text-sm">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="rounded-2xl border border-border bg-muted/30 p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 animate-fade-in">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight mb-2">Ready to get started?</h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Create your account and access your personalized learning dashboard in minutes.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button variant="outline" onClick={() => navigate("/auth")}>Sign in</Button>
              <Button onClick={() => navigate("/auth")} className="gap-2">
                Create account <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 bg-background">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-3 w-3 text-primary" />
            </div>
            <span>Campus Connect</span>
          </div>
          <span>© 2025 Campus Connect. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
