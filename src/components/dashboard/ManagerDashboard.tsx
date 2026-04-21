import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/lib/store";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { FolderKanban, CheckCircle2, Clock, Users, TrendingUp, Plus, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ManagerDashboard() {
  const { projects } = useProjects();
  const { members } = useTeamMembers();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const allTasks = projects.flatMap(p => p.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = allTasks.filter(t => t.status === 'in-progress').length;
  const reviewTasks = allTasks.filter(t => t.status === 'review').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;

  const memberWorkload = members.map(m => ({
    ...m,
    activeTasks: allTasks.filter(t => t.assigneeId === m.id && t.status !== 'done').length,
    completedTasks: allTasks.filter(t => t.assigneeId === m.id && t.status === 'done').length,
  })).sort((a, b) => b.activeTasks - a.activeTasks);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="gradient-hero rounded-2xl p-6 md:p-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, hsl(43 96% 56% / 0.4), transparent 60%)' }} />
        <div className="relative z-10">
          <Badge className="bg-accent/20 text-accent border-accent/30 text-xs mb-2">Manager</Badge>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Welcome, {profile?.full_name || 'Manager'}
          </h1>
          <p className="text-primary-foreground/80 text-sm max-w-xl">
            {reviewTasks > 0 ? `${reviewTasks} tasks awaiting your review.` : 'No pending reviews.'} {activeProjects} active projects under your supervision.
          </p>
          <div className="flex gap-2 mt-4 flex-wrap">
            <Button size="sm" variant="secondary" onClick={() => navigate('/projects')} className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> Create Project
            </Button>
            <Button size="sm" variant="secondary" onClick={() => navigate('/analytics')} className="gap-1.5 text-xs">
              <BarChart3 className="w-3.5 h-3.5" /> Team Analytics
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Projects" value={activeProjects} change={`${projects.length} total`} changeType="positive" icon={FolderKanban} />
        <StatCard title="Completed Tasks" value={completedTasks} change={`${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% rate`} changeType="positive" icon={CheckCircle2} iconColor="bg-success" />
        <StatCard title="In Progress" value={inProgressTasks} change={`${reviewTasks} in review`} changeType="neutral" icon={Clock} iconColor="bg-info" />
        <StatCard title="Team Members" value={members.length} change="All users" changeType="positive" icon={Users} iconColor="gradient-accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-display font-bold text-lg text-foreground">Projects Overview</h3>
          {projects.filter(p => p.status === 'active').map(project => {
            const done = project.tasks.filter(t => t.status === 'done').length;
            const total = project.tasks.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const reviewCount = project.tasks.filter(t => t.status === 'review').length;
            return (
              <div key={project.id} className="glass-card-elevated p-4 cursor-pointer hover:scale-[1.01] transition-all" onClick={() => navigate(`/projects/${project.id}`)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">{project.title}</h4>
                    {reviewCount > 0 && <Badge className="bg-accent/10 text-accent text-[9px]">{reviewCount} to review</Badge>}
                  </div>
                  <span className="text-xs font-bold text-accent">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2 mb-2" />
                <span className="text-[10px] text-muted-foreground">{done}/{total} tasks completed</span>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-foreground">Team Workload</h3>
          {memberWorkload.slice(0, 8).map(m => (
            <div key={m.id} className="glass-card-elevated p-3 flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground font-bold">{m.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{m.name}</p>
                <p className="text-[10px] text-muted-foreground">{m.activeTasks} active • {m.completedTasks} done</p>
              </div>
              <div className="w-16">
                <Progress value={m.activeTasks > 0 ? Math.min((m.completedTasks / (m.activeTasks + m.completedTasks)) * 100, 100) : 100} className="h-1.5" />
              </div>
            </div>
          ))}
          {memberWorkload.length === 0 && (
            <div className="glass-card p-4 text-center text-xs text-muted-foreground">No team members yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
