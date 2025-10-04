import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Briefcase, GraduationCap, Target, TrendingUp, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface CareerNewsItem {
  id: string;
  title: string;
  content: string;
  source: string | null;
  category: "career" | "internship" | "placement" | "skill";
  posted_by: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

const CareerNews = () => {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<CareerNewsItem[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    source: "",
    category: "career" as "career" | "internship" | "placement" | "skill",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const categoryIcons = {
    career: Briefcase,
    internship: GraduationCap,
    placement: Target,
    skill: TrendingUp,
  };

  const categoryColors = {
    career: "bg-primary/10 text-primary border-primary/20",
    internship: "bg-accent/10 text-accent border-accent/20",
    placement: "bg-secondary/10 text-secondary border-secondary/20",
    skill: "bg-primary/20 text-primary border-primary/30",
  };

  useEffect(() => {
    const fetchNews = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
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

        setProfile(profileData);
        setRole(roleData?.role || "");
      }

      const { data, error } = await supabase
        .from("career_news")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load career news",
          variant: "destructive",
        });
      } else {
        setNews((data as CareerNewsItem[]) || []);
      }
      setLoading(false);
    };

    fetchNews();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("career_news_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "career_news",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            fetchNews();
          } else if (payload.eventType === "DELETE") {
            setNews((prev) => prev.filter((item) => item.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            fetchNews();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to post",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("career_news").insert({
      title: formData.title,
      content: formData.content,
      source: formData.source || null,
      category: formData.category,
      posted_by: profile.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post career news",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Career news posted successfully",
      });
      setFormData({ title: "", content: "", source: "", category: "career" });
      setIsDialogOpen(false);
    }
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
          <Button variant="ghost" onClick={() => navigate(role === "faculty" ? "/faculty-dashboard" : "/student-dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          {role === "faculty" && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Post News
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Post Career News</DialogTitle>
                  <DialogDescription>
                    Share career opportunities and updates with students
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: "career" | "internship" | "placement" | "skill") =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="career">Career</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="placement">Placement</SelectItem>
                        <SelectItem value="skill">Skill Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="source">Source (Optional)</Label>
                    <Input
                      id="source"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      placeholder="e.g., LinkedIn, Company website"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Post News</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Career & Internship News</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest career opportunities, internships, and skill development resources
          </p>
        </div>

        {news.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No career news available yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {news.map((item) => {
              const Icon = categoryIcons[item.category];
              return (
                <Card key={item.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`rounded-full p-2 ${categoryColors[item.category]}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <Badge variant="outline" className={categoryColors[item.category]}>
                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl mb-2">{item.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span>Posted by {item.profiles?.full_name}</span>
                          <span>•</span>
                          <span>{format(new Date(item.created_at), "MMM dd, yyyy")}</span>
                          {item.source && (
                            <>
                              <span>•</span>
                              <span className="text-primary">{item.source}</span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{item.content}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default CareerNews;
