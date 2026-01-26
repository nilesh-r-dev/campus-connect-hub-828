import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BookOpen, Plus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Subjects = () => {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState<Set<string>>(new Set());
  const [userRole, setUserRole] = useState<string>("");
  const [profileId, setProfileId] = useState<string>("");
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, college_id")
      .eq("user_id", session.user.id)
      .single();

    setUserRole(roleData?.role || "");
    setProfileId(profile?.id || "");
    setCollegeId(profile?.college_id || null);

    const { data: subjectsData } = await supabase
      .from("subjects")
      .select("*, profiles!subjects_faculty_id_fkey(full_name)");

    setSubjects(subjectsData || []);

    if (roleData?.role === "student" && profile?.id) {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("subject_id")
        .eq("student_id", profile.id);

      setEnrolledSubjects(new Set(enrollments?.map(e => e.subject_id) || []));
    }

    setLoading(false);
  };

  const handleCreateSubject = async () => {
    if (!title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    if (!collegeId) {
      toast({ title: "Error", description: "Your profile must be associated with a college to create subjects", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("subjects")
      .insert({ title, description, faculty_id: profileId, college_id: collegeId });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Subject created successfully" });
      setOpen(false);
      setTitle("");
      setDescription("");
      loadData();
    }
  };

  const handleEnroll = async (subjectId: string) => {
    const { error } = await supabase
      .from("enrollments")
      .insert({ subject_id: subjectId, student_id: profileId });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Enrolled successfully" });
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">Subjects</h1>
          {userRole === "faculty" && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Subject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Subject</DialogTitle>
                  <DialogDescription>Add a new subject for students to enroll in</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateSubject}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {subjects.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Subjects Yet</h2>
            <p className="text-muted-foreground mb-4">
              {userRole === "faculty" 
                ? "Create your first subject to get started" 
                : "No subjects available yet. Check back later!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Card key={subject.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="bg-primary/10 rounded-full p-3 w-fit mb-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{subject.title}</CardTitle>
                  <CardDescription>By {subject.profiles?.full_name || "Unknown"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{subject.description || "No description"}</p>
                  {userRole === "student" && (
                    <Button 
                      className="w-full" 
                      disabled={enrolledSubjects.has(subject.id)}
                      onClick={() => handleEnroll(subject.id)}
                    >
                      {enrolledSubjects.has(subject.id) ? "Enrolled" : "Enroll Now"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Subjects;
