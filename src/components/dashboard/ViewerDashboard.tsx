import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useProjects } from "@/lib/store";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { Eye, FolderKanban, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ViewerDashboard() {
  const { projects } = useProjects();
  const { members } = useTeamMembers();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const allTasks = projects.flatMap(p => p.tasks);
  const completedTasks = allTasks.filter(t => t.status === 'done').length;
  const totalTasks = allTasks.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl p-6 md:p-8 bg-muted/50 border border-border relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <Badge variant="outline" className="text-xs">View Only</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            Welcome, {profile?.full_name || 'Viewer'}
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            You have read-only access to the platform. Browse projects, tasks, and team activity below.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card-elevated p-5 text-center">
          <FolderKanban className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{activeProjects}</p>
          <p className="text-xs text-muted-foreground">Active Projects</p>
        </div>
        <div className="glass-card-elevated p-5 text-center">
          <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{completedTasks}/{totalTasks}</p>
          <p className="text-xs text-muted-foreground">Tasks Completed</p>
        </div>
        <div className="glass-card-elevated p-5 text-center">
          <Clock className="w-8 h-8 text-info mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</p>
          <p className="text-xs text-muted-foreground">Overall Progress</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg text-foreground">Projects Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(project => {
            const done = project.tasks.filter(t => t.status === 'done').length;
            const total = project.tasks.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={project.id} className="glass-card-elevated p-4 cursor-pointer hover:bg-muted/30 transition-all" onClick={() => navigate(`/projects/${project.id}`)}>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-foreground">{project.title}</h4>
                  <Badge variant="outline" className="text-[9px] capitalize">{project.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                <Progress value={pct} className="h-2 mb-2" />
                <span className="text-[10px] text-muted-foreground">{done}/{total} tasks</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg text-foreground">Team Directory</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map(m => (
            <div key={m.id} className="glass-card p-3 flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground font-bold">{m.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{m.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
