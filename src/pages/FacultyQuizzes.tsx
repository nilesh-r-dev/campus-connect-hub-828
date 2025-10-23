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
import { ArrowLeft, ClipboardList, Plus, Trash2, PlusCircle, MinusCircle } from "lucide-react";
import { toast } from "sonner";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

const FacultyQuizzes = () => {
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [questions, setQuestions] = useState<Question[]>([{
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    points: 1
  }]);
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

    const { data: quizzesData } = await supabase
      .from("quizzes")
      .select("*, subjects(title)")
      .in("subject_id", subjectsData?.map(s => s.id) || []);

    setSubjects(subjectsData || []);
    setQuizzes(quizzesData || []);
    setLoading(false);
  };

  const handleCreateQuiz = async () => {
    if (!title || !selectedSubject || questions.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    const { error } = await supabase
      .from("quizzes")
      .insert({
        subject_id: selectedSubject,
        title,
        description,
        questions: questions as any,
        total_points: totalPoints
      });

    if (error) {
      toast.error("Failed to create quiz");
      return;
    }

    toast.success("Quiz created successfully");
    setOpen(false);
    resetForm();
    loadData();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedSubject("");
    setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: 0, points: 1 }]);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: 0, points: 1 }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
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
          <h1 className="text-xl font-bold">Manage Quizzes</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Quiz</DialogTitle>
                <DialogDescription>Create a new quiz for your subject</DialogDescription>
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
                  <Label>Quiz Title *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quiz title" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Quiz description" />
                </div>
                
                <div className="space-y-4 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Questions</h3>
                    <Button type="button" onClick={addQuestion} size="sm">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                  
                  {questions.map((q, qIndex) => (
                    <Card key={qIndex}>
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex justify-between">
                          <Label>Question {qIndex + 1}</Label>
                          {questions.length > 1 && (
                            <Button variant="ghost" size="sm" onClick={() => removeQuestion(qIndex)}>
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Textarea
                          value={q.question}
                          onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                          placeholder="Enter question"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, oIndex) => (
                            <Input
                              key={oIndex}
                              value={opt}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              placeholder={`Option ${oIndex + 1}`}
                            />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Correct Answer</Label>
                            <Select
                              value={String(q.correctAnswer)}
                              onValueChange={(v) => updateQuestion(qIndex, "correctAnswer", parseInt(v))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {q.options.map((_, i) => (
                                  <SelectItem key={i} value={String(i)}>Option {i + 1}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Points</Label>
                            <Input
                              type="number"
                              value={q.points}
                              onChange={(e) => updateQuestion(qIndex, "points", parseInt(e.target.value))}
                              min="1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <Button onClick={handleCreateQuiz} className="w-full">Create Quiz</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {quizzes.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Quizzes Yet</h2>
            <p className="text-muted-foreground">Create your first quiz</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="bg-accent/10 rounded-full p-3 w-fit mb-2">
                    <ClipboardList className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>{quiz.title}</CardTitle>
                  <CardDescription>{quiz.subjects?.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{quiz.description}</p>
                  <p className="text-sm font-medium">{quiz.questions?.length || 0} questions • {quiz.total_points} points</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FacultyQuizzes;
