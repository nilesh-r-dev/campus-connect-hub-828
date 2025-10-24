import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Plus, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { validateFile } from "@/lib/fileValidation";

const FacultyAssignments = () => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [totalPoints, setTotalPoints] = useState(100);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    const { data: subjectsData } = await supabase
      .from("subjects")
      .select("*")
      .eq("faculty_id", profile?.id);

    const { data: assignmentsData } = await supabase
      .from("assignments")
      .select("*, subjects(title)")
      .in("subject_id", subjectsData?.map(s => s.id) || [])
      .order("created_at", { ascending: false });

    setSubjects(subjectsData || []);
    setAssignments(assignmentsData || []);
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCreateAssignment = async () => {
    if (!title || !selectedSubject) {
      toast.error("Please fill all required fields");
      return;
    }

    // Validate file if provided
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
    }

    setUploading(true);
    let fileUrl = null;

    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("assignment-files")
        .upload(fileName, file);

      if (uploadError) {
        toast.error("Failed to upload file");
        setUploading(false);
        return;
      }

      // Use signed URL instead of public URL
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from("assignment-files")
        .createSignedUrl(fileName, 31536000); // 1 year expiry

      if (urlError) {
        toast.error("Failed to generate file URL");
        setUploading(false);
        return;
      }
      
      fileUrl = signedUrlData.signedUrl;
    }

    const { error } = await supabase
      .from("assignments")
      .insert({
        title,
        description,
        subject_id: selectedSubject,
        due_date: dueDate || null,
        total_points: totalPoints,
        file_url: fileUrl
      });

    setUploading(false);

    if (error) {
      toast.error("Failed to create assignment");
      return;
    }

    toast.success("Assignment created successfully");
    setOpen(false);
    setTitle("");
    setDescription("");
    setDueDate("");
    setTotalPoints(100);
    setSelectedSubject("");
    setFile(null);
    loadData();
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
          <h1 className="text-xl font-bold">Manage Assignments</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Assignment</DialogTitle>
                <DialogDescription>Create a new assignment for your subject</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Subject *</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>{subject.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assignment Title *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Assignment description" />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <div>
                  <Label>Total Points</Label>
                  <Input type="number" value={totalPoints} onChange={(e) => setTotalPoints(parseInt(e.target.value))} min="1" />
                </div>
                <div>
                  <Label>Assignment File (Optional)</Label>
                  <Input type="file" onChange={handleFileChange} />
                </div>
                <Button onClick={handleCreateAssignment} className="w-full" disabled={uploading}>
                  {uploading ? "Creating..." : "Create Assignment"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {assignments.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Assignments Yet</h2>
            <p className="text-muted-foreground">Create your first assignment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="bg-accent/10 rounded-full p-3 w-fit mb-2">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>{assignment.title}</CardTitle>
                  <CardDescription>{assignment.subjects?.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{assignment.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{assignment.total_points} points</span>
                    {assignment.due_date && (
                      <span className="text-muted-foreground">
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {assignment.file_url && (
                    <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                      <a href={assignment.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        View File
                      </a>
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

export default FacultyAssignments;
