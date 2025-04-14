
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  Users, 
  DollarSign, 
  FileText 
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import ProjectCard, { ProjectCardProps } from "@/components/dashboard/ProjectCard";
import TaskCard, { TaskCardProps } from "@/components/tasks/TaskCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { summaryData, getRecentProjects, getUpcomingTasks } from "@/utils/sample-data";

const Dashboard = () => {
  // Cast the return type to ensure it matches the ProjectCardProps type
  const [recentProjects] = useState<ProjectCardProps[]>(
    getRecentProjects(3).map(project => ({
      ...project,
      status: project.status as "active" | "completed" | "on-hold"
    }))
  );
  const [upcomingTasks] = useState<TaskCardProps[]>(getUpcomingTasks(4));

  return (
    <>
      <Helmet>
        <title>Dashboard | ProjectFlow</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your project management overview and recent activities.
          </p>
        </div>

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
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Upcoming Tasks</CardTitle>
              <Tabs defaultValue="all" className="w-[300px]">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="overdue">Overdue</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {upcomingTasks.map((task) => (
                <TaskCard key={task.id} {...task} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
