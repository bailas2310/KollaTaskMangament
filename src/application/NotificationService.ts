import type { Notification } from '../domain/Notification'
import type { Task } from '../domain/Task'
import type { NotificationRepository } from '../infrastructure/NotificationRepository'

export class NotificationService {
  constructor(private notificationRepository: NotificationRepository) {}

  async createTaskCompletedNotification(
    task: Task,
    userId: string,
    tenantId: string
  ): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      type: 'task_completed',
      message: `Task "${task.title}" has been completed`,
      taskId: task.id,
      userId,
      tenantId,
      createdAt: new Date(),
      read: false
    }

    return this.notificationRepository.save(notification)
  }

  async getNotifications(userId: string, tenantId: string): Promise<Notification[]> {
    return this.notificationRepository.findByUser(userId, tenantId)
  }

  async markAsRead(notificationId: string, userId: string, tenantId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(notificationId, tenantId)
    if (notification && notification.userId === userId) {
      notification.read = true
      await this.notificationRepository.save(notification)
    }
  }

  async markAllAsRead(userId: string, tenantId: string): Promise<void> {
    const notifications = await this.notificationRepository.findByUser(userId, tenantId)
    for (const notification of notifications) {
      if (!notification.read) {
        notification.read = true
        await this.notificationRepository.save(notification)
      }
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}


