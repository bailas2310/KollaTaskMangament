<template>
  <div class="min-h-screen bg-neutral-50">
    <header class="bg-white shadow-soft border-b border-neutral-100">
      <div class="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-bold text-neutral-900">Manager Dashboard</h1>
              <span
                v-if="isLive"
                class="relative flex h-3 w-3"
                title="Live updates active"
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
                class="relative px-4 py-2 text-sm text-neutral-700 hover:text-neutral-900 border border-neutral-100 rounded-button hover:bg-neutral-50 transition-smooth font-medium"
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
            <div class="flex gap-2">
              <button
                @click="router.push({ name: 'users' })"
                class="px-4 py-2 text-sm text-neutral-700 border border-neutral-100 rounded-button hover:bg-neutral-50 transition-smooth font-medium"
                title="View All Users"
              >
                <svg class="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Users
              </button>
              <button
                @click="showUserModal = true"
                class="px-4 py-2 text-sm text-white bg-gradient-primary rounded-button hover:shadow-card transition-smooth font-medium"
              >
                Create User
              </button>
              <!-- Settings button commented out -->
              <!-- <button
                @click="showAdminSettings = true"
                class="px-4 py-2 text-sm text-neutral-700 border border-neutral-100 rounded-button hover:bg-neutral-50 transition-smooth font-medium"
                title="Admin Settings"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button> -->
            </div>
            <button
              @click="handleLogout"
              class="px-4 py-2 text-sm text-neutral-700 hover:text-neutral-900 border border-neutral-100 rounded-button hover:bg-neutral-50 transition-smooth font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <!-- Dashboard Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div class="bg-white rounded-card shadow-soft p-6 border-l-4 border-danger transition-smooth hover:shadow-card">
          <h3 class="text-sm font-medium text-neutral-500 mb-2">Immediate Priority</h3>
          <p class="text-3xl font-bold text-danger">{{ taskStore.immediateTasks.length }}</p>
          <p class="text-xs text-neutral-500 mt-1">Tasks due within 8 hours</p>
        </div>
        <div class="bg-white rounded-card shadow-soft p-6 border-l-4 border-warning transition-smooth hover:shadow-card">
          <h3 class="text-sm font-medium text-neutral-500 mb-2">Medium Priority</h3>
          <p class="text-3xl font-bold text-warning">{{ taskStore.mediumTasks.length }}</p>
          <p class="text-xs text-neutral-500 mt-1">Tasks due in 8-32 hours</p>
        </div>
        <div class="bg-white rounded-card shadow-soft p-6 border-l-4 border-success transition-smooth hover:shadow-card">
          <h3 class="text-sm font-medium text-neutral-500 mb-2">Long Priority</h3>
          <p class="text-3xl font-bold text-success">{{ taskStore.longTasks.length }}</p>
          <p class="text-xs text-neutral-500 mt-1">Tasks due after 32 hours</p>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <TaskProgressChart :tasks="taskStore.tasks" />
        <PriorityDistributionChart :tasks="taskStore.tasks" />
      </div>

      <!-- Tasks Table -->
      <div class="max-w-7xl mx-auto mb-6 sm:mb-8">
        <div class="mb-4 flex justify-between items-center flex-wrap gap-3">
          <button
            @click="showCreateModal = true"
            class="px-4 py-2 text-sm bg-gradient-primary text-white rounded-button hover:shadow-card transition-smooth font-medium flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Task
          </button>
          <button
            @click="handleRefresh"
            :disabled="taskStore.loading"
            class="px-4 py-2 text-sm bg-gradient-primary text-white rounded-button hover:shadow-card disabled:opacity-50 transition-smooth font-medium"
          >
            Refresh Priorities
          </button>
        </div>
        <TaskTable
          :tasks="taskStore.tasks"
          :loading="taskStore.loading"
          @status-change="handleStatusChange"
          @priority-override="handlePriorityOverrideClick"
          @bulk-status-change="handleBulkStatusChange"
          @view-detail="handleViewDetail"
        />
      </div>

      <!-- Priority Override Modal -->
      <div
        v-if="showPriorityModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-smooth"
        @click="showPriorityModal = false"
      >
        <div
          class="bg-white rounded-card shadow-card p-6 w-full max-w-md transition-smooth"
          @click.stop
        >
          <h3 class="text-lg font-semibold mb-4 text-neutral-900">Override Priority</h3>
          <div class="space-y-3">
            <button
              v-for="priority in ['immediate', 'medium', 'long'] as const"
              :key="priority"
              @click="handlePriorityOverride(priority)"
              :class="[
                'w-full px-4 py-3 rounded-button border-2 transition-smooth font-medium',
                selectedPriority === priority
                  ? 'border-primary-start bg-gradient-primary text-white shadow-soft'
                  : 'border-neutral-100 bg-white text-neutral-900 hover:border-primary-start hover:shadow-soft'
              ]"
            >
              {{ priority.charAt(0).toUpperCase() + priority.slice(1) }}
            </button>
          </div>
          <div class="mt-6 flex gap-3">
            <button
              @click="handleConfirmPriority"
              class="flex-1 px-4 py-2 bg-gradient-primary text-white rounded-button hover:shadow-card transition-smooth font-medium"
            >
              Confirm
            </button>
            <button
              @click="showPriorityModal = false"
              class="flex-1 px-4 py-2 border border-neutral-100 rounded-button hover:bg-neutral-50 transition-smooth font-medium text-neutral-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Task Detail Modal -->
      <TaskDetailModal
        :task="selectedTask"
        :visible="showDetailModal"
        :show-priority-override="true"
        @close="showDetailModal = false"
        @status-change="handleStatusChange"
        @priority-override="handlePriorityOverrideClick"
        @priority-change="handlePriorityChangeFromDetail"
        @edit="handleEditTask"
        @forward="handleForwardTask"
        @delete="handleDeleteTask"
        @deadline-override="handleDeadlineOverride"
      />

      <!-- Task Edit Modal (for assigned users) -->
      <TaskEditModal
        :task="userEditingTask"
        :visible="showUserEditModal"
        :auto-save-enabled="false"
        :allow-due-date-edit="true"
        @close="showUserEditModal = false"
        @save="handleSaveUserEdit"
      />

      <!-- Task Create/Edit Modal -->
      <TaskCreateEditModal
        :visible="showCreateModal || showEditModal"
        :task="editingTask"
        :tenant-id="authStore.user?.tenantId || 'tenant-1'"
        @close="handleCloseCreateEditModal"
        @save="handleCreateTask"
        @update="handleUpdateTask"
      />
      <UserCreateModal
        :visible="showUserModal"
        @close="showUserModal = false"
        @created="handleUserCreated"
      />
      <!-- AdminSettingsModal commented out -->
      <!-- <AdminSettingsModal
        :visible="showAdminSettings"
        @close="showAdminSettings = false"
      /> -->
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useTaskStore } from '../store/tasks'
import { useNotificationStore } from '../store/notifications'
import { useActivityStore } from '../store/activity'
import { useUserStore } from '../store/users'
import type { TaskStatus, TaskPriority } from '../models/Task'
// import { useAdminSettingsStore } from '../store/adminSettings'
import type { Notification } from '../models/Notification'
import TaskTable from '../components/TaskTable.vue'
import TaskProgressChart from '../components/charts/TaskProgressChart.vue'
import PriorityDistributionChart from '../components/charts/PriorityDistributionChart.vue'
import TaskEditModal from '../components/TaskEditModal.vue'
import TaskForwardModal from '../components/TaskForwardModal.vue'
// import AdminSettingsModal from '../components/AdminSettingsModal.vue'
import TaskDetailModal from '../components/TaskDetailModal.vue'
import TaskCreateEditModal from '../components/TaskCreateEditModal.vue'
import UserCreateModal from '../components/UserCreateModal.vue'
import type { Task } from '../models/Task'

