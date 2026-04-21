import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { TaskCard } from "@/components/TaskCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjects, Task } from "@/lib/store";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useAuth } from "@/hooks/useAuth";
import { Plus, ArrowLeft, Send, Paperclip, Upload, FileText, Calendar, MessageSquare } from "lucide-react";

const columns = [
  { key: 'todo', label: 'To Do', color: 'bg-muted' },
  { key: 'in-progress', label: 'In Progress', color: 'bg-info/10' },
  { key: 'review', label: 'In Review', color: 'bg-warning/10' },
  { key: 'done', label: 'Completed', color: 'bg-success/10' },
] as const;

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, addTask, updateTask, addComment, addFile } = useProjects();
  const { members, getUserById } = useTeamMembers();
  const { user } = useAuth();
  const project = projects.find(p => p.id === id);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '', assigneeId: '', priority: 'medium' as const, dueDate: '', status: 'todo' as const });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!project) {
    return (
      <AppLayout title="Project Not Found">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground mb-4">This project doesn't exist.</p>
          <Button onClick={() => navigate('/projects')} variant="outline">← Back to Projects</Button>
        </div>
      </AppLayout>
    );
  }

  const done = project.tasks.filter(t => t.status === 'done').length;
  const total = project.tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleCreateTask = () => {
    if (!newTask.title) return;
    addTask(project.id, { ...newTask, assigneeId: newTask.assigneeId || user?.id || '' });
    setNewTask({ title: '', description: '', assigneeId: '', priority: 'medium', dueDate: '', status: 'todo' });
    setDialogOpen(false);
  };

  const handleComment = () => {
    if (!commentText.trim() || !selectedTask) return;
    addComment(project.id, selectedTask.id, user?.id || '', commentText);
    setCommentText('');
    const updated = projects.find(p => p.id === id)?.tasks.find(t => t.id === selectedTask.id);
    if (updated) setSelectedTask(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTask) return;
    addFile(project.id, selectedTask.id, { name: file.name, size: file.size, type: file.type, uploadedBy: user?.id || '', url: '#' });
    const updated = projects.find(p => p.id === id)?.tasks.find(t => t.id === selectedTask.id);
    if (updated) setSelectedTask(updated);
  };

  const openTaskSheet = (task: Task) => {
    setSelectedTask(task);
    setSheetOpen(true);
  };

  return (
    <AppLayout title={project.title} subtitle={project.description}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}><ArrowLeft className="w-4 h-4" /></Button>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-accent/10 text-accent border-none font-semibold">{project.category}</Badge>
                <Badge className="bg-success/10 text-success border-none">{project.status}</Badge>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" /> Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No date'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{pct}%</span>
                  <Progress value={pct} className="w-24 h-2" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 mr-2">
              {project.members.map(mId => {
                const u = getUserById(mId);
                return u ? (
                  <Avatar key={mId} className="h-8 w-8 border-2 border-card"><AvatarFallback className="text-xs bg-primary text-primary-foreground">{u.avatar}</AvatarFallback></Avatar>
                ) : null;
              })}
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Add Task</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-display">Create New Task</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div><Label>Title</Label><Input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="Task title" /></div>
                  <div><Label>Description</Label><Textarea value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} placeholder="Task description" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Assignee</Label>
                      <Select value={newTask.assigneeId} onValueChange={v => setNewTask(p => ({ ...p, assigneeId: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select assignee" /></SelectTrigger>
                        <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Select value={newTask.priority} onValueChange={v => setNewTask(p => ({ ...p, priority: v as any }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label>Due Date</Label><Input type="date" value={newTask.dueDate} onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))} /></div>
                  <Button onClick={handleCreateTask} className="w-full gradient-primary text-primary-foreground">Create Task</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map(col => {
            const tasks = project.tasks.filter(t => t.status === col.key);
            return (
              <div key={col.key} className="space-y-3">
                <div className={`p-3 rounded-lg ${col.color} flex items-center justify-between`}>
                  <h4 className="text-sm font-semibold text-foreground">{col.label}</h4>
                  <Badge variant="outline" className="text-xs">{tasks.length}</Badge>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {tasks.map(task => (
                    <TaskCard key={task.id} task={task} onClick={() => openTaskSheet(task)} />
                  ))}
                  {tasks.length === 0 && (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center text-xs text-muted-foreground">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Task Detail Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            {selectedTask && (
              <>
                <SheetHeader>
                  <SheetTitle className="font-display text-lg">{selectedTask.title}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Select
                      value={selectedTask.status}
                      onValueChange={v => {
                        updateTask(project.id, selectedTask.id, { status: v as any });
                        setSelectedTask({ ...selectedTask, status: v as any });
                      }}
                    >
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="review">In Review</SelectItem>
                        <SelectItem value="done">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-sm text-muted-foreground">{selectedTask.description}</div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Assignee</p>
                      <p className="font-medium">{getUserById(selectedTask.assigneeId)?.name || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Due Date</p>
                      <p className="font-medium">{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString('en-IN') : 'No date'}</p>
                    </div>
                  </div>

                  <Tabs defaultValue="comments">
                    <TabsList className="w-full">
                      <TabsTrigger value="comments" className="flex-1 gap-1"><MessageSquare className="w-3 h-3" /> Comments ({selectedTask.comments.length})</TabsTrigger>
                      <TabsTrigger value="files" className="flex-1 gap-1"><Paperclip className="w-3 h-3" /> Files ({selectedTask.files.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="comments" className="space-y-4 mt-4">
                      {selectedTask.comments.map(c => {
                        const commenter = getUserById(c.userId);
                        return (
                          <div key={c.id} className="flex gap-3 animate-fade-in">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">{commenter?.avatar || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 glass-card p-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold">{commenter?.name || 'Unknown'}</span>
                                <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{c.content}</p>
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex gap-2">
                        <Input
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          placeholder="Add a comment..."
                          onKeyDown={e => e.key === 'Enter' && handleComment()}
                        />
                        <Button size="icon" onClick={handleComment} className="gradient-primary text-primary-foreground"><Send className="w-4 h-4" /></Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="files" className="space-y-3 mt-4">
                      {selectedTask.files.map(f => (
                        <div key={f.id} className="glass-card p-3 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-accent/10"><FileText className="w-4 h-4 text-accent" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{f.name}</p>
                            <p className="text-[10px] text-muted-foreground">{(f.size / 1024 / 1024).toFixed(1)} MB • {getUserById(f.uploadedBy)?.name || 'Unknown'}</p>
                          </div>
                        </div>
                      ))}
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                      <Button variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4" /> Upload File
                      </Button>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}
