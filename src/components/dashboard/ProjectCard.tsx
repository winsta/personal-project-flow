
import React from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  Layers, 
  MoreHorizontal,
  UserRound
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

type ProjectStatus = "planning" | "in_progress" | "on_hold" | "completed" | "cancelled";

interface ProjectCardProps {
  id: string;
  title: string;
  description?: string;
  client?: string;
  status: ProjectStatus;
  progress: number;
  dueDate?: string | Date;
  onClick?: () => void;
}

const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case "planning":
      return "bg-blue-500";
    case "in_progress":
      return "bg-amber-500";
    case "on_hold":
      return "bg-purple-500";
    case "completed":
      return "bg-green-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-slate-500";
  }
};

const getStatusText = (status: ProjectStatus) => {
  switch (status) {
    case "planning":
      return "Planning";
    case "in_progress":
      return "In Progress";
    case "on_hold":
      return "On Hold";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  client,
  status,
  progress,
  dueDate,
  onClick,
}) => {
  return (
    <Card className="overflow-hidden h-full transition-shadow hover:shadow-md">
      <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between space-y-0">
        <div>
          <Link 
            to={`/projects/${id}`}
            className="font-semibold text-lg hover:underline truncate max-w-[180px] inline-block"
          >
            {title}
          </Link>
          <div className="flex items-center space-x-1 mt-1">
            <Badge
              variant="secondary"
              className={`px-2 py-0 h-5 ${getStatusColor(status)} text-white hover:${getStatusColor(status)}`}
            >
              {getStatusText(status)}
            </Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground line-clamp-2 h-10">
          {description || "No description provided"}
        </div>
        
        <div className="space-y-3 mt-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="text-muted-foreground">Progress</div>
              <div className="font-medium">{progress}%</div>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col items-start space-y-2">
        {client && (
          <div className="flex items-center text-xs text-muted-foreground">
            <UserRound className="mr-1 h-3 w-3" />
            <span>{client}</span>
          </div>
        )}
        {dueDate && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="mr-1 h-3 w-3" />
            <span>
              Due {format(new Date(dueDate), "MMM d, yyyy")}
            </span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
