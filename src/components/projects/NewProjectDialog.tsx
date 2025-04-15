
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Project form schema
const projectSchema = z.object({
  name: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  client_id: z.string().optional(),
  status: z.enum(["planning", "in_progress", "completed", "on_hold"]),
  team_id: z.string().optional(),
  budget: z.coerce.number().min(0, "Budget must be a positive number").optional(),
  team_members: z.array(z.string()).optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch clients for the select dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch teams for the select dropdown
  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teams").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch team members
  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      client_id: undefined,
      status: "planning",
      team_id: undefined,
      budget: undefined,
      team_members: [],
    },
  });

  const createTeam = useMutation({
    mutationFn: async (teamName: string) => {
      const { data, error } = await supabase
        .from("teams")
        .insert({
          name: teamName,
        })
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: (newTeam) => {
      toast.success("Team created successfully");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      form.setValue("team_id", newTeam.id);
      setTeamDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error("Failed to create team", {
        description: error.message,
      });
    },
  });

  const createProject = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      // First create the project
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert({
          name: data.name,
          description: data.description,
          client_id: data.client_id || null,
          status: data.status,
          team_id: data.team_id || null,
          created_by: user?.id,
        })
        .select();
      
      if (projectError) throw projectError;
      
      const projectId = projectData[0].id;
      
      // If team members were selected, add them to the team_members table
      if (data.team_members && data.team_members.length > 0 && data.team_id) {
        const teamMembersPromises = data.team_members.map(userId => {
          return supabase
            .from("team_members")
            .insert({
              user_id: userId,
              team_id: data.team_id as string,
              role: 'member'
            });
        });
        
        await Promise.all(teamMembersPromises);
      }
      
      // Create the initial finance record if budget is provided
      if (data.budget && data.budget > 0) {
        const financeData = {
          project_id: projectId,
          budget: data.budget,
          received: 0,
          spent: 0
        };
      
        // Here we'll check if the project_finance table exists before inserting
        try {
          await supabase.from("project_finance").insert(financeData);
        } catch (error) {
          console.error("Failed to add finance data", error);
          // We won't throw this error as it's not critical to project creation
        }
      }
      
      return projectData[0];
    },
    onSuccess: () => {
      // Reset form and close dialog
      form.reset();
      setOpen(false);
      
      // Show success message
      toast.success("Project created successfully!");
      
      // Refresh projects data
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error: any) => {
      toast.error("Failed to create project", {
        description: error.message,
      });
    },
  });

  function onSubmit(data: ProjectFormValues) {
    createProject.mutate(data);
  }

  function handleCreateTeam() {
    if (newTeamName.trim()) {
      createTeam.mutate(newTeamName);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="sm:w-auto w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Enter the details for your new project. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Website Redesign" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the project"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="on_hold">On Hold</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="5000" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="team_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select a team" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {teams.map((team) => (
                                <SelectItem key={team.id} value={team.id}>
                                  {team.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <AlertDialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" type="button">New</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Create New Team</AlertDialogTitle>
                              <AlertDialogDescription>
                                Enter the name for your new team.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <Input 
                              value={newTeamName} 
                              onChange={(e) => setNewTeamName(e.target.value)} 
                              placeholder="Team name"
                            />
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleCreateTeam}>Create</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="team_members"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Team Members</FormLabel>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                      {profiles.map((profile) => (
                        <FormField
                          key={profile.id}
                          control={form.control}
                          name="team_members"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={profile.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(profile.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value || [], profile.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== profile.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {profile.name}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createProject.isPending}
                >
                  {createProject.isPending ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
