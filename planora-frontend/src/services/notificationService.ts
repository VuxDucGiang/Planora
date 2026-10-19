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

export interface NotificationPreference {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  browserPushEnabled: boolean;
  taskDueReminderEnabled: boolean;
  paymentDueReminderEnabled: boolean;
  weddingMilestoneReminderEnabled: boolean;
  remindDaysBefore: number;
}

export interface NotificationItem {
  id: number;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export async function getNotificationPreferences(): Promise<NotificationPreference> {
  try {
    const response = await fetch('/api/notifications/preferences', {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return {
        emailEnabled: true,
        inAppEnabled: true,
        browserPushEnabled: false,
        taskDueReminderEnabled: true,
        paymentDueReminderEnabled: true,
        weddingMilestoneReminderEnabled: true,
        remindDaysBefore: 3,
      };
    }

    return await response.json();
  } catch {
    return {
      emailEnabled: true,
      inAppEnabled: true,
      browserPushEnabled: false,
      taskDueReminderEnabled: true,
      paymentDueReminderEnabled: true,
      weddingMilestoneReminderEnabled: true,
      remindDaysBefore: 3,
    };
  }
}

export async function updateNotificationPreferences(
  data: Partial<NotificationPreference>
): Promise<NotificationPreference> {
  const response = await fetch('/api/notifications/preferences', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = 'Không thể lưu cài đặt thông báo';
    try {
      const errorData = await response.json();
      if (errorData?.message) errorMessage = errorData.message;
    } catch {}
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getMyNotifications(): Promise<NotificationItem[]> {
  try {
    const response = await fetch('/api/notifications', {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch {
    return [];
  }
}
