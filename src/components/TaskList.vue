<template>
  <div class="space-y-4">
    <div v-if="loading && tasks.length === 0" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-start"></div>
      <p class="mt-3 text-neutral-500 font-medium">Loading tasks...</p>
    </div>

    <div v-else-if="tasks.length === 0" class="text-center py-12">
      <div class="inline-block p-4 bg-neutral-100 rounded-card">
        <svg class="w-12 h-12 text-neutral-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-neutral-500 font-medium">No tasks found</p>
      </div>
    </div>

    <div v-else class="space-y-3">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :loading="loading"
        :show-priority-override="showPriorityOverride"
        @status-change="handleStatusChange"
        @priority-override="handlePriorityOverride"
        @view-detail="handleViewDetail"
      />
    </div>

    <div v-if="error" class="p-4 bg-red-50 border border-red-200 text-danger rounded-card">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span class="font-medium">{{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskStatus } from '../models/Task'
import TaskCard from './TaskCard.vue'

interface Props {
  tasks: Task[]
  loading?: boolean
  error?: string | null
  showPriorityOverride?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  showPriorityOverride: false
})

const emit = defineEmits<{
  statusChange: [taskId: string, status: TaskStatus]
  priorityOverride: [taskId: string]
  viewDetail: [taskId: string]
}>()

function handleStatusChange(taskId: string, status: TaskStatus) {
  emit('statusChange', taskId, status)
}

function handlePriorityOverride(taskId: string) {
  emit('priorityOverride', taskId)
}

function handleViewDetail(taskId: string) {
  emit('viewDetail', taskId)
}
</script>
