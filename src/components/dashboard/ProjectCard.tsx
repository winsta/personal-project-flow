
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "on-hold";
  progress: number;
  dueDate: string | Date;
  clientName?: string;
  tasksCount: number;
  completedTasks: number;
}

const ProjectCard = ({
  id,
  title,
  description,
  status,
  progress,
  dueDate,
  clientName,
  tasksCount,
  completedTasks,
}: ProjectCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "on-hold":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const date = new Date(dueDate);

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <Badge className={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 mr-1" />
              <span>Due {formatDistanceToNow(date, { addSuffix: true })}</span>
            </div>
            {clientName && (
              <div className="flex items-center text-muted-foreground">
                <Users className="h-3.5 w-3.5 mr-1" />
                <span>{clientName}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 text-xs text-muted-foreground">
        {completedTasks} of {tasksCount} tasks completed
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
