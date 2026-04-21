import { useState, useMemo } from "react";
import { useProjects, type Project } from "@/lib/store";
import { useTeamMembers } from "@/hooks/useTeamMembers";

export interface Notification {
  id: string;
  type: 'task_assigned' | 'comment' | 'status_change' | 'deadline' | 'file_upload';
  title: string;
  message: string;
  projectId?: string;
  taskId?: string;
  read: boolean;
  createdAt: string;
  icon: string;
}

function generateNotifications(projects: Project[], getUserById: (id: string) => { name: string } | undefined): Notification[] {
  const notifications: Notification[] = [];
  const allTasks = projects.flatMap(p => p.tasks.map(t => ({ ...t, projectId: p.id, projectTitle: p.title })));

  allTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'done').forEach(t => {
    notifications.push({
      id: `overdue-${t.id}`, type: 'deadline', title: 'Task Overdue',
      message: `"${t.title}" in ${t.projectTitle} is past its due date.`,
      projectId: t.projectId, taskId: t.id, read: false, createdAt: t.dueDate, icon: '⏰',
    });
  });

  allTasks.forEach(t => {
    t.comments.slice(-2).forEach(c => {
      const user = getUserById(c.userId);
      notifications.push({
        id: `comment-${c.id}`, type: 'comment', title: 'New Comment',
        message: `${user?.name || 'Someone'} commented on "${t.title}"`,
        projectId: t.projectId, taskId: t.id, read: false, createdAt: c.createdAt, icon: '💬',
      });
    });
  });

  allTasks.filter(t => t.status === 'review').forEach(t => {
    const assignee = getUserById(t.assigneeId);
    notifications.push({
      id: `review-${t.id}`, type: 'status_change', title: 'Ready for Review',
      message: `"${t.title}" by ${assignee?.name || 'someone'} needs your review.`,
      projectId: t.projectId, taskId: t.id, read: false, createdAt: t.createdAt, icon: '👀',
    });
  });

  allTasks.forEach(t => {
    t.files.forEach(f => {
      const uploader = getUserById(f.uploadedBy);
      notifications.push({
        id: `file-${f.id}`, type: 'file_upload', title: 'File Uploaded',
        message: `${uploader?.name || 'Someone'} uploaded "${f.name}" to "${t.title}"`,
        projectId: t.projectId, taskId: t.id, read: false, createdAt: f.uploadedAt, icon: '📎',
      });
    });
  });

  return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

const READ_KEY = 'acp_read_notifications';

export function useNotifications() {
  const { projects } = useProjects();
  const { getUserById } = useTeamMembers();
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(READ_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const notifications = useMemo(() => {
    return generateNotifications(projects, getUserById).map(n => ({ ...n, read: readIds.has(n.id) }));
  }, [projects, readIds, getUserById]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem(READ_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const markAllRead = () => {
    setReadIds(prev => {
      const next = new Set([...prev, ...notifications.map(n => n.id)]);
      localStorage.setItem(READ_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  return { notifications, unreadCount, markAsRead, markAllRead };
}

export interface SearchResult {
  type: 'project' | 'task' | 'member';
  id: string;
  title: string;
  subtitle: string;
  projectId?: string;
  url: string;
}

export function useSearch(query: string): SearchResult[] {
  const { projects } = useProjects();
  const { members } = useTeamMembers();

  return useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    projects.forEach(p => {
      if (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
        results.push({ type: 'project', id: p.id, title: p.title, subtitle: `${p.status} • ${p.tasks.length} tasks`, url: `/projects/${p.id}` });
      }
      p.tasks.forEach(t => {
        if (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) {
          results.push({ type: 'task', id: t.id, title: t.title, subtitle: `${p.title} • ${t.status}`, projectId: p.id, url: `/projects/${p.id}` });
        }
      });
    });

    members.forEach(m => {
      if (m.name.toLowerCase().includes(q)) {
        results.push({ type: 'member', id: m.id, title: m.name, subtitle: `${m.role}`, url: '/team' });
      }
    });

    return results.slice(0, 10);
  }, [query, projects, members]);
}
