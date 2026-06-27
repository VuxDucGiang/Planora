import type { 
  TimelineEvent, 
  CreateEventRequest, 
  UpdateEventRequest 
} from '@/types/timeline';

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

export async function getTimeline(planId: number): Promise<TimelineEvent[]> {
  const response = await fetch(`/api/wedding-plans/${planId}/timeline`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải dòng thời gian sự kiện');
  }

  return response.json();
}

export async function createEvent(planId: number, request: CreateEventRequest): Promise<TimelineEvent> {
  const response = await fetch(`/api/wedding-plans/${planId}/timeline`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let errorMessage = 'Thêm mốc sự kiện mới thất bại';
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

export async function updateEvent(eventId: number, request: UpdateEventRequest): Promise<TimelineEvent> {
  const response = await fetch(`/api/timeline-events/${eventId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let errorMessage = 'Cập nhật mốc sự kiện thất bại';
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

export async function deleteEvent(eventId: number): Promise<void> {
  const response = await fetch(`/api/timeline-events/${eventId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Xóa mốc sự kiện thất bại');
  }
}
