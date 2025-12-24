import type { Notification } from '../../models/Notification'
import type { NotificationRepository } from '../NotificationRepository'
import { NotificationApiService } from '../services/NotificationApiService'

/**
 * Adapter to make NotificationApiService work like NotificationRepository
 */
export class NotificationApiAdapter implements NotificationRepository {
  constructor(private apiService: NotificationApiService) {}

  async findByUser(userId: string, tenantId: string): Promise<Notification[]> {
    return this.apiService.getNotifications(userId, tenantId)
  }

  async findById(id: string, tenantId: string): Promise<Notification | null> {
    // Note: Real API might need a different endpoint
    // For now, get all and find by id
    try {
      // This is a simplified version - adjust based on your backend
      const notifications = await this.findByUser('', tenantId)
      return notifications.find(n => n.id === id) || null
    } catch (error) {
      return null
    }
  }

  async save(notification: Notification): Promise<Notification> {
    // Note: Real API might handle creation differently
    // This is a placeholder - adjust based on your backend
    return notification
  }

  async delete(id: string, tenantId: string): Promise<void> {
    // Note: Add delete endpoint to NotificationApiService when backend is ready
    // For now, this is a placeholder
  }
}

