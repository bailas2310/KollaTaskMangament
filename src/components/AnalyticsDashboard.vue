<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-neutral-900">Analytics Dashboard</h2>
      <button
        @click="exportAllData"
        class="px-4 py-2 text-sm bg-gradient-primary text-white rounded-button hover:shadow-card transition-smooth font-medium"
      >
        Export All Data
      </button>
    </div>

    <!-- Chart Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Task Completion Chart -->
      <TaskCompletionChart :tasks="tasks" />

      <!-- Active Tasks Chart -->
      <ActiveTasksChart :tasks="tasks" />

      <!-- Task Status Overview -->
      <TaskStatusChart :tasks="tasks" />

      <!-- Priority Distribution Horizontal -->
      <PriorityDistributionHorizontalChart :tasks="tasks" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '../models/Task'
import TaskCompletionChart from './charts/TaskCompletionChart.vue'
import ActiveTasksChart from './charts/ActiveTasksChart.vue'
import TaskStatusChart from './charts/TaskStatusChart.vue'
import PriorityDistributionHorizontalChart from './charts/PriorityDistributionHorizontalChart.vue'

interface Props {
  tasks: Task[]
}

const props = defineProps<Props>()

function exportAllData() {
  // Collect all chart data
  const completedTasks = props.tasks.filter(t => t.status === 'completed')
  const pendingTasks = props.tasks.filter(t => t.status === 'pending')
  const inProgressTasks = props.tasks.filter(t => t.status === 'in_progress')
  const overdueTasks = props.tasks.filter(t => {
    const deadline = new Date(t.deadline)
    return deadline < new Date() && t.status !== 'completed'
  })
  
  const immediateTasks = props.tasks.filter(t => t.priority === 'immediate')
  const mediumTasks = props.tasks.filter(t => t.priority === 'medium')
  const longTasks = props.tasks.filter(t => t.priority === 'long')

  const csv = [
    ['Analytics Dashboard Export'],
    ['Generated:', new Date().toLocaleString()],
    [''],
    ['Task Status Overview'],
    ['Status', 'Count'],
    ['Completed', completedTasks.length.toString()],
    ['In Progress', inProgressTasks.length.toString()],
    ['Pending', pendingTasks.length.toString()],
    ['Overdue', overdueTasks.length.toString()],
    [''],
    ['Priority Distribution'],
    ['Priority', 'Count'],
    ['Immediate (≤8h)', immediateTasks.length.toString()],
    ['Medium (8-32h)', mediumTasks.length.toString()],
    ['Long-term (>32h)', longTasks.length.toString()],
    [''],
    ['Active Tasks Breakdown'],
    ['Status', 'Count'],
    ['To Do', pendingTasks.length.toString()],
    ['In Progress', inProgressTasks.length.toString()],
    ['Under Review', props.tasks.filter(t => t.status === 'in_progress' && t.completedSteps && t.totalSteps && t.completedSteps === t.totalSteps).length.toString()],
    [''],
    ['Task Details'],
    ['ID', 'Title', 'Status', 'Priority', 'Assigned To', 'Deadline', 'Created At'],
    ...props.tasks.map(task => [
      task.id,
      task.title,
      task.status,
      task.priority,
      task.assignedTo || 'Unassigned',
      new Date(task.deadline).toLocaleString(),
      new Date(task.createdAt).toLocaleString()
    ])
  ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics-dashboard-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}
</script>

