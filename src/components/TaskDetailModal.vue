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
      v-if="visible"
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
          v-if="visible && task"
          class="bg-white rounded-card shadow-card w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-smooth"
          @click.stop
        >
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-neutral-100 p-6 flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h2 class="text-2xl font-bold text-neutral-900">{{ task.title }}</h2>
                <span
                  :class="[
                    'px-3 py-1 rounded-button text-xs font-semibold',
                    getPriorityBadgeClass(task.priority)
                  ]"
                >
                  {{ getPriorityLabel(task.priority) }}
                </span>
              </div>
              <p class="text-sm text-neutral-500">{{ task.description }}</p>
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

          <!-- Content -->
          <div class="p-6 space-y-6">
            <!-- Progress -->
            <div v-if="task.totalSteps">
              <h3 class="text-sm font-semibold text-neutral-900 mb-2">Progress</h3>
              <div class="flex items-center gap-3 mb-2">
                <div class="flex-1 bg-neutral-100 rounded-full h-3 overflow-hidden">
                  <div
                    :class="[
                      'h-full transition-all duration-300 rounded-full',
                      getProgressBarColor()
                    ]"
                    :style="{ width: `${progressPercentage}%` }"
                  ></div>
                </div>
                <span class="text-sm font-semibold text-neutral-900">
                  {{ task.completedSteps || 0 }}/{{ task.totalSteps }} steps
                </span>
              </div>
              <p class="text-xs text-neutral-500">{{ progressPercentage }}% complete</p>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 class="text-xs font-semibold text-neutral-500 uppercase mb-1">Status</h3>
                <span
                  :class="[
                    'inline-block px-3 py-1 rounded-button text-sm font-medium',
                    getStatusBadgeClass(task.status)
                  ]"
                >
                  {{ getStatusLabel(task.status) }}
                </span>
              </div>

              <div>
                <h3 class="text-xs font-semibold text-neutral-500 uppercase mb-1">Duration</h3>
                <p class="text-sm text-neutral-900">{{ task.duration }} hours</p>
              </div>

              <div>
                <h3 class="text-xs font-semibold text-neutral-500 uppercase mb-1">Deadline</h3>
                <p class="text-sm text-neutral-900">{{ formatDeadline(task.deadline) }}</p>
              </div>

              <div>
                <h3 class="text-xs font-semibold text-neutral-500 uppercase mb-1">Created</h3>
                <p class="text-sm text-neutral-900">{{ formatDate(task.createdAt) }}</p>
              </div>

              <div v-if="task.completedAt">
                <h3 class="text-xs font-semibold text-neutral-500 uppercase mb-1">Completed</h3>
                <p class="text-sm text-neutral-900">{{ formatDate(task.completedAt) }}</p>
              </div>

              <div v-if="task.priorityOverridden">
                <h3 class="text-xs font-semibold text-neutral-500 uppercase mb-1">Priority</h3>
                <p class="text-sm text-warning font-medium">Manually Overridden</p>
              </div>

              <div v-if="task.lastEditedBy">
                <h3 class="text-xs font-semibold text-neutral-500 uppercase mb-1">Last Edited</h3>
                <p class="text-sm text-neutral-900">
                  By {{ task.lastEditedByName || 'Unknown' }}<br>
                  <span class="text-xs text-neutral-500">{{ formatDate(task.lastEditedAt!) }}</span>
                </p>
              </div>
            </div>

            <!-- Notes/Comments -->
            <div v-if="task.notes" class="pt-4 border-t border-neutral-100">
              <h3 class="text-sm font-semibold text-neutral-900 mb-2">Notes/Comments</h3>
              <p class="text-sm text-neutral-700 whitespace-pre-wrap">{{ task.notes }}</p>
            </div>

            <!-- Tags -->
            <div v-if="task.tags && task.tags.length > 0" class="pt-4 border-t border-neutral-100">
              <h3 class="text-sm font-semibold text-neutral-900 mb-2">Tags</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in task.tags"
                  :key="tag"
                  class="px-3 py-1 bg-primary-start/10 text-primary-start rounded-button text-sm"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Attachments -->
            <div v-if="task.attachments && task.attachments.length > 0" class="pt-4 border-t border-neutral-100">
              <h3 class="text-sm font-semibold text-neutral-900 mb-2">Attachments</h3>
              <div class="space-y-2">
                <div
                  v-for="(attachment, index) in task.attachments"
                  :key="index"
                  class="flex items-center gap-2 p-2 bg-neutral-50 rounded-button"
                >
                  <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span class="text-sm text-neutral-700 flex-1">{{ attachment }}</span>
                  <a
                    :href="attachment"
                    target="_blank"
                    class="text-primary-start hover:text-primary-end text-sm"
                  >
                    Open
                  </a>
                </div>
              </div>
            </div>

            <!-- Forwarding History -->
            <div v-if="task.forwardingHistory && task.forwardingHistory.length > 0" class="pt-4 border-t border-neutral-100">
              <h3 class="text-sm font-semibold text-neutral-900 mb-3">Forwarding History</h3>
              <div class="space-y-3 max-h-48 overflow-y-auto">
                <div
                  v-for="forward in task.forwardingHistory.slice().reverse()"
                  :key="forward.id"
                  class="p-3 bg-blue-50 rounded-button border-l-4 border-primary-start"
                >
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <p class="text-sm font-medium text-neutral-900">
                        Forwarded from <span class="font-semibold">{{ forward.forwardedFromName }}</span> to <span class="font-semibold">{{ forward.forwardedToName }}</span>
                      </p>
                      <p class="text-xs text-neutral-500">{{ formatDate(forward.forwardedAt) }}</p>
                    </div>
                  </div>
                  <p v-if="forward.forwardingNote" class="text-xs text-neutral-600 mt-1 italic">
                    "{{ forward.forwardingNote }}"
                  </p>
                </div>
              </div>
            </div>

            <!-- Edit History -->
            <div v-if="task.editHistory && task.editHistory.length > 0" class="pt-4 border-t border-neutral-100">
              <h3 class="text-sm font-semibold text-neutral-900 mb-3">Edit History</h3>
              <div class="space-y-3 max-h-48 overflow-y-auto">
                <div
                  v-for="edit in task.editHistory.slice().reverse()"
                  :key="edit.id"
                  class="p-3 bg-neutral-50 rounded-button"
                >
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <p class="text-sm font-medium text-neutral-900">{{ edit.editedByName }}</p>
                      <p class="text-xs text-neutral-500">{{ formatDate(edit.editedAt) }}</p>
                    </div>
                  </div>
                  <div v-if="edit.changes.length > 0" class="space-y-1">
                    <p
                      v-for="(change, index) in edit.changes"
                      :key="index"
                      class="text-xs text-neutral-600"
                    >
                      <span class="font-medium">{{ change.field }}:</span>
                      <span class="line-through text-neutral-400 ml-1">{{ formatChangeValue(change.oldValue) }}</span>
                      <span class="text-success ml-1">→ {{ formatChangeValue(change.newValue) }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="pt-4 border-t border-neutral-100 flex flex-wrap gap-3">
              <select
                :value="task.status"
                @change="handleStatusChange"
                class="px-4 py-2 border border-neutral-100 rounded-button text-sm focus:ring-2 focus:ring-primary-start focus:border-transparent outline-none"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <button
                v-if="canEdit"
                @click="$emit('edit', task)"
                class="px-4 py-2 text-sm bg-gradient-primary text-white rounded-button hover:shadow-card transition-smooth font-medium"
              >
                Edit Task
              </button>
              <button
                v-if="canForward"
                @click="$emit('forward', task)"
                class="px-4 py-2 text-sm border border-neutral-200 text-neutral-700 rounded-button hover:bg-neutral-50 transition-smooth font-medium"
              >
                Forward Task
              </button>
              <button
                v-if="showPriorityOverride"
                @click="$emit('priorityOverride', task.id)"
                class="px-4 py-2 text-sm bg-gradient-primary text-white rounded-button hover:shadow-card transition-smooth font-medium"
              >
                Override Priority
              </button>
              <button
                v-if="isManager"
                @click="showDeadlineOverride = true"
                class="px-4 py-2 text-sm border border-neutral-200 text-neutral-700 rounded-button hover:bg-neutral-50 transition-smooth font-medium"
              >
                Override Deadline
              </button>
              <button
                v-if="isManager"
                @click="showDeleteConfirm = true"
                class="px-4 py-2 text-sm bg-danger text-white rounded-button hover:shadow-card transition-smooth font-medium"
              >
                Delete Task
              </button>
              <select
                v-if="canChangePriority && canEdit"
                :value="task.priority"
                @change="handlePriorityChange"
                class="px-4 py-2 border border-neutral-100 rounded-button text-sm focus:ring-2 focus:ring-primary-start focus:border-transparent outline-none"
              >
                <option value="immediate">High (Immediate)</option>
                <option value="medium">Medium</option>
                <option value="long">Low (Long-term)</option>
              </select>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>

  <!-- Delete Confirmation Modal -->
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
      @click="showDeleteConfirm = false"
    >
      <div
        class="bg-white rounded-card shadow-card p-6 max-w-md w-full"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-neutral-900 mb-2">Delete Task</h3>
        <p class="text-sm text-neutral-600 mb-6">
          Are you sure you want to delete "{{
            task?.title
          }}"? This action cannot be undone.
        </p>
        <div class="flex gap-3">
          <button
            @click="showDeleteConfirm = false"
            class="flex-1 px-4 py-2 border border-neutral-200 rounded-button hover:bg-neutral-50 transition-smooth font-medium text-neutral-700"
          >
            Cancel
          </button>
          <button
            @click="handleDelete"
            class="flex-1 px-4 py-2 bg-danger text-white rounded-button hover:shadow-card transition-smooth font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Deadline Override Modal -->
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="showDeadlineOverride"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
      @click="showDeadlineOverride = false"
    >
      <div
        class="bg-white rounded-card shadow-card p-6 max-w-md w-full"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-neutral-900 mb-2">Override Deadline</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-neutral-900 mb-2">
            New Deadline
          </label>
          <input
            v-model="newDeadline"
            type="datetime-local"
            required
            class="w-full px-4 py-2 border border-neutral-200 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent outline-none"
          />
        </div>
        <div class="flex gap-3">
          <button
            @click="showDeadlineOverride = false"
            class="flex-1 px-4 py-2 border border-neutral-200 rounded-button hover:bg-neutral-50 transition-smooth font-medium text-neutral-700"
          >
            Cancel
          </button>
          <button
            @click="handleDeadlineOverride"
            :disabled="!newDeadline"
            class="flex-1 px-4 py-2 bg-gradient-primary text-white rounded-button hover:shadow-card disabled:opacity-50 disabled:cursor-not-allowed transition-smooth font-medium"
          >
            Override
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '../store/auth'
import { useAdminSettingsStore } from '../store/adminSettings'
import type { Task, TaskStatus, TaskPriority } from '../models/Task'

