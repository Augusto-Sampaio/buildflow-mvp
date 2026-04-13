export type ProjectStatus = "not_started" | "in_progress" | "completed" | "delayed";

export type TaskStatus = "not_started" | "in_progress" | "completed" | "delayed";

export interface Task {
  id: string;
  projectId: string;
  name: string;
  responsible: string;
  plannedProgress: number;
  actualProgress: number;
  status: TaskStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  location: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  createdAt: string;
  tasks: Task[];
}
