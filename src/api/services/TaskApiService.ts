import { apiClient } from '../client'
import { API_CONFIG } from '../config'
import type { Task, TaskStatus, TaskPriority } from '../../models/Task'

/**
 * Task API Service
 * Handles all task-related API calls
 * When useMock is false, this will make real HTTP requests
 */
export class TaskApiService {
  async getAllTasks(tenantId: string, userRole: string, userId?: string): Promise<Task[]> {
    const params: any = { tenantId, role: userRole }
    if (userId) {
      params.userId = userId
    }
    return apiClient.get<Task[]>(API_CONFIG.endpoints.tasks.list, { params })
  }

  async getTaskById(id: string, tenantId: string): Promise<Task> {
    return apiClient.get<Task>(API_CONFIG.endpoints.tasks.get(id), {
      params: { tenantId }
    })
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'priority'>): Promise<Task> {
    return apiClient.post<Task>(API_CONFIG.endpoints.tasks.create, task)
  }

  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    return apiClient.put<Task>(API_CONFIG.endpoints.tasks.update(id), task)
  }

  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    tenantId: string,
    userId: string
  ): Promise<Task> {
    return apiClient.patch<Task>(
      API_CONFIG.endpoints.tasks.updateStatus(id),
      { status, tenantId, userId }
    )
  }

  async overridePriority(
    id: string,
    priority: TaskPriority,
    tenantId: string
  ): Promise<Task> {
    return apiClient.patch<Task>(
      API_CONFIG.endpoints.tasks.overridePriority(id),
      { priority, tenantId }
    )
  }

  async deleteTask(id: string, tenantId: string): Promise<void> {
    return apiClient.delete(API_CONFIG.endpoints.tasks.delete(id), {
      params: { tenantId }
    })
  }

  async refreshPriorities(tenantId: string): Promise<void> {
    return apiClient.post(API_CONFIG.endpoints.tasks.refreshPriorities, { tenantId })
  }
}

