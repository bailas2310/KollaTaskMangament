<template>
  <div class="min-h-screen bg-neutral-50">
    <header class="bg-white shadow-soft border-b border-neutral-100">
      <div class="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-bold text-neutral-900">User Dashboard</h1>
              <span
                v-if="isRefreshing"
                class="relative flex h-3 w-3"
                title="Auto-refreshing"
              >
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"
                ></span>
                <span
                  class="relative inline-flex rounded-full h-3 w-3 bg-success"
                ></span>
              </span>
            </div>
            <p class="text-sm text-neutral-500 mt-1">Welcome, {{ authStore.user?.name }}</p>
          </div>
          <div class="flex gap-3 items-center w-full sm:w-auto">
            <div class="relative">
              <button
                @click="showNotifications = !showNotifications"
                class="relative px-3 xs:px-4 py-2 text-xs xs:text-sm text-neutral-700 hover:text-neutral-900 border border-neutral-100 rounded-button hover:bg-neutral-50 transition-smooth font-medium touch-manipulation"
              >
                Notifications
                <span
                  v-if="notificationStore.unreadCount > 0"
                  class="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-soft"
                >
                  {{ notificationStore.unreadCount }}
                </span>
              </button>
              <div
                v-if="showNotifications"
                class="absolute right-0 mt-2 w-80 bg-white rounded-card shadow-card border border-neutral-100 z-50 max-h-96 overflow-y-auto transition-smooth"
              >
                <div class="p-4 border-b border-neutral-100 flex justify-between items-center">
                  <h3 class="font-semibold text-neutral-900">Notifications</h3>
                  <button
                    @click="handleMarkAllRead"
                    class="text-xs text-primary-start hover:text-primary-end transition-smooth font-medium"
                  >
                    Mark all as read
                  </button>
                </div>
                <div v-if="notificationStore.notifications.length === 0" class="p-4 text-neutral-500 text-sm">
                  No notifications
                </div>
                <div
                  v-for="notification in notificationStore.sortedNotifications"
                  :key="notification.id"
                  @click="handleNotificationClick(notification)"
                  :class="[
                    'p-4 border-b border-neutral-100 cursor-pointer transition-smooth',
                    !notification.read ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-neutral-50'
                  ]"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1">
                      <p class="text-sm font-medium text-neutral-900">{{ notification.message }}</p>
                      <div v-if="notification.metadata" class="mt-2 space-y-1">
                        <p v-if="notification.metadata.assignedByName" class="text-xs text-neutral-600">
                          Assigned by: {{ notification.metadata.assignedByName }}
                        </p>
                        <p v-if="notification.metadata.changedByName" class="text-xs text-neutral-600">
                          Changed by: {{ notification.metadata.changedByName }}
                        </p>
                        <p v-if="notification.metadata.forwardedFromName && notification.metadata.forwardedToName" class="text-xs text-neutral-600">
                          Forwarded from {{ notification.metadata.forwardedFromName }} to {{ notification.metadata.forwardedToName }}
                        </p>
                        <p v-if="notification.metadata.forwardingNote" class="text-xs text-neutral-600 italic">
                          Note: "{{ notification.metadata.forwardingNote }}"
                        </p>
                        <p v-if="notification.metadata.oldPriority && notification.metadata.newPriority" class="text-xs text-neutral-600">
                          Priority: {{ notification.metadata.oldPriority }} → {{ notification.metadata.newPriority }}
                        </p>
                        <p v-if="notification.metadata.dueDate" class="text-xs text-neutral-600">
                          Due: {{ formatDate(notification.metadata.dueDate) }}
                        </p>
                        <p v-if="notification.metadata.changes && notification.metadata.changes.length > 0" class="text-xs text-neutral-600">
                          Changes: {{ notification.metadata.changes.join(', ') }}
                        </p>
                      </div>
                      <p class="text-xs text-neutral-500 mt-2">
                        {{ formatDate(notification.createdAt) }}
                      </p>
                    </div>
                    <span
                      v-if="!notification.read"
                      class="flex-shrink-0 w-2 h-2 bg-primary-start rounded-full mt-1"
                    ></span>
                  </div>
                </div>
              </div>
            </div>
            <button
              @click="handleLogout"
              class="px-3 xs:px-4 py-2 text-xs xs:text-sm text-neutral-700 hover:text-neutral-900 border border-neutral-100 rounded-button hover:bg-neutral-50 transition-smooth font-medium touch-manipulation"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div class="bg-white rounded-card shadow-soft p-6 border-l-4 border-primary-start transition-smooth hover:shadow-card">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-neutral-500">Open Tasks</h3>
            <svg class="w-5 h-5 text-primary-start" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p class="text-3xl font-bold text-neutral-900">{{ openTasksCount }}</p>
          <p class="text-xs text-neutral-500 mt-1">Tasks in progress or pending</p>
        </div>

        <div class="bg-white rounded-card shadow-soft p-6 border-l-4 border-warning transition-smooth hover:shadow-card">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-neutral-500">Due Today</h3>
            <svg class="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-3xl font-bold text-warning">{{ dueTodayCount }}</p>
          <p class="text-xs text-neutral-500 mt-1">Tasks due within 24 hours</p>
        </div>

        <div class="bg-white rounded-card shadow-soft p-6 border-l-4 border-danger transition-smooth hover:shadow-card">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-neutral-500">Overdue</h3>
            <svg class="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p class="text-3xl font-bold text-danger">{{ overdueCount }}</p>
          <p class="text-xs text-neutral-500 mt-1">Tasks past their deadline</p>
        </div>
      </div>

      <!-- Priority Badges -->
      <div class="mb-6 flex flex-wrap gap-2">
        <span
          v-if="taskStore.immediateTasks.length > 0"
          class="px-4 py-2 bg-red-50 text-danger rounded-button text-sm font-semibold shadow-soft"
        >
          {{ taskStore.immediateTasks.length }} Immediate
        </span>
        <span
          v-if="taskStore.mediumTasks.length > 0"
          class="px-4 py-2 bg-orange-50 text-warning rounded-button text-sm font-semibold shadow-soft"
        >
          {{ taskStore.mediumTasks.length }} Medium
        </span>
        <span
          v-if="taskStore.longTasks.length > 0"
          class="px-4 py-2 bg-green-50 text-success rounded-button text-sm font-semibold shadow-soft"
        >
          {{ taskStore.longTasks.length }} Long
        </span>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <TaskProgressChart :tasks="taskStore.tasks" />
        <PriorityDistributionChart :tasks="taskStore.tasks" />
      </div>

      <!-- Task List -->
      <div class="mb-4">
        <h2 class="text-xl font-semibold text-neutral-900 mb-4">
          My Tasks ({{ taskStore.sortedTasks.length }})
        </h2>
        <TaskList
          :tasks="taskStore.sortedTasks"
          :loading="taskStore.loading"
          :error="taskStore.error"
          @status-change="handleStatusChange"
          @view-detail="handleViewDetail"
        />
      </div>

      <!-- Task Detail Modal -->
      <TaskDetailModal
        :task="selectedTask"
        :visible="showDetailModal"
        :show-priority-override="false"
        @close="showDetailModal = false"
        @status-change="handleStatusChange"
        @priority-change="handlePriorityChange"
        @edit="handleEditTask"
        @forward="handleForwardTask"
      />

      <!-- Task Edit Modal -->
      <TaskEditModal
        :task="editingTask"
        :visible="showEditModal"
        :auto-save-enabled="false"
        :allow-due-date-edit="true"
        @close="showEditModal = false"
        @save="handleSaveEdit"
      />

      <!-- Task Forward Modal -->
      <TaskForwardModal
        :task="forwardingTask"
        :visible="showForwardModal"
        @close="showForwardModal = false"
        @forward="handleForward"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useTaskStore } from '../store/tasks'
