import { NotificationService } from '../services/NotificationService'
import { getNotificationService } from '../api/ServiceFactory'
import type { Notification } from '../models/Notification'
import type { Task } from '../models/Task'

export class NotificationController {
  private notificationService: NotificationService

  constructor() {
    this.notificationService = getNotificationService()
  }

  async createTaskCompletedNotification(
    task: Task,
    userId: string,
    tenantId: string
  ): Promise<Notification> {
    return this.notificationService.createTaskCompletedNotification(task, userId, tenantId)
  }

  async getNotifications(userId: string, tenantId: string): Promise<Notification[]> {
    return this.notificationService.getNotifications(userId, tenantId)
  }

  async markAsRead(notificationId: string, userId: string, tenantId: string): Promise<void> {
    return this.notificationService.markAsRead(notificationId, userId, tenantId)
  }

  async markAllAsRead(userId: string, tenantId: string): Promise<void> {
    return this.notificationService.markAllAsRead(userId, tenantId)
  }
}


