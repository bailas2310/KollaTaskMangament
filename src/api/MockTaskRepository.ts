import type { Task } from '../models/Task'
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

    // Specific tasks from screenshot requirements
    const specificTasks: Task[] = [
      {
        id: 'task-1',
        title: 'Review Document',
        description: 'Review and provide feedback on the project document',
        duration: 3,
        deadline: new Date('2026-01-14'),
        role: 'worker',
        status: 'in_progress',
        priority: 'immediate', // High priority = immediate
        assignedTo: 'user-mohamed',
        tenantId,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        completedSteps: 2,
        totalSteps: 5
      },
      {
        id: 'task-2',
        title: 'Write Report',
        description: 'Write comprehensive report on project progress',
        duration: 6,
        deadline: new Date(now.getTime() + 20 * 60 * 60 * 1000), // 20 hours from now
        role: 'worker',
        status: 'in_progress',
        priority: 'medium',
        assignedTo: 'user-mohamed',
        tenantId,
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        completedSteps: 1,
        totalSteps: 4
      },
      {
        id: 'task-3',
        title: 'Testing',
        description: 'Perform comprehensive testing of the application',
        duration: 8,
        deadline: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        role: 'worker',
        status: 'completed',
        priority: 'medium',
        assignedTo: 'user-mohamed',
        tenantId,
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        completedSteps: 5,
        totalSteps: 5
      },
      {
        id: 'task-4',
        title: 'Research',
        description: 'Research best practices and gather information',
        duration: 4,
        deadline: new Date(now.getTime() + 40 * 60 * 60 * 1000), // 40 hours from now
        role: 'worker',
        status: 'pending',
        priority: 'long',
        assignedTo: 'user-mohamed',
        tenantId,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        completedSteps: 0,
        totalSteps: 3
      }
    ]

    // Generate additional tasks to match chart requirements:
    // Priority: Immediate: 8, Medium: 15, Long-term: 22 (total: 45)
    // Status: Open: 12, In Progress: 18, Completed: 35, Overdue: 3 (total: 68, but some overlap)
    // Let's create 68 tasks total to match all requirements

    const additionalTasks: Task[] = []

    // Immediate priority tasks (8 total, including task-1)
    const immediateTasks = [
      ...specificTasks.filter(t => t.priority === 'immediate'),
      ...this.generateTasks(7, 'immediate', tenantId, now, 'user-mohamed')
    ]

    // Medium priority tasks (15 total, including task-2 and task-3)
    const mediumTasks = [
      ...specificTasks.filter(t => t.priority === 'medium'),
      ...this.generateTasks(13, 'medium', tenantId, now, 'user-mohamed')
    ]

    // Long-term priority tasks (22 total, including task-4)
    const longTasks = [
      ...specificTasks.filter(t => t.priority === 'long'),
      ...this.generateTasks(21, 'long', tenantId, now, 'user-mohamed')
    ]

    // Combine and ensure status distribution
    let allTasks = [...immediateTasks, ...mediumTasks, ...longTasks]

    // Adjust statuses to match requirements
    // Open (pending): 12, In Progress: 18, Completed: 35, Overdue: 3
    const statusDistribution = {
      pending: 12,
      in_progress: 18,
      completed: 35,
      overdue: 3
    }

    let pendingCount = 0
    let inProgressCount = 0
    let completedCount = 0
    let overdueCount = 0

    allTasks = allTasks.map((task, index) => {
      // Preserve specific task statuses
      if (task.id.startsWith('task-1') || task.id.startsWith('task-2') || 
          task.id.startsWith('task-3') || task.id.startsWith('task-4')) {
        return task
      }

      // Assign statuses to match distribution
      let status: Task['status'] = 'pending'
      
      if (pendingCount < statusDistribution.pending && task.status === 'pending') {
        pendingCount++
        status = 'pending'
      } else if (inProgressCount < statusDistribution.in_progress) {
        inProgressCount++
        status = 'in_progress'
      } else if (completedCount < statusDistribution.completed) {
        completedCount++
        status = 'completed'
        task.completedAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      } else {
        status = 'pending'
      }

      // Mark overdue tasks
      if (overdueCount < statusDistribution.overdue && 
          new Date(task.deadline) < now && 
          status !== 'completed') {
        overdueCount++
        task.deadline = new Date(now.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000)
        status = 'pending' // Overdue tasks are still pending
      }

      return {
        ...task,
        status
      }
    })

    this.tasks = allTasks
  }

  private generateTasks(
    count: number,
    priority: Task['priority'],
    tenantId: string,
    now: Date,
    assignedTo: string
  ): Task[] {
    const tasks: Task[] = []
    const titles = [
      'Code Review', 'Bug Fix', 'Feature Implementation', 'Documentation Update',
      'API Integration', 'UI Design', 'Database Migration', 'Performance Optimization',
      'Security Audit', 'User Testing', 'Deployment', 'Monitoring Setup',
      'Data Analysis', 'Report Generation', 'Meeting Preparation', 'Client Communication'
    ]

    for (let i = 0; i < count; i++) {
      const hoursUntilDeadline = 
        priority === 'immediate' 
          ? Math.random() * 8 // 0-8 hours
          : priority === 'medium'
          ? 8 + Math.random() * 24 // 8-32 hours
          : 32 + Math.random() * 72 // 32-104 hours

      const deadline = new Date(now.getTime() + hoursUntilDeadline * 60 * 60 * 1000)
      const createdAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)

      const randomTitleIndex = Math.floor(Math.random() * titles.length)
      const randomDescIndex = Math.floor(Math.random() * titles.length)
      
      tasks.push({
        id: `task-${priority}-${i + 1}`,
        title: titles[randomTitleIndex] || 'Task',
        description: `Task description for ${titles[randomDescIndex] || 'task'}`,
        duration: Math.floor(Math.random() * 8) + 2,
        deadline,
        role: 'worker',
        status: Math.random() > 0.5 ? 'pending' : 'in_progress',
        priority,
        assignedTo,
        tenantId,
        createdAt,
        updatedAt: createdAt,
        completedSteps: Math.floor(Math.random() * 3),
        totalSteps: Math.floor(Math.random() * 5) + 3
      })
    }

    return tasks
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
