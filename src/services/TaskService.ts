import type { Task, TaskStatus, TaskPriority, UserRole } from '../models/Task'
import { PriorityCalculator } from './PriorityCalculator'
import type { TaskRepository } from '../api/TaskRepository'
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

  async createTask(
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'priority'>,
    createdByUser?: { id: string; name: string }
  ): Promise<Task> {
    const now = new Date()
    const newTask: Task = {
      ...task,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
      priority: PriorityCalculator.calculate(task as Task)
    }
    
    const taskWithPriority = PriorityCalculator.updatePriority(newTask)
    const savedTask = await this.taskRepository.save(taskWithPriority)

    // Send notification if task is assigned to a user
    if (savedTask.assignedTo && createdByUser) {
      await this.notificationService.createTaskAssignedNotification(
        savedTask,
        savedTask.assignedTo,
        createdByUser as any,
        savedTask.tenantId
      )
    }

    return savedTask
  }

  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    tenantId: string,
    userId: string,
    changedByUser?: { id: string; name: string }
  ): Promise<Task> {
    const task = await this.taskRepository.findById(taskId, tenantId)
    if (!task) {
      throw new Error('Task not found')
    }

    const oldStatus = task.status
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

    // Send notifications
    if (status === 'completed') {
      await this.notificationService.createTaskCompletedNotification(
        savedTask,
        userId,
        tenantId
      )
    }

    // Send task updated notification if status changed and user info provided
    if (oldStatus !== status && changedByUser && savedTask.assignedTo) {
      await this.notificationService.createTaskUpdatedNotification(
        savedTask,
        [`Status changed from ${oldStatus} to ${status}`],
        changedByUser as any,
        tenantId
      )
    }

    return savedTask
  }

  async overridePriority(
    taskId: string,
    priority: TaskPriority,
    tenantId: string,
    changedByUser?: { id: string; name: string }
  ): Promise<Task> {
    const task = await this.taskRepository.findById(taskId, tenantId)
    if (!task) {
      throw new Error('Task not found')
    }

    const oldPriority = task.priority
    const updatedTask: Task = {
      ...task,
      priority,
      priorityOverridden: true,
      updatedAt: new Date()
    }

    const savedTask = await this.taskRepository.save(updatedTask)

    // Send priority changed notification if priority actually changed and user info provided
    if (oldPriority !== priority && changedByUser && savedTask.assignedTo) {
      await this.notificationService.createPriorityChangedNotification(
        savedTask,
        oldPriority,
        priority,
        changedByUser as any,
        tenantId
      )
    }

    return savedTask
  }

  async updateTask(
    task: Task,
    changes: string[],
    changedByUser?: { id: string; name: string }
  ): Promise<Task> {
    const updatedTask: Task = {
      ...task,
      updatedAt: new Date()
    }

    const savedTask = await this.taskRepository.save(updatedTask)

    // Send task updated notification
    if (changedByUser && savedTask.assignedTo && changes.length > 0) {
      await this.notificationService.createTaskUpdatedNotification(
        savedTask,
        changes,
        changedByUser as any,
        savedTask.tenantId
      )
    }

    return savedTask
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

  async deleteTask(
    taskId: string,
    tenantId: string,
    deletedByUser: { id: string; name: string }
  ): Promise<void> {
    const task = await this.taskRepository.findById(taskId, tenantId)
    if (!task) {
      throw new Error('Task not found')
    }

    // Notify assigned user if task is deleted
    if (task.assignedTo) {
      await this.notificationService.createTaskDeletedNotification(
        task,
        task.assignedTo,
        deletedByUser as any,
        tenantId
      )
    }

    await this.taskRepository.delete(taskId, tenantId)
  }

  async forwardTask(
    taskId: string,
    forwardedToUserId: string,
    forwardedByUser: { id: string; name: string },
    forwardingNote: string | undefined,
    tenantId: string,
    getUserById: (id: string) => Promise<{ id: string; name: string; email: string; role: string } | null>,
    getManagers: () => Promise<{ id: string; name: string; email: string; role: string }[]>
  ): Promise<Task> {
    const task = await this.taskRepository.findById(taskId, tenantId)
    if (!task) {
      throw new Error('Task not found')
    }

    if (task.assignedTo !== forwardedByUser.id) {
      throw new Error('Only the assigned user can forward this task')
    }

    const forwardedToUser = await getUserById(forwardedToUserId)
    if (!forwardedToUser) {
      throw new Error('Recipient user not found')
    }

    const originalAssignedTo = task.assignedTo
    const originalAssignedToName = forwardedByUser.name

    // Create forwarding history entry
    const forwardingEntry = {
      id: `forward-${Date.now()}`,
      taskId: task.id,
      forwardedFrom: originalAssignedTo!,
      forwardedFromName: originalAssignedToName,
      forwardedTo: forwardedToUserId,
      forwardedToName: forwardedToUser.name,
      forwardedAt: new Date(),
      forwardingNote: forwardingNote || undefined
    }

    // Update task with new assignee and forwarding history
    const updatedTask: Task = {
      ...task,
      assignedTo: forwardedToUserId,
      forwardedFrom: task.forwardedFrom || originalAssignedTo,
      forwardedFromName: task.forwardedFromName || originalAssignedToName,
      forwardingHistory: [
        ...(task.forwardingHistory || []),
        forwardingEntry
      ],
      updatedAt: new Date()
    }

    const savedTask = await this.taskRepository.save(updatedTask)

    // Send notification to recipient
    await this.notificationService.createTaskForwardedNotification(
      savedTask,
      forwardedToUserId,
      forwardedByUser as any,
      forwardingNote,
      tenantId,
      forwardedToUser.name
    )

    // Send notification to all managers
    const managers = await getManagers()
    for (const manager of managers) {
      await this.notificationService.createTaskForwardedAdminNotification(
        savedTask,
        forwardedByUser as any,
        forwardedToUser as any,
        forwardingNote,
        tenantId,
        manager.id
      )
    }

    return savedTask
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}


