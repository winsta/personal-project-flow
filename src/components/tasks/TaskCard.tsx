
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export type TaskStatus = "todo" | "in-progress" | "review" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | Date;
  assignedTo?: string;
  subtasks?: { id: string; title: string; completed: boolean }[];
}

const TaskCard = ({
  id,
  title,
  description,
  status,
  priority,
  dueDate,
  assignedTo,
  subtasks = [],
}: TaskCardProps) => {
  const completedSubtasks = subtasks.filter((st) => st.completed).length;

  const getStatusBadgeClass = (status: TaskStatus) => {
    return `status-badge-${status}`;
  };

  const getPriorityBadgeClass = (priority: TaskPriority) => {
    return `priority-badge-${priority}`;
  };

  const formatStatus = (status: TaskStatus) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-medium line-clamp-1">{title}</h3>
          <div className="flex flex-shrink-0 gap-1.5">
            <Badge className={cn("text-xs px-1.5 py-0", getPriorityBadgeClass(priority))}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Badge>
            <Badge className={cn("text-xs px-1.5 py-0", getStatusBadgeClass(status))}>
              {formatStatus(status)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2">
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        
        {dueDate && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>Due {formatDistanceToNow(new Date(dueDate), { addSuffix: true })}</span>
          </div>
        )}
        
        {subtasks.length > 0 && (
          <div className="flex items-center text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            <span>
              {completedSubtasks} of {subtasks.length} subtasks completed
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;
