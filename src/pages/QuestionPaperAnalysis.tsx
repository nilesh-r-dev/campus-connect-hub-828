import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const QuestionPaperAnalysis = () => {
  const [content, setContent] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setContent(text);
        toast({
          title: "File loaded",
          description: "Question paper content loaded successfully",
        });
      };
      reader.readAsText(uploadedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast({
        title: "No content",
        description: "Please paste or upload question paper content first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis("");

    try {
      const { data, error } = await supabase.functions.invoke('analyze-question-paper', {
        body: { content }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analysis complete",
        description: "Your question paper has been analyzed",
      });
    } catch (error) {
      console.error('Error analyzing question paper:', error);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the question paper. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Question Paper Analysis</h1>
          <p className="text-muted-foreground">Upload or paste question papers to get AI-powered insights</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Question Paper
            </CardTitle>
            <CardDescription>
              Upload a text file or paste the content below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="file"
                accept=".txt,.doc,.docx,text/*"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
              {file && (
                <p className="text-sm text-muted-foreground mt-2">
                  Loaded: {file.name}
                </p>
              )}
            </div>

            <div className="relative">
              <Textarea
                placeholder="Or paste your question paper content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !content.trim()}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Question Paper
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Analysis Results
            </CardTitle>
            <CardDescription>
              AI-powered insights and important questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Analyzing your question paper...</p>
                </div>
              </div>
            ) : analysis ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
                  {analysis}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
                <div className="text-center space-y-2">
                  <FileText className="h-12 w-12 mx-auto opacity-50" />
                  <p>Upload or paste a question paper to get started</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuestionPaperAnalysis;
