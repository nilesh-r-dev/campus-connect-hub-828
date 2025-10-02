import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Calendar, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const Assignments = () => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("");
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

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    setUserRole(roleData?.role || "");

    const { data: assignmentsData } = await supabase
      .from("assignments")
      .select("*, subjects(title)");

    setAssignments(assignmentsData || []);
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
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">Assignments</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {assignments.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Assignments Yet</h2>
            <p className="text-muted-foreground">
              {userRole === "faculty" 
                ? "Create assignments from your course pages" 
                : "No assignments available yet. Check back later!"}
            </p>
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
                  <CardDescription>{assignment.subjects?.title}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{assignment.description || "No description"}</p>
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
                  <Badge variant="secondary">Pending</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Assignments;
