import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Award, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const FacultyCertificates = () => {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [profileId, setProfileId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadStudents();
    }
  }, [selectedSubject]);

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

    setProfileId(profile?.id || "");

    const { data: subjectsData } = await supabase
      .from("subjects")
      .select("*")
      .eq("faculty_id", profile?.id);

    setSubjects(subjectsData || []);
    setLoading(false);
  };

  const loadStudents = async () => {
    const { data: enrollmentsData } = await supabase
      .from("enrollments")
      .select("student_id, profiles(id, full_name)")
      .eq("subject_id", selectedSubject);

    const { data: videosData } = await supabase
      .from("videos")
      .select("id")
      .eq("subject_id", selectedSubject);

    const totalVideos = videosData?.length || 0;

    const studentsWithProgress = await Promise.all(
      (enrollmentsData || []).map(async (enrollment: any) => {
        const { data: completionsData } = await supabase
          .from("video_completions")
          .select("id")
          .eq("student_id", enrollment.student_id)
          .in("video_id", videosData?.map(v => v.id) || []);

        const { data: certificateData } = await supabase
          .from("certificates")
          .select("id")
          .eq("student_id", enrollment.student_id)
          .eq("subject_id", selectedSubject)
          .single();

        const completedVideos = completionsData?.length || 0;
        const isComplete = totalVideos > 0 && completedVideos === totalVideos;
        const hasCertificate = !!certificateData;

        return {
          studentId: enrollment.student_id,
          name: enrollment.profiles?.full_name || "Unknown",
          completedVideos,
          totalVideos,
          isComplete,
          hasCertificate
        };
      })
    );

    setStudents(studentsWithProgress);
  };

  const handleIssueCertificate = async (studentId: string) => {
    const { error } = await supabase
      .from("certificates")
      .insert({
        student_id: studentId,
        subject_id: selectedSubject,
        issued_by: profileId
      });

    if (error) {
      if (error.code === "23505") {
        toast.error("Certificate already issued to this student");
      } else {
        toast.error("Failed to issue certificate");
      }
      return;
    }

    toast.success("Certificate issued successfully");
    loadStudents();
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
          <h1 className="text-xl font-bold">Issue Certificates</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Subject</CardTitle>
            <CardDescription>Choose a subject to view student progress and issue certificates</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {selectedSubject && students.length === 0 ? (
          <div className="text-center py-16">
            <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Students Enrolled</h2>
            <p className="text-muted-foreground">No students have enrolled in this subject yet</p>
          </div>
        ) : selectedSubject ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <Card key={student.studentId} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className={`rounded-full p-3 w-fit mb-2 ${student.isComplete ? "bg-green-500/10" : "bg-accent/10"}`}>
                    <Award className={`h-6 w-6 ${student.isComplete ? "text-green-500" : "text-accent"}`} />
                  </div>
                  <CardTitle>{student.name}</CardTitle>
                  <CardDescription>
                    Progress: {student.completedVideos}/{student.totalVideos} videos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {student.hasCertificate ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Certificate Issued</span>
                    </div>
                  ) : student.isComplete ? (
                    <Button onClick={() => handleIssueCertificate(student.studentId)} className="w-full">
                      Issue Certificate
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">Complete all videos to issue certificate</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Select a Subject</h2>
            <p className="text-muted-foreground">Choose a subject to view student progress</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default FacultyCertificates;
