export interface Notification {
  id: string
  type: 'task_assigned' | 'task_completed' | 'priority_changed' | 'task_updated' | 'deadline_alert' | 'deadline_approaching'
  message: string
  taskId: string
  userId: string
  tenantId: string
  createdAt: Date
  read: boolean
  // Additional metadata for different notification types
  metadata?: {
    taskTitle?: string
    taskDescription?: string
    priority?: string
    oldPriority?: string
    newPriority?: string
    dueDate?: Date
    assignedBy?: string
    assignedByName?: string
    changedBy?: string
    changedByName?: string
    changes?: string[] // List of what was changed
    originalDueDate?: Date
    currentStatus?: string
    // Forwarding fields
    forwardingNote?: string
    forwardedFrom?: string
    forwardedFromName?: string
    forwardedTo?: string
    forwardedToName?: string
  }
}


