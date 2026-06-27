export interface TimelineEvent {
  id: number;
  weddingPlanId: number;
  title: string;
  description?: string;
  eventDate: string; // YYYY-MM-DDTHH:mm:ss
  createdAt: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  eventDate: string; // YYYY-MM-DDTHH:mm:ss
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  eventDate?: string; // YYYY-MM-DDTHH:mm:ss
}