interface Props {
  task: Task | null
  visible: boolean
  showPriorityOverride?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showPriorityOverride: false
})

const emit = defineEmits<{
  close: []
  statusChange: [taskId: string, status: TaskStatus]
  priorityOverride: [taskId: string]
  priorityChange: [taskId: string, priority: TaskPriority]
  edit: [task: Task]
  forward: [task: Task]
  delete: [taskId: string]
  deadlineOverride: [taskId: string, newDeadline: Date]
}>()

const authStore = useAuthStore()
const adminSettingsStore = useAdminSettingsStore()

const isManager = computed(() => authStore.isManager)
const showDeleteConfirm = ref(false)
const showDeadlineOverride = ref(false)
const newDeadline = ref<Date | null>(null)

// Check if current user can edit this task
const canEdit = computed(() => {
  if (!props.task || !authStore.user) return false
  // Admins (managers) can edit any task
  if (authStore.isManager) return true
  // Regular users can only edit tasks assigned to them
  return props.task.assignedTo === authStore.user.id
})

// Check if current user can change priority
const canChangePriority = computed(() => {
  if (!props.task || !authStore.user) return false
  // Managers can always change priority
  if (authStore.isManager) return true
  // Regular users can only if admin allows and task is assigned to them
  return adminSettingsStore.canUsersChangePriority && canEdit.value
})

