import { AppLayout } from "@/components/AppLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/lib/store";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { Mail, Shield, UserCheck, FolderKanban, Lock, Loader2 } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

const roleColors: Record<string, string> = {
  admin: 'bg-accent/10 text-accent',
  manager: 'bg-primary/10 text-primary',
  member: 'bg-info/10 text-info',
  viewer: 'bg-muted text-muted-foreground',
};

export default function Team() {
  const { projects } = useProjects();
  const { members, loading } = useTeamMembers();
  const { canManageTeam, isReadOnly } = usePermissions();

  return (
    <AppLayout title="Team" subtitle={`${members.length} members${isReadOnly ? ' (View Only)' : ''}`}>
      {isReadOnly && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground mb-4">
          <Lock className="w-4 h-4" />
          You have view-only access to the team directory.
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
          {members.map(member => {
            const memberTasks = projects.flatMap(p => p.tasks).filter(t => t.assigneeId === member.id);
            const completedTasks = memberTasks.filter(t => t.status === 'done').length;

            return (
              <div key={member.id} className="glass-card-elevated p-6 hover:scale-[1.01] transition-all animate-slide-up">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="text-lg font-bold gradient-primary text-primary-foreground">{member.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-foreground">{member.name}</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Joined {new Date(member.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <Badge className={`mt-2 text-[10px] border-none ${roleColors[member.role] || ''}`}>
                      <Shield className="w-3 h-3 mr-1" /> {member.role}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
                  <div className="text-center">
                    <p className="text-xl font-display font-bold text-foreground">{memberTasks.length}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><UserCheck className="w-3 h-3" /> Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-display font-bold text-accent">{completedTasks}</p>
                    <p className="text-[10px] text-muted-foreground">Done</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
