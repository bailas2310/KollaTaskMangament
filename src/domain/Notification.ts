export interface Notification {
  id: string
  type: 'task_completed' | 'deadline_approaching' | 'priority_changed'
  message: string
  taskId: string
  userId: string
  tenantId: string
  createdAt: Date
  read: boolean
}


