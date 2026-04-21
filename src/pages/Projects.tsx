import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/lib/store";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { Plus, Search, FolderKanban, Calendar, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success',
  completed: 'bg-info/10 text-info',
  archived: 'bg-muted text-muted-foreground',
};

export default function Projects() {
  const { projects, addProject } = useProjects();
  const { members, getUserById } = useTeamMembers();
  const navigate = useNavigate();
  const { canCreateProject, isReadOnly } = usePermissions();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', dueDate: '', category: '', status: 'active' as const, members: [] as string[] });

  const filtered = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleCreate = () => {
    if (!newProject.title) return;
    addProject({ ...newProject, members: newProject.members });
    setNewProject({ title: '', description: '', dueDate: '', category: '', status: 'active', members: [] });
    setDialogOpen(false);
  };

  return (
    <AppLayout title="Projects" subtitle={`${projects.length} total projects${isReadOnly ? ' (View Only)' : ''}`}>
      <div className="space-y-6 animate-fade-in">
        {isReadOnly && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            You have read-only access. Contact a manager or admin to contribute.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-1 w-full sm:w-auto">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 bg-card"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {canCreateProject && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground gap-2 glow-accent">
                  <Plus className="w-4 h-4" /> New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader><DialogTitle className="font-display">Create New Project</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div><Label>Project Title</Label><Input value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))} placeholder="Enter project title" /></div>
                  <div><Label>Description</Label><Textarea value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} placeholder="Project description" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Category</Label><Input value={newProject.category} onChange={e => setNewProject(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Infrastructure" /></div>
                    <div><Label>Due Date</Label><Input type="date" value={newProject.dueDate} onChange={e => setNewProject(p => ({ ...p, dueDate: e.target.value }))} /></div>
                  </div>
                  <Button onClick={handleCreate} className="w-full gradient-primary text-primary-foreground">Create Project</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(project => {
            const done = project.tasks.filter(t => t.status === 'done').length;
            const total = project.tasks.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="glass-card-elevated p-5 cursor-pointer hover:scale-[1.02] transition-all duration-300 animate-slide-up"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg gradient-primary">
                      <FolderKanban className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <Badge className={`text-[10px] border-none ${statusColors[project.status]}`}>{project.status}</Badge>
                  </div>
                  {project.category && <Badge variant="outline" className="text-[10px]">{project.category}</Badge>}
                </div>
                <h3 className="font-display font-bold text-foreground mb-1 line-clamp-2">{project.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{project.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-bold text-accent">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 4).map(mId => {
                      const u = getUserById(mId);
                      return u ? (
                        <Avatar key={mId} className="h-7 w-7 border-2 border-card">
                          <AvatarFallback className="text-[10px] bg-primary text-primary-foreground font-semibold">{u.avatar}</AvatarFallback>
                        </Avatar>
                      ) : null;
                    })}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {project.dueDate ? new Date(project.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