import { useNotificationStore } from '../store/notifications'
import type { TaskStatus, Task, TaskPriority } from '../models/Task'
import type { Notification as AppNotification } from '../models/Notification'
import TaskList from '../components/TaskList.vue'
import TaskDetailModal from '../components/TaskDetailModal.vue'
import TaskEditModal from '../components/TaskEditModal.vue'
import TaskForwardModal from '../components/TaskForwardModal.vue'
import TaskProgressChart from '../components/charts/TaskProgressChart.vue'
import PriorityDistributionChart from '../components/charts/PriorityDistributionChart.vue'

const router = useRouter()
const authStore = useAuthStore()
const taskStore = useTaskStore()
const notificationStore = useNotificationStore()

const isRefreshing = ref(false)
const showDetailModal = ref(false)
const showEditModal = ref(false)
const showForwardModal = ref(false)
const showNotifications = ref(false)
const selectedTask = ref<Task | null>(null)
const editingTask = ref<Task | null>(null)
const forwardingTask = ref<Task | null>(null)
let refreshInterval: number | null = null

const openTasksCount = computed(() => {
  return taskStore.tasks.filter(
    task => task.status === 'pending' || task.status === 'in_progress'
  ).length
})

const dueTodayCount = computed(() => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return taskStore.tasks.filter(task => {
    const deadline = new Date(task.deadline)
    return deadline >= now && deadline < tomorrow && task.status !== 'completed'
  }).length
})

