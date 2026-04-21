import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { ManagerDashboard } from "@/components/dashboard/ManagerDashboard";
import { MemberDashboard } from "@/components/dashboard/MemberDashboard";
import { ViewerDashboard } from "@/components/dashboard/ViewerDashboard";

export default function Dashboard() {
  const { role } = useAuth();

  const subtitles: Record<string, string> = {
    admin: 'Full Platform Administration',
    manager: 'Team & Project Management',
    member: 'Your Tasks & Assignments',
    viewer: 'Platform Overview (Read Only)',
  };

  return (
    <AppLayout title="Dashboard" subtitle={subtitles[role || 'member']}>
      {role === 'admin' && <AdminDashboard />}
      {role === 'manager' && <ManagerDashboard />}
      {role === 'member' && <MemberDashboard />}
      {role === 'viewer' && <ViewerDashboard />}
      {!role && <MemberDashboard />}
    </AppLayout>
  );
}
