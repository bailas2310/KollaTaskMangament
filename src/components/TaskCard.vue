<template>
  <div
    :class="[
      'bg-white rounded-card shadow-soft p-4 sm:p-5 border-l-4 transition-smooth hover:shadow-card-hover cursor-pointer touch-manipulation',
      priorityClass
    ]"
    @click="$emit('viewDetail', task.id)"
  >
    <div class="flex justify-between items-start mb-3">
      <h3 class="text-lg font-semibold text-neutral-900">{{ task.title }}</h3>
      <span
        :class="[
          'px-3 py-1 rounded-button text-xs font-semibold transition-smooth',
          priorityBadgeClass
        ]"
      >
        {{ priorityLabel }}
      </span>
    </div>

    <p class="text-neutral-500 text-sm mb-4 leading-relaxed">{{ task.description }}</p>

    <!-- Progress Bar -->
    <div class="mb-4">
      <div class="flex justify-between items-center mb-1">
        <span class="text-xs font-medium text-neutral-600">Progress</span>
        <span class="text-xs font-semibold text-neutral-900">
          {{ progressPercentage }}%
          <span v-if="task.totalSteps" class="text-neutral-500 font-normal">
            ({{ task.completedSteps || 0 }}/{{ task.totalSteps }})
          </span>
        </span>
      </div>
      <div class="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
        <div
          :class="[
            'h-full transition-all duration-300 rounded-full',
            progressBarColor
          ]"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
    </div>

    <div class="flex flex-wrap gap-3 mb-4 text-xs text-neutral-500">
      <span class="flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ task.duration }}h
      </span>
      <span>•</span>
      <span class="flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {{ formattedDeadline }}
      </span>
      <span v-if="task.assignedTo">•</span>
      <span v-if="task.assignedTo" class="flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Assigned
      </span>
    </div>

    <div class="flex items-center justify-between pt-4 border-t border-neutral-100">
      <select
        :value="task.status"
        @change="handleStatusChange"
        @click.stop
        :disabled="loading"
        class="px-3 py-2 border border-neutral-100 rounded-button text-sm focus:ring-2 focus:ring-primary-start focus:border-transparent disabled:opacity-50 transition-smooth outline-none bg-white"
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      <div class="flex items-center gap-2">
        <button
          v-if="showPriorityOverride"
          @click.stop="handlePriorityOverride"
          class="px-3 py-1.5 text-xs bg-gradient-primary text-white rounded-button hover:shadow-soft transition-smooth font-medium"
        >
          Override Priority
        </button>
        <div v-if="task.priorityOverridden" class="text-xs text-warning font-medium flex items-center gap-1">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Overridden
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task, TaskStatus } from '../models/Task'

interface Props {
  task: Task
  loading?: boolean
  showPriorityOverride?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showPriorityOverride: false
})

const emit = defineEmits<{
  statusChange: [taskId: string, status: TaskStatus]
  priorityOverride: [taskId: string]
  viewDetail: [taskId: string]
}>()

const priorityLabel = computed(() => {
  const labels: Record<Task['priority'], string> = {
    immediate: 'Immediate',
    medium: 'Medium',
    long: 'Long'
  }
  return labels[props.task.priority]
})

const priorityClass = computed(() => {
  const classes: Record<Task['priority'], string> = {
    immediate: 'border-danger',
    medium: 'border-warning',
    long: 'border-success'
  }
  return classes[props.task.priority]
})

const priorityBadgeClass = computed(() => {
  const classes: Record<Task['priority'], string> = {
    immediate: 'bg-red-50 text-danger',
    medium: 'bg-orange-50 text-warning',
    long: 'bg-green-50 text-success'
  }
  return classes[props.task.priority]
})

const progressPercentage = computed(() => {
  // If task has steps, calculate based on steps
  if (props.task.totalSteps && props.task.totalSteps > 0) {
    const stepsProgress = ((props.task.completedSteps || 0) / props.task.totalSteps) * 100
    return Math.min(100, Math.max(0, Math.round(stepsProgress)))
  }
  
  // Otherwise use status-based progress
  const statusProgress: Record<Task['status'], number> = {
    pending: 0,
    in_progress: 50,
    completed: 100
  }
  return statusProgress[props.task.status]
})

const progressBarColor = computed(() => {
  if (props.task.status === 'completed') {
    return 'bg-success'
  } else if (props.task.status === 'in_progress') {
    return 'bg-warning'
  }
  return 'bg-neutral-300'
})

const formattedDeadline = computed(() => {
  const date = new Date(props.task.deadline)
  const now = new Date()
  const hoursUntil = (date.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntil < 0) {
    return 'Overdue'
  } else if (hoursUntil < 1) {
    return `${Math.round(hoursUntil * 60)}m`
  } else if (hoursUntil < 24) {
    return `${Math.round(hoursUntil)}h`
  } else {
    return `${Math.round(hoursUntil / 24)}d`
  }
})

function handleStatusChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('statusChange', props.task.id, target.value as TaskStatus)
}

function handlePriorityOverride() {
  emit('priorityOverride', props.task.id)
}
</script>
