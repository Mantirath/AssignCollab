import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Paperclip, Calendar } from "lucide-react";
import { Task } from "@/lib/store";
import { useTeamMembers } from "@/hooks/useTeamMembers";

const statusColors: Record<string, string> = {
  'todo': 'bg-muted text-muted-foreground',
  'in-progress': 'bg-info/10 text-info',
  'review': 'bg-warning/10 text-warning',
  'done': 'bg-success/10 text-success',
};

const priorityColors: Record<string, string> = {
  'low': 'bg-muted text-muted-foreground',
  'medium': 'bg-info/10 text-info',
  'high': 'bg-warning/10 text-warning',
  'critical': 'bg-destructive/10 text-destructive',
};

const statusLabels: Record<string, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'review': 'In Review',
  'done': 'Completed',
};

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { getUserById } = useTeamMembers();
  const assignee = getUserById(task.assigneeId);

  return (
    <div
      onClick={onClick}
      className="glass-card p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] animate-fade-in"
    >
      <div className="flex items-start justify-between mb-3">
        <Badge className={`text-[10px] font-semibold border-none ${priorityColors[task.priority]}`}>
          {task.priority.toUpperCase()}
        </Badge>
        <Badge className={`text-[10px] font-medium border-none ${statusColors[task.status]}`}>
          {statusLabels[task.status]}
        </Badge>
      </div>

      <h4 className="font-semibold text-sm text-foreground mb-1 font-sans">{task.title}</h4>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-muted-foreground">
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <MessageSquare className="w-3 h-3" /> {task.comments.length}
            </span>
          )}
          {task.files.length > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <Paperclip className="w-3 h-3" /> {task.files.length}
            </span>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs">
              <Calendar className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
        {assignee && (
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px] bg-primary text-primary-foreground font-semibold">
              {assignee.avatar}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
