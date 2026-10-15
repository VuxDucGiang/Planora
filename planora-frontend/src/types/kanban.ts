export type KanbanStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface KanbanCategory {
  id: string;
  name: string;
  icon: string;
  colorBg: string;
  colorText: string;
  colorBorder: string;
}

export interface KanbanSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface KanbanTask {
  id: number;
  weddingPlanId: number;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  status: KanbanStatus;
  priority: TaskPriority;
  category: string; // Category ID
  assignee: string; // e.g., 'Cô dâu', 'Chú rể', 'Planner', 'Nguyễn Văn A'
  subtasks: KanbanSubtask[];
  notes?: string;
  dependencyTaskId?: number | null;
  createdAt: string;
  updatedAt?: string;
}

export interface TaskTemplate {
  title: string;
  category: string;
  priority: TaskPriority;
  description?: string;
  subtasks?: string[];
  daysBeforeWedding: number;
  dependencyKey?: string;
  suggestedNext?: string[];
}
