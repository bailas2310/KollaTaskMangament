export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type TaskPriority = 'immediate' | 'medium' | 'long'
export type UserRole = 'worker' | 'manager'

export interface TaskEditHistory {
  id: string
  taskId: string
  editedBy: string // userId
  editedByName: string
  editedAt: Date
  changes: {
    field: string
    oldValue: any
    newValue: any
  }[]
}

export interface TaskForwardingHistory {
  id: string
  taskId: string
  forwardedFrom: string // userId
  forwardedFromName: string
  forwardedTo: string // userId
  forwardedToName: string
  forwardedAt: Date
  forwardingNote?: string // optional reason/note
}

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
  completedSteps?: number // for progress tracking
  totalSteps?: number // for progress tracking
  // New fields for user editing
  notes?: string // user notes/comments
  tags?: string[] // tags/labels
  attachments?: string[] // attachment URLs or IDs
  lastEditedBy?: string // userId of last editor
  lastEditedByName?: string // name of last editor
  lastEditedAt?: Date // timestamp of last edit
  editHistory?: TaskEditHistory[] // full edit history
  // Forwarding fields
  forwardedFrom?: string // userId of original assignee (if task was forwarded)
  forwardedFromName?: string // name of original assignee
  forwardingHistory?: TaskForwardingHistory[] // complete forwarding chain
}
