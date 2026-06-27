import type { 
  ChecklistTask, 
  CreateTaskRequest, 
  UpdateTaskRequest 
} from '@/types/checklist';

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('planora_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

export async function getChecklist(planId: number): Promise<ChecklistTask[]> {
  const response = await fetch(`/api/wedding-plans/${planId}/checklist`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải danh sách công việc');
  }

  return response.json();
}

export async function createTask(planId: number, request: CreateTaskRequest): Promise<ChecklistTask> {
  const response = await fetch(`/api/wedding-plans/${planId}/checklist`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let errorMessage = 'Tạo công việc mới thất bại';
    try {
      const errorData = await response.json();
      if (errorData && typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      }
    } catch {}
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function updateTask(taskId: number, request: UpdateTaskRequest): Promise<ChecklistTask> {
  const response = await fetch(`/api/checklist-tasks/${taskId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let errorMessage = 'Cập nhật công việc thất bại';
    try {
      const errorData = await response.json();
      if (errorData && typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      }
    } catch {}
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function deleteTask(taskId: number): Promise<void> {
  const response = await fetch(`/api/checklist-tasks/${taskId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Xóa công việc thất bại');
  }
}
