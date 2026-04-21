import { useAuth } from '@/hooks/useAuth';

export type AppRole = 'admin' | 'manager' | 'member' | 'viewer';

interface Permissions {
  canCreateProject: boolean;
  canEditProject: boolean;
  canDeleteProject: boolean;
  canCreateTask: boolean;
  canEditTask: boolean;
  canAssignTask: boolean;
  canChangeTaskStatus: boolean;
  canViewAnalytics: boolean;
  canViewTeam: boolean;
  canManageTeam: boolean;
  canAccessAdmin: boolean;
  canEditSettings: boolean;
  canComment: boolean;
  canUploadFiles: boolean;
  isReadOnly: boolean;
}

const rolePermissions: Record<AppRole, Permissions> = {
  admin: {
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: true,
    canCreateTask: true,
    canEditTask: true,
    canAssignTask: true,
    canChangeTaskStatus: true,
    canViewAnalytics: true,
    canViewTeam: true,
    canManageTeam: true,
    canAccessAdmin: true,
    canEditSettings: true,
    canComment: true,
    canUploadFiles: true,
    isReadOnly: false,
  },
  manager: {
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: false,
    canCreateTask: true,
    canEditTask: true,
    canAssignTask: true,
    canChangeTaskStatus: true,
    canViewAnalytics: true,
    canViewTeam: true,
    canManageTeam: false,
    canAccessAdmin: false,
    canEditSettings: true,
    canComment: true,
    canUploadFiles: true,
    isReadOnly: false,
  },
  member: {
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canCreateTask: false,
    canEditTask: false,
    canAssignTask: false,
    canChangeTaskStatus: true,
    canViewAnalytics: false,
    canViewTeam: true,
    canManageTeam: false,
    canAccessAdmin: false,
    canEditSettings: true,
    canComment: true,
    canUploadFiles: true,
    isReadOnly: false,
  },
  viewer: {
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canCreateTask: false,
    canEditTask: false,
    canAssignTask: false,
    canChangeTaskStatus: false,
    canViewAnalytics: false,
    canViewTeam: true,
    canManageTeam: false,
    canAccessAdmin: false,
    canEditSettings: false,
    canComment: false,
    canUploadFiles: false,
    isReadOnly: true,
  },
};

export function usePermissions(): Permissions & { role: AppRole | null } {
  const { role } = useAuth();
  const perms = role ? rolePermissions[role] : rolePermissions.viewer;
  return { ...perms, role };
}
