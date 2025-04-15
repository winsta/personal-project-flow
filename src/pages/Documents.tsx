import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { FileText, Plus, Search, Upload, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const documentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  file: z.instanceof(File).optional(),
  project_id: z.string().optional(),
  task_id: z.string().optional(),
});

type DocumentFormValues = {
  name: string;
  file?: File;
  project_id?: string;
  task_id?: string;
};

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: "",
      project_id: undefined,
      task_id: undefined,
    },
  });

  const { data: documents = [], isLoading, error, refetch } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select(`*, projects(name)`)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name");
      
      if (error) throw error;
      
      return data || [];
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title");
      
      if (error) throw error;
      
      return data || [];
    },
  });

  const uploadDocument = useMutation({
    mutationFn: async (data: DocumentFormValues) => {
      if (!user || !selectedFile) {
        throw new Error("User must be logged in and a file must be selected");
      }

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { error: docError } = await supabase
        .from("documents")
        .insert({
          name: data.name,
          file_path: filePath,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          uploaded_by: user.id,
          project_id: data.project_id || null,
          task_id: data.task_id || null,
        });

      if (docError) throw docError;
    },
    onSuccess: () => {
      form.reset();
      setSelectedFile(null);
      setDialogOpen(false);
      toast.success("Document uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error: any) => {
      toast.error("Failed to upload document", {
        description: error.message,
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      if (!form.getValues("name")) {
        const fileName = file.name.split('.')[0];
        form.setValue("name", fileName);
      }
    }
  };

  const onSubmit = (data: DocumentFormValues) => {
    uploadDocument.mutate(data);
  };

  const filteredDocuments = documents.filter((doc) => {
    return doc.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getDocumentDownloadUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 60);
    
    if (data) {
      window.open(data.signedUrl, '_blank');
    }
  };

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      const docToDelete = documents.find(doc => doc.id === id);
      if (!docToDelete) throw new Error("Document not found");

      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([docToDelete.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast.success("Document deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error: any) => {
      toast.error("Failed to delete document", {
        description: error.message,
      });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDocument.mutate(id);
    }
  };

  return (
    <>
      <Helmet>
        <title>Documents | ProjectFlow</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground">
              Manage your files, attachments, and documents.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
                <DialogDescription>
                  Select a file to upload and provide the document details.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <FormLabel>File</FormLabel>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Select File
                      </Button>
                      <Input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      {selectedFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">
                        {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                      </p>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Project Brief" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="project_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select project" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {projects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="task_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select task" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {tasks.map((task) => (
                                <SelectItem key={task.id} value={task.id}>
                                  {task.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={uploadDocument.isPending || !selectedFile}
                    >
                      {uploadDocument.isPending ? "Uploading..." : "Upload Document"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div 
                key={`skeleton-${index}`} 
                className="h-[180px] rounded-lg border border-border bg-card p-6 animate-pulse"
              />
            ))
          ) : filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => (
              <Card key={doc.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="truncate text-lg">{doc.name}</CardTitle>
                      <CardDescription>
                        {doc.projects?.name ? `Project: ${doc.projects.name}` : 'No project'}
                      </CardDescription>
                    </div>
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(doc.file_size / 1024)} KB
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => getDocumentDownloadUrl(doc.file_path)}
                  >
                    Download
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <h3 className="text-lg font-medium">No documents found</h3>
              <p className="text-muted-foreground">
                Upload your first document to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Documents;
