// Enums
export enum AppView {
  DASHBOARD = 'dashboard',
  TASKS = 'tasks',
  CHAT = 'chat',
  PLANNER = 'planner'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Interfaces
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  subtasks?: SubTask[];
  createdAt: number;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
  sources?: { title: string; uri: string }[];
}

export interface ScheduleItem {
  time: string;
  activity: string;
  description?: string;
}

export interface PlannerResult {
  schedule: ScheduleItem[];
  tips: string[];
}