const router = useRouter()
const authStore = useAuthStore()
const taskStore = useTaskStore()
const notificationStore = useNotificationStore()
const activityStore = useActivityStore()
const userStore = useUserStore()

const showNotifications = ref(false)
const showPriorityModal = ref(false)
const showDetailModal = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showUserModal = ref(false)
// const showAdminSettings = ref(false)
const showUserEditModal = ref(false)
const showForwardModal = ref(false)
const selectedTaskId = ref<string | null>(null)
const selectedTask = ref<Task | null>(null)
const editingTask = ref<Task | null>(null)
const userEditingTask = ref<Task | null>(null)
const forwardingTask = ref<Task | null>(null)
const selectedPriority = ref<TaskPriority>('medium')
const isLive = ref(true)

let refreshInterval: number | null = null

onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.isManager) {
    router.push('/login')
    return
  }

  await taskStore.loadTasks()
  await notificationStore.loadNotifications()
  await activityStore.loadActivities()
  await userStore.loadUsers()

  // Enable real-time notifications
  await notificationStore.enableRealTime()

  // Auto-refresh every 20 seconds (between 15-30)
  refreshInterval = window.setInterval(async () => {
    await taskStore.refreshPriorities()
    await taskStore.loadTasks()
    await notificationStore.loadNotifications()
    await activityStore.loadActivities()
  }, 20000)
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
  await activityStore.loadActivities()
}

async function handleBulkStatusChange(taskIds: string[], status: TaskStatus) {
  await taskStore.bulkUpdateStatus(taskIds, status)
  await notificationStore.loadNotifications()
  await activityStore.loadActivities()
}

