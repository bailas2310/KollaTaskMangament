export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type TaskPriority = 'immediate' | 'medium' | 'long'
export type UserRole = 'worker' | 'manager'

export interface Task {
  id: string
  title: string
  description: string
  duration: number // in hours
  deadline: Date
  role: UserRole
  status: TaskStatus
  priority: TaskPriority
  assignedTo?: string // userId for workers
  tenantId: string // multi-tenancy support
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  priorityOverridden?: boolean // true if manager manually set priority
}


