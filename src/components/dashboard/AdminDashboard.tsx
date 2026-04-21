import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/lib/store";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { FolderKanban, CheckCircle2, Clock, Users, AlertTriangle, TrendingUp, Shield, Activity, UserPlus, Settings, Database, FileText, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function AdminDashboard() {
  const { projects } = useProjects();
  const { members } = useTeamMembers();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const allTasks = projects.flatMap(p => p.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = allTasks.filter(t => t.status === 'in-progress').length;
  const overdueTasks = allTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'done').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const reviewTasks = allTasks.filter(t => t.status === 'review').length;

  const roleBreakdown = {
    admins: members.filter(m => m.role === 'admin').length,
    managers: members.filter(m => m.role === 'manager').length,
    membersCount: members.filter(m => m.role === 'member').length,
    viewers: members.filter(m => m.role === 'viewer').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Admin Welcome Banner */}
      <div className="gradient-hero rounded-2xl p-6 md:p-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, hsl(43 96% 56% / 0.4), transparent 60%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-accent" />
            <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">Administrator</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Welcome back, {profile?.full_name || 'Admin'}
          </h1>
          <p className="text-primary-foreground/80 text-sm md:text-base max-w-xl">
            Full platform oversight. {overdueTasks > 0 ? `${overdueTasks} overdue tasks need attention.` : 'All systems running smoothly.'} {members.length} registered users across all teams.
          </p>
          <div className="flex gap-2 mt-4 flex-wrap">
            <Button size="sm" variant="secondary" onClick={() => navigate('/admin')} className="gap-1.5 text-xs">
              <UserPlus className="w-3.5 h-3.5" /> Manage Users
            </Button>
            <Button size="sm" variant="secondary" onClick={() => navigate('/analytics')} className="gap-1.5 text-xs">
              <Activity className="w-3.5 h-3.5" /> View Analytics
            </Button>
            <Button size="sm" variant="secondary" onClick={() => navigate('/crisis')} className="gap-1.5 text-xs">
              <AlertTriangle className="w-3.5 h-3.5" /> Crisis Dashboard
            </Button>
            <Button size="sm" variant="secondary" onClick={() => navigate('/settings')} className="gap-1.5 text-xs">
              <Settings className="w-3.5 h-3.5" /> Platform Settings
            </Button>
          </div>
        </div>
      </div>

      {/* System-wide Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Projects" value={projects.length} change={`${activeProjects} active`} changeType="positive" icon={FolderKanban} />
        <StatCard title="Completed Tasks" value={completedTasks} change={`${completionRate}% rate`} changeType="positive" icon={CheckCircle2} iconColor="bg-success" />
        <StatCard title="In Progress" value={inProgressTasks} change={`${reviewTasks} in review`} changeType="neutral" icon={Clock} iconColor="bg-info" />
        <StatCard title="Registered Users" value={members.length} change="All teams" changeType="positive" icon={Users} iconColor="gradient-accent" />
        <StatCard title="Overdue" value={overdueTasks} change={overdueTasks > 0 ? "Needs action" : "On track"} changeType={overdueTasks > 0 ? "negative" : "positive"} icon={AlertTriangle} iconColor="bg-destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* All Active Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-foreground">All Active Projects</h3>
            <button onClick={() => navigate('/projects')} className="text-xs text-accent hover:underline font-medium">Manage →</button>
          </div>
          {projects.filter(p => p.status === 'active').map(project => {
            const done = project.tasks.filter(t => t.status === 'done').length;
            const total = project.tasks.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={project.id} className="glass-card-elevated p-4 cursor-pointer hover:scale-[1.01] transition-all" onClick={() => navigate(`/projects/${project.id}`)}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground">{project.title}</h4>
                  <span className="text-xs font-bold text-accent">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2 mb-2" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{done}/{total} tasks • {project.category}</span>
                  <Badge variant="outline" className="text-[9px]">{project.members.length} members</Badge>
                </div>
              </div>
            );
          })}
          {projects.filter(p => p.status === 'active').length === 0 && (
            <div className="glass-card p-8 text-center text-sm text-muted-foreground">No active projects yet.</div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* System Alerts */}
          <h3 className="font-display font-bold text-lg text-foreground">System Alerts</h3>
          
          {overdueTasks > 0 && (
            <div className="glass-card p-4 border-destructive/30 bg-destructive/5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <h4 className="text-sm font-semibold text-destructive">Overdue Tasks</h4>
              </div>
              <p className="text-xs text-muted-foreground">{overdueTasks} task{overdueTasks > 1 ? 's' : ''} past due. Requires immediate admin review.</p>
            </div>
          )}

          {reviewTasks > 0 && (
            <div className="glass-card p-4 border-accent/30 bg-accent/5">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-accent" />
                <h4 className="text-sm font-semibold text-accent-foreground">Pending Reviews</h4>
              </div>
              <p className="text-xs text-muted-foreground">{reviewTasks} task{reviewTasks > 1 ? 's' : ''} awaiting review approval.</p>
            </div>
          )}

          {/* Platform Health */}
          <div className="glass-card p-4 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-primary">Platform Health</h4>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Task Completion</span><span className="font-bold text-foreground">{completionRate}%</span></div>
              <div className="flex justify-between"><span>Active Projects</span><span className="font-bold text-foreground">{activeProjects}</span></div>
              <div className="flex justify-between"><span>Total Users</span><span className="font-bold text-foreground">{members.length}</span></div>
            </div>
          </div>

          {/* Role Distribution */}
          <div className="glass-card-elevated p-4">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Role Distribution</h4>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Admins', count: roleBreakdown.admins, color: 'bg-destructive' },
                { label: 'Managers', count: roleBreakdown.managers, color: 'bg-accent' },
                { label: 'Members', count: roleBreakdown.membersCount, color: 'bg-primary' },
                { label: 'Viewers', count: roleBreakdown.viewers, color: 'bg-muted-foreground' },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${r.color}`} />
                  <span className="text-xs text-muted-foreground flex-1">{r.label}</span>
                  <span className="text-xs font-bold text-foreground">{r.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="glass-card-elevated p-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">Recent Users</h4>
            {members.slice(0, 5).map(m => (
              <div key={m.id} className="flex items-center gap-2 py-1.5">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[9px] bg-primary text-primary-foreground">{m.avatar}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-foreground flex-1 truncate">{m.name}</span>
                <Badge variant="outline" className="text-[9px]">{m.role}</Badge>
              </div>
            ))}
            <button onClick={() => navigate('/admin')} className="text-xs text-accent hover:underline mt-2 block">View all →</button>
          </div>

          {/* Quick Admin Actions */}
          <div className="glass-card-elevated p-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={() => navigate('/admin')} className="text-xs gap-1.5">
                <UserPlus className="w-3 h-3" /> Users
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/analytics')} className="text-xs gap-1.5">
                <BarChart3 className="w-3 h-3" /> Reports
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/projects')} className="text-xs gap-1.5">
                <FolderKanban className="w-3 h-3" /> Projects
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/team')} className="text-xs gap-1.5">
                <Users className="w-3 h-3" /> Teams
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
