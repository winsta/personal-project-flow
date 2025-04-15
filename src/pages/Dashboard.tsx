import { Helmet } from "react-helmet-async";
import { 
  FolderKanban, 
  CheckCircle2, 
  Users, 
  DollarSign
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import ProjectCard from "@/components/dashboard/ProjectCard";
import TaskCard from "@/components/tasks/TaskCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import NewTaskDialog from "@/components/tasks/NewTaskDialog";
import NewProjectDialog from "@/components/projects/NewProjectDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Dashboard = () => {
  // Fetch recent projects
  const { data: recentProjects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, clients(name)")
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      
      return data || [];
    },
  });

  // Fetch upcoming tasks
  const { data: upcomingTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", "upcoming"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, projects(name)")
        .order("due_date", { ascending: true })
        .limit(4);
      
      if (error) throw error;
      
      return data || [];
    },
  });

  // Fetch summary data
  const { data: summaryData } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: async () => {
      // Projects count
      const { count: projectsCount, error: projectsError } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });
      
      if (projectsError) throw projectsError;

      // Active clients count
      const { count: clientsCount, error: clientsError } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true });
      
      if (clientsError) throw clientsError;

      // Tasks count
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("status");
      
      if (tasksError) throw tasksError;
      
      const completedTasks = tasksData.filter(task => task.status === "done").length;
      const totalTasks = tasksData.length;

      return {
        activeProjects: projectsCount || 0,
        activeClients: clientsCount || 0,
        completedTasks,
        totalTasks,
        revenueThisMonth: 0, // Placeholder for now
        pendingInvoices: 0,   // Placeholder for now
      };
    },
    initialData: {
      activeProjects: 0,
      activeClients: 0,
      completedTasks: 0,
      totalTasks: 0,
      revenueThisMonth: 0,
      pendingInvoices: 0,
    },
  });

  return (
    <>
      <Helmet>
        <title>Dashboard | ProjectFlow</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <NewProjectDialog />
            <NewTaskDialog className="sm:w-auto w-full" />
          </div>
        </div>
        <p className="text-muted-foreground">
          Your project management overview and recent activities.
        </p>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Projects"
            value={summaryData.activeProjects}
            icon={<FolderKanban />}
          />
          <StatCard
            title="Completed Tasks"
            value={summaryData.completedTasks}
            description={`of ${summaryData.totalTasks} total tasks`}
            icon={<CheckCircle2 />}
          />
          <StatCard
            title="Active Clients"
            value={summaryData.activeClients}
            icon={<Users />}
          />
          <StatCard
            title="Revenue This Month"
            value={`$${summaryData.revenueThisMonth.toLocaleString()}`}
            description={`${summaryData.pendingInvoices} pending invoices`}
            icon={<DollarSign />}
          />
        </div>

        {/* Recent Projects */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Recent Projects</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <a href="/projects">View all</a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projectsLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div 
                    key={`project-skeleton-${index}`} 
                    className="h-[220px] rounded-lg border border-border bg-card p-6 animate-pulse"
                  />
                ))
              ) : recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <ProjectCard 
                    key={project.id}
                    id={project.id}
                    title={project.name}
                    description={project.description || ""}
                    status={project.status as "planning" | "in_progress" | "on_hold" | "completed" | "cancelled"}
                    progress={Math.floor(Math.random() * (100 - 10 + 1) + 10)} // Placeholder progress
                    dueDate={project.end_date || undefined}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <h3 className="text-lg font-medium">No projects found</h3>
                  <p className="text-muted-foreground">
                    Create your first project to get started.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Upcoming Tasks</CardTitle>
              <div className="flex items-center gap-2">
                <NewTaskDialog className="ml-2" />
                <Tabs defaultValue="all" className="w-[300px]">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="overdue">Overdue</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tasksLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div 
                    key={`task-skeleton-${index}`} 
                    className="h-[180px] rounded-lg border border-border bg-card p-6 animate-pulse"
                  />
                ))
              ) : upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <TaskCard 
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description || ""}
                    dueDate={task.due_date ? new Date(task.due_date) : undefined}
                    status={task.status as "to_do" | "in_progress" | "done" | "blocked"}
                    priority={task.priority as "low" | "medium" | "high"}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <h3 className="text-lg font-medium">No tasks found</h3>
                  <p className="text-muted-foreground">
                    Add your first task to get started.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
