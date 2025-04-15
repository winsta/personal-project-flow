import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Code, Copy, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
];

const snippetSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  code: z.string().min(1, "Code is required"),
  language: z.string().min(1, "Language is required"),
  project_id: z.string().optional(),
  task_id: z.string().optional(),
});

type SnippetFormValues = z.infer<typeof snippetSchema>;

const Snippets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState<any>(null);
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createForm = useForm<SnippetFormValues>({
    resolver: zodResolver(snippetSchema),
    defaultValues: {
      title: "",
      code: "",
      language: "javascript",
      project_id: undefined,
      task_id: undefined,
    },
  });

  const editForm = useForm<SnippetFormValues>({
    resolver: zodResolver(snippetSchema),
    defaultValues: {
      title: "",
      code: "",
      language: "javascript",
      project_id: undefined,
      task_id: undefined,
    },
  });

  // Fetch code snippets
  const { data: snippets = [], isLoading, error, refetch } = useQuery({
    queryKey: ["code-snippets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("code_snippets")
        .select(`*, projects(name), tasks(title)`)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    },
  });

  // Fetch projects for the select dropdown
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

  // Fetch tasks for the select dropdown
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

  const createSnippet = useMutation({
    mutationFn: async (data: SnippetFormValues) => {
      if (!user) {
        throw new Error("User must be logged in");
      }

      const { error } = await supabase
        .from("code_snippets")
        .insert({
          title: data.title,
          code: data.code,
          language: data.language,
          project_id: data.project_id || null,
          task_id: data.task_id || null,
          created_by: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      createForm.reset();
      setCreateDialogOpen(false);
      toast.success("Code snippet created successfully!");
      queryClient.invalidateQueries({ queryKey: ["code-snippets"] });
    },
    onError: (error: any) => {
      toast.error("Failed to create code snippet", {
        description: error.message,
      });
    },
  });

  const updateSnippet = useMutation({
    mutationFn: async (data: SnippetFormValues & { id: string }) => {
      const { error } = await supabase
        .from("code_snippets")
        .update({
          title: data.title,
          code: data.code,
          language: data.language,
          project_id: data.project_id || null,
          task_id: data.task_id || null,
        })
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      editForm.reset();
      setEditDialogOpen(false);
      setSelectedSnippet(null);
      toast.success("Code snippet updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["code-snippets"] });
    },
    onError: (error: any) => {
      toast.error("Failed to update code snippet", {
        description: error.message,
      });
    },
  });

  const deleteSnippet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("code_snippets")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Code snippet deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["code-snippets"] });
    },
    onError: (error: any) => {
      toast.error("Failed to delete code snippet", {
        description: error.message,
      });
    },
  });

  const onCreateSubmit = (data: SnippetFormValues) => {
    createSnippet.mutate(data);
  };

  const onEditSubmit = (data: SnippetFormValues) => {
    if (selectedSnippet) {
      updateSnippet.mutate({
        ...data,
        id: selectedSnippet.id,
      });
    }
  };

  const handleEdit = (snippet: any) => {
    setSelectedSnippet(snippet);
    editForm.reset({
      title: snippet.title,
      code: snippet.code,
      language: snippet.language,
      project_id: snippet.project_id || undefined,
      task_id: snippet.task_id || undefined,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this code snippet?")) {
      deleteSnippet.mutate(id);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  // Filter snippets based on search term and active language
  const filteredSnippets = snippets.filter((snippet) => {
    const matchesSearch = 
      snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = 
      !activeLanguage || 
      snippet.language === activeLanguage;
    
    return matchesSearch && matchesLanguage;
  });

  // Get unique languages from snippets
  const uniqueLanguages = Array.from(
    new Set(snippets.map((snippet) => snippet.language))
  );

  return (
    <>
      <Helmet>
        <title>Code Snippets | ProjectFlow</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Code Snippets</h1>
            <p className="text-muted-foreground">
              Store and organize your code snippets for quick reference.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Snippet
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>Create New Code Snippet</DialogTitle>
                  <DialogDescription>
                    Save a useful code snippet for future reference.
                  </DialogDescription>
                </DialogHeader>

                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                    <FormField
                      control={createForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="API Authentication Example" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {LANGUAGES.map((lang) => (
                                  <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createForm.control}
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
                    </div>

                    <FormField
                      control={createForm.control}
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

                    <FormField
                      control={createForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Paste your code here..."
                              className="font-mono min-h-[200px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createSnippet.isPending}
                      >
                        {createSnippet.isPending ? "Creating..." : "Create Snippet"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="icon" onClick={() => refetch()} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Edit Code Snippet</DialogTitle>
              <DialogDescription>
                Update your code snippet.
              </DialogDescription>
            </DialogHeader>

            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LANGUAGES.map((lang) => (
                              <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="project_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project</FormLabel>
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
                </div>

                <FormField
                  control={editForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Textarea
                          className="font-mono min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={updateSnippet.isPending}
                  >
                    {updateSnippet.isPending ? "Updating..." : "Update Snippet"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Search and Language Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search snippets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8"
            />
          </div>

          <Tabs value={activeLanguage || "all"} onValueChange={(value) => setActiveLanguage(value === "all" ? null : value)}>
            <TabsList className="w-full overflow-x-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              {uniqueLanguages.map((lang) => (
                <TabsTrigger key={lang} value={lang}>
                  {LANGUAGES.find(l => l.value === lang)?.label || lang}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Snippets Grid */}
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div 
                key={`skeleton-${index}`} 
                className="h-[280px] rounded-lg border border-border bg-card p-6 animate-pulse"
              />
            ))
          ) : filteredSnippets.length > 0 ? (
            filteredSnippets.map((snippet) => (
              <Card key={snippet.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{snippet.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                          {LANGUAGES.find(l => l.value === snippet.language)?.label || snippet.language}
                        </span>
                        {snippet.projects && (
                          <span className="text-xs text-muted-foreground">
                            Project: {snippet.projects.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(snippet)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(snippet.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-0">
                  <div className="relative bg-gray-100 dark:bg-gray-900 rounded-md p-4 font-mono text-sm overflow-x-auto max-h-[200px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap break-words">{snippet.code}</pre>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between py-2">
                  <div className="text-xs text-muted-foreground">
                    {new Date(snippet.created_at).toLocaleDateString()}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(snippet.code)}
                    className="h-8"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <h3 className="text-lg font-medium">No code snippets found</h3>
              <p className="text-muted-foreground">
                Create your first code snippet to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Snippets;
