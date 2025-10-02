import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Award, FileText } from "lucide-react";
import { format } from "date-fns";

const Grades = () => {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
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

    if (profile) {
      const { data: submissionsData } = await supabase
        .from("submissions")
        .select("*, assignments(title, total_points, subjects(title))")
        .eq("student_id", profile.id)
        .order("submitted_at", { ascending: false });

      const { data: quizData } = await supabase
        .from("quiz_attempts")
        .select("*, quizzes(title, total_points, subjects(title))")
        .eq("student_id", profile.id)
        .order("completed_at", { ascending: false });

      setSubmissions(submissionsData || []);
      setQuizAttempts(quizData || []);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const calculateAverage = () => {
    const gradedSubmissions = submissions.filter(s => s.grade !== null);
    const totalAssignment = gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0);
    const maxAssignment = gradedSubmissions.reduce((sum, s) => sum + (s.assignments?.total_points || 0), 0);

    const totalQuiz = quizAttempts.reduce((sum, q) => sum + (q.score || 0), 0);
    const maxQuiz = quizAttempts.reduce((sum, q) => sum + (q.quizzes?.total_points || 0), 0);

    const total = totalAssignment + totalQuiz;
    const max = maxAssignment + maxQuiz;

    return max > 0 ? ((total / max) * 100).toFixed(1) : "0.0";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">My Grades</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-5xl font-bold text-primary mb-2">{calculateAverage()}%</p>
              <p className="text-muted-foreground">Average Grade</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <CardTitle>Assignment Grades</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No submissions yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.assignments?.title}</TableCell>
                        <TableCell>{submission.assignments?.subjects?.title}</TableCell>
                        <TableCell>{format(new Date(submission.submitted_at), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          {submission.grade !== null ? (
                            <span className="font-semibold">
                              {submission.grade}/{submission.assignments?.total_points}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Not graded</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{submission.status}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <CardTitle>Quiz Scores</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {quizAttempts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No quiz attempts yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quiz</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quizAttempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell className="font-medium">{attempt.quizzes?.title}</TableCell>
                        <TableCell>{attempt.quizzes?.subjects?.title}</TableCell>
                        <TableCell>{format(new Date(attempt.completed_at), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          <span className="font-semibold">
                            {attempt.score}/{attempt.quizzes?.total_points}
                          </span>
                        </TableCell>
                        <TableCell>
                          {((attempt.score / attempt.quizzes?.total_points) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Grades;