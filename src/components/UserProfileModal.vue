<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible && user"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-smooth"
      @click="$emit('close')"
    >
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          class="bg-white rounded-card shadow-card w-full max-w-4xl max-h-[90vh] overflow-y-auto transition-smooth"
          @click.stop
        >
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-neutral-100 p-6">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {{ userInitials }}
                  </div>
                  <div>
                    <h2 class="text-2xl font-bold text-neutral-900">{{ user.name }}</h2>
                    <p class="text-sm text-neutral-500">{{ user.email }}</p>
                  </div>
                  <span
                    :class="[
                      'px-3 py-1 rounded-button text-sm font-semibold',
                      user.role === 'manager' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                    ]"
                  >
                    {{ user.role === 'manager' ? 'Admin' : 'Worker' }}
                  </span>
                </div>
              </div>
              <button
                @click="$emit('close')"
                class="ml-4 p-2 text-neutral-400 hover:text-neutral-600 rounded-button hover:bg-neutral-100 transition-smooth"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-6">
            <!-- Statistics -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="bg-neutral-50 rounded-card p-4 border-l-4 border-primary-start">
                <h3 class="text-sm font-medium text-neutral-500 mb-1">Total Tasks</h3>
                <p class="text-3xl font-bold text-neutral-900">{{ userTasks.length }}</p>
              </div>
              <div class="bg-neutral-50 rounded-card p-4 border-l-4 border-success">
                <h3 class="text-sm font-medium text-neutral-500 mb-1">Completed</h3>
                <p class="text-3xl font-bold text-success">{{ completedTasks.length }}</p>
              </div>
              <div class="bg-neutral-50 rounded-card p-4 border-l-4 border-warning">
                <h3 class="text-sm font-medium text-neutral-500 mb-1">In Progress</h3>
                <p class="text-3xl font-bold text-warning">{{ inProgressTasks.length }}</p>
              </div>
            </div>

            <!-- Tasks Section -->
            <div>
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-neutral-900">Assigned Tasks</h3>
                <div class="flex gap-2">
                  <button
                    v-for="status in ['all', 'pending', 'in_progress', 'completed'] as const"
                    :key="status"
                    @click="taskStatusFilter = status"
                    :class="[
                      'px-3 py-1 rounded-button text-sm font-medium transition-smooth',
                      taskStatusFilter === status
                        ? 'bg-gradient-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    ]"
                  >
                    {{ status === 'all' ? 'All' : status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1) }}
                  </button>
                </div>
              </div>

              <div v-if="filteredTasks.length === 0" class="text-center py-12 bg-neutral-50 rounded-card">
                <svg class="w-12 h-12 text-neutral-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p class="text-neutral-500 font-medium">No tasks found</p>
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="task in filteredTasks"
                  :key="task.id"
                  @click="viewTaskDetail(task)"
                  class="bg-white border border-neutral-200 rounded-card p-4 cursor-pointer transition-smooth hover:shadow-card hover:border-primary-start/30"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                      <h4 class="font-semibold text-neutral-900 mb-1">{{ task.title }}</h4>
                      <p class="text-sm text-neutral-600 line-clamp-2">{{ task.description }}</p>
                    </div>
                    <span
                      :class="[
                        'px-2 py-1 rounded-button text-xs font-semibold ml-2',
                        getPriorityBadgeClass(task.priority)
                      ]"
                    >
                      {{ getPriorityLabel(task.priority) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-4 text-xs text-neutral-500 mt-3">
                    <span
                      :class="[
                        'px-2 py-1 rounded-button',
                        getStatusBadgeClass(task.status)
                      ]"
                    >
                      {{ getStatusLabel(task.status) }}
                    </span>
                    <span>Due: {{ formatDate(task.deadline) }}</span>
                    <span v-if="task.completedAt">Completed: {{ formatDate(task.completedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>

  <!-- Task Detail Modal -->
  <TaskDetailModal
    :task="selectedTask"
    :visible="showTaskDetail"
    :show-priority-override="true"
    @close="showTaskDetail = false"
    @status-change="handleStatusChange"
    @priority-override="handlePriorityOverride"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { User } from '../models/User'
import type { Task, TaskStatus, TaskPriority } from '../models/Task'
import { useTaskStore } from '../store/tasks'
import TaskDetailModal from './TaskDetailModal.vue'

interface Props {
  user: User | null
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const taskStore = useTaskStore()
const taskStatusFilter = ref<'all' | 'pending' | 'in_progress' | 'completed'>('all')
const showTaskDetail = ref(false)
const selectedTask = ref<Task | null>(null)

const userInitials = computed(() => {
  if (!props.user?.name) return ''
  const names = props.user.name.split(' ').filter(n => n.length > 0)
  if (names.length >= 2) {
    const first = names[0]?.[0] || ''
    const second = names[1]?.[0] || ''
    return (first + second).toUpperCase()
  }
  return props.user.name.substring(0, 2).toUpperCase()
})

const userTasks = computed(() => {
  if (!props.user) return []
  return taskStore.tasks.filter(t => t.assignedTo === props.user!.id)
})

const completedTasks = computed(() => {
  return userTasks.value.filter(t => t.status === 'completed')
})

const inProgressTasks = computed(() => {
  return userTasks.value.filter(t => t.status === 'in_progress')
})

const filteredTasks = computed(() => {
  if (taskStatusFilter.value === 'all') {
    return userTasks.value
  }
  return userTasks.value.filter(t => t.status === taskStatusFilter.value)
})

function getPriorityLabel(priority: TaskPriority): string {
  const labels: Record<TaskPriority, string> = {
    immediate: 'High',
    medium: 'Medium',
    long: 'Low'
  }
  return labels[priority]
}

function getPriorityBadgeClass(priority: TaskPriority): string {
  const classes: Record<TaskPriority, string> = {
    immediate: 'bg-red-50 text-danger',
    medium: 'bg-orange-50 text-warning',
    long: 'bg-green-50 text-success'
  }
  return classes[priority]
}

function getStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed'
  }
  return labels[status]
}

function getStatusBadgeClass(status: TaskStatus): string {
  const classes: Record<TaskStatus, string> = {
    pending: 'bg-neutral-100 text-neutral-700',
    in_progress: 'bg-yellow-50 text-warning',
    completed: 'bg-green-50 text-success'
  }
  return classes[status]
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function viewTaskDetail(task: Task) {
  selectedTask.value = task
  showTaskDetail.value = true
}

async function handleStatusChange(taskId: string, status: TaskStatus) {
  await taskStore.updateTaskStatus(taskId, status)
}

function handlePriorityOverride(taskId: string) {
  // Priority override handled by TaskDetailModal
  // Refresh tasks after override
  taskStore.loadTasks()
}
</script>