const overdueCount = computed(() => {
  const now = new Date()
  return taskStore.tasks.filter(task => {
    const deadline = new Date(task.deadline)
    return deadline < now && task.status !== 'completed'
  }).length
})

const forwardedTasks = computed(() => {
  if (!authStore.user) return []
  return taskStore.tasks.filter(task => {
    // Tasks that were forwarded from current user
    return task.forwardedFrom === authStore.user?.id && task.assignedTo !== authStore.user?.id
  })
})

async function refreshData() {
  isRefreshing.value = true
  try {
    await taskStore.refreshPriorities()
    await taskStore.loadTasks()
    await notificationStore.loadNotifications()
  } finally {
    isRefreshing.value = false
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  await refreshData()

  // Enable real-time notifications
  await notificationStore.enableRealTime()

  // Auto-refresh every 30 seconds
  refreshInterval = window.setInterval(async () => {
    await refreshData()
  }, 30000)
})

onUnmounted(() => {
  if (refreshInterval !== null) {
    clearInterval(refreshInterval)
  }
  notificationStore.disableRealTime()
})

async function handleStatusChange(taskId: string, status: TaskStatus) {
  await taskStore.updateTaskStatus(taskId, status)
  await notificationStore.loadNotifications()
}

async function handlePriorityChange(taskId: string, priority: TaskPriority) {
  try {
    await taskStore.overridePriority(taskId, priority)
    await notificationStore.loadNotifications()
    // Refresh the selected task
    const updatedTask = taskStore.tasks.find(t => t.id === taskId)
    if (updatedTask && selectedTask.value?.id === taskId) {
      selectedTask.value = updatedTask
    }
  } catch (error) {
    console.error('Failed to change priority:', error)
  }
}

function handleNotificationClick(notification: AppNotification) {
  notificationStore.markAsRead(notification.id)
  showNotifications.value = false

  // If notification has a taskId, open the task detail
  if (notification.taskId) {
    const task = taskStore.tasks.find(t => t.id === notification.taskId)
    if (task) {
      selectedTask.value = task
      showDetailModal.value = true
    }
  }
}

async function handleMarkAllRead() {
  await notificationStore.markAllAsRead()
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

function handleViewDetail(taskId: string) {
  const task = taskStore.tasks.find(t => t.id === taskId)
  if (task) {
    selectedTask.value = task
    showDetailModal.value = true
  }
}

function handleEditTask(task: Task) {
  editingTask.value = task
  showDetailModal.value = false
  showEditModal.value = true
}

async function handleSaveEdit(updatedTask: Task) {
  try {
    await taskStore.updateTask(updatedTask)
    await notificationStore.loadNotifications()
    showEditModal.value = false
    // Refresh the selected task if it's the same one
    if (selectedTask.value?.id === updatedTask.id) {
      selectedTask.value = updatedTask
      showDetailModal.value = true
    }
  } catch (error) {
    console.error('Failed to save task:', error)
  }
}

function handleForwardTask(task: Task) {
  forwardingTask.value = task
  showDetailModal.value = false
  showForwardModal.value = true
}

async function handleForward(taskId: string, recipientId: string, forwardingNote?: string) {
  try {
    await taskStore.forwardTask(taskId, recipientId, forwardingNote)
    await notificationStore.loadNotifications()
    showForwardModal.value = false
    forwardingTask.value = null
    // Refresh tasks
    await taskStore.loadTasks()
  } catch (error) {
    console.error('Failed to forward task:', error)
  }
}
</script>
