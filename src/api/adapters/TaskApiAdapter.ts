import type { Task } from '../../models/Task'
import type { TaskRepository } from '../TaskRepository'
import { TaskApiService } from '../services/TaskApiService'

/**
 * Adapter to make TaskApiService work like TaskRepository
 * This allows seamless switching between mock and real API
 */
export class TaskApiAdapter implements TaskRepository {
  constructor(private apiService: TaskApiService) {}

  async findAll(tenantId: string): Promise<Task[]> {
    // Note: This method is called from TaskService.getAllTasks which already handles
    // role-based filtering. The API service will handle the actual filtering on the backend.
    // For now, we pass 'manager' to get all tasks - the backend should filter based on user role
    return this.apiService.getAllTasks(tenantId, 'manager')
  }

  async findById(id: string, tenantId: string): Promise<Task | null> {
    try {
      return await this.apiService.getTaskById(id, tenantId)
    } catch (error) {
      return null
    }
  }

  async save(task: Task): Promise<Task> {
    if (task.id && await this.findById(task.id, task.tenantId)) {
      return this.apiService.updateTask(task.id, task)
    } else {
      return this.apiService.createTask(task)
    }
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.apiService.deleteTask(id, tenantId)
  }
}

