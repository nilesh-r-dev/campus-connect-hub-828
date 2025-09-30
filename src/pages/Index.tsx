import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Users, Video, Shield, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-primary rounded-full p-2">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Campus Connect</h1>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")}>Get Started</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Welcome to Campus Connect
            </h1>
            <p className="text-xl text-muted-foreground">
              A professional learning management platform connecting students and faculty
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button size="lg" onClick={() => navigate("/auth")} className="shadow-lg">
                Start Learning
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                I'm a Faculty
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-primary/20">
              <CardHeader>
                <div className="bg-primary/10 rounded-full p-3 w-fit mb-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Course Management</CardTitle>
                <CardDescription>Complete course creation and management tools</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Faculty can create subjects, add assignments, quizzes, notes, and video lectures
                </p>
              </CardContent>
            </Card>

            <Card className="border-secondary/20">
              <CardHeader>
                <div className="bg-secondary/10 rounded-full p-3 w-fit mb-2">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Student Portal</CardTitle>
                <CardDescription>Access all course materials in one place</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Students can view subjects, submit assignments, take quizzes, and participate in forums
                </p>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <div className="bg-accent/10 rounded-full p-3 w-fit mb-2">
                  <Video className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Video Lectures</CardTitle>
                <CardDescription>Rich multimedia content</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Upload and watch video lectures with seamless integration
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <div className="bg-primary/10 rounded-full p-3 w-fit mb-2">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Secure Storage</CardTitle>
                <CardDescription>DigiLocker-style document management</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Store personal documents securely with role-based access control
                </p>
              </CardContent>
            </Card>

            <Card className="border-secondary/20">
              <CardHeader>
                <div className="bg-secondary/10 rounded-full p-3 w-fit mb-2">
                  <Zap className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Real-time Grading</CardTitle>
                <CardDescription>Instant feedback and assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Faculty can review submissions and provide grades with feedback
                </p>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <div className="bg-accent/10 rounded-full p-3 w-fit mb-2">
                  <GraduationCap className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Discussion Forums</CardTitle>
                <CardDescription>Collaborative learning environment</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Engage in subject-wise discussions with markdown support
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-muted-foreground">
              Join Campus Connect today and experience a modern learning platform
            </p>
            <Button size="lg" onClick={() => navigate("/auth")} className="shadow-lg">
              Create Your Account
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Campus Connect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
