import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, FolderOpen, FileText, Upload, Pencil, Trash2, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { toast } from "sonner";
import { validateFile } from "@/lib/fileValidation";

const Documents = () => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [editDoc, setEditDoc] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteDoc, setDeleteDoc] = useState<any | null>(null);
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

    if (profile) {
      setProfileId(profile.id);
      const { data: documentsData } = await supabase
        .from("student_documents")
        .select("*")
        .eq("student_id", profile.id)
        .order("created_at", { ascending: false });

      setDocuments(documentsData || []);
    }
    
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !profileId) {
      toast.error("Please select a file and enter a title");
      return;
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profileId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('student-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('student-documents')
        .createSignedUrl(fileName, 31536000);

      if (urlError) throw urlError;

      const { error: dbError } = await supabase
        .from('student_documents')
        .insert({
          student_id: profileId,
          title,
          file_url: signedUrlData.signedUrl,
          file_type: file.type || 'application/octet-stream'
        });

      if (dbError) throw dbError;

      toast.success("Document uploaded successfully!");
      setFile(null);
      setTitle("");
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateTitle = async () => {
    if (!editDoc || !editTitle.trim()) return;
    try {
      const { error } = await supabase
        .from("student_documents")
        .update({ title: editTitle.trim() })
        .eq("id", editDoc.id);

      if (error) throw error;
      toast.success("Document renamed successfully!");
      setEditDoc(null);
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to rename document");
    }
  };

  const handleDelete = async () => {
    if (!deleteDoc) return;
    try {
      const { error } = await supabase
        .from("student_documents")
        .delete()
        .eq("id", deleteDoc.id);

      if (error) throw error;
      toast.success("Document deleted successfully!");
      setDeleteDoc(null);
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete document");
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
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">My Documents</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {documents.length === 0 ? (
              <div className="text-center py-16 animate-fade-in">
                <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Documents Yet</h2>
                <p className="text-muted-foreground">Upload your documents to keep them secure and organized</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc, index) => (
                  <Card key={doc.id} className="hover:shadow-lg transition-all animate-fade-in hover:-translate-y-1" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="bg-secondary/10 rounded-full p-3 w-fit mb-2">
                          <FileText className="h-6 w-6 text-secondary" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditDoc(doc); setEditTitle(doc.title); }}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteDoc(doc)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardTitle>{doc.title}</CardTitle>
                      <CardDescription>
                        Uploaded {format(new Date(doc.created_at), "MMM dd, yyyy")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{doc.file_type}</p>
                      <Button 
                        variant="secondary" 
                        className="w-full"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        View Document
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload">
            <Card className="max-w-2xl mx-auto animate-fade-in">
              <CardHeader>
                <div className="bg-primary/10 rounded-full p-3 w-fit mb-2">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Upload Document</CardTitle>
                <CardDescription>Add a new document to your collection</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Document Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter document title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file">Select File</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload Document"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Rename Dialog */}
      <Dialog open={!!editDoc} onOpenChange={(open) => !open && setEditDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
            <DialogDescription>Enter a new title for this document.</DialogDescription>
          </DialogHeader>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="New document title"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDoc(null)}>Cancel</Button>
            <Button onClick={handleUpdateTitle}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDoc} onOpenChange={(open) => !open && setDeleteDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDoc?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDoc(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;