// Check if current user can forward this task
const canForward = computed(() => {
  if (!props.task || !authStore.user) return false
  // Must be assigned to current user
  if (props.task.assignedTo !== authStore.user.id) return false
  // Check if admin allows forwarding
  return adminSettingsStore.canUsersForwardTasks
})

const progressPercentage = computed(() => {
  if (!props.task?.totalSteps || props.task.totalSteps === 0) {
    const statusProgress: Record<Task['status'], number> = {
      pending: 0,
      in_progress: 50,
      completed: 100
    }
    return statusProgress[props.task?.status || 'pending']
  }
  return Math.round(((props.task.completedSteps || 0) / props.task.totalSteps) * 100)
})

function getProgressBarColor(): string {
  if (!props.task) return 'bg-neutral-300'
  if (props.task.status === 'completed') return 'bg-success'
  if (props.task.status === 'in_progress') return 'bg-warning'
  return 'bg-neutral-300'
}

function getPriorityLabel(priority: TaskPriority): string {
  const labels: Record<TaskPriority, string> = {
    immediate: 'Immediate',
    medium: 'Medium',
    long: 'Long'
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

function formatDeadline(deadline: Date | string): string {
  const date = new Date(deadline)
  const now = new Date()
  const hoursUntil = (date.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntil < 0) {
    return `Overdue (${date.toLocaleDateString()})`
  } else if (hoursUntil < 24) {
    return `${Math.round(hoursUntil)} hours (${date.toLocaleDateString()})`
  } else {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function handleStatusChange(event: Event) {
  if (!props.task) return
  const target = event.target as HTMLSelectElement
  emit('statusChange', props.task.id, target.value as TaskStatus)
}

function handlePriorityChange(event: Event) {
  if (!props.task) return
  const target = event.target as HTMLSelectElement
  emit('priorityChange', props.task.id, target.value as TaskPriority)
}

function formatChangeValue(value: any): string {
  if (value === null || value === undefined) return 'N/A'
  if (Array.isArray(value)) return value.join(', ')
  if (value instanceof Date) return formatDate(value)
  if (value === 'immediate') return 'High (Immediate)'
  if (value === 'medium') return 'Medium'
  if (value === 'long') return 'Low (Long-term)'
  return String(value)
}

function handleDelete() {
  if (!props.task) return
  emit('delete', props.task.id)
  showDeleteConfirm.value = false
}

function handleDeadlineOverride() {
  if (!props.task || !newDeadline.value) return
  emit('deadlineOverride', props.task.id, newDeadline.value)
  showDeadlineOverride.value = false
  newDeadline.value = null
}
</script>