async function handleRefresh() {
  await taskStore.refreshPriorities()
  await taskStore.loadTasks()
  await activityStore.loadActivities()
}

function handleNotificationClick(notification: Notification) {
  notificationStore.markAsRead(notification.id)
  showNotifications.value = false
}

async function handleMarkAllRead() {
  await notificationStore.markAllAsRead()
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString()
}

function handlePriorityOverrideClick(taskId: string) {
  selectedTaskId.value = taskId
  const task = taskStore.tasks.find(t => t.id === taskId)
  if (task) {
    selectedPriority.value = task.priority
  }
  showPriorityModal.value = true
}

function handlePriorityOverride(priority: TaskPriority) {
  selectedPriority.value = priority
}

async function handleConfirmPriority() {
  if (selectedTaskId.value) {
    await taskStore.overridePriority(selectedTaskId.value, selectedPriority.value)
    await activityStore.loadActivities()
    showPriorityModal.value = false
    selectedTaskId.value = null
  }
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

async function handleCreateTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'priority'>) {
  await taskStore.createTask(task)
  await activityStore.loadActivities()
  showCreateModal.value = false
}

async function handleUpdateTask(task: Task) {
  await taskStore.updateTask(task)
  await activityStore.loadActivities()
  showEditModal.value = false
  editingTask.value = null
}

function handleEditTask(task: Task) {
  if (!authStore.user) return
  
  // Admins (managers) can edit any task using the full edit modal
  if (authStore.isManager) {
    editingTask.value = task
    showDetailModal.value = false
    showEditModal.value = true
  } 
  // Regular users can only edit tasks assigned to them using the restricted edit modal
  else if (task.assignedTo === authStore.user.id) {
    userEditingTask.value = task
    showDetailModal.value = false
    showUserEditModal.value = true
  }
}

async function handleSaveUserEdit(updatedTask: Task) {
  try {
    await taskStore.updateTask(updatedTask)
    await notificationStore.loadNotifications()
    await activityStore.loadActivities()
    showUserEditModal.value = false
    userEditingTask.value = null
    // Refresh the selected task if it's the same one
    if (selectedTask.value?.id === updatedTask.id) {
      selectedTask.value = updatedTask
      showDetailModal.value = true
    }
  } catch (error) {
    console.error('Failed to save task:', error)
  }
}

async function handlePriorityChange(taskId: string, priority: TaskPriority) {
  try {
    await taskStore.overridePriority(taskId, priority)
    await notificationStore.loadNotifications()
    await activityStore.loadActivities()
    // Refresh the selected task if it's the same one
    const updatedTask = taskStore.tasks.find(t => t.id === taskId)
    if (updatedTask && selectedTask.value?.id === taskId) {
      selectedTask.value = updatedTask
    }
  } catch (error) {
    console.error('Failed to change priority:', error)
  }
}

async function handlePriorityChangeFromDetail(taskId: string, priority: TaskPriority) {
  await handlePriorityChange(taskId, priority)
}

function handleForwardTask(task: Task) {
  selectedTask.value = task
  showDetailModal.value = false
  showForwardModal.value = true
}

async function handleForward(taskId: string, recipientId: string, forwardingNote?: string) {
  try {
    await taskStore.forwardTask(taskId, recipientId, forwardingNote)
    await notificationStore.loadNotifications()
    await activityStore.loadActivities()
    showForwardModal.value = false
    forwardingTask.value = null
    // Refresh tasks
    await taskStore.loadTasks()
  } catch (error) {
    console.error('Failed to forward task:', error)
  }
}

function handleCloseCreateEditModal() {
  showCreateModal.value = false
  showEditModal.value = false
  editingTask.value = null
}

async function handleUserCreated() {
  await userStore.loadUsers()
}

async function handleDeleteTask(taskId: string) {
  if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
    return
  }

  try {
    await taskStore.deleteTask(taskId)
    await notificationStore.loadNotifications()
    await activityStore.loadActivities()
    showDetailModal.value = false
    selectedTask.value = null
  } catch (error) {
    console.error('Failed to delete task:', error)
    alert('Failed to delete task. Please try again.')
  }
}

async function handleDeadlineOverride(taskId: string, newDeadline: Date) {
  try {
    await taskStore.overrideDeadline(taskId, newDeadline)
    await notificationStore.loadNotifications()
    await activityStore.loadActivities()
    if (selectedTask.value && selectedTask.value.id === taskId) {
      selectedTask.value.deadline = newDeadline
    }
  } catch (error) {
    console.error('Failed to override deadline:', error)
    alert('Failed to override deadline. Please try again.')
  }
}
</script>
