import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Sparkles, Loader2, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { validateFile } from "@/lib/fileValidation";

type UploadedFile = {
  name: string;
  content: string;
};

const QuestionPaperAnalysis = () => {
  const [content, setContent] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((uploadedFile) => {
      const validation = validateFile(uploadedFile);
      if (!validation.valid) {
        toast({
          title: `Invalid file: ${uploadedFile.name}`,
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      if (uploadedFile.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${uploadedFile.name} exceeds 2MB limit`,
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setUploadedFiles((prev) => {
          if (prev.some((f) => f.name === uploadedFile.name)) {
            toast({ title: "Duplicate", description: `${uploadedFile.name} already added`, variant: "destructive" });
            return prev;
          }
          return [...prev, { name: uploadedFile.name, content: text }];
        });
        toast({ title: "File added", description: `${uploadedFile.name} loaded successfully` });
      };
      reader.readAsText(uploadedFile);
    });

    // Reset input so user can re-select the same file
    e.target.value = "";
  };

  const removeFile = (name: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const getCombinedContent = () => {
    const fileParts = uploadedFiles.map(
      (f, i) => `--- Question Paper ${i + 1}: ${f.name} ---\n${f.content}`
    );
    const allContent = [...fileParts];
    if (content.trim()) {
      allContent.push(`--- Pasted Content ---\n${content}`);
    }
    return allContent.join("\n\n");
  };

  const handleAnalyze = async () => {
    const combined = getCombinedContent();
    if (!combined.trim()) {
      toast({
        title: "No content",
        description: "Please upload files or paste question paper content first",
        variant: "destructive",
      });
      return;
    }

    if (combined.length > 100000) {
      toast({
        title: "Content too large",
        description: "Total content exceeds 100,000 characters. Remove some files.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Authentication required");
      }

      const { data, error } = await supabase.functions.invoke('analyze-question-paper', {
        body: { content: combined }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analysis complete",
        description: "Your question papers have been analyzed",
      });
    } catch (error) {
      console.error('Error analyzing question paper:', error);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasContent = uploadedFiles.length > 0 || content.trim().length > 0;

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Question Paper Analysis</h1>
          <p className="text-muted-foreground">Upload multiple question papers to get AI-powered insights & important PYQs</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Question Papers
            </CardTitle>
            <CardDescription>
              Upload multiple text files or paste content below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">Click to add question paper files (.txt, .doc, .docx)</span>
              </label>
              <Input
                id="file-upload"
                type="file"
                accept=".txt,.doc,.docx,text/*"
                onChange={handleFileUpload}
                className="hidden"
                multiple
              />
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploaded Files ({uploadedFiles.length})</p>
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((f) => (
                    <Badge key={f.name} variant="secondary" className="flex items-center gap-1 pr-1">
                      <FileText className="h-3 w-3" />
                      <span className="max-w-[150px] truncate">{f.name}</span>
                      <button
                        onClick={() => removeFile(f.name)}
                        className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="relative">
              <Textarea
                placeholder="Or paste your question paper content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !hasContent}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing {uploadedFiles.length > 1 ? `${uploadedFiles.length} papers` : ""}...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze {uploadedFiles.length > 1 ? `${uploadedFiles.length} Papers` : "Question Paper"}
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
              Important PYQs, patterns & AI-powered insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Analyzing your question papers...</p>
                </div>
              </div>
            ) : analysis ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg max-h-[500px] overflow-y-auto">
                  {analysis}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
                <div className="text-center space-y-2">
                  <FileText className="h-12 w-12 mx-auto opacity-50" />
                  <p>Upload question papers to get important PYQs & insights</p>
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
