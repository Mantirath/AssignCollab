import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Save, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";

export default function Settings() {
  const { profile, role } = useAuth();
  const { canEditSettings, isReadOnly } = usePermissions();

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const [formProfile, setFormProfile] = useState({
    name: profile?.full_name || '',
    email: '',
    department: '',
    designation: '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    taskAssigned: true,
    commentMention: true,
    projectUpdate: false,
  });

  const handleSave = () => {
    if (!canEditSettings) return;
    toast.success('Settings saved successfully');
  };

  if (isReadOnly) {
    return (
      <AppLayout title="Settings" subtitle="Access Restricted">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Lock className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-display font-bold text-foreground mb-2">View-Only Access</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Viewers cannot modify settings. Contact an admin for role changes.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Settings" subtitle="Manage your account and preferences">
      <div className="max-w-3xl animate-fade-in">
        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="glass-card-elevated p-6 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl font-bold gradient-primary text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-display font-bold">{profile?.full_name || 'User'}</h3>
                  <Badge variant="outline" className="text-[10px] mt-1 capitalize">{role || 'member'}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Full Name</Label><Input value={formProfile.name} onChange={e => setFormProfile(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>Email</Label><Input value={formProfile.email} onChange={e => setFormProfile(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" /></div>
                <div><Label>Department</Label><Input value={formProfile.department} onChange={e => setFormProfile(p => ({ ...p, department: e.target.value }))} placeholder="e.g. Engineering" /></div>
                <div><Label>Designation</Label><Input value={formProfile.designation} onChange={e => setFormProfile(p => ({ ...p, designation: e.target.value }))} placeholder="e.g. Developer" /></div>
              </div>
              <Button onClick={handleSave} className="gradient-primary text-primary-foreground gap-2"><Save className="w-4 h-4" /> Save Changes</Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="glass-card-elevated p-6 space-y-6">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
                { key: 'taskAssigned', label: 'Task Assigned', desc: 'When a new task is assigned to you' },
                { key: 'commentMention', label: 'Comment Mentions', desc: 'When someone mentions you' },
                { key: 'projectUpdate', label: 'Project Updates', desc: 'General project activity' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={v => setNotifications(p => ({ ...p, [item.key]: v }))}
                  />
                </div>
              ))}
              <Button onClick={handleSave} className="gradient-primary text-primary-foreground gap-2"><Save className="w-4 h-4" /> Save</Button>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="glass-card-elevated p-6 space-y-6">
              <div><Label>Current Password</Label><Input type="password" placeholder="••••••••" /></div>
              <div><Label>New Password</Label><Input type="password" placeholder="••••••••" /></div>
              <div><Label>Confirm Password</Label><Input type="password" placeholder="••••••••" /></div>
              <Button onClick={handleSave} className="gradient-primary text-primary-foreground gap-2"><Save className="w-4 h-4" /> Update Password</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
