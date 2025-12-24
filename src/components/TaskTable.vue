<template>
  <div class="bg-white rounded-card shadow-soft overflow-hidden">
    <!-- Table Header with Search and Bulk Actions -->
    <div class="p-3 xs:p-4 border-b border-neutral-100">
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
        <div class="flex-1 w-full sm:w-auto">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search tasks..."
              class="w-full sm:w-64 px-4 py-2 pl-10 border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent outline-none transition-smooth"
            />
            <svg
              class="absolute left-3 top-2.5 w-5 h-5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div v-if="selectedTasks.length > 0" class="flex items-center gap-2">
          <span class="text-sm text-neutral-600">{{ selectedTasks.length }} selected</span>
          <button
            @click="handleBulkStatusChange('completed')"
            class="px-3 py-1.5 text-xs bg-success text-white rounded-button hover:bg-green-600 transition-smooth font-medium"
          >
            Mark Complete
          </button>
          <button
            @click="clearSelection"
            class="px-3 py-1.5 text-xs border border-neutral-200 rounded-button hover:bg-neutral-50 transition-smooth font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-2">
        <select
          v-model="statusFilter"
          class="px-3 py-1.5 text-sm border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start outline-none"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          v-model="priorityFilter"
          class="px-3 py-1.5 text-sm border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start outline-none"
        >
          <option value="">All Priorities</option>
          <option value="immediate">Immediate</option>
          <option value="medium">Medium</option>
          <option value="long">Long</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto -mx-3 xs:mx-0">
      <table class="w-full min-w-[600px]">
        <thead class="bg-neutral-50 border-b border-neutral-100">
          <tr>
            <th class="px-4 py-3 text-left">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll"
                class="rounded border-neutral-300 text-primary-start focus:ring-primary-start"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              @click="sortBy(column.key)"
              :class="[
                'px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase cursor-pointer hover:bg-neutral-100 transition-smooth',
                sortColumn === column.key && 'bg-neutral-100'
              ]"
            >
              <div class="flex items-center gap-2">
                {{ column.label }}
                <svg
                  v-if="sortColumn === column.key"
                  class="w-4 h-4"
                  :class="sortDirection === 'asc' ? 'rotate-180' : ''"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
              </div>
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100">
          <tr
            v-for="task in paginatedTasks"
            :key="task.id"
            :class="[
              'hover:bg-neutral-50 transition-smooth cursor-pointer',
              selectedTasks.includes(task.id) && 'bg-blue-50'
            ]"
            @click="handleViewDetail(task.id)"
          >
            <td class="px-4 py-3">
              <input
                type="checkbox"
                :checked="selectedTasks.includes(task.id)"
                @change="toggleTaskSelection(task.id)"
                class="rounded border-neutral-300 text-primary-start focus:ring-primary-start"
              />
            </td>
            <td class="px-4 py-3">
              <div class="font-medium text-neutral-900">{{ task.title }}</div>
              <div class="text-sm text-neutral-500">{{ task.description }}</div>
            </td>
            <td class="px-4 py-3">
              <span
                :class="[
                  'px-2 py-1 rounded-button text-xs font-semibold',
                  getPriorityBadgeClass(task.priority)
                ]"
              >
                {{ getPriorityLabel(task.priority) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span
                :class="[
                  'px-2 py-1 rounded-button text-xs font-medium',
                  getStatusBadgeClass(task.status)
                ]"
              >
                {{ getStatusLabel(task.status) }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-neutral-600">
              {{ formatDeadline(task.deadline) }}
            </td>
            <td class="px-4 py-3 text-sm text-neutral-600">
              {{ task.duration }}h
            </td>
            <td class="px-4 py-3" @click.stop>
              <div class="flex items-center gap-2">
                <select
                  :value="task.status"
                  @change="handleStatusChange(task.id, $event)"
                  @click.stop
                  class="px-2 py-1 text-xs border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button
                  @click.stop="handlePriorityOverride(task.id)"
                  class="px-2 py-1 text-xs bg-gradient-primary text-white rounded-button hover:shadow-soft transition-smooth"
                >
                  Override
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredTasks.length === 0">
            <td :colspan="7" class="px-4 py-8 text-center text-neutral-500">
              No tasks found
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="px-3 xs:px-4 py-3 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="text-sm text-neutral-600">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredTasks.length }} tasks
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-1.5 text-sm border border-neutral-100 rounded-button hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
        >
          Previous
        </button>
        <span class="text-sm text-neutral-600">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-1.5 text-sm border border-neutral-100 rounded-button hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task, TaskStatus, TaskPriority } from '../models/Task'

interface Props {
  tasks: Task[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  statusChange: [taskId: string, status: TaskStatus]
  priorityOverride: [taskId: string]
  bulkStatusChange: [taskIds: string[], status: TaskStatus]
  viewDetail: [taskId: string]
}>()

const searchQuery = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const selectedTasks = ref<string[]>([])
const sortColumn = ref<string>('deadline')
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const pageSize = ref(10)

const columns = [
  { key: 'title', label: 'Task' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'deadline', label: 'Deadline' },
  { key: 'duration', label: 'Duration' }
]

const filteredTasks = computed(() => {
  let result = [...props.tasks]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (statusFilter.value) {
    result = result.filter(task => task.status === statusFilter.value)
  }

  // Priority filter
  if (priorityFilter.value) {
    result = result.filter(task => task.priority === priorityFilter.value)
  }

  // Sorting
  result.sort((a, b) => {
    let aVal: any = a[sortColumn.value as keyof Task]
    let bVal: any = b[sortColumn.value as keyof Task]

    if (sortColumn.value === 'deadline') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return result
})

const totalPages = computed(() => Math.ceil(filteredTasks.value.length / pageSize.value))

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTasks.value.slice(start, end)
})

const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, filteredTasks.value.length))

const allSelected = computed(() => {
  return paginatedTasks.value.length > 0 && paginatedTasks.value.every(task => selectedTasks.value.includes(task.id))
})

function sortBy(column: string) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
  currentPage.value = 1
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedTasks.value = selectedTasks.value.filter(
      id => !paginatedTasks.value.some(task => task.id === id)
    )
  } else {
    paginatedTasks.value.forEach(task => {
      if (!selectedTasks.value.includes(task.id)) {
        selectedTasks.value.push(task.id)
      }
    })
  }
}

function toggleTaskSelection(taskId: string) {
  const index = selectedTasks.value.indexOf(taskId)
  if (index > -1) {
    selectedTasks.value.splice(index, 1)
  } else {
    selectedTasks.value.push(taskId)
  }
}

function clearSelection() {
  selectedTasks.value = []
}

function handleStatusChange(taskId: string, event: Event) {
  const target = event.target as HTMLSelectElement
  emit('statusChange', taskId, target.value as TaskStatus)
}

function handlePriorityOverride(taskId: string) {
  emit('priorityOverride', taskId)
}

function handleViewDetail(taskId: string) {
  emit('viewDetail', taskId)
}

function handleBulkStatusChange(status: TaskStatus) {
  if (selectedTasks.value.length > 0) {
    emit('bulkStatusChange', [...selectedTasks.value], status)
    clearSelection()
  }
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
    return 'Overdue'
  } else if (hoursUntil < 24) {
    return `${Math.round(hoursUntil)}h`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}
</script>

