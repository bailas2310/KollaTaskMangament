import type { Notification } from '../domain/Notification'
import type { NotificationRepository } from './NotificationRepository'

export class MockNotificationRepository implements NotificationRepository {
  private notifications: Notification[] = []

  async findByUser(userId: string, tenantId: string): Promise<Notification[]> {
    return this.notifications.filter(
      n => n.userId === userId && n.tenantId === tenantId
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async findById(id: string, tenantId: string): Promise<Notification | null> {
    const notification = this.notifications.find(
      n => n.id === id && n.tenantId === tenantId
    )
    return notification || null
  }

  async save(notification: Notification): Promise<Notification> {
    const index = this.notifications.findIndex(n => n.id === notification.id)
    if (index >= 0) {
      this.notifications[index] = notification
    } else {
      this.notifications.push(notification)
    }
    return notification
  }

  async delete(id: string, tenantId: string): Promise<void> {
    this.notifications = this.notifications.filter(n => !(n.id === id && n.tenantId === tenantId))
  }
}


