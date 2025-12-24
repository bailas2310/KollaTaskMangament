import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TaskService } from '../TaskService'
import type { TaskRepository } from '../../api/TaskRepository'
import type { NotificationService } from '../NotificationService'
import type { Task } from '../../models/Task'

describe('TaskService', () => {
  let mockTaskRepository: TaskRepository
  let mockNotificationService: NotificationService
  let taskService: TaskService

  beforeEach(() => {
    mockTaskRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn()
    } as unknown as TaskRepository

    mockNotificationService = {
      createTaskCompletedNotification: vi.fn()
    } as unknown as NotificationService

    taskService = new TaskService(mockTaskRepository, mockNotificationService)
  })

  describe('getAllTasks', () => {
    it('should return all tasks for managers', async () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          description: 'Desc 1',
          duration: 4,
          deadline: new Date(),
          role: 'worker',
          status: 'pending',
          priority: 'medium',
          tenantId: 'tenant-1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      vi.mocked(mockTaskRepository.findAll).mockResolvedValue(tasks)

      const result = await taskService.getAllTasks('tenant-1', 'manager')
      expect(result).toEqual(tasks)
      expect(mockTaskRepository.findAll).toHaveBeenCalledWith('tenant-1')
    })

    it('should filter tasks for workers', async () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          description: 'Desc 1',
          duration: 4,
          deadline: new Date(),
          role: 'worker',
          status: 'pending',
          priority: 'medium',
          assignedTo: 'user-1',
          tenantId: 'tenant-1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          title: 'Task 2',
          description: 'Desc 2',
          duration: 4,
          deadline: new Date(),
          role: 'worker',
          status: 'pending',
          priority: 'medium',
          assignedTo: 'user-2',
          tenantId: 'tenant-1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      vi.mocked(mockTaskRepository.findAll).mockResolvedValue(tasks)

      const result = await taskService.getAllTasks('tenant-1', 'worker', 'user-1')
      expect(result).toHaveLength(1)
      expect(result[0]?.id).toBe('1')
    })
  })
})

