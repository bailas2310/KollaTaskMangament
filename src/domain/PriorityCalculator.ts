import type { Task, TaskPriority } from './Task'

/**
 * Calculates task priority based on deadline
 * - immediate: ≤8 hours until deadline
 * - medium: 8-32 hours until deadline
 * - long: >32 hours until deadline
 */
export class PriorityCalculator {
  static calculate(task: Task): TaskPriority {
    // If priority was manually overridden, return current priority
    if (task.priorityOverridden) {
      return task.priority
    }

    const now = new Date()
    const deadline = new Date(task.deadline)
    const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilDeadline <= 8) {
      return 'immediate'
    } else if (hoursUntilDeadline <= 32) {
      return 'medium'
    } else {
      return 'long'
    }
  }

  static updatePriority(task: Task): Task {
    const newPriority = this.calculate(task)
    return {
      ...task,
      priority: newPriority,
      updatedAt: new Date()
    }
  }
}


