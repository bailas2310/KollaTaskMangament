import { TaskService } from '../services/TaskService'
import { getTaskService } from '../api/ServiceFactory'
import type { Task, TaskStatus, TaskPriority, UserRole } from '../models/Task'

export class TaskController {
  private taskService: TaskService

  constructor() {
    this.taskService = getTaskService()
  }

  async getAllTasks(tenantId: string, userRole: UserRole, userId?: string): Promise<Task[]> {
    return this.taskService.getAllTasks(tenantId, userRole, userId)
  }

  async getTaskById(id: string, tenantId: string): Promise<Task | null> {
    return this.taskService.getTaskById(id, tenantId)
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'priority'>): Promise<Task> {
    return this.taskService.createTask(task)
  }

  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    tenantId: string,
    userId: string
  ): Promise<Task> {
    return this.taskService.updateTaskStatus(taskId, status, tenantId, userId)
  }

  async overridePriority(
    taskId: string,
    priority: TaskPriority,
    tenantId: string
  ): Promise<Task> {
    return this.taskService.overridePriority(taskId, priority, tenantId)
  }

  async updateTaskPriorities(tenantId: string): Promise<void> {
    return this.taskService.updateTaskPriorities(tenantId)
  }
}
