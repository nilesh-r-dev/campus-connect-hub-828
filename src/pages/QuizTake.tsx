import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QuizTake = () => {
  const { quizId } = useParams();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [profileId, setProfileId] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [quizId]);

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

    const { data: quizData } = await supabase
      .from("quizzes")
      .select("*, subjects(title)")
      .eq("id", quizId)
      .single();

    setQuiz(quizData);

    if (profile?.id) {
      const { data: attemptData } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("student_id", profile.id)
        .maybeSingle();

      if (attemptData) {
        setSubmitted(true);
        setResult(attemptData);
      }
    }

    setLoading(false);
  };

  const handleSubmit = async () => {
    const questions = quiz.questions as any[];
    let score = 0;

    questions.forEach((q: any, index: number) => {
      if (answers[index] === q.correct_answer) {
        score += q.points || 1;
      }
    });

    const { error } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id: quizId,
        student_id: profileId,
        answers: answers,
        score: score,
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Quiz submitted! Your score: ${score}/${quiz.total_points}` });
      setSubmitted(true);
      setResult({ score });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (submitted) {
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
          <Card className="text-center">
            <CardHeader>
              <div className="bg-accent/10 rounded-full p-4 w-fit mx-auto mb-4">
                <Award className="h-12 w-12 text-accent" />
              </div>
              <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary mb-2">
                {result?.score}/{quiz?.total_points}
              </p>
              <p className="text-muted-foreground mb-6">
                {((result?.score / quiz?.total_points) * 100).toFixed(1)}%
              </p>
              <Button onClick={() => navigate(-1)}>Back to Course</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const questions = quiz.questions as any[];

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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{quiz?.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{quiz?.subjects?.title}</p>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{quiz?.description}</p>
            <p className="mt-2 text-sm">
              Total Points: <span className="font-semibold">{quiz?.total_points}</span>
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {questions.map((question: any, index: number) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Question {index + 1}: {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[index]}
                  onValueChange={(value) =>
                    setAnswers((prev) => ({ ...prev, [index]: value }))
                  }
                >
                  {question.options.map((option: string, optIndex: number) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`q${index}-o${optIndex}`} />
                      <Label htmlFor={`q${index}-o${optIndex}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button onClick={handleSubmit} className="w-full mt-6" size="lg">
          Submit Quiz
        </Button>
      </main>
    </div>
  );
};

export default QuizTake;