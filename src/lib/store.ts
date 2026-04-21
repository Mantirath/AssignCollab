import { useState, useCallback } from 'react';

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  createdAt: string;
  comments: Comment[];
  files: FileAttachment[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  dueDate: string;
  tasks: Task[];
  members: string[];
  category: string;
}

const initialProjects: Project[] = [
  {
    id: 'p1',
    title: 'National Digital Infrastructure Upgrade',
    description: 'Modernize the national digital infrastructure for improved public service delivery across all states.',
    status: 'active',
    createdAt: '2024-01-15',
    dueDate: '2024-06-30',
    category: 'Infrastructure',
    members: [],
    tasks: [
      {
        id: 't1', title: 'Requirements Analysis Document', description: 'Compile comprehensive requirements from all stakeholder ministries.',
        assigneeId: '', status: 'done', priority: 'high', dueDate: '2024-02-15', createdAt: '2024-01-16',
        comments: [
          { id: 'c1', userId: '', content: 'Excellent work on the stakeholder interviews. Please add the rural connectivity requirements.', createdAt: '2024-02-10T10:30:00' },
          { id: 'c2', userId: '', content: 'Updated with rural connectivity section. Ready for review.', createdAt: '2024-02-11T14:20:00' },
        ],
        files: [
          { id: 'f1', name: 'requirements_v2.pdf', size: 2450000, type: 'application/pdf', uploadedBy: '', uploadedAt: '2024-02-11', url: '#' },
        ],
      },
      {
        id: 't2', title: 'System Architecture Design', description: 'Design scalable microservices architecture.',
        assigneeId: '', status: 'in-progress', priority: 'critical', dueDate: '2024-03-20', createdAt: '2024-02-01',
        comments: [
          { id: 'c3', userId: '', content: 'Draft architecture ready. Using event-driven microservices pattern.', createdAt: '2024-03-05T09:00:00' },
        ],
        files: [
          { id: 'f2', name: 'architecture_diagram.png', size: 1200000, type: 'image/png', uploadedBy: '', uploadedAt: '2024-03-05', url: '#' },
        ],
      },
      {
        id: 't3', title: 'Security Audit Framework', description: 'Establish security protocols and audit framework.',
        assigneeId: '', status: 'review', priority: 'high', dueDate: '2024-04-10', createdAt: '2024-02-20',
        comments: [], files: [],
      },
      {
        id: 't4', title: 'Database Migration Plan', description: 'Plan and execute legacy database migration.',
        assigneeId: '', status: 'todo', priority: 'medium', dueDate: '2024-05-15', createdAt: '2024-03-01',
        comments: [], files: [],
      },
    ],
  },
  {
    id: 'p2',
    title: 'Smart City Analytics Platform',
    description: 'Build real-time analytics dashboard for smart city sensor data across 100 cities.',
    status: 'active',
    createdAt: '2024-02-01',
    dueDate: '2024-08-31',
    category: 'Analytics',
    members: [],
    tasks: [
      {
        id: 't5', title: 'Sensor Data Pipeline', description: 'Build real-time data ingestion pipeline.',
        assigneeId: '', status: 'in-progress', priority: 'critical', dueDate: '2024-04-30', createdAt: '2024-02-05',
        comments: [], files: [],
      },
      {
        id: 't6', title: 'Dashboard UI Design', description: 'Design responsive analytics dashboard.',
        assigneeId: '', status: 'done', priority: 'high', dueDate: '2024-03-15', createdAt: '2024-02-10',
        comments: [
          { id: 'c4', userId: '', content: 'Figma designs complete. Includes mobile-responsive views.', createdAt: '2024-03-12T16:00:00' },
        ],
        files: [],
      },
      {
        id: 't7', title: 'ML Anomaly Detection', description: 'Implement ML models for anomaly detection in sensor data.',
        assigneeId: '', status: 'todo', priority: 'medium', dueDate: '2024-06-30', createdAt: '2024-03-01',
        comments: [], files: [],
      },
    ],
  },
  {
    id: 'p3',
    title: 'E-Governance Portal Redesign',
    description: 'Complete redesign of the citizen services portal with accessibility compliance.',
    status: 'completed',
    createdAt: '2023-09-01',
    dueDate: '2024-01-31',
    category: 'Web Development',
    members: [],
    tasks: [
      {
        id: 't8', title: 'Accessibility Audit', description: 'WCAG 2.1 AA compliance audit.',
        assigneeId: '', status: 'done', priority: 'high', dueDate: '2023-10-15', createdAt: '2023-09-05',
        comments: [], files: [],
      },
      {
        id: 't9', title: 'UI Component Library', description: 'Build reusable accessible component library.',
        assigneeId: '', status: 'done', priority: 'high', dueDate: '2023-11-30', createdAt: '2023-09-15',
        comments: [], files: [],
      },
    ],
  },
];

const STORAGE_KEY = 'acp_projects';

function loadProjects(): Project[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialProjects;
  } catch {
    return initialProjects;
  }
}

function saveProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(loadProjects);

  const update = useCallback((updater: (prev: Project[]) => Project[]) => {
    setProjects(prev => {
      const next = updater(prev);
      saveProjects(next);
      return next;
    });
  }, []);

  const addProject = useCallback((project: Omit<Project, 'id' | 'createdAt' | 'tasks'>) => {
    update(prev => [...prev, { ...project, id: `p${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], tasks: [] }]);
  }, [update]);

  const addTask = useCallback((projectId: string, task: Omit<Task, 'id' | 'createdAt' | 'comments' | 'files'>) => {
    update(prev => prev.map(p => p.id === projectId ? {
      ...p, tasks: [...p.tasks, { ...task, id: `t${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], comments: [], files: [] }]
    } : p));
  }, [update]);

  const updateTask = useCallback((projectId: string, taskId: string, updates: Partial<Task>) => {
    update(prev => prev.map(p => p.id === projectId ? {
      ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    } : p));
  }, [update]);

  const addComment = useCallback((projectId: string, taskId: string, userId: string, content: string) => {
    update(prev => prev.map(p => p.id === projectId ? {
      ...p, tasks: p.tasks.map(t => t.id === taskId ? {
        ...t, comments: [...t.comments, { id: `c${Date.now()}`, userId, content, createdAt: new Date().toISOString() }]
      } : t)
    } : p));
  }, [update]);

  const addFile = useCallback((projectId: string, taskId: string, file: Omit<FileAttachment, 'id' | 'uploadedAt'>) => {
    update(prev => prev.map(p => p.id === projectId ? {
      ...p, tasks: p.tasks.map(t => t.id === taskId ? {
        ...t, files: [...t.files, { ...file, id: `f${Date.now()}`, uploadedAt: new Date().toISOString().split('T')[0] }]
      } : t)
    } : p));
  }, [update]);

  return { projects, addProject, addTask, updateTask, addComment, addFile };
}
