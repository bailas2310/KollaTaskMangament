import type { Notification } from '../models/Notification'
import type { Task, TaskPriority } from '../models/Task'
import type { NotificationRepository } from '../api/NotificationRepository'
import type { User } from '../models/User'

export class NotificationService {
  constructor(private notificationRepository: NotificationRepository) {}

  async createTaskAssignedNotification(
    task: Task,
    assignedToUserId: string,
    assignedByUser: User,
    tenantId: string
  ): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      type: 'task_assigned',
      message: `New task "${task.title}" has been assigned to you`,
      taskId: task.id,
      userId: assignedToUserId,
      tenantId,
      createdAt: new Date(),
      read: false,
      metadata: {
        taskTitle: task.title,
        taskDescription: task.description,
        priority: task.priority,
        dueDate: task.deadline,
        assignedBy: assignedByUser.id,
        assignedByName: assignedByUser.name
      }
    }

    return this.notificationRepository.save(notification)
  }

  async createPriorityChangedNotification(
    task: Task,
    oldPriority: TaskPriority,
    newPriority: TaskPriority,
    changedByUser: User,
    tenantId: string
  ): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      type: 'priority_changed',
      message: `Priority of task "${task.title}" changed from ${oldPriority} to ${newPriority}`,
      taskId: task.id,
      userId: task.assignedTo || '',
      tenantId,
      createdAt: new Date(),
      read: false,
      metadata: {
        taskTitle: task.title,
        oldPriority,
        newPriority,
        changedBy: changedByUser.id,
        changedByName: changedByUser.name
      }
    }

    return this.notificationRepository.save(notification)
  }

  async createTaskUpdatedNotification(
    task: Task,
    changes: string[],
    changedByUser: User,
    tenantId: string
  ): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      type: 'task_updated',
      message: `Task "${task.title}" has been updated: ${changes.join(', ')}`,
      taskId: task.id,
      userId: task.assignedTo || '',
      tenantId,
      createdAt: new Date(),
      read: false,
      metadata: {
        taskTitle: task.title,
        changes,
        changedBy: changedByUser.id,
        changedByName: changedByUser.name
      }
    }

    return this.notificationRepository.save(notification)
  }

  async createDeadlineAlertNotification(
    task: Task,
    tenantId: string
  ): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      type: 'deadline_alert',
      message: `Task "${task.title}" deadline has passed`,
      taskId: task.id,
      userId: task.assignedTo || '',
      tenantId,
      createdAt: new Date(),
      read: false,
      metadata: {
        taskTitle: task.title,
        originalDueDate: task.deadline,
        currentStatus: task.status
      }
    }

    return this.notificationRepository.save(notification)
  }

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
      read: false,
      metadata: {
        taskTitle: task.title
      }
    }

    return this.notificationRepository.save(notification)
  }

  async createTaskForwardedNotification(
    task: Task,
    forwardedToUserId: string,
    forwardedByUser: User,
    forwardingNote: string | undefined,
    tenantId: string,
    forwardedToUserName?: string
  ): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      type: 'task_assigned',
      message: `You have been assigned a forwarded task "${task.title}" from ${forwardedByUser.name}`,
      taskId: task.id,
      userId: forwardedToUserId,
      tenantId,
      createdAt: new Date(),
      read: false,
      metadata: {
        taskTitle: task.title,
        taskDescription: task.description,
        priority: task.priority,
        dueDate: task.deadline,
        assignedBy: forwardedByUser.id,
        assignedByName: forwardedByUser.name,
        forwardedFrom: forwardedByUser.id,
        forwardedFromName: forwardedByUser.name,
        forwardedTo: forwardedToUserId,
        forwardedToName: forwardedToUserName || '',
        forwardingNote: forwardingNote || undefined
      }
    }

    return this.notificationRepository.save(notification)
  }

  async createTaskForwardedAdminNotification(
    task: Task,
    forwardedFromUser: User,
    forwardedToUser: User,
    forwardingNote: string | undefined,
    tenantId: string,
    adminUserId: string
  ): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      type: 'task_updated',
      message: `Task "${task.title}" forwarded from ${forwardedFromUser.name} to ${forwardedToUser.name}`,
      taskId: task.id,
      userId: adminUserId,
      tenantId,
      createdAt: new Date(),
      read: false,
      metadata: {
        taskTitle: task.title,
        forwardedFrom: forwardedFromUser.id,
        forwardedFromName: forwardedFromUser.name,
        forwardedTo: forwardedToUser.id,
        forwardedToName: forwardedToUser.name,
        forwardingNote: forwardingNote || undefined
      }
    }

    return this.notificationRepository.save(notification)
  }

  async createTaskDeletedNotification(
    task: Task,
    assignedToUserId: string,
    deletedByUser: User,
    tenantId: string
  ): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      type: 'task_updated',
      message: `Task "${task.title}" has been deleted by ${deletedByUser.name}`,
      taskId: task.id,
      userId: assignedToUserId,
      tenantId,
      createdAt: new Date(),
      read: false,
      metadata: {
        taskTitle: task.title,
        changedBy: deletedByUser.id,
        changedByName: deletedByUser.name,
        changes: ['Task deleted']
      }
    }

    return this.notificationRepository.save(notification)
  }

  async createAdminNotification(
    message: string,
    task: Task | null,
    adminUserId: string,
    tenantId: string,
    metadata?: Record<string, any>
  ): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      type: 'task_updated',
      message,
      taskId: task?.id || '',
      userId: adminUserId,
      tenantId,
      createdAt: new Date(),
      read: false,
      metadata: {
        taskTitle: task?.title,
        ...metadata
      }
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


