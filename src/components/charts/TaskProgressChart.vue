<template>
  <div class="bg-white rounded-card shadow-soft p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-neutral-900">Task Progress</h3>
      <select
        v-model="selectedPeriod"
        @change="updateChart"
        class="px-3 py-1.5 text-sm border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start outline-none"
      >
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="quarter">Quarter</option>
      </select>
    </div>
    <Line
      :data="chartData"
      :options="chartOptions"
      class="max-h-64"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import type { Task } from '../../models/Task'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Props {
  tasks: Task[]
}

const props = defineProps<Props>()

const selectedPeriod = ref<'week' | 'month' | 'quarter'>('week')

const chartData = computed(() => {
  const labels = generateLabels()
  
  // Generate realistic 7-day progress data
  // Start with lower numbers and gradually increase completed tasks
  const baseCompleted = 25
  const baseInProgress = 15
  const basePending = 20
  
  const completed = labels.map((_, index) => {
    // Gradual increase in completed tasks over time
    const trend = Math.floor((index / labels.length) * 15)
    return baseCompleted + trend + Math.floor(Math.random() * 5) - 2
  })
  
  const inProgress = labels.map((_, index) => {
    // Slight variation but relatively stable
    return baseInProgress + Math.floor(Math.random() * 6) - 3
  })
  
  const pending = labels.map((_, index) => {
    // Decrease as tasks get completed
    const trend = Math.floor((index / labels.length) * -8)
    return Math.max(10, basePending + trend + Math.floor(Math.random() * 4) - 2)
  })

  return {
    labels,
    datasets: [
      {
        label: 'Completed',
        data: completed,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'In Progress',
        data: inProgress,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Pending',
        data: pending,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
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
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        font: {
          family: 'Inter'
        }
      }
    },
    x: {
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
}

function generateLabels(): string[] {
  const count = selectedPeriod.value === 'week' ? 7 : selectedPeriod.value === 'month' ? 30 : 90
  const labels: string[] = []
  const now = new Date()
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    if (selectedPeriod.value === 'week') {
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }))
    } else if (selectedPeriod.value === 'month') {
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    } else {
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    }
  }
  return labels
}

function updateChart() {
  // Chart will automatically update via computed property
}
</script>

