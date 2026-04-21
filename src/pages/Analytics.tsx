import { AppLayout } from "@/components/AppLayout";
import { useProjects } from "@/lib/store";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { usePermissions } from "@/hooks/usePermissions";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Lock } from "lucide-react";

const COLORS = ['hsl(222,65%,22%)', 'hsl(43,96%,56%)', 'hsl(152,60%,40%)', 'hsl(210,100%,52%)', 'hsl(0,72%,51%)', 'hsl(38,92%,50%)'];

export default function Analytics() {
  const { canViewAnalytics } = usePermissions();
  const { projects } = useProjects();
  const { members } = useTeamMembers();

  if (!canViewAnalytics) {
    return (
      <AppLayout title="Analytics" subtitle="Access Restricted">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Lock className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-display font-bold text-foreground mb-2">Access Restricted</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Analytics is available to Admins and Managers only. Contact your administrator to request elevated access.
          </p>
        </div>
      </AppLayout>
    );
  }

  const allTasks = projects.flatMap(p => p.tasks);

  const statusData = [
    { name: 'To Do', value: allTasks.filter(t => t.status === 'todo').length },
    { name: 'In Progress', value: allTasks.filter(t => t.status === 'in-progress').length },
    { name: 'In Review', value: allTasks.filter(t => t.status === 'review').length },
    { name: 'Completed', value: allTasks.filter(t => t.status === 'done').length },
  ];

  const memberData = members.map(m => {
    const tasks = allTasks.filter(t => t.assigneeId === m.id);
    return { name: m.name.split(' ').pop(), total: tasks.length, completed: tasks.filter(t => t.status === 'done').length };
  }).filter(d => d.total > 0);

  const priorityData = [
    { name: 'Low', value: allTasks.filter(t => t.priority === 'low').length },
    { name: 'Medium', value: allTasks.filter(t => t.priority === 'medium').length },
    { name: 'High', value: allTasks.filter(t => t.priority === 'high').length },
    { name: 'Critical', value: allTasks.filter(t => t.priority === 'critical').length },
  ];

  const projectProgress = projects.map(p => ({
    name: p.title.length > 20 ? p.title.slice(0, 20) + '…' : p.title,
    progress: p.tasks.length > 0 ? Math.round((p.tasks.filter(t => t.status === 'done').length / p.tasks.length) * 100) : 0,
    tasks: p.tasks.length,
  }));

  return (
    <AppLayout title="Analytics" subtitle="Performance metrics and insights">
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card-elevated p-6">
            <h3 className="font-display font-bold text-foreground mb-4">Task Status Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card-elevated p-6">
            <h3 className="font-display font-bold text-foreground mb-4">Team Workload</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={memberData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill={COLORS[0]} name="Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill={COLORS[2]} name="Completed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card-elevated p-6">
            <h3 className="font-display font-bold text-foreground mb-4">Priority Breakdown</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={priorityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={60} />
                <Tooltip />
                <Bar dataKey="value" fill={COLORS[1]} name="Tasks" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card-elevated p-6">
            <h3 className="font-display font-bold text-foreground mb-4">Project Completion</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={projectProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} unit="%" />
                <Tooltip />
                <Bar dataKey="progress" fill={COLORS[0]} name="Progress %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
