
export type ProjectStatus = "planning" | "in_progress" | "on_hold" | "completed" | "cancelled";
export type TaskStatus = "to_do" | "in_progress" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high";
export type UserRole = "admin" | "manager" | "member";

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  client_id?: string;
  team_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  project_id: string;
  assignee_id?: string;
  parent_task_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  projects?: {
    name: string;
  };
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectFinance {
  id: string;
  project_id: string;
  budget: number;
  received: number;
  spent: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  project_id: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  date: string;
  created_at: string;
  updated_at: string;
  projects?: {
    name: string;
  };
}

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  project_id?: string;
  task_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  project_id?: string;
  task_id?: string;
  uploaded_by: string;
  created_at: string;
}
