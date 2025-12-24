import { describe, it, expect, beforeEach } from 'vitest'
import { PriorityCalculator } from '../PriorityCalculator'
import type { Task } from '../../models/Task'

describe('PriorityCalculator', () => {
  const baseTask: Omit<Task, 'priority' | 'deadline'> = {
    id: 'test-1',
    title: 'Test Task',
    description: 'Test',
    duration: 4,
    role: 'worker',
    status: 'pending',
    tenantId: 'tenant-1',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  describe('calculate', () => {
    it('should return immediate priority for tasks due within 8 hours', () => {
      const task: Task = {
        ...baseTask,
        deadline: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
        priority: 'medium'
      }
      expect(PriorityCalculator.calculate(task)).toBe('immediate')
    })

    it('should return medium priority for tasks due in 8-32 hours', () => {
      const task: Task = {
        ...baseTask,
        deadline: new Date(Date.now() + 20 * 60 * 60 * 1000), // 20 hours
        priority: 'long'
      }
      expect(PriorityCalculator.calculate(task)).toBe('medium')
    })

    it('should return long priority for tasks due after 32 hours', () => {
      const task: Task = {
        ...baseTask,
        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
        priority: 'immediate'
      }
      expect(PriorityCalculator.calculate(task)).toBe('long')
    })

    it('should return current priority if overridden', () => {
      const task: Task = {
        ...baseTask,
        deadline: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours (should be immediate)
        priority: 'long',
        priorityOverridden: true
      }
      expect(PriorityCalculator.calculate(task)).toBe('long')
    })
  })

  describe('updatePriority', () => {
    it('should update task priority and updatedAt timestamp', () => {
      const task: Task = {
        ...baseTask,
        deadline: new Date(Date.now() + 6 * 60 * 60 * 1000),
        priority: 'medium'
      }
      const updated = PriorityCalculator.updatePriority(task)
      expect(updated.priority).toBe('immediate')
      expect(updated.updatedAt.getTime()).toBeGreaterThan(task.updatedAt.getTime())
    })
  })
})

