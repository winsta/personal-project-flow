
import React from "react";
import { Calendar, Clock, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type TaskStatus = "to_do" | "in_progress" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high";

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  onClick?: () => void;
}

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case "to_do":
      return "bg-slate-500";
    case "in_progress":
      return "bg-blue-500";
    case "done":
      return "bg-green-500";
    case "blocked":
      return "bg-red-500";
    default:
      return "bg-slate-500";
  }
};

const getStatusText = (status: TaskStatus) => {
  switch (status) {
    case "to_do":
      return "To Do";
    case "in_progress":
      return "In Progress";
    case "done":
      return "Done";
    case "blocked":
      return "Blocked";
    default:
      return status;
  }
};

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case "low":
      return "bg-slate-400";
    case "medium":
      return "bg-amber-500";
    case "high":
      return "bg-red-500";
    default:
      return "bg-slate-400";
  }
};

const getPriorityText = (priority: TaskPriority) => {
  switch (priority) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    default:
      return priority;
  }
};

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  status,
  priority,
  dueDate,
  onClick,
}) => {
  return (
    <Card className="overflow-hidden h-full transition-shadow hover:shadow-md">
      <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between space-y-0">
        <div>
          <div 
            className="font-semibold text-base hover:underline cursor-pointer truncate max-w-[180px] inline-block"
            onClick={onClick}
          >
            {title}
          </div>
          <div className="flex items-center space-x-1 mt-1">
            <Badge
              variant="secondary"
              className={`px-2 py-0 h-5 ${getStatusColor(status)} text-white hover:${getStatusColor(status)}`}
            >
              {getStatusText(status)}
            </Badge>
            <Badge
              variant="secondary"
              className={`px-2 py-0 h-5 ${getPriorityColor(priority)} text-white hover:${getPriorityColor(priority)}`}
            >
              {getPriorityText(priority)}
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
      </CardContent>
      {dueDate && (
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="mr-1 h-3 w-3" />
            <span>
              Due {format(dueDate, "MMM d, yyyy")}
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default TaskCard;
