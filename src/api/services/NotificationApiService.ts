import { apiClient } from '../client'
import { API_CONFIG } from '../config'
import type { Notification } from '../../models/Notification'

/**
 * Notification API Service
 * Handles notification API calls
 */
export class NotificationApiService {
  async getNotifications(userId: string, tenantId: string): Promise<Notification[]> {
    return apiClient.get<Notification[]>(API_CONFIG.endpoints.notifications.list, {
      params: { userId, tenantId }
    })
  }

  async markAsRead(notificationId: string, userId: string, tenantId: string): Promise<void> {
    return apiClient.patch(
      API_CONFIG.endpoints.notifications.markAsRead(notificationId),
      { userId, tenantId }
    )
  }

  async markAllAsRead(userId: string, tenantId: string): Promise<void> {
    return apiClient.post(API_CONFIG.endpoints.notifications.markAllAsRead, {
      userId,
      tenantId
    })
  }
}

