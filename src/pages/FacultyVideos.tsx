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
import { ArrowLeft, Video, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const FacultyVideos = () => {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
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

    const { data: videosData } = await supabase
      .from("videos")
      .select("*, subjects(title)")
      .in("subject_id", subjectsData?.map(s => s.id) || []);

    setSubjects(subjectsData || []);
    setVideos(videosData || []);
    setLoading(false);
  };

  const handleCreateVideo = async () => {
    if (!title || !videoUrl || !selectedSubject) {
      toast.error("Please fill all required fields");
      return;
    }

    const { error } = await supabase
      .from("videos")
      .insert({
        title,
        description,
        video_url: videoUrl,
        subject_id: selectedSubject
      });

    if (error) {
      toast.error("Failed to create video");
      return;
    }

    toast.success("Video created successfully");
    setOpen(false);
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setSelectedSubject("");
    loadData();
  };

  const handleDeleteVideo = async (id: string) => {
    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete video");
      return;
    }

    toast.success("Video deleted successfully");
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
          <h1 className="text-xl font-bold">Manage Video Lectures</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Video Lecture</DialogTitle>
                <DialogDescription>Add a new video lecture for your subject</DialogDescription>
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
                  <Label>Title *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lecture title" />
                </div>
                <div>
                  <Label>Video URL *</Label>
                  <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Lecture description" />
                </div>
                <Button onClick={handleCreateVideo} className="w-full">Create Video</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {videos.length === 0 ? (
          <div className="text-center py-16">
            <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Videos Yet</h2>
            <p className="text-muted-foreground">Create your first video lecture</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="bg-accent/10 rounded-full p-3 w-fit mb-2">
                      <Video className="h-6 w-6 text-accent" />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteVideo(video.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <CardTitle>{video.title}</CardTitle>
                  <CardDescription>{video.subjects?.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{video.description || "No description"}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FacultyVideos;
