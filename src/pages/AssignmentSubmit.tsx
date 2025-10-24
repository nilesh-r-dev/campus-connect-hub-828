import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, FileText, Calendar, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { validateFile } from "@/lib/fileValidation";

const AssignmentSubmit = () => {
  const { assignmentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [profileId, setProfileId] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [assignmentId]);

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

    const { data: assignmentData } = await supabase
      .from("assignments")
      .select("*, subjects(title)")
      .eq("id", assignmentId)
      .single();

    setAssignment(assignmentData);

    if (profile?.id) {
      const { data: submissionData } = await supabase
        .from("submissions")
        .select("*")
        .eq("assignment_id", assignmentId)
        .eq("student_id", profile.id)
        .maybeSingle();

      setSubmission(submissionData);
    }

    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!file && !submission) {
      toast({ title: "Error", description: "Please select a file", variant: "destructive" });
      return;
    }

    // Validate file
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast({ title: "Error", description: validation.error, variant: "destructive" });
        return;
      }
    }

    setUploading(true);

    try {
      let fileUrl = submission?.file_url;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${profileId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("assignment-files")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Use signed URL instead of public URL
        const { data: signedUrlData, error: urlError } = await supabase.storage
          .from("assignment-files")
          .createSignedUrl(fileName, 31536000); // 1 year expiry

        if (urlError) throw urlError;

        fileUrl = signedUrlData.signedUrl;
      }

      const { error } = await supabase
        .from("submissions")
        .insert({
          assignment_id: assignmentId,
          student_id: profileId,
          file_url: fileUrl,
          status: "submitted",
        });

      if (error) throw error;

      toast({ title: "Success", description: "Assignment submitted successfully" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
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
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="bg-secondary/10 rounded-full p-3 w-fit mb-2">
              <FileText className="h-6 w-6 text-secondary" />
            </div>
            <CardTitle className="text-2xl">{assignment?.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{assignment?.subjects?.title}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{assignment?.description || "No description"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {assignment?.due_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className="font-medium">{format(new Date(assignment.due_date), "MMM dd, yyyy")}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Points</p>
                  <p className="font-medium">{assignment?.total_points}</p>
                </div>
              </div>
            </div>

            {submission ? (
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold">Your Submission</h3>
                <p className="text-sm text-muted-foreground">
                  Status: <span className="font-medium capitalize">{submission.status}</span>
                </p>
                {submission.grade !== null && (
                  <p className="text-sm text-muted-foreground">
                    Grade: <span className="font-medium">{submission.grade}/{assignment?.total_points}</span>
                  </p>
                )}
                {submission.feedback && (
                  <div>
                    <p className="text-sm font-medium mt-2">Feedback:</p>
                    <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Submitted: {format(new Date(submission.submitted_at), "MMM dd, yyyy HH:mm")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Upload Your Work</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="mt-2"
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Assignment
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AssignmentSubmit;