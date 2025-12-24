import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, TaskStatus, TaskPriority } from '../models/Task'
import { getTaskService } from '../api/ServiceFactory'
import { useAuthStore } from './auth'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()

  const sortedTasks = computed(() => {
    const priorityOrder: Record<TaskPriority, number> = {
      immediate: 1,
      medium: 2,
      long: 3
    }

    return [...tasks.value].sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    })
  })

  const immediateTasks = computed(() => 
    tasks.value.filter(t => t.priority === 'immediate')
  )

  const mediumTasks = computed(() => 
    tasks.value.filter(t => t.priority === 'medium')
  )

  const longTasks = computed(() => 
    tasks.value.filter(t => t.priority === 'long')
  )

  async function loadTasks() {
    if (!authStore.user) return

    loading.value = true
    error.value = null
    try {
      const taskService = getTaskService()
      const loadedTasks = await taskService.getAllTasks(
        authStore.user.tenantId,
        authStore.user.role,
        authStore.user.id
      )
      tasks.value = loadedTasks
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load tasks'
    } finally {
      loading.value = false
    }
  }

  async function updateTaskStatus(taskId: string, status: TaskStatus) {
    if (!authStore.user) return

    // Optimistic UI update - update immediately
    const taskIndex = tasks.value.findIndex(t => t.id === taskId)
    let originalTask: Task | null = null
    
    if (taskIndex >= 0) {
      const currentTask = tasks.value[taskIndex]
      if (currentTask) {
        originalTask = JSON.parse(JSON.stringify(currentTask)) as Task
        tasks.value[taskIndex] = {
          id: currentTask.id,
          title: currentTask.title,
          description: currentTask.description,
          duration: currentTask.duration,
          deadline: currentTask.deadline,
          role: currentTask.role,
          status,
          priority: currentTask.priority,
          assignedTo: currentTask.assignedTo,
          tenantId: currentTask.tenantId,
          createdAt: currentTask.createdAt,
          updatedAt: new Date(),
          completedAt: status === 'completed' ? new Date() : currentTask.completedAt,
          priorityOverridden: currentTask.priorityOverridden,
          completedSteps: currentTask.completedSteps,
          totalSteps: currentTask.totalSteps
        }
      }
    }

    loading.value = true
    error.value = null
    
    try {
      const taskService = getTaskService()
      const updatedTask = await taskService.updateTaskStatus(
        taskId,
        status,
        authStore.user.tenantId,
        authStore.user.id
      )
      
      // Update with server response
      if (taskIndex >= 0) {
        tasks.value[taskIndex] = updatedTask
      }
    } catch (e) {
      // Rollback on error
      if (taskIndex >= 0 && originalTask) {
        tasks.value[taskIndex] = originalTask
      }
      error.value = e instanceof Error ? e.message : 'Failed to update task'
    } finally {
      loading.value = false
    }
  }

  async function overridePriority(taskId: string, priority: TaskPriority) {
    if (!authStore.user) return

    // Optimistic UI update
    const taskIndex = tasks.value.findIndex(t => t.id === taskId)
    let originalTask: Task | null = null
    
    if (taskIndex >= 0) {
      const currentTask = tasks.value[taskIndex]
      if (currentTask) {
        originalTask = JSON.parse(JSON.stringify(currentTask)) as Task
        tasks.value[taskIndex] = {
          id: currentTask.id,
          title: currentTask.title,
          description: currentTask.description,
          duration: currentTask.duration,
          deadline: currentTask.deadline,
          role: currentTask.role,
          status: currentTask.status,
          priority,
          assignedTo: currentTask.assignedTo,
          tenantId: currentTask.tenantId,
          createdAt: currentTask.createdAt,
          updatedAt: new Date(),
          completedAt: currentTask.completedAt,
          priorityOverridden: true,
          completedSteps: currentTask.completedSteps,
          totalSteps: currentTask.totalSteps
        }
      }
    }

    loading.value = true
    error.value = null
    
    try {
      const taskService = getTaskService()
      const originalTask = tasks.value.find(t => t.id === taskId)
      const oldPriority = originalTask?.priority
      
      const updatedTask = await taskService.overridePriority(
        taskId,
        priority,
        authStore.user.tenantId,
        {
          id: authStore.user.id,
          name: authStore.user.name
        }
      )
      
      // If a regular user changed priority (not manager), notify admins
      if (!authStore.isManager && oldPriority !== priority) {
        // Notification is already sent by TaskService, but we ensure it's loaded
        const { useNotificationStore } = await import('./notifications')
        const notificationStore = useNotificationStore()
        await notificationStore.loadNotifications()
      }
      
      // Update with server response
      if (taskIndex >= 0) {
        tasks.value[taskIndex] = updatedTask
      }
    } catch (e) {
      // Rollback on error
      if (taskIndex >= 0 && originalTask) {
        tasks.value[taskIndex] = originalTask
      }
      error.value = e instanceof Error ? e.message : 'Failed to override priority'
    } finally {
      loading.value = false
    }
  }

  async function refreshPriorities() {
    if (!authStore.user) return

    try {
      const taskService = getTaskService()
      await taskService.updateTaskPriorities(authStore.user.tenantId)
      await loadTasks()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to refresh priorities'
    }
  }

  async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'priority'>) {
    if (!authStore.user) return

    loading.value = true
    error.value = null
    
    try {
      const taskService = getTaskService()
      // Pass user info for notification creation
      const newTask = await taskService.createTask(task, {
        id: authStore.user.id,
        name: authStore.user.name
      })
      tasks.value.push(newTask)
      return newTask
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create task'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateTask(task: Task) {
    if (!authStore.user) return

    loading.value = true
    error.value = null
    
    try {
      const taskService = getTaskService()
      // Detect what changed
      const originalTask = tasks.value.find(t => t.id === task.id)
      const changes: string[] = []
      
      if (originalTask) {
        if (originalTask.title !== task.title) changes.push('Title')
        if (originalTask.description !== task.description) changes.push('Description')
        if (originalTask.deadline.getTime() !== task.deadline.getTime()) changes.push('Deadline')
        if (originalTask.status !== task.status) changes.push('Status')
        if (originalTask.assignedTo !== task.assignedTo) changes.push('Assignment')
      }

      // Use updateTask if available, otherwise use updateTaskStatus
      if ((taskService as any).updateTask && changes.length > 0) {
        const updatedTask = await (taskService as any).updateTask(
          task,
          changes,
          {
            id: authStore.user.id,
            name: authStore.user.name
          }
        )
        
        const index = tasks.value.findIndex(t => t.id === task.id)
        if (index >= 0) {
          tasks.value[index] = updatedTask
        }
        return updatedTask
      } else {
        // Fallback to status update
        const updatedTask = await taskService.updateTaskStatus(
          task.id,
          task.status,
          authStore.user.tenantId,
          authStore.user.id,
          {
            id: authStore.user.id,
            name: authStore.user.name
          }
        )
        
        const index = tasks.value.findIndex(t => t.id === task.id)
        if (index >= 0) {
          tasks.value[index] = { ...updatedTask, ...task }
        }
        return updatedTask
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update task'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function bulkUpdateStatus(taskIds: string[], status: TaskStatus) {
    if (!authStore.user) return

    // Optimistic UI update for all tasks
    const originalTasks = new Map<string, Task>()
    taskIds.forEach(taskId => {
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index >= 0) {
        const currentTask = tasks.value[index]
        if (currentTask) {
          originalTasks.set(taskId, JSON.parse(JSON.stringify(currentTask)) as Task)
          tasks.value[index] = {
            id: currentTask.id,
            title: currentTask.title,
            description: currentTask.description,
            duration: currentTask.duration,
            deadline: currentTask.deadline,
            role: currentTask.role,
            status,
            priority: currentTask.priority,
            assignedTo: currentTask.assignedTo,
            tenantId: currentTask.tenantId,
            createdAt: currentTask.createdAt,
            updatedAt: new Date(),
            completedAt: status === 'completed' ? new Date() : currentTask.completedAt,
            priorityOverridden: currentTask.priorityOverridden,
            completedSteps: currentTask.completedSteps,
            totalSteps: currentTask.totalSteps
          }
        }
      }
    })

    loading.value = true
    error.value = null
    
    try {
      const taskService = getTaskService()
      // Process in parallel for better performance
      await Promise.all(
        taskIds.map(taskId =>
          taskService.updateTaskStatus(
            taskId,
            status,
            authStore.user!.tenantId,
            authStore.user!.id
          )
        )
      )
      await loadTasks()
    } catch (e) {
      // Rollback on error
      originalTasks.forEach((originalTask, taskId) => {
        const index = tasks.value.findIndex(t => t.id === taskId)
        if (index >= 0) {
          tasks.value[index] = originalTask
        }
      })
      error.value = e instanceof Error ? e.message : 'Failed to update tasks'
    } finally {
      loading.value = false
    }
  }

  async function forwardTask(taskId: string, recipientId: string, forwardingNote?: string) {
    if (!authStore.user) return

    loading.value = true
    error.value = null
    
    try {
      const taskService = getTaskService()
      const { useUserStore } = await import('./users')
      const userStore = useUserStore()
      
      // Get user info
      const getUserById = async (id: string) => {
        if (userStore.users.length === 0) {
          await userStore.loadUsers()
        }
        return userStore.users.find(u => u.id === id) || null
      }
      
      const getManagers = async () => {
        if (userStore.users.length === 0) {
          await userStore.loadUsers()
        }
        return userStore.managers
      }

      const updatedTask = await (taskService as any).forwardTask(
        taskId,
        recipientId,
        {
          id: authStore.user.id,
          name: authStore.user.name
        },
        forwardingNote,
        authStore.user.tenantId,
        getUserById,
        getManagers
      )
      
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index >= 0) {
        tasks.value[index] = updatedTask
      }
      
      // Reload notifications
      const { useNotificationStore } = await import('./notifications')
      const notificationStore = useNotificationStore()
      await notificationStore.loadNotifications()
      
      return updatedTask
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to forward task'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteTask(taskId: string) {
    if (!authStore.user) return

    loading.value = true
    error.value = null

    try {
      const taskService = getTaskService()
      await taskService.deleteTask(
        taskId,
        authStore.user.tenantId,
        { id: authStore.user.id, name: authStore.user.name }
      )

      // Remove from local store
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index >= 0) {
        tasks.value.splice(index, 1)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete task'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function overrideDeadline(taskId: string, newDeadline: Date) {
    if (!authStore.user) return

    loading.value = true
    error.value = null

    try {
      const task = tasks.value.find(t => t.id === taskId)
      if (!task) {
        throw new Error('Task not found')
      }

      const taskService = getTaskService()
      const updatedTask: Task = {
        ...task,
        deadline: newDeadline,
        updatedAt: new Date()
      }

      const savedTask = await taskService.updateTask(
        updatedTask,
        [`Deadline overridden to ${newDeadline.toLocaleDateString()}`],
        { id: authStore.user.id, name: authStore.user.name }
      )

      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index >= 0) {
        tasks.value[index] = savedTask
      }

      return savedTask
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to override deadline'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    tasks,
    sortedTasks,
    immediateTasks,
    mediumTasks,
    longTasks,
    loading,
    error,
    loadTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    overridePriority,
    refreshPriorities,
    bulkUpdateStatus,
    forwardTask,
    deleteTask,
    overrideDeadline
  }
})

