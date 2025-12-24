import type { Task, TaskStatus, TaskPriority, UserRole } from '../domain/Task'
import { PriorityCalculator } from '../domain/PriorityCalculator'
import type { TaskRepository } from '../infrastructure/TaskRepository'
import type { NotificationService } from './NotificationService'

export class TaskService {
  constructor(
    private taskRepository: TaskRepository,
    private notificationService: NotificationService
  ) {}

  async getAllTasks(tenantId: string, userRole: UserRole, userId?: string): Promise<Task[]> {
    const tasks = await this.taskRepository.findAll(tenantId)
    
    // Workers only see their assigned tasks
    if (userRole === 'worker' && userId) {
      return tasks.filter(task => task.assignedTo === userId)
    }
    
    // Managers see all tasks
    return tasks
  }

  async getTaskById(id: string, tenantId: string): Promise<Task | null> {
    return this.taskRepository.findById(id, tenantId)
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'priority'>): Promise<Task> {
    const now = new Date()
    const newTask: Task = {
      ...task,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
      priority: PriorityCalculator.calculate(task as Task)
    }
    
    const taskWithPriority = PriorityCalculator.updatePriority(newTask)
    return this.taskRepository.save(taskWithPriority)
  }

  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    tenantId: string,
    userId: string
  ): Promise<Task> {
    const task = await this.taskRepository.findById(taskId, tenantId)
    if (!task) {
      throw new Error('Task not found')
    }

    const updatedTask: Task = {
      ...task,
      status,
      updatedAt: new Date(),
      completedAt: status === 'completed' ? new Date() : task.completedAt
    }

    // Update priority if not overridden
    const finalTask = task.priorityOverridden 
      ? updatedTask 
      : PriorityCalculator.updatePriority(updatedTask)

    const savedTask = await this.taskRepository.save(finalTask)

    // Send notification if task completed
    if (status === 'completed') {
      await this.notificationService.createTaskCompletedNotification(
        savedTask,
        userId,
        tenantId
      )
    }

    return savedTask
  }

  async overridePriority(
    taskId: string,
    priority: TaskPriority,
    tenantId: string
  ): Promise<Task> {
    const task = await this.taskRepository.findById(taskId, tenantId)
    if (!task) {
      throw new Error('Task not found')
    }

    const updatedTask: Task = {
      ...task,
      priority,
      priorityOverridden: true,
      updatedAt: new Date()
    }

    return this.taskRepository.save(updatedTask)
  }

  async updateTaskPriorities(tenantId: string): Promise<void> {
    const tasks = await this.taskRepository.findAll(tenantId)
    
    for (const task of tasks) {
      if (!task.priorityOverridden) {
        const updatedTask = PriorityCalculator.updatePriority(task)
        await this.taskRepository.save(updatedTask)
      }
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}


