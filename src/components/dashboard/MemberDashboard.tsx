import { StatCard } from "@/components/StatCard";
import { TaskCard } from "@/components/TaskCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProjects } from "@/lib/store";
import { CheckCircle2, Clock, ListTodo, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function MemberDashboard() {
  const { projects } = useProjects();
  const navigate = useNavigate();
  const { profile } = useAuth();

  // Members see only their assigned tasks
  const allTasks = projects.flatMap(p => p.tasks);
  // For demo purposes, show all tasks (in production, filter by auth user's assignments)
  const myTasks = allTasks;
  const myTodo = myTasks.filter(t => t.status === 'todo');
  const myInProgress = myTasks.filter(t => t.status === 'in-progress');
  const myDone = myTasks.filter(t => t.status === 'done');
  const myOverdue = myTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'done');
  const completionRate = myTasks.length > 0 ? Math.round((myDone.length / myTasks.length) * 100) : 0;

  const upcomingTasks = [...myTasks]
    .filter(t => t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Member Banner */}
      <div className="gradient-hero rounded-2xl p-6 md:p-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, hsl(43 96% 56% / 0.4), transparent 60%)' }} />
        <div className="relative z-10">
          <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 text-xs mb-2">Team Member</Badge>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Hi, {profile?.full_name || 'Member'}!
          </h1>
          <p className="text-primary-foreground/80 text-sm max-w-xl">
            You have {myInProgress.length} tasks in progress and {myTodo.length} tasks to start.
            {myOverdue.length > 0 ? ` ⚠️ ${myOverdue.length} overdue!` : " You're on track!"}
          </p>
          <div className="flex gap-3 mt-4">
            <Badge className="bg-accent/20 text-accent border-accent/30">
              {completionRate}% Complete
            </Badge>
          </div>
        </div>
      </div>

      {/* Personal Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="To Do" value={myTodo.length} change="Pending" changeType="neutral" icon={ListTodo} />
        <StatCard title="In Progress" value={myInProgress.length} change="Active" changeType="positive" icon={Clock} iconColor="bg-info" />
        <StatCard title="Completed" value={myDone.length} change={`${completionRate}% rate`} changeType="positive" icon={CheckCircle2} iconColor="bg-success" />
        <StatCard title="Overdue" value={myOverdue.length} change={myOverdue.length > 0 ? "Action needed" : "On track"} changeType={myOverdue.length > 0 ? "negative" : "positive"} icon={AlertTriangle} iconColor="bg-destructive" />
      </div>

      {/* My Upcoming Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-foreground">My Upcoming Tasks</h3>
          <button onClick={() => navigate('/projects')} className="text-xs text-accent hover:underline font-medium">View All →</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {upcomingTasks.map(task => {
            const project = projects.find(p => p.tasks.some(t => t.id === task.id));
            return (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => project && navigate(`/projects/${project.id}`)}
              />
            );
          })}
        </div>
        {upcomingTasks.length === 0 && (
          <div className="glass-card p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">All caught up! No pending tasks.</p>
          </div>
        )}
      </div>

      {/* My Projects */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg text-foreground">My Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.filter(p => p.status === 'active').map(project => {
            const done = project.tasks.filter(t => t.status === 'done').length;
            const total = project.tasks.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={project.id} className="glass-card-elevated p-4 cursor-pointer hover:scale-[1.01] transition-all" onClick={() => navigate(`/projects/${project.id}`)}>
                <h4 className="text-sm font-semibold text-foreground mb-2">{project.title}</h4>
                <Progress value={pct} className="h-2 mb-2" />
                <span className="text-[10px] text-muted-foreground">{done}/{total} tasks • {pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
