import type { Task } from '../models/Task'
import type { TaskRepository } from '../api/TaskRepository'
import type { NotificationService } from './NotificationService'

/**
 * Deadline Alert Service
 * Checks for tasks with expired deadlines and sends notifications
 */
export class DeadlineAlertService {
  private checkInterval: number | null = null
  private readonly CHECK_INTERVAL_MS = 60000 // Check every minute

  constructor(
    private taskRepository: TaskRepository,
    private notificationService: NotificationService
  ) {}

  startChecking(tenantId: string) {
    // Check immediately
    this.checkDeadlines(tenantId)

    // Then check periodically
    this.checkInterval = window.setInterval(() => {
      this.checkDeadlines(tenantId)
    }, this.CHECK_INTERVAL_MS)
  }

  stopChecking() {
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  private async checkDeadlines(tenantId: string) {
    try {
      const tasks = await this.taskRepository.findAll(tenantId)
      const now = new Date()

      for (const task of tasks) {
        // Only check tasks that are not completed and have passed deadlines
        if (
          task.status !== 'completed' &&
          task.deadline < now &&
          task.assignedTo
        ) {
          // Check if we already sent a notification for this task today
          // (to avoid spamming)
          const lastNotificationKey = `deadline_alert_${task.id}_${now.toDateString()}`
          const lastNotification = localStorage.getItem(lastNotificationKey)

          if (!lastNotification) {
            await this.notificationService.createDeadlineAlertNotification(
              task,
              tenantId
            )
            // Mark that we sent a notification for this task today
            localStorage.setItem(lastNotificationKey, 'true')
          }
        }
      }
    } catch (error) {
      console.error('Error checking deadlines:', error)
    }
  }
}

