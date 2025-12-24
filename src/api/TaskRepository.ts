import type { Task } from '../models/Task'

export interface TaskRepository {
  findAll(tenantId: string): Promise<Task[]>
  findById(id: string, tenantId: string): Promise<Task | null>
  save(task: Task): Promise<Task>
  delete(id: string, tenantId: string): Promise<void>
}


