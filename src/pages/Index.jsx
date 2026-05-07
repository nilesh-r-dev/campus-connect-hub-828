import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, BookOpen, Users, Video, Shield, Zap, ArrowRight, CheckCircle,
  Sparkles, Brain, MessageSquare, Award, Star, ChevronRight, Newspaper, FileQuestion
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userRole } = await supabase
          .from("user_roles").select("role").eq("user_id", session.user.id).single();
        if (userRole) {
          const dashboardRole = userRole.role === "admin" ? "student" : userRole.role;
          navigate(`/${dashboardRole}-dashboard`, { replace: true });
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const features = [
    { icon: BookOpen, title: "Course Management", desc: "Create subjects, assignments, quizzes & notes from one dashboard.", color: "primary" },
    { icon: Video, title: "Video Lectures", desc: "Upload, stream and track student progress in real time.", color: "secondary" },
    { icon: Brain, title: "AI Tutor", desc: "Personalized exam prep, PYQ analysis & instant doubt-solving.", color: "accent" },
    { icon: MessageSquare, title: "Discussion Forum", desc: "Subject-wise threads with markdown, upvotes & faculty answers.", color: "primary" },
    { icon: Shield, title: "Secure Documents", desc: "Private storage with signed URLs and role-based access.", color: "secondary" },
    { icon: Newspaper, title: "Career Hub", desc: "Curated job feeds, AI career guidance and PYQ helpers.", color: "accent" },
  ];

  const steps = [
    { n: "01", title: "Sign up", desc: "Pick your college and choose student or faculty." },
    { n: "02", title: "Set up your space", desc: "Faculty creates subjects. Students enroll instantly." },
    { n: "03", title: "Learn & teach", desc: "Lectures, assignments, AI tools — all in one place." },
  ];

  const partners = [
    "AI-Powered Learning",
    "Real-time Collaboration",
    "Secure Cloud Storage",
    "Career Guidance",
  ];

  const testimonials = [
    { name: "Priya S.", role: "CS Student", quote: "The AI tutor saved me before finals. PYQ helper is gold." },
    { name: "Dr. Mehta", role: "Faculty, ECE", quote: "Managing assignments and quizzes finally feels effortless." },
    { name: "Arjun K.", role: "Engineering Student", quote: "Career news + guidance got me my first internship." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-pop">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">Campus Connect</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how" className="hover:text-primary transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-primary transition-colors">Reviews</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>Sign in</Button>
            <Button size="sm" onClick={() => navigate("/auth")} className="gap-1.5 gradient-primary text-primary-foreground border-0 shadow-pop hover:translate-y-[-2px] transition-transform">
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-32 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-20 -right-40 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-right">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-foreground/10 bg-card/60 backdrop-blur text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered learning platform
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
              Learn bolder.<br />
              <span className="text-gradient">Teach smarter.</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              Campus Connect unites students and faculty with AI tutors, video lectures, assignments and a single beautiful dashboard.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-10">
              <Button size="lg" onClick={() => navigate("/auth")} className="gap-2 gradient-primary text-primary-foreground border-0 shadow-pop hover:translate-y-[-2px] transition-transform px-7 h-12 text-base">
                Start free <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="border-2 border-foreground hover:bg-foreground hover:text-background h-12 px-7 text-base">
                Faculty access
              </Button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex -space-x-2">
                {["primary", "secondary", "accent", "primary"].map((c, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-background bg-${c} flex items-center justify-center text-xs font-bold text-${c}-foreground`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />)}
                </div>
                <p className="text-muted-foreground text-xs mt-0.5">Loved by 10k+ students</p>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative animate-slide-left hidden lg:block">
            <div className="relative aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 gradient-primary rounded-[3rem] rotate-6 shadow-elegant" />
              <div className="absolute inset-0 bg-card rounded-[3rem] -rotate-3 shadow-pop border-2 border-foreground/10 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                        <Brain className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-display font-bold text-sm">AI Tutor</p>
                        <p className="text-xs text-muted-foreground">Online now</p>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <div className="bg-muted rounded-2xl rounded-tl-md p-3 text-sm max-w-[85%]">Explain integration by parts.</div>
                    <div className="gradient-primary text-primary-foreground rounded-2xl rounded-tr-md p-3 text-sm max-w-[85%] ml-auto">Sure! Take ∫u dv = uv − ∫v du. Let's pick u and dv carefully…</div>
                    <div className="flex gap-2">
                      <span className="px-2.5 py-1 bg-secondary/15 text-secondary rounded-full text-xs font-medium">Math</span>
                      <span className="px-2.5 py-1 bg-accent/20 text-accent-foreground rounded-full text-xs font-medium">PYQ ready</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[BookOpen, Video, Award].map((Icon, i) => (
                    <div key={i} className="aspect-square rounded-2xl border-2 border-foreground/10 flex items-center justify-center hover:gradient-primary hover:text-primary-foreground hover:border-transparent transition-all cursor-pointer">
                      <Icon className="h-5 w-5" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating chips */}
              <div className="absolute -top-4 -right-4 px-4 py-2 bg-accent text-accent-foreground rounded-full font-bold text-sm shadow-pop animate-bounce-slow">
                <Zap className="h-4 w-4 inline mr-1" /> 24/7 AI
              </div>
              <div className="absolute -bottom-4 -left-4 px-4 py-2 bg-secondary text-secondary-foreground rounded-full font-bold text-sm shadow-pop">
                Free to start
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="relative px-6 py-12 border-y-2 border-foreground/10 bg-foreground text-background">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-4xl md:text-5xl font-bold text-gradient mb-1">{s.v}</div>
              <div className="text-xs uppercase tracking-widest opacity-70">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 max-w-7xl mx-auto">
        <div className="max-w-2xl mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold uppercase tracking-widest mb-4 shadow-pop">Features</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Everything your campus needs,<br /><span className="text-gradient">in one app.</span>
          </h2>
          <p className="text-muted-foreground text-lg">Built end-to-end for both students and faculty — no plugins, no juggling tools.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} className="group relative bg-card border-2 border-foreground/10 rounded-3xl p-6 hover:shadow-pop hover:-translate-y-1 hover:translate-x-[-3px] transition-all duration-200">
              <div className={`w-12 h-12 rounded-2xl bg-${f.color} flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform`}>
                <f.icon className={`h-6 w-6 text-${f.color}-foreground`} />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              <ChevronRight className="absolute top-6 right-6 h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-6 py-24 bg-muted/40 border-y-2 border-foreground/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-widest mb-4 shadow-pop">How it works</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Three steps. Zero friction.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="relative bg-card border-2 border-foreground rounded-3xl p-8 shadow-pop">
                <div className="font-display text-7xl font-bold text-gradient leading-none mb-4">{s.n}</div>
                <h3 className="font-display font-bold text-2xl mb-2">{s.title}</h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest mb-4 shadow-pop">Loved by campus</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Real results, real students.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => {
            const tints = ["bg-primary/10", "bg-secondary/10", "bg-accent/15"];
            return (
              <div key={i} className={`${tints[i]} rounded-3xl p-7 border-2 border-foreground/10`}>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-foreground text-foreground" />)}
                </div>
                <p className="text-lg font-medium leading-snug mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto relative overflow-hidden gradient-primary rounded-[3rem] p-12 md:p-16 text-center shadow-elegant">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/40 rounded-full blur-3xl" />
          <div className="relative">
            <Sparkles className="h-10 w-10 text-primary-foreground mx-auto mb-6" />
            <h2 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-4 tracking-tight">
              Ready to level up?
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of students and faculty already learning smarter.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => navigate("/auth")} className="bg-background text-foreground hover:bg-background/90 h-12 px-7 text-base font-semibold gap-2 shadow-pop">
                Create account <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="border-2 border-background bg-transparent text-primary-foreground hover:bg-background hover:text-foreground h-12 px-7 text-base font-semibold">
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-foreground/10 px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">Campus Connect</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 Campus Connect. Built for the next generation of learners.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
