import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Users, Crown, Eye, UserCog, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AppRole = 'admin' | 'manager' | 'member' | 'viewer';

interface UserWithRole {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  role: AppRole;
  role_id: string;
}

const roleConfig: Record<AppRole, { label: string; icon: typeof Shield; color: string }> = {
  admin: { label: 'Admin', icon: Crown, color: 'bg-destructive/10 text-destructive border-destructive/20' },
  manager: { label: 'Manager', icon: Shield, color: 'bg-accent/20 text-accent-foreground border-accent/30' },
  member: { label: 'Member', icon: Users, color: 'bg-primary/10 text-primary border-primary/20' },
  viewer: { label: 'Viewer', icon: Eye, color: 'bg-muted text-muted-foreground border-border' },
};

export default function AdminPanel() {
  const { user, role, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (role === 'admin') fetchUsers();
  }, [role]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, avatar_url, created_at');
    const { data: roles } = await supabase.from('user_roles').select('id, user_id, role');

    if (profiles && roles) {
      const merged: UserWithRole[] = profiles.map(p => {
        const userRole = roles.find(r => r.user_id === p.user_id);
        return {
          user_id: p.user_id,
          full_name: p.full_name || 'Unnamed User',
          avatar_url: p.avatar_url,
          created_at: p.created_at,
          role: (userRole?.role as AppRole) || 'member',
          role_id: userRole?.id || '',
        };
      });
      setUsers(merged.sort((a, b) => {
        const order: AppRole[] = ['admin', 'manager', 'member', 'viewer'];
        return order.indexOf(a.role) - order.indexOf(b.role);
      }));
    }
    setLoading(false);
  };

  const handleRoleChange = async (targetUserId: string, roleId: string, newRole: AppRole) => {
    if (targetUserId === user?.id) {
      toast({ title: 'Error', description: "You cannot change your own role.", variant: 'destructive' });
      return;
    }
    setUpdating(targetUserId);
    const { error } = await supabase.from('user_roles').update({ role: newRole }).eq('id', roleId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Role Updated', description: `User role changed to ${newRole}.` });
      setUsers(prev => prev.map(u => u.user_id === targetUserId ? { ...u, role: newRole } : u));
    }
    setUpdating(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role !== 'admin') return <Navigate to="/" replace />;

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    members: users.filter(u => u.role === 'member').length,
    viewers: users.filter(u => u.role === 'viewer').length,
  };

  return (
    <AppLayout title="Admin Panel" subtitle="Manage users and roles">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, cls: 'bg-primary/10 text-primary' },
          { label: 'Admins', value: stats.admins, icon: Crown, cls: 'bg-destructive/10 text-destructive' },
          { label: 'Managers', value: stats.managers, icon: Shield, cls: 'bg-accent/20 text-accent-foreground' },
          { label: 'Members', value: stats.members, icon: UserCog, cls: 'bg-primary/10 text-primary' },
          { label: 'Viewers', value: stats.viewers, icon: Eye, cls: 'bg-muted text-muted-foreground' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.cls}`}>
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" /> User Management
          </CardTitle>
          <CardDescription>View all registered users and manage their roles.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Change Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(u => {
                    const cfg = roleConfig[u.role];
                    const initials = u.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    const isSelf = u.user_id === user?.id;
                    return (
                      <TableRow key={u.user_id} className={isSelf ? 'bg-primary/5' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-foreground">
                                {u.full_name} {isSelf && <span className="text-muted-foreground">(you)</span>}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${cfg.color} text-xs`}>
                            <cfg.icon className="w-3 h-3 mr-1" />
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-right">
                          {isSelf ? (
                            <span className="text-xs text-muted-foreground">Cannot change own role</span>
                          ) : (
                            <Select
                              value={u.role}
                              onValueChange={(val) => handleRoleChange(u.user_id, u.role_id, val as AppRole)}
                              disabled={updating === u.user_id}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
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
    </AppLayout>
  );
}
