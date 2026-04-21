import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useIncidents, type Incident } from '@/hooks/useIncidents';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Shield, Plus, Clock, CheckCircle2, Search, Activity, Loader2, Zap, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const severityConfig = {
  critical: { label: 'Critical', color: 'bg-destructive text-destructive-foreground', dot: 'bg-destructive' },
  high: { label: 'High', color: 'bg-destructive/20 text-destructive border-destructive/30', dot: 'bg-destructive/70' },
  medium: { label: 'Medium', color: 'bg-accent/20 text-accent-foreground border-accent/30', dot: 'bg-accent' },
  low: { label: 'Low', color: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' },
};

const statusConfig = {
  active: { label: 'Active', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: Zap },
  investigating: { label: 'Investigating', color: 'bg-accent/20 text-accent-foreground border-accent/30', icon: Search },
  mitigating: { label: 'Mitigating', color: 'bg-primary/10 text-primary border-primary/20', icon: Shield },
  resolved: { label: 'Resolved', color: 'bg-muted text-muted-foreground border-border', icon: CheckCircle2 },
};

export default function CrisisDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const { incidents, loading, createIncident, updateIncident, resolveIncident } = useIncidents();
  const { members, getUserById } = useTeamMembers();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [form, setForm] = useState({ title: '', description: '', severity: 'medium' as Incident['severity'], affected_area: '', assigned_to: '' });

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (role !== 'admin') return <Navigate to="/" replace />;

  const filtered = filter === 'all' ? incidents : incidents.filter(i => i.status === filter);
  const activeCount = incidents.filter(i => i.status === 'active').length;
  const investigatingCount = incidents.filter(i => i.status === 'investigating').length;
  const mitigatingCount = incidents.filter(i => i.status === 'mitigating').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;

  const handleCreate = async () => {
    if (!form.title.trim()) { toast({ title: 'Error', description: 'Title is required', variant: 'destructive' }); return; }
    try {
      await createIncident({ ...form, reported_by: user!.id, assigned_to: form.assigned_to || null, status: 'active' });
      toast({ title: 'Incident Created', description: 'New incident has been logged.' });
      setForm({ title: '', description: '', severity: 'medium', affected_area: '', assigned_to: '' });
      setDialogOpen(false);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleStatusChange = async (id: string, status: Incident['status']) => {
    try {
      if (status === 'resolved') await resolveIncident(id);
      else await updateIncident(id, { status } as Partial<Incident>);
      toast({ title: 'Status Updated' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <AppLayout title="Crisis Dashboard" subtitle="Real-time incident monitoring & response">
      <div className="space-y-6 animate-fade-in">
        {/* Live Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active', value: activeCount, icon: Zap, cls: 'bg-destructive/10 text-destructive', pulse: activeCount > 0 },
            { label: 'Investigating', value: investigatingCount, icon: Search, cls: 'bg-accent/20 text-accent-foreground' },
            { label: 'Mitigating', value: mitigatingCount, icon: Shield, cls: 'bg-primary/10 text-primary' },
            { label: 'Resolved', value: resolvedCount, icon: CheckCircle2, cls: 'bg-muted text-muted-foreground' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.cls} ${s.pulse ? 'animate-pulse' : ''}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active Crisis Banner */}
        {activeCount > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3 animate-pulse">
            <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-destructive">{activeCount} Active Crisis{activeCount > 1 ? 'es' : ''}</p>
              <p className="text-xs text-muted-foreground">Immediate action required. Assign team members and begin resolution.</p>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-lg text-foreground">Incident Log</h3>
            <Badge variant="outline" className="text-xs">{filtered.length} incidents</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="mitigating">Mitigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 text-xs"><Plus className="w-3.5 h-3.5" /> Report Incident</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Report New Incident</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Incident title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  <Textarea placeholder="Description of the issue..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={form.severity} onValueChange={(v) => setForm(f => ({ ...f, severity: v as Incident['severity'] }))}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Severity" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={form.assigned_to} onValueChange={(v) => setForm(f => ({ ...f, assigned_to: v }))}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Assign to..." /></SelectTrigger>
                      <SelectContent>
                        {members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input placeholder="Affected area (e.g. Payment System)" value={form.affected_area} onChange={e => setForm(f => ({ ...f, affected_area: e.target.value }))} />
                  <Button onClick={handleCreate} className="w-full">Create Incident</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Incidents Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                {filter === 'all' ? 'No incidents reported. All systems operational. ✅' : `No ${filter} incidents.`}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Incident</TableHead>
                      <TableHead>Affected Area</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reported</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(inc => {
                      const sev = severityConfig[inc.severity];
                      const stat = statusConfig[inc.status];
                      const assignee = inc.assigned_to ? getUserById(inc.assigned_to) : null;
                      const reporter = getUserById(inc.reported_by);
                      return (
                        <TableRow key={inc.id} className={inc.status === 'active' ? 'bg-destructive/5' : ''}>
                          <TableCell>
                            <Badge variant="outline" className={`${sev.color} text-[10px]`}>{sev.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium text-foreground">{inc.title}</p>
                              {inc.description && <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{inc.description}</p>}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{inc.affected_area || '—'}</TableCell>
                          <TableCell className="text-xs">{assignee?.name || <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${stat.color} text-[10px] gap-1`}>
                              <stat.icon className="w-3 h-3" />{stat.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-muted-foreground">
                              <p>{new Date(inc.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                              <p className="text-[10px]">by {reporter?.name || 'Unknown'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {inc.status !== 'resolved' ? (
                              <Select value={inc.status} onValueChange={(v) => handleStatusChange(inc.id, v as Incident['status'])}>
                                <SelectTrigger className="w-28 h-7 text-[10px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="investigating">Investigating</SelectItem>
                                  <SelectItem value="mitigating">Mitigating</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">
                                {inc.resolved_at ? new Date(inc.resolved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Resolved'}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
