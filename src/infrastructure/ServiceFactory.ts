import { TaskService } from '../application/TaskService'
import { NotificationService } from '../application/NotificationService'
import { AuthService } from '../application/AuthService'
import { ActivityService } from '../application/ActivityService'
import { MockTaskRepository } from './MockTaskRepository'
import { MockNotificationRepository } from './MockNotificationRepository'
import { MockUserRepository } from './MockUserRepository'
import { MockActivityRepository } from './MockActivityRepository'

// Singleton instances
let taskService: TaskService | null = null
let notificationService: NotificationService | null = null
let authService: AuthService | null = null
let activityService: ActivityService | null = null

export function getTaskService(): TaskService {
  if (!taskService) {
    const taskRepository = new MockTaskRepository()
    const notificationRepository = new MockNotificationRepository()
    const notificationServiceInstance = new NotificationService(notificationRepository)
    taskService = new TaskService(taskRepository, notificationServiceInstance)
  }
  return taskService
}

export function getNotificationService(): NotificationService {
  if (!notificationService) {
    const notificationRepository = new MockNotificationRepository()
    notificationService = new NotificationService(notificationRepository)
  }
  return notificationService
}

export function getAuthService(): AuthService {
  if (!authService) {
    const userRepository = new MockUserRepository()
    authService = new AuthService(userRepository)
  }
  return authService
}

export function getActivityService(): ActivityService {
  if (!activityService) {
    const activityRepository = new MockActivityRepository()
    activityService = new ActivityService(activityRepository)
  }
  return activityService
}

