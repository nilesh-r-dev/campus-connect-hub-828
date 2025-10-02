import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Video, BookOpen, Award, Calendar, Download } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const CourseDetail = () => {
  const { subjectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCourseData();
  }, [subjectId]);

  const loadCourseData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: subjectData } = await supabase
      .from("subjects")
      .select("*, profiles!subjects_faculty_id_fkey(full_name)")
      .eq("id", subjectId)
      .single();

    setSubject(subjectData);

    const [assignmentsData, quizzesData, notesData, videosData] = await Promise.all([
      supabase.from("assignments").select("*").eq("subject_id", subjectId),
      supabase.from("quizzes").select("*").eq("subject_id", subjectId),
      supabase.from("notes").select("*").eq("subject_id", subjectId),
      supabase.from("videos").select("*").eq("subject_id", subjectId),
    ]);

    setAssignments(assignmentsData.data || []);
    setQuizzes(quizzesData.data || []);
    setNotes(notesData.data || []);
    setVideos(videosData.data || []);
    setLoading(false);
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
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{subject?.title}</h1>
            <p className="text-muted-foreground mt-1">
              Instructor: {subject?.profiles?.full_name}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="assignments" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="mt-6">
            {assignments.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Assignments</h2>
                <p className="text-muted-foreground">No assignments available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((assignment) => (
                  <Card key={assignment.id} className="hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="bg-secondary/10 rounded-full p-3 w-fit mb-2">
                        <FileText className="h-6 w-6 text-secondary" />
                      </div>
                      <CardTitle>{assignment.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {assignment.description || "No description"}
                      </p>
                      {assignment.due_date && (
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Due: {format(new Date(assignment.due_date), "MMM dd, yyyy")}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{assignment.total_points} points</span>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => navigate(`/assignment/${assignment.id}`)}
                      >
                        View & Submit
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="quizzes" className="mt-6">
            {quizzes.length === 0 ? (
              <div className="text-center py-16">
                <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Quizzes</h2>
                <p className="text-muted-foreground">No quizzes available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id} className="hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="bg-accent/10 rounded-full p-3 w-fit mb-2">
                        <Award className="h-6 w-6 text-accent" />
                      </div>
                      <CardTitle>{quiz.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {quiz.description || "No description"}
                      </p>
                      <div className="flex items-center text-sm">
                        <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{quiz.total_points} points</span>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => navigate(`/quiz/${quiz.id}`)}
                      >
                        Take Quiz
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            {notes.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Notes</h2>
                <p className="text-muted-foreground">No notes available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <Card key={note.id} className="hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="bg-primary/10 rounded-full p-3 w-fit mb-2">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{note.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {note.content || "No preview"}
                      </p>
                      {note.file_url && (
                        <Button className="w-full" variant="outline" asChild>
                          <a href={note.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            {videos.length === 0 ? (
              <div className="text-center py-16">
                <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Videos</h2>
                <p className="text-muted-foreground">No video lectures available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((video) => (
                  <Card key={video.id} className="hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="bg-accent/10 rounded-full p-3 w-fit mb-2">
                        <Video className="h-6 w-6 text-accent" />
                      </div>
                      <CardTitle>{video.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {video.description || "No description"}
                      </p>
                      {video.video_url && (
                        <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
                          <iframe
                            src={video.video_url}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CourseDetail;