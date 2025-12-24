import type { Task } from '../domain/Task'

export interface TaskRepository {
  findAll(tenantId: string): Promise<Task[]>
  findById(id: string, tenantId: string): Promise<Task | null>
  save(task: Task): Promise<Task>
  delete(id: string, tenantId: string): Promise<void>
}


