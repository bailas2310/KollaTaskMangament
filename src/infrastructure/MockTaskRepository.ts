import type { Task } from '../domain/Task'
import type { TaskRepository } from './TaskRepository'

export class MockTaskRepository implements TaskRepository {
  private tasks: Task[] = []
  private initialized = false

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData(): void {
    if (this.initialized) return
    this.initialized = true

    const now = new Date()
    const tenantId = 'tenant-1'

    // Create some mock tasks with different deadlines
    this.tasks = [
      {
        id: 'task-1',
        title: 'Fix critical bug in payment system',
        description: 'Urgent bug fix required for payment processing',
        duration: 4,
        deadline: new Date(now.getTime() + 6 * 60 * 60 * 1000), // 6 hours from now (immediate)
        role: 'worker',
        status: 'pending',
        priority: 'immediate',
        assignedTo: 'user-1',
        tenantId,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'task-2',
        title: 'Update documentation',
        description: 'Update API documentation for new endpoints',
        duration: 8,
        deadline: new Date(now.getTime() + 20 * 60 * 60 * 1000), // 20 hours from now (medium)
        role: 'worker',
        status: 'in_progress',
        priority: 'medium',
        assignedTo: 'user-1',
        tenantId,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000)
      },
      {
        id: 'task-3',
        title: 'Refactor user authentication',
        description: 'Improve authentication flow and security',
        duration: 16,
        deadline: new Date(now.getTime() + 48 * 60 * 60 * 1000), // 48 hours from now (long)
        role: 'worker',
        status: 'pending',
        priority: 'long',
        assignedTo: 'user-2',
        tenantId,
        createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000)
      },
      {
        id: 'task-4',
        title: 'Review code changes',
        description: 'Review pull requests from team members',
        duration: 2,
        deadline: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours from now (immediate)
        role: 'manager',
        status: 'pending',
        priority: 'immediate',
        tenantId,
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000)
      },
      {
        id: 'task-5',
        title: 'Plan sprint goals',
        description: 'Define goals and tasks for next sprint',
        duration: 4,
        deadline: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours from now (medium)
        role: 'manager',
        status: 'in_progress',
        priority: 'medium',
        tenantId,
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000)
      }
    ]
  }

  async findAll(tenantId: string): Promise<Task[]> {
    return this.tasks.filter(task => task.tenantId === tenantId)
  }

  async findById(id: string, tenantId: string): Promise<Task | null> {
    const task = this.tasks.find(t => t.id === id && t.tenantId === tenantId)
    return task || null
  }

  async save(task: Task): Promise<Task> {
    const index = this.tasks.findIndex(t => t.id === task.id)
    if (index >= 0) {
      this.tasks[index] = task
    } else {
      this.tasks.push(task)
    }
    return task
  }

  async delete(id: string, tenantId: string): Promise<void> {
    this.tasks = this.tasks.filter(t => !(t.id === id && t.tenantId === tenantId))
  }
}


