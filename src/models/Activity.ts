export type ActivityType = 'task_created' | 'task_completed' | 'task_updated' | 'priority_changed' | 'status_changed'

export interface Activity {
  id: string
  type: ActivityType
  message: string
  taskId?: string
  taskTitle?: string
  userId: string
  userName: string
  tenantId: string
  timestamp: Date
}


