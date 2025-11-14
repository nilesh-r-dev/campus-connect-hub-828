import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import Subjects from "./pages/Subjects";
import Assignments from "./pages/Assignments";
import Videos from "./pages/Videos";
import Forum from "./pages/Forum";
import Documents from "./pages/Documents";
import CourseDetail from "./pages/CourseDetail";
import AssignmentSubmit from "./pages/AssignmentSubmit";
import QuizTake from "./pages/QuizTake";
import Grades from "./pages/Grades";
import AITutor from "./pages/AITutor";
import CareerNews from "./pages/CareerNews";
import QuestionPaperAnalysis from "./pages/QuestionPaperAnalysis";
import ExamPrepChat from "./pages/ExamPrepChat";
import CareerGuidanceChat from "./pages/CareerGuidanceChat";
import PreviousYearQuestionsChat from "./pages/PreviousYearQuestionsChat";
import FacultyVideos from "./pages/FacultyVideos";
import FacultyQuizzes from "./pages/FacultyQuizzes";
import FacultyAssignments from "./pages/FacultyAssignments";
import FacultyCertificates from "./pages/FacultyCertificates";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/course/:subjectId" element={<CourseDetail />} />
          <Route path="/assignment/:assignmentId" element={<AssignmentSubmit />} />
          <Route path="/quiz/:quizId" element={<QuizTake />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/ai-tutor" element={<AITutor />} />
          <Route path="/career-news" element={<CareerNews />} />
          <Route path="/question-paper-analysis" element={<QuestionPaperAnalysis />} />
          <Route path="/exam-prep-chat" element={<ExamPrepChat />} />
          <Route path="/career-guidance-chat" element={<CareerGuidanceChat />} />
          <Route path="/pyq-chat" element={<PreviousYearQuestionsChat />} />
          <Route path="/faculty/videos" element={<FacultyVideos />} />
          <Route path="/faculty/quizzes" element={<FacultyQuizzes />} />
          <Route path="/faculty/assignments" element={<FacultyAssignments />} />
          <Route path="/faculty/certificates" element={<FacultyCertificates />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
