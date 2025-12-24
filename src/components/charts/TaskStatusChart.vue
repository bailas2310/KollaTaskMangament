<template>
  <div class="bg-white rounded-card shadow-soft p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-neutral-900">Task Status Overview</h3>
      <div class="flex gap-2">
        <select
          v-model="chartType"
          @change="updateChart"
          class="px-3 py-1.5 text-sm border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start outline-none"
        >
          <option value="bar">Bar</option>
          <option value="stacked">Stacked</option>
        </select>
        <button
          @click="exportData"
          class="px-3 py-1.5 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-button transition-smooth"
          title="Export to CSV"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>
    </div>
    <Bar
      :data="chartData"
      :options="chartOptions"
      class="max-h-64"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import type { Task } from '../../models/Task'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface Props {
  tasks: Task[]
}

const props = defineProps<Props>()

const chartType = ref<'bar' | 'stacked'>('bar')

const openCount = computed(() => 
  props.tasks.filter(t => t.status === 'pending').length
)
const inProgressCount = computed(() => 
  props.tasks.filter(t => t.status === 'in_progress').length
)
const completedCount = computed(() => 
  props.tasks.filter(t => t.status === 'completed').length
)
const overdueCount = computed(() => {
  const now = new Date()
  return props.tasks.filter(t => {
    const deadline = new Date(t.deadline)
    return deadline < now && t.status !== 'completed'
  }).length
})

const chartData = computed(() => {
  if (chartType.value === 'stacked') {
    return {
      labels: ['Tasks'],
      datasets: [
        {
          label: 'Completed',
          data: [completedCount.value],
          backgroundColor: '#10b981',
          borderRadius: 8
        },
        {
          label: 'In Progress',
          data: [inProgressCount.value],
          backgroundColor: '#f59e0b',
          borderRadius: 8
        },
        {
          label: 'Pending',
          data: [openCount.value],
          backgroundColor: '#64748b',
          borderRadius: 8
        },
        {
          label: 'Overdue',
          data: [overdueCount.value],
          backgroundColor: '#ef4444',
          borderRadius: 8
        }
      ]
    }
  } else {
    return {
      labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
      datasets: [
        {
          label: 'Tasks',
          data: [completedCount.value, inProgressCount.value, openCount.value, overdueCount.value],
          backgroundColor: [
            '#10b981',
            '#f59e0b',
            '#64748b',
            '#ef4444'
          ],
          borderRadius: 8,
          borderSkipped: false
        }
      ]
    }
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: chartType.value === 'stacked',
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          family: 'Inter',
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        family: 'Inter',
        size: 13
      },
      bodyFont: {
        family: 'Inter',
        size: 12
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      stacked: chartType.value === 'stacked',
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        stepSize: 1,
        font: {
          family: 'Inter'
        }
      }
    },
    x: {
      stacked: chartType.value === 'stacked',
      grid: {
        display: false
      },
      ticks: {
        font: {
          family: 'Inter'
        }
      }
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart' as const
  }
}))

function updateChart() {
  // Chart will automatically update via computed property
}

function exportData() {
  const data = chartData.value
  const csv = [
    ['Status', 'Count'],
    ['Completed', completedCount.value.toString()],
    ['In Progress', inProgressCount.value.toString()],
    ['Pending', openCount.value.toString()],
    ['Overdue', overdueCount.value.toString()]
  ].map(row => row.join(',')).join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `task-status-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}
</script>

