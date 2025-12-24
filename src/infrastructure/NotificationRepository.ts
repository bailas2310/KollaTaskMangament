import type { Notification } from '../domain/Notification'

export interface NotificationRepository {
  findByUser(userId: string, tenantId: string): Promise<Notification[]>
  findById(id: string, tenantId: string): Promise<Notification | null>
  save(notification: Notification): Promise<Notification>
  delete(id: string, tenantId: string): Promise<void>
}


