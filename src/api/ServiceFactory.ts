import { TaskService } from '../services/TaskService'
import { NotificationService } from '../services/NotificationService'
import { AuthService } from '../services/AuthService'
import { ActivityService } from '../services/ActivityService'
import { API_CONFIG } from './config'

// Mock repositories (used when useMock is true)
import { MockTaskRepository } from './MockTaskRepository'
import { MockNotificationRepository } from './MockNotificationRepository'
import { MockUserRepository } from './MockUserRepository'
import { MockActivityRepository } from './MockActivityRepository'

// Real API services (used when useMock is false)
import { TaskApiService } from './services/TaskApiService'
import { AuthApiService } from './services/AuthApiService'
import { NotificationApiService } from './services/NotificationApiService'
import { ActivityApiService } from './services/ActivityApiService'

// Adapter to make API services work like repositories
import { TaskApiAdapter } from './adapters/TaskApiAdapter'
import { UserApiAdapter } from './adapters/UserApiAdapter'
import { NotificationApiAdapter } from './adapters/NotificationApiAdapter'
import { ActivityApiAdapter } from './adapters/ActivityApiAdapter'

// Singleton instances
let taskService: TaskService | null = null
let notificationService: NotificationService | null = null
let authService: AuthService | null = null
let activityService: ActivityService | null = null

export function getTaskService(): TaskService {
  if (!taskService) {
    if (API_CONFIG.useMock) {
      // Use mock repositories
      const taskRepository = new MockTaskRepository()
      const notificationRepository = new MockNotificationRepository()
      const notificationServiceInstance = new NotificationService(notificationRepository)
      taskService = new TaskService(taskRepository, notificationServiceInstance)
    } else {
      // Use real API
      const taskApiService = new TaskApiService()
      const taskRepository = new TaskApiAdapter(taskApiService)
      const notificationApiService = new NotificationApiService()
      const notificationRepository = new NotificationApiAdapter(notificationApiService)
      const notificationServiceInstance = new NotificationService(notificationRepository)
      taskService = new TaskService(taskRepository, notificationServiceInstance)
    }
  }
  return taskService
}

export function getNotificationService(): NotificationService {
  if (!notificationService) {
    if (API_CONFIG.useMock) {
      const notificationRepository = new MockNotificationRepository()
      notificationService = new NotificationService(notificationRepository)
    } else {
      const notificationApiService = new NotificationApiService()
      const notificationRepository = new NotificationApiAdapter(notificationApiService)
      notificationService = new NotificationService(notificationRepository)
    }
  }
  return notificationService
}

export function getAuthService(): AuthService {
  if (!authService) {
    if (API_CONFIG.useMock) {
      const userRepository = new MockUserRepository()
      authService = new AuthService(userRepository)
    } else {
      const authApiService = new AuthApiService()
      const userRepository = new UserApiAdapter(authApiService)
      authService = new AuthService(userRepository)
    }
  }
  return authService
}

export function getActivityService(): ActivityService {
  if (!activityService) {
    if (API_CONFIG.useMock) {
      const activityRepository = new MockActivityRepository()
      activityService = new ActivityService(activityRepository)
    } else {
      const activityApiService = new ActivityApiService()
      const activityRepository = new ActivityApiAdapter(activityApiService)
      activityService = new ActivityService(activityRepository)
    }
  }
  return activityService
}
