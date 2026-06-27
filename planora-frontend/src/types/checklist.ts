export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ChecklistTask {
  id: number;
  weddingPlanId: number;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  priority?: TaskPriority;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  status?: TaskStatus;
  priority?: TaskPriority;
}
